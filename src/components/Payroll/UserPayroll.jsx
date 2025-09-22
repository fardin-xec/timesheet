import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import toast from 'react-hot-toast';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { fetchPresignedUrlBackend, fetchPayroll } from '../../utils/api';

// Safe toast wrapper
const safeToast = {
  success: (msg) => typeof toast.success === 'function' ? toast.success(msg) : console.log(msg),
  error: (msg) => typeof toast.error === 'function' ? toast.error(msg) : console.error(msg),
};

// Initialize PDF worker
const initializePdfWorker = () => {
  try {
    const detectedVersion = pdfjs.version || '2.16.105';
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${detectedVersion}/build/pdf.worker.min.js`;
  } catch (error) {
    console.error('Failed to set PDF worker:', error);
  }
};
initializePdfWorker();

// Utility to get month names
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const UserPayroll = ({ user }) => {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [availableMonths, setAvailableMonths] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [pdfData, setPdfData] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfError, setPdfError] = useState(null);
  const [payrollData, setPayrollData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [scale, setScale] = useState(1.0);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const abortControllerRef = useRef(null);
  const fetchAttemptedRef = useRef(false);
  const payrollIdRef = useRef(null);

  // Get current date to restrict future months/years
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-based (0 = January)

  const {employee,orgId}=user;


  

  const fetchPayrollData = useCallback(async () => {
   
    try {
      setLoading(true);
      const monthNumber = months.indexOf(selectedMonth) + 1; // Get 1-based month number
    if (monthNumber === 0) { // indexOf returns -1 if not found, so +1 gives 0
      throw new Error('Invalid month selected');
    }
      const response = await fetchPayroll(
        {
          page: 1,
          limit: 100,
          month: monthNumber,
          year: selectedYear,
          employeeId: employee.id,
        },
        orgId
      );
      console.log(response);
      
      setPayrollData(response.data[0]);
    } catch (err) {
        console.log(err);
        
      safeToast.error(`Error: ${err.message || "Unknown error"}`);
      setPayrollData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear, employee?.id, orgId]);

  // Populate years (from 2000 to current year)
  useEffect(() => {
    const years = [];
    for (let year = 2000; year <= currentYear; year++) {
      years.push(year);
    }
    setAvailableYears(years.reverse()); // Latest year first
    setSelectedYear(currentYear.toString()); // Default to current year
  }, [currentYear]);

  // Populate months based on selected year
  useEffect(() => {
    let monthsAvailable = months;
    if (parseInt(selectedYear) === currentYear) {
      monthsAvailable = months.slice(0, currentMonth + 1);
    }
    setAvailableMonths(monthsAvailable);
    setSelectedMonth(monthsAvailable[monthsAvailable.length - 1] || '');
  }, [selectedYear, currentYear, currentMonth]);

  // Reset state when selections change
  useEffect(() => {
    setPdfData(null);
    setPdfError(null);
    setNumPages(null);
    setPageNumber(1);
    setRetryCount(0);
    fetchAttemptedRef.current = false;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, [selectedMonth, selectedYear]);

  // Fetch PDF data
  const fetchPdfData = useCallback(async () => {
    if (!selectedMonth || !selectedYear || loading || retryCount > maxRetries || fetchAttemptedRef.current || !payrollData?.payslip?.id) {
      return;
    }

    fetchAttemptedRef.current = true;
    setLoading(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const payslipId = payrollData.payslip.id;
      const blob = await fetchPresignedUrlBackend(payslipId, abortControllerRef.current.signal);

      if (!blob || blob.type !== 'application/pdf') {
        throw new Error('Invalid PDF content received');
      }
      if (blob.size === 0) {
        throw new Error('Received empty PDF file');
      }

      setPdfData(blob);
      setPdfError(null);
      setRetryCount(0);
      payrollIdRef.current = payslipId;
    } catch (error) {
      if (error.name === 'AbortError') return;

      let errorMessage = 'Failed to load payslip. Please try again.';
      if (error.message?.includes('Unauthorized')) {
        errorMessage = 'Session expired. Please log in again.';
      } else if (error.message?.includes('not found')) {
        errorMessage = 'Payslip not found.';
      } else if (error.message?.includes('Invalid PDF') || error.message?.includes('empty PDF')) {
        errorMessage = 'Invalid or corrupted payslip file.';
      }

      setPdfError(errorMessage);
      safeToast.error(errorMessage);

      if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000;
        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
          fetchAttemptedRef.current = false;
        }, delay);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear, loading, retryCount, payrollData?.payslip?.id]);

  // Trigger payroll data fetch when selections are made
  useEffect(() => {
    if (selectedMonth && selectedYear && employee?.id && orgId) {
        
       fetchPayrollData();
    }
  }, [selectedMonth, selectedYear, employee?.id, orgId, fetchPayrollData]);

  // Trigger PDF fetch when payroll data is available
  useEffect(() => {
    if (payrollData?.payslip?.id && !pdfData && !pdfError) {
      fetchPdfData();
    }
  }, [payrollData, fetchPdfData, pdfData, pdfError]);

  // PDF event handlers
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setPdfError(null);
    safeToast.success('Payslip loaded successfully');
  };

  const onDocumentLoadError = (error) => {
    let errorMessage = 'Failed to render payslip. The file may be corrupted.';
    if (error.message?.includes('worker')) {
      errorMessage = 'PDF worker failed to load. Please try reloading.';
    }
    setPdfError(errorMessage);
    safeToast.error(errorMessage);
  };

  const handlePreviousPage = () => setPageNumber((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setPageNumber((prev) => Math.min(prev + 1, numPages || 1));
  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 2.5));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));
  const resetZoom = () => setScale(1.0);

  const handleDownload = () => {
    if (!pdfData) {
      safeToast.error('No payslip available for download');
      return;
    }
    try {
      const url = window.URL.createObjectURL(pdfData);
      const link = document.createElement('a');
      const fileName = `payslip-${selectedMonth}-${selectedYear}.pdf`;
      link.href = url;
      link.download = fileName;
      link.setAttribute('type', 'application/pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      safeToast.success('Download started');
    } catch (error) {
      safeToast.error('Failed to download payslip');
    }
  };

  const pdfOptions = useMemo(() => {
    const version = pdfjs.version || '4.4.168';
    return {
      cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/cmaps/`,
      cMapPacked: true,
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">View Payslip</h2>

      {/* Dropdowns */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
            Month
          </label>
          <select
            id="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            disabled={!availableMonths.length || loading}
          >
            <option value="">Select Month</option>
            {availableMonths.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
            Year
          </label>
          <select
            id="year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          >
            <option value="">Select Year</option>
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Controls */}
      {pdfData && (
        <div className="bg-white px-4 py-3 border-b border-gray-200 flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex bg-gray-100 rounded-lg overflow-hidden">
              <button
                onClick={zoomOut}
                className="px-3 py-1 text-gray-700 hover:bg-gray-200 transition"
                aria-label="Zoom out"
                disabled={scale <= 0.5}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
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
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
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
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-sm font-medium text-gray-700" aria-live="polite">
                  {pageNumber} / {numPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={pageNumber >= numPages}
                  className="p-1 rounded text-gray-600 disabled:text-gray-400 disabled:opacity-50 hover:bg-gray-200 transition"
                  aria-label="Next page"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            disabled={!pdfData || loading}
            aria-label="Download payslip"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
        </div>
      )}

      {/* PDF Viewer */}
      <div className="relative overflow-auto bg-gray-100 flex items-center justify-center min-h-[400px]" aria-live="polite">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin"></div>
              <p className="mt-3 text-gray-700 font-medium">Loading PDF...</p>
            </div>
          </div>
        )}
        {pdfError ? (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-center text-gray-700 mb-4 max-w-md">{pdfError}</p>
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
          <Document
            file={pdfData}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <p className="mt-3 text-gray-600">Rendering PDF...</p>
                </div>
              </div>
            }
            error={
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-red-500 mb-3">Failed to render PDF</p>
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
            className="flex justify-center p-4"
            options={pdfOptions}
          >
            <Page
              pageNumber={pageNumber}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              scale={scale}
              className="shadow-xl rounded"
            />
          </Document>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-center text-gray-600">payslip not found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPayroll;