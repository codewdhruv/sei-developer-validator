import Papa from 'papaparse';
import { DeveloperRow } from './types';

export function exportToCSV(data: DeveloperRow[], filename: string = 'sei_developers.csv'): void {
  // Define column order for SEI
  const columns = ['full_name', 'email', 'manager_email'];

  // Get additional columns from data
  const additionalColumns = new Set<string>();
  data.forEach((row) => {
    Object.keys(row).forEach((key) => {
      if (!columns.includes(key)) {
        additionalColumns.add(key);
      }
    });
  });

  const allColumns = [...columns, ...Array.from(additionalColumns)];

  // Prepare data with normalized values
  const exportData = data.map((row) => {
    const newRow: Record<string, string> = {};
    allColumns.forEach((col) => {
      newRow[col] = row[col]?.trim() || '';
    });
    return newRow;
  });

  // Convert to CSV
  const csv = Papa.unparse(exportData, {
    columns: allColumns,
    header: true,
  });

  // Trigger download
  downloadCSV(csv, filename);
}

function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export function generateCSVPreview(data: DeveloperRow[], maxRows: number = 5): string {
  const previewData = data.slice(0, maxRows);
  const columns = ['full_name', 'email', 'manager_email'];

  return Papa.unparse(previewData, {
    columns,
    header: true,
  });
}
