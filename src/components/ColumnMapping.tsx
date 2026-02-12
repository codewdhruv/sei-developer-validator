'use client';

import { ColumnMapping as ColumnMappingType } from '@/lib/types';
import { Button, Icons } from './ui/Button';

interface ColumnMappingProps {
  headers: string[];
  mapping: ColumnMappingType;
  onMappingChange: (mapping: ColumnMappingType) => void;
  onProceed: () => boolean;
  canProceed: boolean;
}

const requiredFields: { key: keyof ColumnMappingType; label: string; description: string }[] = [
  { key: 'full_name', label: 'Full Name', description: 'Developer display name' },
  { key: 'email', label: 'Email', description: 'Unique identifier' },
  { key: 'manager_email', label: 'Manager Email', description: 'Reports to (hierarchy)' },
];

export function ColumnMapping({
  headers,
  mapping,
  onMappingChange,
  onProceed,
  canProceed,
}: ColumnMappingProps) {
  const handleChange = (field: keyof ColumnMappingType, value: string) => {
    onMappingChange({
      ...mapping,
      [field]: value || null,
    });
  };

  const getAvailableHeaders = (currentField: keyof ColumnMappingType) => {
    const usedHeaders = Object.entries(mapping)
      .filter(([key, value]) => key !== currentField && value)
      .map(([, value]) => value);
    return headers.filter((h) => !usedHeaders.includes(h));
  };

  const mappedCount = Object.values(mapping).filter((v) => v !== null).length;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#D9DAE6] rounded">
        <div className="px-6 py-4 border-b border-[#D9DAE6]">
          <h3 className="text-base font-semibold text-[#22222A]">Map Columns</h3>
          <p className="text-sm text-[#6B6D85]">{mappedCount}/3 fields mapped</p>
        </div>

        <div className="p-6 space-y-4">
          {requiredFields.map((field) => {
            const isMapped = mapping[field.key] !== null;

            return (
              <div key={field.key} className="flex items-center gap-4">
                <div className="w-40">
                  <label className="block text-sm font-medium text-[#22222A]">
                    {field.label}
                  </label>
                  <p className="text-xs text-[#6B6D85]">{field.description}</p>
                </div>
                <div className="flex-1">
                  <select
                    value={mapping[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className={`
                      w-full px-3 py-2 border rounded text-sm
                      focus:outline-none focus:border-[#0278D5]
                      ${isMapped ? 'border-green-500 bg-green-50' : 'border-[#D9DAE6]'}
                    `}
                  >
                    <option value="">Select column...</option>
                    {getAvailableHeaders(field.key).map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                </div>
                {isMapped && (
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>

        <div className="px-6 py-4 border-t border-[#D9DAE6] flex justify-end">
          <Button onClick={onProceed} disabled={!canProceed} rightIcon={Icons.ArrowRight}>
            Continue
          </Button>
        </div>
      </div>

      {!canProceed && (
        <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-blue-800">
          Please map all three required fields to continue.
        </div>
      )}
    </div>
  );
}
