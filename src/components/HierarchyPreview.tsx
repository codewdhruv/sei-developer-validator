'use client';

import { useState } from 'react';
import { HierarchyNode, HierarchyStats } from '@/lib/types';

interface HierarchyPreviewProps {
  roots: HierarchyNode[];
  stats: HierarchyStats;
}

export function HierarchyPreview({ roots, stats }: HierarchyPreviewProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [orgExpanded, setOrgExpanded] = useState(true);

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

      {/* Org Chart */}
      <div className={`bg-white border border-[#D9DAE6] rounded ${isMaximized ? 'fixed inset-4 z-50' : ''}`}>
        <div className="px-6 py-4 border-b border-[#D9DAE6] flex items-center justify-between">
          <h3 className="text-base font-semibold text-[#22222A]">Organization Tree</h3>
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="flex items-center gap-2 text-[#0278D5] text-sm font-medium hover:underline"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMaximized ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              )}
            </svg>
            {isMaximized ? 'Close' : 'Maximize'}
          </button>
        </div>

        {/* Scrollable canvas */}
        <div className={`overflow-auto ${isMaximized ? 'h-[calc(100%-60px)]' : 'h-[500px]'}`}>
          <div className="p-8 inline-block min-w-full">
            {roots.length === 0 ? (
              <div className="text-center py-8 text-[#6B6D85]">
                No hierarchy data to display
              </div>
            ) : (
              <div className="flex flex-col items-center">
                {/* Organization Root Node */}
                <OrgCard
                  name="Organization"
                  subtitle="Level 0"
                  childCount={roots.length}
                  isExpanded={orgExpanded}
                  onToggle={() => setOrgExpanded(!orgExpanded)}
                  variant="root"
                />

                {/* Children of Organization */}
                {orgExpanded && roots.length > 0 && (
                  <>
                    {/* Vertical line down from org */}
                    <div className="w-px h-6 bg-[#D9DAE6]" />

                    {/* Horizontal line connecting all roots */}
                    {roots.length > 1 && (
                      <div
                        className="h-px bg-[#D9DAE6]"
                        style={{ width: `${(roots.length - 1) * 224 + 208}px` }}
                      />
                    )}

                    {/* Root nodes */}
                    <div className="flex gap-4">
                      {roots.map((node) => (
                        <TreeNode
                          key={node.email}
                          node={node}
                          showTopConnector={roots.length > 1}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TreeNode({
  node,
  showTopConnector = true
}: {
  node: HierarchyNode;
  showTopConnector?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.children.length > 0;

  return (
    <div className="flex flex-col items-center">
      {/* Top connector line */}
      {showTopConnector && (
        <div className="w-px h-4 bg-[#D9DAE6]" />
      )}
      {!showTopConnector && (
        <div className="w-px h-6 bg-[#D9DAE6]" />
      )}

      {/* Node card */}
      <OrgCard
        name={node.full_name || '(unnamed)'}
        subtitle={`Level ${node.depth + 1}: ${node.email}`}
        childCount={node.children.length}
        isExpanded={expanded}
        onToggle={hasChildren ? () => setExpanded(!expanded) : undefined}
        variant="member"
      />

      {/* Children */}
      {expanded && hasChildren && (
        <>
          {/* Vertical line down */}
          <div className="w-px h-6 bg-[#D9DAE6]" />

          {/* Horizontal line connecting children */}
          {node.children.length > 1 && (
            <div
              className="h-px bg-[#D9DAE6]"
              style={{ width: `${(node.children.length - 1) * 224 + 208}px` }}
            />
          )}

          {/* Child nodes */}
          <div className="flex gap-4">
            {node.children.map((child) => (
              <TreeNode
                key={child.email}
                node={child}
                showTopConnector={node.children.length > 1}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function OrgCard({
  name,
  subtitle,
  childCount,
  isExpanded,
  onToggle,
  variant = 'member',
}: {
  name: string;
  subtitle: string;
  childCount: number;
  isExpanded: boolean;
  onToggle?: () => void;
  variant: 'root' | 'member';
}) {
  return (
    <div className={`
      bg-white border border-[#D9DAE6] rounded-lg shadow-sm w-52 flex-shrink-0
      ${variant === 'root' ? 'border-l-4 border-l-orange-400' : 'border-l-4 border-l-yellow-400'}
    `}>
      <div className="p-4">
        <div className="font-semibold text-[#22222A] text-sm truncate" title={name}>
          {name}
        </div>
        <div className="text-xs text-[#6B6D85] mt-1 truncate" title={subtitle}>
          {subtitle}
        </div>
        {childCount > 0 && onToggle && (
          <button
            onClick={onToggle}
            className={`mt-3 w-full py-1.5 px-3 text-xs font-medium border rounded flex items-center justify-center gap-1 ${
              isExpanded
                ? 'text-white bg-[#0278D5] border-[#0278D5]'
                : 'text-[#0278D5] border-[#0278D5] hover:bg-blue-50'
            }`}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {isExpanded ? 'Hide' : 'View'} {childCount} member{childCount !== 1 ? 's' : ''}
          </button>
        )}
      </div>
    </div>
  );
}
