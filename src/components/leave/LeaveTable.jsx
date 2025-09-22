import React from 'react';
import DataTable from '../common/DataTable';

const LeaveTable = ({
  leaveApplications,
  loading,
  error,
  statusColorMap,
  onRowClick,
  onSearch,
  onSort,
  onRefresh,
  searchable,
  sortable,
  pagination,
}) => {
  const columns = [
    { field: 'leaveType', headerName: 'Leave Type', sortable: true },
    { field: 'startDate', headerName: 'Start Date', sortable: true },
    { field: 'endDate', headerName: 'End Date', sortable: true },
    { field: 'reason', headerName: 'Reason' },
    { field: 'status', headerName: 'Status', sortable: true },
    { field: 'appliedDays', headerName: 'Days', sortable: true },
  ];

  return (
    <DataTable
      columns={columns}
      data={leaveApplications}
      loading={loading}
      error={error}
      statusColorMap={statusColorMap}
      onRowClick={onRowClick}
      onSearch={onSearch}
      onSort={onSort}
      onRefresh={onRefresh}
      searchable={searchable}
      sortable={sortable}
      pagination={pagination}
      pageSize={5}
      dense={false}
      stickyHeader={true}
      emptyStateMessage="No leave applications found"
    />
  );
};

export default LeaveTable;