'use client';

import { useState } from 'react';
import { Button, Icons } from './ui/Button';
import { DeveloperRow } from '@/lib/types';
import { generateCSVPreview } from '@/lib/export';

interface ExportButtonProps {
  data: DeveloperRow[];
  onExport: (filename?: string) => void;
  canExport: boolean;
}

export function ExportButton({ data, onExport, canExport }: ExportButtonProps) {
  const [filename, setFilename] = useState('sei_developers.csv');
  const [exported, setExported] = useState(false);

  const handleExport = () => {
    onExport(filename);
    setExported(true);
  };

  const preview = generateCSVPreview(data, 3);

  if (!canExport) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded p-6 text-center">
        <h3 className="text-sm font-medium text-amber-800 mb-2">Export Not Available</h3>
        <p className="text-sm text-amber-700">
          Please complete the repair step first to fix all validation issues.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* CSV Preview */}
      <div className="bg-white border border-[#D9DAE6] rounded">
        <div className="px-6 py-4 border-b border-[#D9DAE6]">
          <h3 className="text-base font-semibold text-[#22222A]">CSV Preview</h3>
          <p className="text-sm text-[#6B6D85]">First 3 rows of {data.length} total</p>
        </div>
        <div className="p-6">
          <div className="bg-gray-900 rounded p-4 overflow-x-auto">
            <pre className="text-sm text-green-400 font-mono">{preview}</pre>
          </div>
        </div>
      </div>

      {/* Export Settings */}
      <div className="bg-white border border-[#D9DAE6] rounded">
        <div className="px-6 py-4 border-b border-[#D9DAE6]">
          <h3 className="text-base font-semibold text-[#22222A]">Export</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#22222A] mb-1">Filename</label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="w-full px-3 py-2 border border-[#D9DAE6] rounded text-sm focus:outline-none focus:border-[#0278D5]"
              placeholder="sei_developers.csv"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#D9DAE6]">
            <span className="text-sm text-[#6B6D85]">{data.length} developers ready for export</span>
            <Button onClick={handleExport} leftIcon={Icons.Download}>
              Download CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Success */}
      {exported && (
        <div className="bg-green-50 border border-green-200 rounded p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-green-800">Export Complete</h3>
              <p className="text-sm text-green-700 mt-1">Your file has been downloaded.</p>
            </div>
            <Button variant="secondary" size="sm" onClick={handleExport}>
              Download Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
