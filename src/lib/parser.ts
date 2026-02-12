import Papa from 'papaparse';
import { ParseResult, RawRow } from './types';

export function parseCSV(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        const data = results.data as RawRow[];
        const headers = results.meta.fields || [];
        const errors: string[] = [];

        // Check for parse errors
        if (results.errors.length > 0) {
          results.errors.forEach((err) => {
            errors.push(`Row ${err.row}: ${err.message}`);
          });
        }

        // Detect blank headers
        const blankHeaders = headers.filter((h) => !h || h.trim() === '');
        if (blankHeaders.length > 0) {
          errors.push(`Found ${blankHeaders.length} blank column header(s)`);
        }

        resolve({ data, headers, errors });
      },
      error: (error) => {
        resolve({
          data: [],
          headers: [],
          errors: [`Failed to parse CSV: ${error.message}`],
        });
      },
    });
  });
}

export function detectColumnMapping(headers: string[]): {
  full_name: string | null;
  email: string | null;
  manager_email: string | null;
} {
  const mapping = {
    full_name: null as string | null,
    email: null as string | null,
    manager_email: null as string | null,
  };

  const lowerHeaders = headers.map((h) => h.toLowerCase().trim());

  // Detect full_name
  const namePatterns = ['full_name', 'fullname', 'name', 'developer_name', 'developer name', 'employee_name', 'employee name'];
  for (const pattern of namePatterns) {
    const idx = lowerHeaders.findIndex((h) => h === pattern || h.includes(pattern));
    if (idx !== -1) {
      mapping.full_name = headers[idx];
      break;
    }
  }

  // Detect manager_email first (more specific)
  const managerPatterns = ['manager_email', 'manager email', 'manageremail', 'manager', 'reports_to', 'reports to', 'supervisor_email', 'supervisor'];
  for (const pattern of managerPatterns) {
    const idx = lowerHeaders.findIndex((h) => h === pattern || h.includes(pattern));
    if (idx !== -1) {
      mapping.manager_email = headers[idx];
      break;
    }
  }

  // Detect email (excluding manager email column)
  const emailPatterns = ['email', 'developer_email', 'developer email', 'employee_email', 'employee email', 'work_email'];
  for (const pattern of emailPatterns) {
    const idx = lowerHeaders.findIndex((h, i) =>
      (h === pattern || h.includes(pattern)) && headers[i] !== mapping.manager_email
    );
    if (idx !== -1) {
      mapping.email = headers[idx];
      break;
    }
  }

  return mapping;
}

export function getPreviewRows(data: RawRow[], count: number = 10): RawRow[] {
  return data.slice(0, count);
}
