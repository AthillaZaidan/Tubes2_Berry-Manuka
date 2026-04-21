// lib/types.ts — TypeScript types matching backend Go structs

export interface DOMNode {
  id: number;
  tag: string;
  attributes: Record<string, string>;
  children: DOMNode[];
  parentId: number;
  depth: number;
  innerText?: string;
}

export interface TraversalLogEntry {
  step: number;
  nodeId: number;
  tag: string;
  action: "visit" | "match" | "skip";
  depth: number;
}

export interface TraversalResult {
  matchedNodes: DOMNode[];
  log: TraversalLogEntry[];
  visitedCount: number;
  executionMs: number;
  maxDepth: number;
  algorithm: string;
}

export interface ScrapeRequest {
  url?: string;
  html?: string;
}

export interface ScrapeResponse {
  tree: DOMNode;
  maxDepth: number;
  totalNodes: number;
}

export interface TraverseRequest {
  tree: DOMNode;
  algorithm: "bfs" | "dfs" | "parallel_bfs" | "parallel_dfs";
  selector: string;
  limit: number;
}

export interface LCARequest {
  tree: DOMNode;
  nodeIdA: number;
  nodeIdB: number;
}

export interface LCAResponse {
  lcaNode: DOMNode;
  pathA: number[];
  pathB: number[];
  depthLCA: number;
}

export interface TraversalStats {
  totalNodes: number;
  maxDepth: number;
  visitedNodes: number;
  matches: number;
  executionTime: string;
}
