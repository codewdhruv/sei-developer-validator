'use client';

import { DeveloperRow } from '@/lib/types';
import { RepairSummary } from '@/lib/repair-engine';

interface RepairedDataPreviewProps {
  data: DeveloperRow[];
  summary: RepairSummary;
}

export function RepairedDataPreview({ data, summary }: RepairedDataPreviewProps) {
  const previewRows = data.slice(0, 20);
  const autoCreatedSet = new Set(summary.autoCreatedManagers);

  return (
    <div className="bg-white border border-[#D9DAE6] rounded">
      <div className="px-6 py-4 border-b border-[#D9DAE6] flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-[#22222A]">Clean Data Preview</h3>
          <p className="text-sm text-[#6B6D85]">Showing {Math.min(20, data.length)} of {data.length} rows</p>
        </div>
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            Auto-created
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Modified
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
            Root
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-[#6B6D85] uppercase">#</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-[#6B6D85] uppercase">Full Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-[#6B6D85] uppercase">Email</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-[#6B6D85] uppercase">Manager</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-[#6B6D85] uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {previewRows.map((row, idx) => {
              const isAutoCreated = autoCreatedSet.has(row.email);
              const isModified = summary.modifiedRows.has(row.email) && !isAutoCreated;
              const isRoot = !row.manager_email;

              let rowClass = '';
              if (isAutoCreated) rowClass = 'bg-blue-50';
              else if (isModified) rowClass = 'bg-amber-50';

              return (
                <tr key={row.email} className={`border-t border-[#D9DAE6] ${rowClass}`}>
                  <td className="px-4 py-2 text-[#6B6D85]">{idx + 1}</td>
                  <td className="px-4 py-2 text-[#22222A]">{row.full_name}</td>
                  <td className="px-4 py-2 text-[#6B6D85] font-mono text-xs">{row.email}</td>
                  <td className="px-4 py-2 font-mono text-xs">
                    {row.manager_email || <span className="text-green-600">— root —</span>}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-1">
                      {isRoot && <span className="px-1.5 py-0.5 text-xs rounded bg-green-100 text-green-700">Root</span>}
                      {isAutoCreated && <span className="px-1.5 py-0.5 text-xs rounded bg-blue-100 text-blue-700">Created</span>}
                      {isModified && <span className="px-1.5 py-0.5 text-xs rounded bg-amber-100 text-amber-700">Modified</span>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data.length > 20 && (
        <div className="px-6 py-3 text-sm text-[#6B6D85] text-center border-t border-[#D9DAE6]">
          Showing first 20 of {data.length} rows
        </div>
      )}
    </div>
  );
}
