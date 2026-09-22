import { useMemo, useState } from "react";

export interface GraphNode {
  id: string; // "kb:section:concept"
  title: string;
  kb: string;
}

export interface GraphEdge {
  /** Prerequisite id (edge points from -> to, "from unlocks to"). */
  from: string;
  to: string;
}

export interface PrereqGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  /** Local/contextual mode: only show this concept and its direct neighbors. Omit for global mode. */
  focusId?: string;
  onNodeClick?: (id: string) => void;
}

/** Topologically sorts nodes by their prerequisite edges; throws on a cycle. */
export function topologicalSort(nodes: GraphNode[], edges: GraphEdge[]): string[] {
  const inDegree = new Map<string, number>(nodes.map((n) => [n.id, 0]));
  const adjacency = new Map<string, string[]>(nodes.map((n) => [n.id, []]));
  for (const { from, to } of edges) {
    adjacency.get(from)?.push(to);
    inDegree.set(to, (inDegree.get(to) ?? 0) + 1);
  }

  const queue = nodes.filter((n) => inDegree.get(n.id) === 0).map((n) => n.id);
  const order: string[] = [];
  while (queue.length > 0) {
    const id = queue.shift()!;
    order.push(id);
    for (const next of adjacency.get(id) ?? []) {
      const remaining = (inDegree.get(next) ?? 0) - 1;
      inDegree.set(next, remaining);
      if (remaining === 0) queue.push(next);
    }
  }

  if (order.length !== nodes.length) {
    throw new Error("PrereqGraph: cycle detected, cannot produce a topological order");
  }
  return order;
}

function layerNodes(nodes: GraphNode[], edges: GraphEdge[]): Map<string, number> {
  const order = topologicalSort(nodes, edges);
  const depth = new Map<string, number>();
  for (const id of order) {
    const incoming = edges.filter((e) => e.to === id);
    const maxParentDepth = incoming.reduce((max, e) => Math.max(max, depth.get(e.from) ?? 0), -1);
    depth.set(id, maxParentDepth + 1);
  }
  return depth;
}

/**
 * Directed prerequisite graph. Global mode (no focusId) renders the full
 * DAG with cross-KB edges visually distinct (dashed). Local/contextual
 * mode (focusId set) renders only the focus node and its direct
 * prerequisite/dependent neighbors.
 */
export default function PrereqGraph({ nodes, edges, focusId, onNodeClick }: PrereqGraphProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const { visibleNodes, visibleEdges } = useMemo(() => {
    if (!focusId) return { visibleNodes: nodes, visibleEdges: edges };
    const neighborIds = new Set<string>([focusId]);
    for (const e of edges) {
      if (e.from === focusId) neighborIds.add(e.to);
      if (e.to === focusId) neighborIds.add(e.from);
    }
    return {
      visibleNodes: nodes.filter((n) => neighborIds.has(n.id)),
      visibleEdges: edges.filter((e) => neighborIds.has(e.from) && neighborIds.has(e.to)),
    };
  }, [nodes, edges, focusId]);

  const depths = useMemo(
    () => layerNodes(visibleNodes, visibleEdges),
    [visibleNodes, visibleEdges],
  );

  const colWidth = 180;
  const rowHeight = 64;
  const nodesByDepth = new Map<number, GraphNode[]>();
  for (const node of visibleNodes) {
    const d = depths.get(node.id) ?? 0;
    if (!nodesByDepth.has(d)) nodesByDepth.set(d, []);
    nodesByDepth.get(d)!.push(node);
  }

  const positions = new Map<string, { x: number; y: number }>();
  for (const [depth, group] of nodesByDepth) {
    group.forEach((node, i) => {
      positions.set(node.id, { x: depth * colWidth + 80, y: i * rowHeight + 40 });
    });
  }

  const maxDepth = Math.max(0, ...[...nodesByDepth.keys()]);
  const maxRows = Math.max(1, ...[...nodesByDepth.values()].map((g) => g.length));
  const width = (maxDepth + 1) * colWidth + 80;
  const height = maxRows * rowHeight + 40;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" className="prereq-graph">
      {visibleEdges.map((edge, i) => {
        const from = positions.get(edge.from);
        const to = positions.get(edge.to);
        if (!from || !to) return null;
        const fromNode = visibleNodes.find((n) => n.id === edge.from);
        const toNode = visibleNodes.find((n) => n.id === edge.to);
        const crossKb = fromNode && toNode && fromNode.kb !== toNode.kb;
        return (
          <line
            key={i}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            className={crossKb ? "prereq-edge prereq-edge-cross-kb" : "prereq-edge"}
          />
        );
      })}
      {visibleNodes.map((node) => {
        const pos = positions.get(node.id);
        if (!pos) return null;
        const isFocus = node.id === focusId;
        return (
          <g
            key={node.id}
            transform={`translate(${pos.x}, ${pos.y})`}
            className="prereq-node"
            onMouseEnter={() => setHovered(node.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onNodeClick?.(node.id)}
          >
            <circle r={isFocus ? 8 : 6} className={isFocus ? "prereq-node-focus" : ""} />
            <text x={12} y={4} className={hovered === node.id ? "prereq-label-hover" : ""}>
              {node.title}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
