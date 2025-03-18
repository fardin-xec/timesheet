import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,

  Alert,
  Box,
  TableSortLabel,
  TablePagination,
  Checkbox,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Chip,
  Skeleton,
} from '@mui/material';
import { Search, Filter, RefreshCw, MoreHorizontal, Download } from 'lucide-react';
import '../../styles/dataTable.css';

/**
 * Enhanced DataTable component with sorting, pagination, selection, and filtering
 * 
 * @param {Object} props - Component props
 * @param {Array} props.columns - Array of column definitions
 * @param {Array} props.data - Array of data rows
 * @param {boolean} props.loading - Whether data is loading
 * @param {string} props.error - Error message if any
 * @param {Object} props.statusColorMap - Map of status values to colors
 * @param {boolean} props.selectable - Whether rows can be selected
 * @param {Function} props.onSelectionChange - Callback when selection changes
 * @param {boolean} props.pagination - Whether to enable pagination
 * @param {number} props.pageSize - Number of rows per page
 * @param {boolean} props.sortable - Whether to enable sorting
 * @param {Function} props.onSort - Callback when sort changes
 * @param {boolean} props.searchable - Whether to enable search
 * @param {Function} props.onSearch - Callback when search changes
 * @param {Function} props.onRefresh - Callback to refresh data
 * @param {Function} props.onExport - Callback to export data
 * @param {Function} props.onRowClick - Callback when a row is clicked
 * @param {boolean} props.dense - Whether to use dense padding
 * @param {boolean} props.stickyHeader - Whether to use sticky headers
 * @param {string} props.emptyStateMessage - Message to display when no data
 * @param {React.ReactNode} props.toolbarContent - Custom toolbar content
 */
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
}) => {
  // State management
  const [selectedRows, setSelectedRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [displayData, setDisplayData] = useState([]);
  const [loadingRows, setLoadingRows] = useState([]);

  // Create loading skeleton rows
  useEffect(() => {
    if (loading) {
      const skeletonRows = Array.from({ length: 5 }, (_, i) => ({ id: `skeleton-${i}` }));
      setLoadingRows(skeletonRows);
    }
  }, [loading]);

  // Process data for display (sorting, filtering, pagination)
  useEffect(() => {
    let processedData = [...data];

    // Apply search filter if searchable
    if (searchable && searchTerm) {
      processedData = processedData.filter(row => {
        return columns.some(column => {
          const value = row[column.field];
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        });
      });
    }

    // Apply sorting if sortable
    if (sortable && sortField) {
      processedData.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        if (aValue === null || aValue === undefined) return sortDirection === 'asc' ? -1 : 1;
        if (bValue === null || bValue === undefined) return sortDirection === 'asc' ? 1 : -1;
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
        }
        
        return sortDirection === 'asc' 
          ? aValue - bValue 
          : bValue - aValue;
      });
    }

    setDisplayData(processedData);
  }, [data, searchTerm, sortField, sortDirection, columns, searchable, sortable]);

  // Current page data
  const currentPageData = pagination 
    ? displayData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) 
    : displayData;

  // Handle sort request
  const handleRequestSort = (field) => {
    const isAsc = sortField === field && sortDirection === 'asc';
    const newDirection = isAsc ? 'desc' : 'asc';
    setSortDirection(newDirection);
    setSortField(field);
    onSort(field, newDirection);
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle select all rows
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = displayData.map(row => row.id);
      setSelectedRows(newSelected);
      onSelectionChange(newSelected);
    } else {
      setSelectedRows([]);
      onSelectionChange([]);
    }
  };

  // Handle select one row
  const handleSelectRow = (id) => {
    const selectedIndex = selectedRows.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selectedRows, id];
    } else {
      newSelected = selectedRows.filter(rowId => rowId !== id);
    }

    setSelectedRows(newSelected);
    onSelectionChange(newSelected);
  };

  // Handle search term change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    onSearch(event.target.value);
  };

  // Check if row is selected
  const isSelected = (id) => selectedRows.indexOf(id) !== -1;

  // Render cell content
  const renderCellContent = (column, row) => {
    // If loading, render skeleton
    if (loading && row.id?.toString().includes('skeleton')) {
      return <Skeleton variant="text" width="80%" />;
    }

    // Status column with color
    if (column.field === 'status' && statusColorMap[row[column.field]]) {
      return (
        <Chip
          label={row[column.field]}
          size="small"
          style={{
            color: statusColorMap[row[column.field]],
            backgroundColor: `${statusColorMap[row[column.field]]}20`,
            borderColor: `${statusColorMap[row[column.field]]}40`,
            fontWeight: 500,
          }}
          variant="outlined"
        />
      );
    }

    // Custom render function
    if (column.renderCell) {
      return column.renderCell({ row });
    }

    // Default value
    return row[column.field];
  };

  return (
    <Paper className="data-table-container">
      {/* Error message */}
      {error && (
        <Alert severity="error" className="error-alert">
          {error}
        </Alert>
      )}

      {/* Table toolbar */}
      {(searchable || toolbarContent || onRefresh || onExport) && (
        <Box className="table-toolbar">
          {searchable && (
            <TextField
              placeholder="Search..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-field"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} />
                  </InputAdornment>
                ),
              }}
            />
          )}

          {toolbarContent && (
            <Box className="toolbar-content">
              {toolbarContent}
            </Box>
          )}

          <Box className="toolbar-actions">
            {onRefresh && (
              <Tooltip title="Refresh data">
                <IconButton onClick={onRefresh} size="small" disabled={loading}>
                  <RefreshCw size={18} className={loading ? 'spin' : ''} />
                </IconButton>
              </Tooltip>
            )}

            {onExport && (
              <Tooltip title="Export data">
                <IconButton onClick={onExport} size="small" disabled={loading}>
                  <Download size={18} />
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title="Filter list">
              <IconButton size="small">
                <Filter size={18} />
              </IconButton>
            </Tooltip>

            <Tooltip title="More options">
              <IconButton size="small">
                <MoreHorizontal size={18} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      )}

      {/* Main table */}
      <TableContainer>
        <Table 
          stickyHeader={stickyHeader}
          size={dense ? "small" : "medium"}
          className={loading ? "loading-table" : ""}
        >
          <TableHead>
            <TableRow>
              {/* Selection checkbox column */}
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedRows.length > 0 && selectedRows.length < displayData.length}
                    checked={displayData.length > 0 && selectedRows.length === displayData.length}
                    onChange={handleSelectAllClick}
                    disabled={loading}
                  />
                </TableCell>
              )}

              {/* Column headers */}
              {columns.map((column) => (
                <TableCell 
                  key={column.field}
                  align={column.align || 'left'}
                  padding={column.disablePadding ? 'none' : 'normal'}
                  sortDirection={sortField === column.field ? sortDirection : false}
                  className={column.headerClassName}
                  style={column.headerStyle}
                >
                  {sortable && column.sortable !== false ? (
                    <TableSortLabel
                      active={sortField === column.field}
                      direction={sortField === column.field ? sortDirection : 'asc'}
                      onClick={() => handleRequestSort(column.field)}
                      disabled={loading}
                    >
                      {column.headerName}
                    </TableSortLabel>
                  ) : (
                    column.headerName
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {/* Loading state */}
            {loading ? (
              loadingRows.map((row) => (
                <TableRow key={row.id}>
                  {selectable && (
                    <TableCell padding="checkbox">
                      <Skeleton variant="rectangular" width={20} height={20} />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell 
                      key={column.field}
                      align={column.align || 'left'}
                    >
                      <Skeleton variant="text" width={column.width || "80%"} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : currentPageData.length > 0 ? (
              currentPageData.map((row) => {
                const isItemSelected = selectable && isSelected(row.id);
                return (
                  <TableRow
                    key={row.id}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    hover={Boolean(onRowClick)}
                    selected={isItemSelected}
                    className={isItemSelected ? 'selected-row' : ''}
                    style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                  >
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          onChange={() => handleSelectRow(row.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell
                        key={column.field}
                        align={column.align || 'left'}
                        padding={column.disablePadding ? 'none' : 'normal'}
                        className={column.cellClassName}
                        style={column.cellStyle}
                      >
                        {renderCellContent(column, row)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (selectable ? 1 : 0)} 
                  align="center"
                  className="no-data-cell"
                >
                  {emptyStateMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {pagination && displayData.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={displayData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
        />
      )}
    </Paper>
  );
};

export default DataTable;