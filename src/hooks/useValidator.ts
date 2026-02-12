'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  AppStep,
  ColumnMapping,
  DeveloperRow,
  RawRow,
} from '@/lib/types';
import { parseCSV, detectColumnMapping } from '@/lib/parser';
import { runAutoRepair, RepairResult, RepairSummary } from '@/lib/repair-engine';
import { buildHierarchy } from '@/lib/hierarchy';
import { exportToCSV } from '@/lib/export';

export function useValidator() {
  const [step, setStep] = useState<AppStep>('upload');
  const [rawData, setRawData] = useState<RawRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    full_name: null,
    email: null,
    manager_email: null,
  });
  const [transformedData, setTransformedData] = useState<DeveloperRow[]>([]);
  const [repairedData, setRepairedData] = useState<DeveloperRow[]>([]);
  const [repairResult, setRepairResult] = useState<RepairResult | null>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);

  const handleFileUpload = useCallback(async (file: File) => {
    const result = await parseCSV(file);
    setRawData(result.data);
    setHeaders(result.headers);
    setParseErrors(result.errors);

    // Auto-detect column mapping
    const detected = detectColumnMapping(result.headers);
    setColumnMapping(detected);

    // Reset downstream state
    setTransformedData([]);
    setRepairedData([]);
    setRepairResult(null);

    if (result.data.length > 0) {
      setStep('map');
    }

    return result;
  }, []);

  const updateColumnMapping = useCallback((mapping: ColumnMapping) => {
    setColumnMapping(mapping);
  }, []);

  const applyColumnMapping = useCallback(() => {
    if (!columnMapping.full_name || !columnMapping.email || !columnMapping.manager_email) {
      return false;
    }

    // Transform raw data using column mapping
    const transformed: DeveloperRow[] = rawData.map((row) => ({
      full_name: row[columnMapping.full_name!] || '',
      email: row[columnMapping.email!] || '',
      manager_email: row[columnMapping.manager_email!] || '',
    }));

    setTransformedData(transformed);
    setStep('validate');

    return true;
  }, [rawData, columnMapping]);

  const runRepair = useCallback(() => {
    if (transformedData.length === 0) return null;

    const result = runAutoRepair(transformedData);
    setRepairResult(result);
    setRepairedData(result.data);
    setStep('fix');

    return result;
  }, [transformedData]);

  const goToPreview = useCallback(() => {
    setStep('preview');
  }, []);

  const goToExport = useCallback(() => {
    setStep('export');
  }, []);

  const handleExport = useCallback((filename?: string) => {
    exportToCSV(repairedData, filename);
  }, [repairedData]);

  const goToStep = useCallback((newStep: AppStep) => {
    setStep(newStep);
  }, []);

  const reset = useCallback(() => {
    setStep('upload');
    setRawData([]);
    setHeaders([]);
    setColumnMapping({ full_name: null, email: null, manager_email: null });
    setTransformedData([]);
    setRepairedData([]);
    setRepairResult(null);
    setParseErrors([]);
  }, []);

  const hierarchy = useMemo(() => {
    if (repairedData.length === 0) return null;
    return buildHierarchy(repairedData);
  }, [repairedData]);

  const canProceedFromMapping = useMemo(() => {
    return !!(columnMapping.full_name && columnMapping.email && columnMapping.manager_email);
  }, [columnMapping]);

  const canExport = useMemo(() => {
    return repairResult?.success === true && repairedData.length > 0;
  }, [repairResult, repairedData]);

  const repairSummary: RepairSummary | null = repairResult?.summary ?? null;

  return {
    // State
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

    // Computed
    canProceedFromMapping,
    canExport,

    // Actions
    handleFileUpload,
    updateColumnMapping,
    applyColumnMapping,
    runRepair,
    goToPreview,
    goToExport,
    handleExport,
    goToStep,
    reset,
  };
}
