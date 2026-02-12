'use client';

import { RepairSummary as RepairSummaryType } from '@/lib/repair-engine';

interface RepairSummaryProps {
  summary: RepairSummaryType;
  success: boolean;
  errors: string[];
}

export function RepairSummary({ summary, success, errors }: RepairSummaryProps) {
  return (
    <div className="space-y-6">
      {/* Status */}
      {success ? (
        <div className="bg-green-50 border border-green-200 rounded p-4">
          <h3 className="text-sm font-medium text-green-800">Repair Complete</h3>
          <p className="text-sm text-green-700 mt-1">
            All issues have been resolved. Your data is ready for export.
          </p>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <h3 className="text-sm font-medium text-red-800">Repair Failed</h3>
          <ul className="text-sm text-red-700 mt-1 list-disc list-inside">
            {errors.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Stats Grid */}
      <div className="bg-white border border-[#D9DAE6] rounded">
        <div className="px-6 py-4 border-b border-[#D9DAE6]">
          <h3 className="text-base font-semibold text-[#22222A]">Summary</h3>
        </div>
        <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatItem label="Original Rows" value={summary.originalRowCount} />
          <StatItem label="Final Rows" value={summary.finalRowCount} />
          <StatItem label="Removed" value={summary.rowsRemoved} highlight={summary.rowsRemoved > 0 ? 'warning' : undefined} />
          <StatItem label="Duplicates" value={summary.duplicateEmailsRemoved} />
          <StatItem label="Normalized" value={summary.emailsNormalized} />
          <StatItem label="Names Filled" value={summary.fullNamesAutoFilled} />
          <StatItem label="Managers Created" value={summary.managersAutoCreated} highlight={summary.managersAutoCreated > 0 ? 'info' : undefined} />
          <StatItem label="Self-Refs Fixed" value={summary.selfReportingFixed} />
          <StatItem label="Cycles Found" value={summary.cyclesDetected} highlight={summary.cyclesDetected > 0 ? 'error' : undefined} />
          <StatItem label="Cycles Broken" value={summary.cyclesBroken} />
          <StatItem label="Root Nodes" value={summary.totalRootNodes} highlight="success" />
          <StatItem label="Tree Depth" value={summary.finalTreeDepth} />
        </div>
      </div>

      {/* Removed Rows */}
      {summary.removedRows.length > 0 && (
        <div className="bg-white border border-[#D9DAE6] rounded">
          <div className="px-6 py-4 border-b border-[#D9DAE6]">
            <h3 className="text-base font-semibold text-[#22222A]">Removed Rows</h3>
            <p className="text-sm text-[#6B6D85]">{summary.removedRows.length} rows removed</p>
          </div>
          <div className="overflow-x-auto max-h-48">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-[#6B6D85] uppercase">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-[#6B6D85] uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-[#6B6D85] uppercase">Reason</th>
                </tr>
              </thead>
              <tbody>
                {summary.removedRows.slice(0, 50).map((item, idx) => (
                  <tr key={idx} className="border-t border-[#D9DAE6]">
                    <td className="px-4 py-2 text-[#22222A]">{item.row.email || '(empty)'}</td>
                    <td className="px-4 py-2 text-[#6B6D85]">{item.row.full_name || '(empty)'}</td>
                    <td className="px-4 py-2 text-amber-600">{item.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Auto-Created Managers */}
      {summary.autoCreatedManagers.length > 0 && (
        <div className="bg-white border border-[#D9DAE6] rounded">
          <div className="px-6 py-4 border-b border-[#D9DAE6]">
            <h3 className="text-base font-semibold text-[#22222A]">Auto-Created Managers</h3>
            <p className="text-sm text-[#6B6D85]">{summary.autoCreatedManagers.length} managers created</p>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-2">
              {summary.autoCreatedManagers.map((email, idx) => (
                <span key={idx} className="px-2 py-1 text-xs rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {email}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatItem({
  label,
  value,
  highlight
}: {
  label: string;
  value: number;
  highlight?: 'success' | 'warning' | 'error' | 'info';
}) {
  const colors = {
    success: 'text-green-600',
    warning: 'text-amber-600',
    error: 'text-red-600',
    info: 'text-blue-600',
  };

  return (
    <div className="text-center">
      <div className={`text-2xl font-semibold ${highlight ? colors[highlight] : 'text-[#22222A]'}`}>
        {value}
      </div>
      <div className="text-xs text-[#6B6D85] mt-1">{label}</div>
    </div>
  );
}
