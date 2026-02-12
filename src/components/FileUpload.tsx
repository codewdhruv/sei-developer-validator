'use client';

import { useCallback, useState } from 'react';
import { RawRow } from '@/lib/types';
import { getPreviewRows } from '@/lib/parser';

interface FileUploadProps {
  onFileUpload: (file: File) => Promise<{ data: RawRow[]; headers: string[]; errors: string[] }>;
  rawData: RawRow[];
  headers: string[];
  parseErrors: string[];
}

export function FileUpload({ onFileUpload, rawData, headers, parseErrors }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const processFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }
    setIsLoading(true);
    setFileName(file.name);
    try {
      await onFileUpload(file);
    } finally {
      setIsLoading(false);
    }
  }, [onFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        await processFile(files[0]);
      }
    },
    [processFile]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        await processFile(files[0]);
      }
    },
    [processFile]
  );

  const previewRows = getPreviewRows(rawData, 5);

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="bg-white border border-[#D9DAE6] rounded p-6">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded p-12 text-center transition-colors
            ${isDragging ? 'border-[#0278D5] bg-blue-50' : 'border-[#D9DAE6]'}
            ${isLoading ? 'opacity-50 pointer-events-none' : ''}
          `}
        >
          {isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <svg className="animate-spin h-8 w-8 text-[#0278D5]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm text-[#6B6D85]">Processing file...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-[#6B6D85]">
                <svg className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <label className="cursor-pointer">
                  <span className="text-[#0278D5] hover:underline font-medium">Click to upload</span>
                  <input type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />
                </label>
                <span className="text-[#6B6D85]"> or drag and drop</span>
              </div>
              <p className="text-sm text-[#6B6D85]">CSV files only</p>
            </div>
          )}
        </div>
      </div>

      {/* Parse Errors */}
      {parseErrors.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded p-4">
          <h3 className="text-sm font-medium text-amber-800 mb-2">Parse Warnings</h3>
          <ul className="text-sm text-amber-700 list-disc list-inside space-y-1">
            {parseErrors.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* File Loaded Success */}
      {rawData.length > 0 && (
        <div className="bg-white border border-[#D9DAE6] rounded">
          <div className="px-6 py-4 border-b border-[#D9DAE6] flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-[#22222A]">File Loaded</h3>
              <p className="text-sm text-[#6B6D85]">{fileName}</p>
            </div>
            <div className="flex gap-6 text-sm">
              <div>
                <span className="text-[#6B6D85]">Rows: </span>
                <span className="font-medium text-[#22222A]">{rawData.length}</span>
              </div>
              <div>
                <span className="text-[#6B6D85]">Columns: </span>
                <span className="font-medium text-[#22222A]">{headers.length}</span>
              </div>
            </div>
          </div>

          {/* Column Tags */}
          <div className="px-6 py-4 border-b border-[#D9DAE6]">
            <p className="text-sm font-medium text-[#22222A] mb-2">Detected Columns</p>
            <div className="flex flex-wrap gap-2">
              {headers.map((header, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 text-xs rounded bg-gray-100 text-[#22222A]"
                >
                  {header || '(blank)'}
                </span>
              ))}
            </div>
          </div>

          {/* Preview Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-[#6B6D85] uppercase">#</th>
                  {headers.slice(0, 5).map((header, idx) => (
                    <th key={idx} className="px-4 py-2 text-left text-xs font-medium text-[#6B6D85] uppercase truncate max-w-[150px]">
                      {header || '(blank)'}
                    </th>
                  ))}
                  {headers.length > 5 && (
                    <th className="px-4 py-2 text-left text-xs font-medium text-[#6B6D85]">
                      +{headers.length - 5} more
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="border-t border-[#D9DAE6]">
                    <td className="px-4 py-2 text-[#6B6D85]">{rowIdx + 1}</td>
                    {headers.slice(0, 5).map((header, colIdx) => (
                      <td key={colIdx} className="px-4 py-2 truncate max-w-[150px] text-[#22222A]">
                        {row[header] || <span className="text-[#6B6D85]">—</span>}
                      </td>
                    ))}
                    {headers.length > 5 && (
                      <td className="px-4 py-2 text-[#6B6D85]">...</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rawData.length > 5 && (
            <div className="px-6 py-3 text-sm text-[#6B6D85] text-center border-t border-[#D9DAE6]">
              Showing first 5 of {rawData.length} rows
            </div>
          )}
        </div>
      )}
    </div>
  );
}
