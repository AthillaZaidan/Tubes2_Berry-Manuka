export type DOMNode = {
  id: number;
  tag: string;
  attributes?: Record<string, string>;
  children?: DOMNode[];
  parentId?: number;
  depth?: number;
  innerText?: string;
};

export type TraversalLogEntry = {
  step: number;
  nodeId: number;
  tag: string;
  action: "visit" | "match" | "skip";
  depth: number;
};

export type TraversalStats = {
  totalNodes: number;
  maxDepth: number;
  visitedNodes: number;
  matches: number;
  executionTime: string;
};