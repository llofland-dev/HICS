import type { Position } from "@/lib/supabase/types";

export interface PositionTreeNode extends Position {
  children: PositionTreeNode[];
}

// Shared by the org chart and the staff roster's qualification matrix, so
// both always reflect the same reporting hierarchy instead of two
// independently-maintained views that can drift apart.
export function buildPositionTree(positions: Position[]): PositionTreeNode[] {
  const nodes = new Map<string, PositionTreeNode>();
  positions.forEach((p) => nodes.set(p.code, { ...p, children: [] }));

  const roots: PositionTreeNode[] = [];
  nodes.forEach((node) => {
    if (node.reports_to_code && nodes.has(node.reports_to_code)) {
      nodes.get(node.reports_to_code)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

// Depth-first flatten (a node immediately followed by its own subtree) --
// e.g. Operations Section Chief, then each branch with its own units
// grouped right after it, in the same order the org chart renders them.
// `include` skips a node (and, since it stops descending, its whole
// subtree) -- used to honor the same expansion-tier toggle the org chart
// applies per level rather than globally.
export function flattenInHierarchyOrder(
  nodes: PositionTreeNode[],
  include: (node: PositionTreeNode) => boolean = () => true
): PositionTreeNode[] {
  const out: PositionTreeNode[] = [];
  function visit(node: PositionTreeNode) {
    if (!include(node)) return;
    out.push(node);
    node.children.forEach(visit);
  }
  nodes.forEach(visit);
  return out;
}
