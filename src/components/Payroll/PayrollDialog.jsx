import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import toast from "react-hot-toast";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { fetchPresignedUrlBackend } from "../../utils/api";

const safeToast = {
  success: (msg) =>
    typeof toast.success === "function"
      ? toast.success(msg)
      : typeof toast === "function"
      ? toast(msg)
      : console.log(msg),
  error: (msg) =>
    typeof toast.error === "function"
      ? toast.error(msg)
      : typeof toast === "function"
      ? toast(msg)
      : console.error(msg),
  info: (msg) =>
    typeof toast.info === "function"
      ? toast.info(msg)
      : typeof toast === "function"
      ? toast(msg)
      : console.info(msg),
};

// We need to maintain version consistency between the API and worker
// Using the version detection helper to handle this properly
const initializePdfWorker = () => {
  try {
    // Detect the version from the loaded pdfjs library
    const detectedVersion = pdfjs.version || "2.16.105";
    console.log("Detected PDF.js version:", detectedVersion);

    // Set worker src using the detected version to ensure they match
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${detectedVersion}/build/pdf.worker.min.js`;
    console.log(
      "PDF worker source set to:",
      pdfjs.GlobalWorkerOptions.workerSrc
    );
  } catch (error) {
    console.error("Failed to set PDF worker:", error);
  }
};

// Initialize PDF worker once
initializePdfWorker();

const fetchPresignedUrl = async (fileKey, signal) => {
  try {
    const response = await fetchPresignedUrlBackend(fileKey, signal);
    return response;
  } catch (error) {
    console.error("Error fetching from S3:", error);
    throw error;
  }
};

const PayrollDialog = ({ open, onClose, payroll, month, year }) => {
  const [tabValue, setTabValue] = useState(0);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfError, setPdfError] = useState(null);
  const [pdfData, setPdfData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [scale, setScale] = useState(1.0);
  const maxRetries = 3;
  const dialogRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Track if we've already attempted to fetch for the current payroll
  const fetchAttemptedRef = useRef(false);

  // Store the payroll ID to detect changes
  const payrollIdRef = useRef(null);

  useEffect(() => {
    // Reset the component state when dialog closes
    if (!open) {
      setPageNumber(1);
      setNumPages(null);
      setPdfError(null);
      setPdfData(null);
      setRetryCount(0);
      setScale(1.0);
      fetchAttemptedRef.current = false;

      // Clean up any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    }
  }, [open]);

  useEffect(() => {
    if (open && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [open]);

  // Check if payroll ID has changed
  useEffect(() => {
    if (payroll?.payslip?.id !== payrollIdRef.current) {
      // ID changed, reset fetch state
      payrollIdRef.current = payroll?.payslip?.id;
      fetchAttemptedRef.current = false;
      setPdfData(null);
      setPdfError(null);
      setRetryCount(0);
    }
  }, [payroll?.payslip?.id]);

  const fetchPdfData = useCallback(async () => {
    // Prevent fetching if:
    // - already loading
    // - no payslip ID
    // - exceeded max retries
    // - already fetched for this payroll
    if (
      loading ||
      !payroll?.payslip?.id ||
      retryCount > maxRetries ||
      fetchAttemptedRef.current
    ) {
      return;
    }

    // Mark that we've attempted a fetch for this payroll
    fetchAttemptedRef.current = true;

    setLoading(true);

    // Clean up any existing controller
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      const blob = await fetchPresignedUrl(
        payroll.payslip.id,
        abortControllerRef.current.signal
      );

      if (!blob || blob.type !== "application/pdf") {
        throw new Error("Invalid PDF content received");
      }

      if (blob.size === 0) {
        throw new Error("Received empty PDF file");
      }

      setPdfData(blob);
      setPdfError(null);
      setRetryCount(0);
    } catch (error) {
      if (error.name === "AbortError") {
        // Request was aborted, don't show error
        return;
      }

      let errorMessage = "Failed to load payslip. Please try again.";

      if (error.message?.includes("Unauthorized")) {
        errorMessage = "Session expired. Please log in again.";
      } else if (error.message?.includes("not found")) {
        errorMessage = "Payslip not found.";
      } else if (
        error.message?.includes("Invalid PDF") ||
        error.message?.includes("empty PDF")
      ) {
        errorMessage = "Invalid or corrupted payslip file.";
      }

      setPdfError(errorMessage);
      safeToast.error(errorMessage);
      console.error("Fetch error:", error.message, error.stack, {
        payslipId: payroll.payslip.id,
      });

      if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000;
        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
          // Allow retry attempt
          fetchAttemptedRef.current = false;
        }, delay);
      }
    } finally {
      setLoading(false);
    }
  }, [payroll?.payslip?.id, loading, retryCount]);

  // Only fetch when dialog is open and we have a payslip ID
  useEffect(() => {
    if (open && payroll?.payslip?.id && !fetchAttemptedRef.current) {
      fetchPdfData();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [open, payroll?.payslip?.id, fetchPdfData]);

  // Manual retry function
  // const manualRetry = useCallback(() => {
  //   fetchAttemptedRef.current = false;
  //   setRetryCount((prev) => prev + 1);
  //   fetchPdfData();
  // }, [fetchPdfData]);

  const handleDownload = () => {
    if (!pdfData) {
      safeToast.error("No payslip available for download");
      return;
    }

    try {
      const url = window.URL.createObjectURL(pdfData);
      const link = document.createElement("a");
      const fileName = payroll?.employee
        ? `payslip-${payroll.employee.employeeId}-${month}-${year}.pdf`
        : `payslip-${payroll?.payslip?.id || "download"}.pdf`;

      link.href = url;
      link.download = fileName;
      link.setAttribute("type", "application/pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => window.URL.revokeObjectURL(url), 100);
      safeToast.success("Download started");
    } catch (error) {
      setPdfError("Failed to download payslip. Please try again.");
      safeToast.error("Failed to download payslip");
      console.error("Download error:", error.message, error.stack);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setPdfError(null);
    safeToast.success("Payslip loaded successfully");
  };

  const onDocumentLoadError = (error) => {
    console.error("PDF load error details:", error);

    let errorMessage = "Failed to render payslip. The file may be corrupted.";
    if (
      error.message?.includes("worker") ||
      error.message?.includes("Worker")
    ) {
      errorMessage =
        'PDF worker failed to load. Please click "Try Alternative Loading Method" below.';
      console.warn("PDF worker loading failed. Manual retry required.");
    }

    setPdfError(errorMessage);
    safeToast.error(errorMessage);
  };

  const handlePreviousPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages || 1));
  };

  const zoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.2, 2.5));
  };

  const zoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.2, 0.5));
  };

  const resetZoom = () => {
    setScale(1.0);
  };

  const handlePrint = () => {
    if (!pdfData) {
      safeToast.error("No payslip available to print");
      return;
    }

    try {
      const pdfUrl = URL.createObjectURL(pdfData);
      const printWindow = window.open(pdfUrl, "_blank");

      if (!printWindow) {
        safeToast.error("Please allow pop-ups to print payslips");
        return;
      }

      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          URL.revokeObjectURL(pdfUrl);
        }, 1000);
      };
    } catch (error) {
      console.error("Print error:", error);
      safeToast.error("Failed to open print window");
    }
  };

  // const forceRetryLoading = () => {
  //   console.log("Attempting alternative loading method for PDF");

  //   // Attempt to detect and match versions
  //   try {
  //     // Check if we can get the version from the loaded library
  //     const detectedVersion = pdfjs.version;
  //     if (detectedVersion) {
  //       console.log("Found PDF.js version:", detectedVersion);
  //       pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${detectedVersion}/build/pdf.worker.min.js`;
  //       console.log(
  //         "Updated worker source to match API version:",
  //         detectedVersion
  //       );
  //     } else {
  //       // If we can't detect version, try with the latest compatible version
  //       console.log(
  //         "Version detection failed, trying with latest compatible version"
  //       );
  //       pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.js`;
  //     }
  //   } catch (error) {
  //     console.error("Version adjustment failed:", error);
  //     // If all else fails, try with the version from the error message
  //     pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.js`;
  //   }

  //   // Reset state to allow a new fetch
  //   fetchAttemptedRef.current = false;
  //   setPdfError(null);
  //   setLoading(false);

  //   // Clear the PDF data to force a complete reload
  //   const currentData = pdfData;
  //   setPdfData(null);

  //   // Slightly delay refetching to ensure state is updated
  //   setTimeout(() => {
  //     if (currentData) {
  //       try {
  //         // Create a new blob to force reprocessing
  //         const newPdfData = new Blob([currentData], {
  //           type: currentData.type,
  //         });
  //         setPdfData(newPdfData);
  //         console.log("Reloading PDF data with new worker configuration");
  //       } catch (e) {
  //         console.error("Failed to reload PDF:", e);
  //         safeToast.error(
  //           "Failed to reload. Please close and reopen the dialog."
  //         );
  //         // Allow another fetch attempt
  //         fetchAttemptedRef.current = false;
  //       }
  //     } else {
  //       // No data available, try fetching again
  //       fetchPdfData();
  //     }
  //   }, 800);

  //   safeToast.success("Retrying with alternative method");
  // };

  const pdfOptions = useMemo(() => {
    // Get the version that's actually being used
    const version = pdfjs.version || "4.4.168";
    return {
      cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/cmaps/`,
      cMapPacked: true,
    };
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto backdrop-blur-sm  bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payroll-dialog-title"
      ref={dialogRef}
      tabIndex={-1}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2
            id="payroll-dialog-title"
            className="text-xl font-bold text-gray-800"
          >
            Payroll Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors duration-150"
            aria-label="Close dialog"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-white" role="tablist">
          <button
            onClick={() => setTabValue(0)}
            className={`flex-1 py-3 text-center font-medium transition-colors duration-150 ${
              tabValue === 0
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
            aria-selected={tabValue === 0}
            role="tab"
            id="payslip-tab"
          >
            Payslip
          </button>
          <button
            onClick={() => setTabValue(1)}
            className={`flex-1 py-3 text-center font-medium transition-colors duration-150 ${
              tabValue === 1
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
            aria-selected={tabValue === 1}
            role="tab"
            id="deductions-tab"
          >
            Other Deductions
          </button>
        </div>

        {tabValue === 0 ? (
          <div className="flex-1 overflow-hidden">
            {/* Payslip Tab */}
            <div
              role="tabpanel"
              aria-labelledby="payslip-tab"
              className={`h-full flex flex-col ${
                tabValue === 0 ? "block" : "hidden"
              }`}
            >
              {/* Controls */}
              <div className="bg-white px-6 py-3 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="flex bg-gray-100 rounded-lg overflow-hidden">
                    <button
                      onClick={zoomOut}
                      className="px-3 py-1 text-gray-700 hover:bg-gray-200 transition"
                      aria-label="Zoom out"
                      disabled={scale <= 0.5}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M20 12H4"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={resetZoom}
                      className="px-3 py-1 bg-white border-x border-gray-200 font-medium text-sm text-gray-700"
                      aria-label="Reset zoom"
                    >
                      {Math.round(scale * 100)}%
                    </button>
                    <button
                      onClick={zoomIn}
                      className="px-3 py-1 text-gray-700 hover:bg-gray-200 transition"
                      aria-label="Zoom in"
                      disabled={scale >= 2.5}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                  </div>

                  {numPages && numPages > 0 && (
                    <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-2 py-1">
                      <button
                        onClick={handlePreviousPage}
                        disabled={pageNumber <= 1}
                        className="p-1 rounded text-gray-600 disabled:text-gray-400 disabled:opacity-50 hover:bg-gray-200 transition"
                        aria-label="Previous page"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>
                      <span
                        className="text-sm font-medium text-gray-700"
                        aria-live="polite"
                      >
                        {pageNumber} / {numPages}
                      </span>
                      <button
                        onClick={handleNextPage}
                        disabled={pageNumber >= numPages}
                        className="p-1 rounded text-gray-600 disabled:text-gray-400 disabled:opacity-50 hover:bg-gray-200 transition"
                        aria-label="Next page"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handlePrint}
                    className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    disabled={!pdfData || loading}
                    aria-label="Print payslip"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                      />
                    </svg>
                    Print
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    disabled={!pdfData || loading}
                    aria-label="Download payslip"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download
                  </button>
                </div>
              </div>

              {/* PDF Viewer */}
              <div className="relative bg-gray-100 flex items-center justify-center min-h-[400px]">
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin"></div>
                      <p className="mt-3 text-gray-700 font-medium">
                        Loading PDF...
                      </p>
                    </div>
                  </div>
                )}
                {pdfError ? (
                  <div className="flex flex-col items-center justify-center h-full p-6">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                      <svg
                        className="w-8 h-8 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-center text-gray-700 mb-4 max-w-md">
                      {pdfError}
                    </p>
                    <button
                      onClick={() => {
                        fetchAttemptedRef.current = false;
                        fetchPdfData();
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      disabled={loading}
                    >
                      Retry
                    </button>
                  </div>
                ) : pdfData ? (
                  <div className="w-full max-h-[600px] overflow-y-auto p-4">
                    {/* Scrollable container with fixed max height */}
                    <Document
                      file={pdfData}
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={onDocumentLoadError}
                      loading={
                        <div className="flex items-center justify-center h-full">
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                            <p className="mt-3 text-gray-600">
                              Rendering PDF...
                            </p>
                          </div>
                        </div>
                      }
                      error={
                        <div className="flex flex-col items-center justify-center h-full">
                          <p className="text-red-500 mb-3">
                            Failed to render PDF
                          </p>
                          <button
                            onClick={() => {
                              fetchAttemptedRef.current = false;
                              fetchPdfData();
                            }}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                            disabled={loading}
                          >
                            Retry
                          </button>
                        </div>
                      }
                      className="flex flex-col items-center"
                      options={pdfOptions}
                    >
                      {/* Render all pages for scrolling */}
                      {numPages &&
                        Array.from({ length: numPages }, (_, index) => (
                          <Page
                            key={index + 1}
                            pageNumber={index + 1}
                            renderTextLayer={true}
                            renderAnnotationLayer={true}
                            scale={scale}
                            className="shadow-xl rounded mb-4"
                            width={undefined}
                          />
                        ))}
                    </Document>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-6">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-center text-gray-600">
                      Select a month and year to view payslip
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div
            role="tabpanel"
            aria-labelledby="deductions-tab"
            className={`h-full flex flex-col ${
              tabValue === 1 ? "block" : "hidden"
            }`}
          >
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Other Deduction Details
                </h3>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="font-medium text-gray-700">
                    Total Other Deduction
                  </span>
                  <span className="text-lg font-semibold text-gray-900">
                    ${payroll?.otherDeduction || "0.00"}
                  </span>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 text-yellow-600 mt-0.5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-yellow-800">
                    Detailed breakdown of deductions will be available soon.
                    Please check back later.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-150 font-medium"
            aria-label="Close dialog"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayrollDialog;
