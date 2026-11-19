/**
 * Enterprise Excel / CSV Export Utility for TAXBAY CA Practice Suite
 * Generates UTF-8 encoded, BOM-prefixed CSV files natively compatible with Microsoft Excel,
 * Google Sheets, LibreOffice Calc, and Apple Numbers.
 */

export const exportToExcel = (headers = [], rows = [], filename = 'Export_Report') => {
  if (!headers || headers.length === 0) {
    console.warn('exportToExcel: No headers provided.');
    return false;
  }

  // Format headers
  const formattedHeaders = headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(',');

  // Format row data
  const formattedRows = rows.map((row) => {
    return row
      .map((val) => {
        if (val === null || val === undefined) return '""';
        const strVal = String(val).replace(/"/g, '""');
        return `"${strVal}"`;
      })
      .join(',');
  });

  // Combine with BOM (\uFEFF) for immediate Excel UTF-8 recognition
  const csvContent = '\uFEFF' + [formattedHeaders, ...formattedRows].join('\r\n');

  // Create Blob and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const cleanFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', cleanFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
};
