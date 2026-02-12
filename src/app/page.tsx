'use client';

import Image from 'next/image';
import { useValidator } from '@/hooks/useValidator';
import { FileUpload } from '@/components/FileUpload';
import { ColumnMapping } from '@/components/ColumnMapping';
import { RepairSummary } from '@/components/RepairSummary';
import { RepairedDataPreview } from '@/components/RepairedDataPreview';
import { HierarchyPreview } from '@/components/HierarchyPreview';
import { ExportButton } from '@/components/ExportButton';
import { Button, Icons } from '@/components/ui/Button';
import { AppStep } from '@/lib/types';

const steps: { id: AppStep; label: string }[] = [
  { id: 'upload', label: 'Upload' },
  { id: 'map', label: 'Map Columns' },
  { id: 'validate', label: 'Repair' },
  { id: 'fix', label: 'Review' },
  { id: 'preview', label: 'Hierarchy' },
  { id: 'export', label: 'Export' },
];

export default function Home() {
  const {
    step,
    rawData,
    headers,
    columnMapping,
    transformedData,
    repairedData,
    repairResult,
    repairSummary,
    parseErrors,
    hierarchy,
    canProceedFromMapping,
    canExport,
    handleFileUpload,
    updateColumnMapping,
    applyColumnMapping,
    runRepair,
    goToStep,
    handleExport,
    reset,
  } = useValidator();

  const currentStepIndex = steps.findIndex((s) => s.id === step);

  const canNavigateToStep = (index: number): boolean => {
    const targetStep = steps[index].id;
    if (index < currentStepIndex) return true;

    switch (targetStep) {
      case 'upload':
        return true;
      case 'map':
        return rawData.length > 0;
      case 'validate':
        return canProceedFromMapping && transformedData.length > 0;
      case 'fix':
        return repairResult !== null;
      case 'preview':
        return repairResult?.success === true;
      case 'export':
        return repairResult?.success === true;
      default:
        return false;
    }
  };

  const handleStepClick = (index: number) => {
    if (canNavigateToStep(index)) {
      goToStep(steps[index].id);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'upload':
        return (
          <FileUpload
            onFileUpload={handleFileUpload}
            rawData={rawData}
            headers={headers}
            parseErrors={parseErrors}
          />
        );

      case 'map':
        return (
          <ColumnMapping
            headers={headers}
            mapping={columnMapping}
            onMappingChange={updateColumnMapping}
            onProceed={applyColumnMapping}
            canProceed={canProceedFromMapping}
          />
        );

      case 'validate':
        return (
          <div className="space-y-6">
            <div className="bg-white border border-[#D9DAE6] rounded p-6">
              <h3 className="text-base font-semibold text-[#22222A] mb-4">Auto Repair Engine</h3>
              <p className="text-sm text-[#6B6D85] mb-6">
                The repair engine will automatically normalize and fix your data:
              </p>
              <ul className="text-sm text-[#6B6D85] space-y-2 mb-6">
                <li>• Trim whitespace and lowercase emails</li>
                <li>• Remove invalid and duplicate rows</li>
                <li>• Auto-fill missing names from email</li>
                <li>• Fix self-reporting references</li>
                <li>• Create missing manager records</li>
                <li>• Detect and break cycles</li>
              </ul>
              <div className="flex items-center justify-between pt-4 border-t border-[#D9DAE6]">
                <span className="text-sm text-[#6B6D85]">{transformedData.length} rows ready</span>
                <Button onClick={runRepair}>Run Auto Repair</Button>
              </div>
            </div>
          </div>
        );

      case 'fix':
        return repairResult && repairSummary ? (
          <div className="space-y-6">
            <RepairSummary
              summary={repairSummary}
              success={repairResult.success}
              errors={repairResult.errors}
            />
            <RepairedDataPreview data={repairedData} summary={repairSummary} />
            {repairResult.success && (
              <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={() => goToStep('preview')}>
                  View Hierarchy
                </Button>
                <Button onClick={() => goToStep('export')} rightIcon={Icons.ArrowRight}>
                  Continue to Export
                </Button>
              </div>
            )}
          </div>
        ) : null;

      case 'preview':
        return hierarchy ? (
          <div className="space-y-6">
            <HierarchyPreview roots={hierarchy.roots} stats={hierarchy.stats} />
            <div className="flex justify-end">
              <Button onClick={() => goToStep('export')} rightIcon={Icons.ArrowRight}>
                Continue to Export
              </Button>
            </div>
          </div>
        ) : null;

      case 'export':
        return (
          <ExportButton
            data={repairedData}
            onExport={handleExport}
            canExport={canExport}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F3FA]">
      {/* Header */}
      <header className="bg-white border-b border-[#D9DAE6]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Image src="/text=primary.png" alt="Harness SEI" width={180} height={36} />
          {rawData.length > 0 && (
            <Button variant="link" size="sm" onClick={reset}>
              Start Over
            </Button>
          )}
        </div>
      </header>

      {/* Page Title */}
      <div className="bg-white border-b border-[#D9DAE6]">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <h1 className="text-xl font-semibold text-[#22222A]">Developer Records Validator - Harness SEI 2.0</h1>
        </div>
      </div>

      {/* Steps Navigation */}
      <div className="bg-white border-b border-[#D9DAE6]">
        <div className="max-w-6xl mx-auto px-6">
          <nav className="flex">
            {steps.map((s, index) => {
              const isActive = s.id === step;
              const isCompleted = index < currentStepIndex;
              const isClickable = canNavigateToStep(index);

              return (
                <button
                  key={s.id}
                  onClick={() => handleStepClick(index)}
                  disabled={!isClickable}
                  className={`
                    px-4 py-3 text-sm font-medium border-b-2 transition-colors
                    ${isActive
                      ? 'border-[#0278D5] text-[#0278D5]'
                      : isCompleted
                        ? 'border-transparent text-[#22222A] hover:text-[#0278D5]'
                        : 'border-transparent text-[#6B6D85]'
                    }
                    ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
                  `}
                >
                  {s.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-6">
        {renderStepContent()}
      </main>
    </div>
  );
}
