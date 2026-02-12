'use client';

import { useState } from 'react';
import { HierarchyNode, HierarchyStats } from '@/lib/types';

interface HierarchyPreviewProps {
  roots: HierarchyNode[];
  stats: HierarchyStats;
}

export function HierarchyPreview({ roots, stats }: HierarchyPreviewProps) {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="bg-white border border-[#D9DAE6] rounded">
        <div className="px-6 py-4 border-b border-[#D9DAE6]">
          <h3 className="text-base font-semibold text-[#22222A]">Hierarchy Statistics</h3>
        </div>
        <div className="p-6 grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-[#22222A]">{stats.totalDevs}</div>
            <div className="text-xs text-[#6B6D85] mt-1">Total Developers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-[#22222A]">{stats.rootCount}</div>
            <div className="text-xs text-[#6B6D85] mt-1">Root Nodes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-[#22222A]">{stats.maxDepth}</div>
            <div className="text-xs text-[#6B6D85] mt-1">Max Depth</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-[#22222A]">{stats.leafCount}</div>
            <div className="text-xs text-[#6B6D85] mt-1">Leaf Nodes</div>
          </div>
        </div>
      </div>

      {/* Tree */}
      <div className="bg-white border border-[#D9DAE6] rounded">
        <div className="px-6 py-4 border-b border-[#D9DAE6]">
          <h3 className="text-base font-semibold text-[#22222A]">Organization Tree</h3>
        </div>
        <div className="p-6 max-h-[400px] overflow-y-auto">
          {roots.length === 0 ? (
            <div className="text-center py-8 text-[#6B6D85]">
              No hierarchy data to display
            </div>
          ) : (
            <div className="space-y-1">
              {roots.map((node) => (
                <TreeNode key={node.email} node={node} level={0} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TreeNode({ node, level }: { node: HierarchyNode; level: number }) {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div
        className={`
          flex items-center gap-2 py-1.5 px-2 rounded hover:bg-gray-50 cursor-pointer text-sm
          ${!node.isValid ? 'bg-red-50' : ''}
        `}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
      >
        {hasChildren ? (
          <button className="w-4 h-4 flex items-center justify-center text-[#6B6D85]">
            <svg
              className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <span className="w-4 h-4 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D9DAE6]"></span>
          </span>
        )}

        <span className="text-[#22222A]">{node.full_name || '(unnamed)'}</span>
        <span className="text-[#6B6D85] text-xs font-mono">{node.email}</span>

        <div className="flex items-center gap-1 ml-auto">
          {!node.isValid && (
            <span className="px-1.5 py-0.5 text-xs rounded bg-red-100 text-red-700">Invalid</span>
          )}
          {level === 0 && (
            <span className="px-1.5 py-0.5 text-xs rounded bg-green-100 text-green-700">Root</span>
          )}
          {hasChildren && (
            <span className="text-xs text-[#6B6D85]">({node.children.length})</span>
          )}
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <TreeNode key={child.email} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
