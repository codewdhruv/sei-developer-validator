import { DeveloperRow, HierarchyNode, HierarchyStats } from './types';

export function detectCycles(data: DeveloperRow[]): string[][] {
  const cycles: string[][] = [];
  const emailToManager = new Map<string, string>();

  // Build email -> manager_email mapping
  data.forEach((row) => {
    const email = row.email?.trim().toLowerCase();
    const managerEmail = row.manager_email?.trim().toLowerCase();
    if (email && managerEmail) {
      emailToManager.set(email, managerEmail);
    }
  });

  const visited = new Set<string>();
  const inStack = new Set<string>();
  const foundCycleMembers = new Set<string>();

  function dfs(email: string, path: string[]): void {
    if (foundCycleMembers.has(email)) {
      return;
    }

    if (inStack.has(email)) {
      // Found a cycle - extract just the cycle portion
      const cycleStart = path.indexOf(email);
      if (cycleStart !== -1) {
        const cycle = path.slice(cycleStart);
        cycle.forEach((e) => foundCycleMembers.add(e));
        cycles.push(cycle);
      }
      return;
    }

    if (visited.has(email)) {
      return;
    }

    visited.add(email);
    inStack.add(email);
    path.push(email);

    const manager = emailToManager.get(email);
    if (manager && emailToManager.has(manager)) {
      dfs(manager, path);
    }

    path.pop();
    inStack.delete(email);
  }

  // Run DFS from each node
  Array.from(emailToManager.keys()).forEach((email) => {
    if (!visited.has(email)) {
      dfs(email, []);
    }
  });

  return cycles;
}

export function buildHierarchy(data: DeveloperRow[]): {
  roots: HierarchyNode[];
  stats: HierarchyStats;
  nodeMap: Map<string, HierarchyNode>;
} {
  const nodeMap = new Map<string, HierarchyNode>();
  const allEmails = new Set<string>();

  // Create nodes for all developers
  data.forEach((row) => {
    const email = row.email?.trim().toLowerCase();
    if (email) {
      allEmails.add(email);
      nodeMap.set(email, {
        email,
        full_name: row.full_name || '',
        manager_email: row.manager_email?.trim().toLowerCase() || '',
        children: [],
        isValid: true,
        depth: 0,
      });
    }
  });

  // Build parent-child relationships
  const childEmails = new Set<string>();
  nodeMap.forEach((node) => {
    if (node.manager_email && nodeMap.has(node.manager_email)) {
      const manager = nodeMap.get(node.manager_email)!;
      manager.children.push(node);
      childEmails.add(node.email);
    }

    // Mark invalid nodes (missing managers)
    if (node.manager_email && !allEmails.has(node.manager_email)) {
      node.isValid = false;
    }
  });

  // Find root nodes (no manager or manager not in dataset)
  const roots: HierarchyNode[] = [];
  nodeMap.forEach((node) => {
    if (!node.manager_email || !nodeMap.has(node.manager_email)) {
      roots.push(node);
    }
  });

  // Calculate depths
  function setDepth(node: HierarchyNode, depth: number): void {
    node.depth = depth;
    node.children.forEach((child) => setDepth(child, depth + 1));
  }
  roots.forEach((root) => setDepth(root, 0));

  // Calculate stats
  let maxDepth = 0;
  let leafCount = 0;
  nodeMap.forEach((node) => {
    if (node.depth > maxDepth) maxDepth = node.depth;
    if (node.children.length === 0) leafCount++;
  });

  const stats: HierarchyStats = {
    totalDevs: nodeMap.size,
    rootCount: roots.length,
    maxDepth: maxDepth + 1, // Convert 0-indexed to count
    leafCount,
  };

  return { roots, stats, nodeMap };
}

export function flattenHierarchy(roots: HierarchyNode[]): HierarchyNode[] {
  const result: HierarchyNode[] = [];

  function traverse(node: HierarchyNode): void {
    result.push(node);
    node.children.forEach(traverse);
  }

  roots.forEach(traverse);
  return result;
}
