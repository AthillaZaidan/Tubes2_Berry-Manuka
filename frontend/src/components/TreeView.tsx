"use client";

import { DOMNode } from "@/lib/dom-tree";

type TreeViewProps = {
  tree: DOMNode;
  selectedNodeId?: number;
  onSelectNode?: (node: DOMNode) => void;
};

function TreeNodeItem({
  node,
  selectedNodeId,
  onSelectNode,
}: {
  node: DOMNode;
  selectedNodeId?: number;
  onSelectNode?: (node: DOMNode) => void;
}) {
  const isSelected = node.id === selectedNodeId;

  return (
    <li className="relative pl-6">
      <div className="absolute left-2 top-0 h-full w-px bg-border/70" />
      <div className="absolute left-2 top-5 h-px w-4 bg-border/70" />

      <button
        type="button"
        onClick={() => onSelectNode?.(node)}
        className={`relative z-10 inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
          isSelected
            ? "border-primary bg-primary/10 text-primary shadow-[0_0_20px_hsl(var(--primary)/0.18)]"
            : "border-border bg-card/50 text-foreground hover:border-primary/50 hover:bg-card"
        }`}
      >
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            isSelected ? "bg-primary" : "bg-muted-foreground/60"
          }`}
        />
        <span className="font-mono">{`<${node.tag}>`}</span>
      </button>

      {node.children && node.children.length > 0 && (
        <ul className="mt-3 space-y-3">
          {node.children.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              selectedNodeId={selectedNodeId}
              onSelectNode={onSelectNode}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function TreeView({
  tree,
  selectedNodeId,
  onSelectNode,
}: TreeViewProps) {
  return (
    <div className="h-full overflow-auto rounded-2xl">
      <ul className="space-y-4 p-4">
        <TreeNodeItem
          node={tree}
          selectedNodeId={selectedNodeId}
          onSelectNode={onSelectNode}
        />
      </ul>
    </div>
  );
}