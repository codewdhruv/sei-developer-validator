import { DeveloperRow } from './types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface RepairSummary {
  originalRowCount: number;
  finalRowCount: number;
  rowsRemoved: number;
  duplicateEmailsRemoved: number;
  emailsNormalized: number;
  fullNamesAutoFilled: number;
  managersAutoCreated: number;
  selfReportingFixed: number;
  cyclesDetected: number;
  cyclesBroken: number;
  totalRootNodes: number;
  finalTreeDepth: number;
  removedRows: { row: DeveloperRow; reason: string }[];
  autoCreatedManagers: string[];
  modifiedRows: Set<string>; // emails of rows that were modified
}

export interface RepairResult {
  success: boolean;
  data: DeveloperRow[];
  summary: RepairSummary;
  errors: string[];
}

function deriveNameFromEmail(email: string): string {
  const prefix = email.split('@')[0];
  return prefix
    .replace(/[._-]/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function runAutoRepair(inputData: DeveloperRow[]): RepairResult {
  const summary: RepairSummary = {
    originalRowCount: inputData.length,
    finalRowCount: 0,
    rowsRemoved: 0,
    duplicateEmailsRemoved: 0,
    emailsNormalized: 0,
    fullNamesAutoFilled: 0,
    managersAutoCreated: 0,
    selfReportingFixed: 0,
    cyclesDetected: 0,
    cyclesBroken: 0,
    totalRootNodes: 0,
    finalTreeDepth: 0,
    removedRows: [],
    autoCreatedManagers: [],
    modifiedRows: new Set(),
  };

  const errors: string[] = [];
  let data = inputData.map((row) => ({ ...row })); // Deep copy

  // ═══════════════════════════════════════════════════════════════════════════
  // RULE 1: Normalize Identity Fields
  // ═══════════════════════════════════════════════════════════════════════════
  data = data.map((row) => {
    const originalEmail = row.email;
    const originalManagerEmail = row.manager_email;
    const originalFullName = row.full_name;

    const newRow: DeveloperRow = {
      ...row,
      full_name: (row.full_name || '').trim(),
      email: (row.email || '').trim().toLowerCase(),
      manager_email: (row.manager_email || '').trim().toLowerCase(),
    };

    // Track if normalization changed anything
    if (
      newRow.email !== originalEmail ||
      newRow.manager_email !== originalManagerEmail ||
      newRow.full_name !== originalFullName
    ) {
      summary.emailsNormalized++;
      if (newRow.email) {
        summary.modifiedRows.add(newRow.email);
      }
    }

    return newRow;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // RULE 2: Remove Structurally Invalid Rows
  // ═══════════════════════════════════════════════════════════════════════════
  const validRows: DeveloperRow[] = [];
  data.forEach((row) => {
    if (!row.email || !isValidEmail(row.email)) {
      summary.removedRows.push({
        row,
        reason: !row.email ? 'Missing email' : `Invalid email format: ${row.email}`,
      });
      summary.rowsRemoved++;
    } else {
      validRows.push(row);
    }
  });
  data = validRows;

  // ═══════════════════════════════════════════════════════════════════════════
  // RULE 3: Auto-Fill Missing full_name
  // ═══════════════════════════════════════════════════════════════════════════
  data = data.map((row) => {
    if (!row.full_name || row.full_name.trim() === '') {
      const derivedName = deriveNameFromEmail(row.email);
      summary.fullNamesAutoFilled++;
      summary.modifiedRows.add(row.email);
      return { ...row, full_name: derivedName };
    }
    return row;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // RULE 4: Resolve Duplicate Emails (Keep First)
  // ═══════════════════════════════════════════════════════════════════════════
  const seenEmails = new Set<string>();
  const deduplicatedData: DeveloperRow[] = [];
  data.forEach((row) => {
    if (seenEmails.has(row.email)) {
      summary.removedRows.push({
        row,
        reason: `Duplicate email: ${row.email}`,
      });
      summary.duplicateEmailsRemoved++;
      summary.rowsRemoved++;
    } else {
      seenEmails.add(row.email);
      deduplicatedData.push(row);
    }
  });
  data = deduplicatedData;

  // ═══════════════════════════════════════════════════════════════════════════
  // RULE 5: Fix Self-Reporting
  // ═══════════════════════════════════════════════════════════════════════════
  data = data.map((row) => {
    if (row.manager_email && row.email === row.manager_email) {
      summary.selfReportingFixed++;
      summary.modifiedRows.add(row.email);
      return { ...row, manager_email: '' };
    }
    return row;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // RULE 6: Auto-Create Missing Managers (Recursive)
  // ═══════════════════════════════════════════════════════════════════════════
  let missingManagersExist = true;
  while (missingManagersExist) {
    const existingEmails = new Set(data.map((r) => r.email));
    const missingManagers = new Set<string>();

    data.forEach((row) => {
      if (row.manager_email && !existingEmails.has(row.manager_email)) {
        missingManagers.add(row.manager_email);
      }
    });

    if (missingManagers.size === 0) {
      missingManagersExist = false;
    } else {
      missingManagers.forEach((managerEmail) => {
        const newManager: DeveloperRow = {
          full_name: deriveNameFromEmail(managerEmail),
          email: managerEmail,
          manager_email: '',
        };
        data.push(newManager);
        summary.managersAutoCreated++;
        summary.autoCreatedManagers.push(managerEmail);
        summary.modifiedRows.add(managerEmail);
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RULE 7: Detect and Resolve Cycles
  // ═══════════════════════════════════════════════════════════════════════════
  let cyclesExist = true;
  while (cyclesExist) {
    const cycle = detectFirstCycle(data);
    if (cycle.length === 0) {
      cyclesExist = false;
    } else {
      summary.cyclesDetected++;
      // Break cycle at first node encountered
      const firstNodeEmail = cycle[0];
      data = data.map((row) => {
        if (row.email === firstNodeEmail) {
          summary.cyclesBroken++;
          summary.modifiedRows.add(row.email);
          return { ...row, manager_email: '' };
        }
        return row;
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FINAL INTEGRITY VERIFICATION
  // ═══════════════════════════════════════════════════════════════════════════
  const finalEmails = new Set<string>();
  let hasDuplicates = false;
  let hasMissingEmails = false;
  let hasInvalidEmails = false;
  let hasSelfReporting = false;
  let hasMissingManagers = false;
  let hasCycles = false;

  data.forEach((row) => {
    if (!row.email) {
      hasMissingEmails = true;
      errors.push('Integrity violation: Missing email found');
    }
    if (row.email && !isValidEmail(row.email)) {
      hasInvalidEmails = true;
      errors.push(`Integrity violation: Invalid email format: ${row.email}`);
    }
    if (finalEmails.has(row.email)) {
      hasDuplicates = true;
      errors.push(`Integrity violation: Duplicate email: ${row.email}`);
    }
    finalEmails.add(row.email);
    if (row.email && row.manager_email && row.email === row.manager_email) {
      hasSelfReporting = true;
      errors.push(`Integrity violation: Self-reporting: ${row.email}`);
    }
  });

  // Check for missing manager references
  data.forEach((row) => {
    if (row.manager_email && !finalEmails.has(row.manager_email)) {
      hasMissingManagers = true;
      errors.push(`Integrity violation: Missing manager: ${row.manager_email}`);
    }
  });

  // Final cycle check
  const finalCycle = detectFirstCycle(data);
  if (finalCycle.length > 0) {
    hasCycles = true;
    errors.push(`Integrity violation: Cycle detected: ${finalCycle.join(' → ')}`);
  }

  // Check for at least one root
  const rootNodes = data.filter((r) => !r.manager_email || r.manager_email === '');
  if (rootNodes.length === 0) {
    errors.push('Integrity violation: No root nodes exist');
  }

  const success =
    !hasDuplicates &&
    !hasMissingEmails &&
    !hasInvalidEmails &&
    !hasSelfReporting &&
    !hasMissingManagers &&
    !hasCycles &&
    rootNodes.length > 0;

  // Calculate final stats
  summary.finalRowCount = data.length;
  summary.totalRootNodes = rootNodes.length;
  summary.finalTreeDepth = calculateMaxDepth(data);

  return {
    success,
    data,
    summary,
    errors,
  };
}

function detectFirstCycle(data: DeveloperRow[]): string[] {
  const emailToManager = new Map<string, string>();

  data.forEach((row) => {
    if (row.manager_email) {
      emailToManager.set(row.email, row.manager_email);
    }
  });

  const visited = new Set<string>();
  const inStack = new Set<string>();

  for (const email of Array.from(emailToManager.keys())) {
    const cycle = dfs(email, emailToManager, visited, inStack, []);
    if (cycle.length > 0) {
      return cycle;
    }
  }

  return [];
}

function dfs(
  email: string,
  emailToManager: Map<string, string>,
  visited: Set<string>,
  inStack: Set<string>,
  path: string[]
): string[] {
  if (inStack.has(email)) {
    // Found cycle - return the cycle portion
    const cycleStart = path.indexOf(email);
    if (cycleStart !== -1) {
      return path.slice(cycleStart);
    }
    return [email];
  }

  if (visited.has(email)) {
    return [];
  }

  visited.add(email);
  inStack.add(email);
  path.push(email);

  const manager = emailToManager.get(email);
  if (manager && emailToManager.has(manager)) {
    const result = dfs(manager, emailToManager, visited, inStack, path);
    if (result.length > 0) {
      return result;
    }
  }

  path.pop();
  inStack.delete(email);
  return [];
}

function calculateMaxDepth(data: DeveloperRow[]): number {
  const emailToManager = new Map<string, string>();
  data.forEach((row) => {
    emailToManager.set(row.email, row.manager_email || '');
  });

  const depths = new Map<string, number>();

  function getDepth(email: string, visited: Set<string>): number {
    if (depths.has(email)) {
      return depths.get(email)!;
    }

    if (visited.has(email)) {
      return 0; // Prevent infinite loop (shouldn't happen after repair)
    }

    visited.add(email);
    const managerEmail = emailToManager.get(email);

    if (!managerEmail) {
      depths.set(email, 0);
      return 0;
    }

    const managerDepth = getDepth(managerEmail, visited);
    const depth = managerDepth + 1;
    depths.set(email, depth);
    return depth;
  }

  let maxDepth = 0;
  data.forEach((row) => {
    const depth = getDepth(row.email, new Set());
    if (depth > maxDepth) {
      maxDepth = depth;
    }
  });

  return maxDepth + 1; // Convert to 1-indexed depth
}
