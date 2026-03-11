import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  Background,
  Controls,
  ReactFlowProvider,
  useReactFlow,
  NodeProps,
  Edge,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import * as dagre from 'dagre';
import { ChevronRight, ChevronDown, ThumbsUp, ThumbsDown, Info, MousePointer2 } from 'lucide-react';

/* ─── Custom Node ─────────────────────────────────────────────── */
const CustomNode = ({ data }: NodeProps) => {
  const isRoot = (data.id as string) === 'root';
  return (
    <div
      onClick={() => { if (data.hasChildren && data.onToggle) (data.onToggle as (id: string) => void)(data.id as string); }}
      style={{
        background: isRoot ? '#3d3a6e' : '#2B343B',
        border: `1px solid ${isRoot ? 'rgba(130,110,255,0.6)' : 'rgba(255,255,255,0.12)'}`,
        borderRadius: 12,
        padding: '10px 16px',
        color: 'rgba(255,255,255,0.95)',
        fontSize: 12,
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        minWidth: 160,
        maxWidth: 230,
        boxSizing: 'border-box',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0, width: 1, height: 1 }} />
      <span style={{ flex: 1, lineHeight: '1.3' }}>{String(data.label)}</span>
      {data.hasChildren && (
        (data.isExpanded as boolean)
          ? <ChevronDown width={14} style={{ flexShrink: 0, opacity: 0.5 }} />
          : <ChevronRight width={14} style={{ flexShrink: 0, opacity: 0.5 }} />
      )}
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0, width: 1, height: 1 }} />
    </div>
  );
};
const nodeTypes = { custom: CustomNode };

/* ─── Types ───────────────────────────────────────────────────── */
type MindMapData = { name: string; children?: MindMapData[] };

const NODE_W = 230;
const NODE_H = 50;

/* ─── Dagre layout ────────────────────────────────────────────── */
function applyLayout(nodes: Node[], edges: Edge[]): Node[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', nodesep: 60, ranksep: 100, marginx: 30, marginy: 30 });
  nodes.forEach(n => g.setNode(n.id, { width: NODE_W, height: NODE_H }));
  edges.forEach(e => g.setEdge(e.source, e.target));
  dagre.layout(g);
  return nodes.map(n => {
    const p = g.node(n.id);
    return {
      ...n,
      position: { x: p.x - NODE_W / 2, y: p.y - NODE_H / 2 },
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
    };
  });
}

/* ─── Resolve raw backend data (may have { mindmap: {...} } wrapper) ─── */
function resolveData(raw: unknown): MindMapData | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (r.mindmap && typeof r.mindmap === 'object') return resolveData(r.mindmap);
  if (typeof r.name === 'string') return r as unknown as MindMapData;
  return null;
}

/* ─── Build nodes/edges from tree ────────────────────────────── */
function buildGraph(
  nodeData: MindMapData,
  expanded: Set<string>,
  onToggle: (id: string) => void,
  parentId: string | null,
  pathId: string,
  nodes: Node[],
  edges: Edge[],
) {
  const hasChildren = !!(nodeData.children?.length);
  const isExpanded = expanded.has(pathId);

  nodes.push({
    id: pathId,
    type: 'custom',
    position: { x: 0, y: 0 }, // will be overwritten by dagre
    data: { label: nodeData.name || 'Untitled', hasChildren, isExpanded, id: pathId, onToggle },
  });

  if (parentId !== null) {
    edges.push({
      id: `e_${parentId}__${pathId}`,
      source: parentId,
      target: pathId,
      type: 'smoothstep',
      style: { stroke: 'rgba(255,255,255,0.25)', strokeWidth: 2 },
    });
  }

  if (hasChildren && isExpanded) {
    nodeData.children!.forEach((child, i) =>
      buildGraph(child, expanded, onToggle, pathId, `${pathId}_${i}`, nodes, edges)
    );
  }
}

/* ─── Inner component (needs ReactFlowProvider above it) ──────── */
function MindMapInner({ data }: { data: unknown }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { fitView } = useReactFlow();

  const actual = useMemo(() => resolveData(data), [data]);

  // Default: only root expanded → shows root's direct children (collapsed)
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(['root']));

  const onToggle = useCallback((id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!actual) return;
    const ns: Node[] = [];
    const es: Edge[] = [];
    buildGraph(actual, expanded, onToggle, null, 'root', ns, es);
    const laid = applyLayout(ns, es);
    setNodes(laid);
    setEdges(es);
    // re-fit after layout settles
    setTimeout(() => fitView({ padding: 0.25, duration: 300 }), 50);
  }, [actual, expanded, onToggle, setNodes, setEdges, fitView]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      minZoom={0.1}
      maxZoom={2}
      fitView
      fitViewOptions={{ padding: 0.25 }}
      proOptions={{ hideAttribution: true }}
      nodesDraggable={false}
    >
      <Background color="rgba(255,255,255,0.03)" gap={40} size={1} />
      <Controls showInteractive={false} position="bottom-left" />
    </ReactFlow>
  );
}

/* ─── Exported wrapper ────────────────────────────────────────── */
export default function MindMapViewer({ data }: { data: unknown }) {
  const actual = useMemo(() => resolveData(data), [data]);
  const title = actual?.name || 'Mind Map';

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 65px)', backgroundColor: '#1A1D23' }}>
      <style>{`
        .react-flow__pane { cursor: grab; }
        .react-flow__pane:active { cursor: grabbing; }
        .react-flow__controls { border: none !important; background: transparent !important; box-shadow: none !important; }
        .react-flow__controls-button { background: #2B343B !important; border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 8px !important; }
        .react-flow__controls-button svg { fill: white !important; }
      `}</style>

      <div className="flex-1">
        <ReactFlowProvider>
          <MindMapInner data={data} />
        </ReactFlowProvider>
      </div>

      <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-[#14171A] flex-shrink-0">
        <div className="min-w-0">
          <p className="text-sm font-bold text-white/90 truncate">{title}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[10px] text-white/40 flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full">
              <MousePointer2 className="w-2.5 h-2.5" /> Tap to expand
            </span>
            <span className="text-[10px] text-white/40 flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full">
              <Info className="w-2.5 h-2.5" /> Pinch to zoom
            </span>
          </div>
        </div>
        <div className="flex items-center gap-6 flex-shrink-0">
          <ThumbsUp className="w-5 h-5 text-white/30 hover:text-white/70 transition-colors cursor-pointer" />
          <ThumbsDown className="w-5 h-5 text-white/30 hover:text-white/70 transition-colors cursor-pointer" />
        </div>
      </div>
    </div>
  );
}
