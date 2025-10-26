import React, { useState, useEffect } from "react";
import "../../styles/dataTable.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { exportToExcel } from '../../utils/exportTable';

const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  error = null,
  statusColorMap = {},
  selectable = false,
  onSelectionChange = () => {},
  pagination = false,
  pageSize = 10,
  sortable = false,
  onSort = () => {},
  searchable = false,
  onSearch = () => {},
  onRefresh = null,
  onExport = null,
  onRowClick = null,
  dense = false,
  stickyHeader = false,
  emptyStateMessage = "No data found",
  toolbarContent = null,
  // New props for bulk actions
  bulkActions = [],
  onBulkAction = () => {},
  selectedRows: externalSelectedRows = null, // Allow external control of selection
  maxSelectable = null,
  onDateChange = () => {},
  selectedDate = null, 
}) => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [displayData, setDisplayData] = useState([]);
  const [loadingRows, setLoadingRows] = useState([]);

  const handleDateChange = (date) => {
    onDateChange(date);
  };
  const handleExportClick = () => {
  exportToExcel(displayData, columns, `attendance-${selectedDate}.xlsx`);
};
  // Use external selection state if provided
  const currentSelectedRows =
    externalSelectedRows !== null ? externalSelectedRows : selectedRows;

  useEffect(() => {
    if (loading) {
      const skeletonRows = Array.from({ length: 5 }, (_, i) => ({
        id: `skeleton-${i}`,
      }));
      setLoadingRows(skeletonRows);
    }
  }, [loading]);

  useEffect(() => {
    let processedData = [...data];

    if (searchable && searchTerm) {
      processedData = processedData.filter((row) => {
        return columns.some((column) => {
          const value = row[column.field];
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        });
      });
    }

    if (sortable && sortField) {
      processedData.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        if (aValue === null || aValue === undefined)
          return sortDirection === "asc" ? -1 : 1;
        if (bValue === null || bValue === undefined)
          return sortDirection === "asc" ? 1 : -1;

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortDirection === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        } else if (aValue instanceof Date && bValue instanceof Date) {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        } else {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        }
      });
    }

    setDisplayData(processedData);
  }, [
    data,
    searchTerm,
    sortField,
    sortDirection,
    columns,
    searchable,
    sortable,
  ]);

  const currentPageData = pagination
    ? displayData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : displayData;

  const handleRequestSort = (field) => {
    const isAsc = sortField === field && sortDirection === "asc";
    const newDirection = isAsc ? "desc" : "asc";
    setSortDirection(newDirection);
    setSortField(field);
    onSort(field, newDirection);
  };

  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      let newSelected = displayData.map((row) => row.id);

      // Apply max selectable limit
      if (maxSelectable && newSelected.length > maxSelectable) {
        newSelected = newSelected.slice(0, maxSelectable);
      }

      if (externalSelectedRows === null) {
        setSelectedRows(newSelected);
      }
      onSelectionChange(newSelected);
    } else {
      if (externalSelectedRows === null) {
        setSelectedRows([]);
      }
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (id) => {
    const selectedIndex = currentSelectedRows.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      // Check max selectable limit
      if (maxSelectable && currentSelectedRows.length >= maxSelectable) {
        return; // Don't allow more selections
      }
      newSelected = [...currentSelectedRows, id];
    } else {
      newSelected = currentSelectedRows.filter((rowId) => rowId !== id);
    }

    if (externalSelectedRows === null) {
      setSelectedRows(newSelected);
    }
    onSelectionChange(newSelected);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    onSearch(event.target.value);
  };

  const handleBulkActionClick = (action) => {
    if (currentSelectedRows.length === 0) {
      alert("Please select at least one item");
      return;
    }

    const selectedItems = data.filter((row) =>
      currentSelectedRows.includes(row.id)
    );
    onBulkAction(action, selectedItems, currentSelectedRows);
  };

  const handleClearSelection = () => {
    if (externalSelectedRows === null) {
      setSelectedRows([]);
    }
    onSelectionChange([]);
  };

  const isSelected = (id) => currentSelectedRows.indexOf(id) !== -1;
  const isAllSelected =
    displayData.length > 0 && currentSelectedRows.length === displayData.length;
  const isIndeterminate =
    currentSelectedRows.length > 0 &&
    currentSelectedRows.length < displayData.length;

  const renderCellContent = (column, row) => {
    if (loading && row.id?.toString().includes("skeleton")) {
      return (
        <div className="w-3/4 h-4 bg-gray-200 animate-pulse rounded"></div>
      );
    }

    if (column.field === "status" && statusColorMap[row[column.field]]) {
      console.log(statusColorMap);
      console.log(row[column.field]);

      
      return (
        <span
          className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium`}
          style={{
            color: statusColorMap[row[column.field]],
            backgroundColor: `${statusColorMap[row[column.field]]}20`,
            border: `1px solid ${statusColorMap[row[column.field]]}40`,
          }}
        >
          {row[column.field]}
        </span>
      );
    }

    if (column.renderCell) {
      return column.renderCell({ row });
    }

    return row[column.field];
  };

  const totalPages = Math.ceil(displayData.length / rowsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="data-table-container relative z-10">
      {error && (
        <div
          className="error-alert bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Selection Summary and Bulk Actions */}
      {selectable && currentSelectedRows.length > 0 && (
        <div className="selection-toolbar bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-blue-800">
                {currentSelectedRows.length} item
                {currentSelectedRows.length !== 1 ? "s" : ""} selected
                {maxSelectable && ` (max ${maxSelectable})`}
              </span>
              <button
                onClick={handleClearSelection}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Clear selection
              </button>
            </div>
            {bulkActions.length > 0 && (
              <div className="flex gap-2">
                {bulkActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleBulkActionClick(action)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      action.variant === "danger"
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : action.variant === "success"
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                    disabled={loading}
                  >
                    {action.icon && <span className="mr-1">{action.icon}</span>}
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {(searchable || onRefresh || onExport || selectedDate !== null) && (
        <div className="table-toolbar flex flex-wrap items-center gap-2 mb-2">
          {/* Date picker to the left */}
          {selectedDate !== null && (
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              maxDate={new Date()}
              className="date-picker-input p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              dateFormat="yyyy-MM-dd"
              placeholderText="Select date"
            />
          )}

          {/* Search input */}
          {searchable && (
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-field w-full md:w-1/3 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}

          <div className="toolbar-actions flex space-x-2 ml-auto">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className="p-2 text-gray-500 hover:text-gray-700 disabled:text-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Refresh data"
              >
                <svg
                  className={`w-4 h-4 ${loading ? "spin" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8 8 0 006.858 16m0 0l-2.5-2.5M6.858 16l2.5-2.5"
                  />
                </svg>
              </button>
            )}

            {onExport && (
              <button
                onClick={handleExportClick}
                disabled={loading}
                className="p-2 text-gray-500 hover:text-gray-700 disabled:text-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Export to Excel"
                title="Export to Excel"
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
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      <div className="table-container overflow-x-auto">
        <table
          className={`w-full ${stickyHeader ? "sticky-header" : ""} ${
            dense ? "dense" : ""
          } ${loading ? "loading-table" : ""}`}
        >
          <thead>
            <tr>
              {selectable && (
                <th className="p-2 border-b">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={handleSelectAllClick}
                    disabled={
                      loading ||
                      (maxSelectable && displayData.length > maxSelectable)
                    }
                    className="form-checkbox text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.field}
                  className={`p-2 border-b fw-bold ${
                    sortable && column.sortable !== false
                      ? "cursor-pointer hover:bg-gray-100"
                      : ""
                  }`}
                  onClick={
                    sortable && column.sortable !== false
                      ? () => handleRequestSort(column.field)
                      : null
                  }
                >
                  {column.headerName}
                  {sortable &&
                    column.sortable !== false &&
                    sortField === column.field && (
                      <span
                        className={`ml-1 ${
                          sortDirection === "asc" ? "rotate-180" : ""
                        }`}
                      >
                        <svg
                          className="w-4 h-4 inline"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </span>
                    )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              loadingRows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-100 transition-colors"
                >
                  {selectable && (
                    <td className="p-2 border-b">
                      <div className="w-5 h-5 bg-gray-200 animate-pulse rounded"></div>
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.field} className="p-2 border-b">
                      <div className="w-3/4 h-4 bg-gray-200 animate-pulse rounded"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : currentPageData.length > 0 ? (
              currentPageData.map((row) => {
                const isItemSelected = selectable && isSelected(row.id);
                const isRowDisabled =
                  maxSelectable &&
                  !isItemSelected &&
                  currentSelectedRows.length >= maxSelectable;

                return (
                  <tr
                    key={row.id}
                    onClick={onRowClick ? () => onRowClick(row) : null}
                    className={`hover:bg-gray-100 transition-colors ${
                      isItemSelected ? "bg-blue-50" : ""
                    } ${onRowClick ? "cursor-pointer" : ""} ${
                      isRowDisabled ? "opacity-50" : ""
                    }`}
                  >
                    {selectable && (
                      <td className="p-2 border-b">
                        <input
                          type="checkbox"
                          checked={isItemSelected}
                          onChange={() => handleSelectRow(row.id)}
                          onClick={(e) => e.stopPropagation()}
                          disabled={isRowDisabled}
                          className="form-checkbox text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.field}
                        className="p-2 border-b"
                        align={column.align || "left"}
                      >
                        {renderCellContent(column, row)}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="p-4 text-center text-gray-500"
                >
                  {emptyStateMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && displayData.length > 0 && !loading && (
        <div className="flex flex-col md:flex-row justify-between items-center px-4 py-3 bg-gray-50 border-t gap-4">
          <span className="text-sm text-gray-700">
            Showing {page * rowsPerPage + 1} to{" "}
            {Math.min((page + 1) * rowsPerPage, displayData.length)} of{" "}
            {displayData.length} entries
          </span>
          <div className="flex items-center gap-2">
            <select
              value={rowsPerPage}
              onChange={handleChangeRowsPerPage}
              className="p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Rows per page"
              disabled={loading}
            >
              {[5, 10, 25, 50].map((size) => (
                <option key={size} value={size}>
                  {size} rows
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-600">per page</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleChangePage(page - 1)}
              disabled={page === 0 || loading}
              className="px-3 py-1 bg-gray-200 rounded-md text-sm hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-1"
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
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {page + 1} of {totalPages}
            </span>
            <select
              value={page + 1}
              onChange={(e) => handleChangePage(parseInt(e.target.value) - 1)}
              className="p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-20"
              aria-label="Jump to page"
              disabled={loading}
            >
              {pageNumbers.map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
            <button
              onClick={() => handleChangePage(page + 1)}
              disabled={page >= totalPages - 1 || loading}
              className="px-3 py-1 bg-gray-200 rounded-md text-sm hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-1"
              aria-label="Next page"
            >
              Next
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
        </div>
      )}
    </div>
  );
};

export default DataTable;
