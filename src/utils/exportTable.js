// utils/exportTable.js
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export function exportToExcel(data, columns, fileName = 'export.xlsx') {
  // Map data to array of objects with column headers as keys
  const exportData = data.map(row => {
    const rowData = {};
    columns.forEach(col => {
      // Use headerName or fallback to field name as key
      const key = col.headerName || col.field;
      // Use renderCell if exists, else raw value
      if (col.renderCell) {
        // Assuming renderCell returns a React element,
        // fallback to raw field value (simpler for export)
        rowData[key] = row[col.field];
      } else {
        rowData[key] = row[col.field];
      }
    });
    return rowData;
  });

  // Create worksheet and workbook
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  // Generate XLSX buffer
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

  // Create Blob and trigger download
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  saveAs(blob, fileName);
}
