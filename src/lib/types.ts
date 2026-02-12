export interface DeveloperRow {
  full_name: string;
  email: string;
  manager_email: string;
  [key: string]: string;
}

export interface RawRow {
  [key: string]: string;
}

export type ValidationErrorType =
  | 'required_field'
  | 'invalid_email'
  | 'duplicate_email'
  | 'missing_manager'
  | 'self_reference'
  | 'cycle'
  | 'blank_header';

export interface ValidationError {
  type: ValidationErrorType;
  rowIndex?: number;
  field?: string;
  message: string;
  severity: 'error' | 'warning';
  cycleChain?: string[];
}

export interface ColumnMapping {
  full_name: string | null;
  email: string | null;
  manager_email: string | null;
}

export interface ValidationStats {
  totalRows: number;
  validRows: number;
  invalidEmails: number;
  duplicateEmails: number;
  missingManagers: number;
  selfReferences: number;
  cycles: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  stats: ValidationStats;
}

export interface ParseResult {
  data: RawRow[];
  headers: string[];
  errors: string[];
}

export interface HierarchyNode {
  email: string;
  full_name: string;
  manager_email: string;
  children: HierarchyNode[];
  isValid: boolean;
  depth: number;
}

export interface HierarchyStats {
  totalDevs: number;
  rootCount: number;
  maxDepth: number;
  leafCount: number;
}

export type AppStep = 'upload' | 'map' | 'validate' | 'fix' | 'preview' | 'export';

export interface AppState {
  step: AppStep;
  rawData: RawRow[];
  headers: string[];
  columnMapping: ColumnMapping;
  transformedData: DeveloperRow[];
  validationResult: ValidationResult | null;
  fixHistory: string[];
}
