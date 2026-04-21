"use client";

import Starfield from "@/components/Starfield";
import MultithreadToggle from "@/components/MultithreadToggle";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { DOMNode, TraversalLogEntry, TraversalStats } from "@/lib/types";
import { scrapeHTML, traverseTree, findLCA } from "@/lib/api";

type NodeState = "default" | "visited" | "current" | "match";

const DUMMY_HTML = `<!DOCTYPE html>
<html>
  <head>
    <title>Sample</title>
  </head>
  <body>
    <header class="site">
      <nav>
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/explorer" class="active">Explorer</a>
      </nav>
    </header>
    <main>
      <article>
        <h1>Hello</h1>
        <p>Paragraph <span>child span</span></p>
      </article>
      <article>
        <h2>Sub heading</h2>
        <p>Paragraph 2 <span>span 2</span></p>
      </article>
      <aside>
        <ul>
          <li>One</li>
          <li class="active">Two</li>
          <li>Three</li>
        </ul>
      </aside>
    </main>
    <footer>
      <small>Footer text</small>
    </footer>
  </body>
</html>`;

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function looksLikeHtml(value: string) {
  const trimmed = value.trim().toLowerCase();
  return (
    trimmed.includes("<html") ||
    trimmed.includes("<body") ||
    /<([a-z][a-z0-9]*)\b[^>]*>/i.test(trimmed)
  );
}

function findNodeById(node: DOMNode, id: number): DOMNode | null {
  if (node.id === id) return node;
  for (const child of node.children ?? []) {
    const found = findNodeById(child, id);
    if (found) return found;
  }
  return null;
}

function flattenNodes(root: DOMNode): DOMNode[] {
  const out: DOMNode[] = [];
  const walk = (node: DOMNode) => {
    out.push(node);
    (node.children ?? []).forEach(walk);
  };
  walk(root);
  return out;
}

type TreeEdge = {
  parentId: number;
  childId: number;
};

type PositionedNode = {
  node: DOMNode;
  x: number;
  y: number;
};

function collectEdges(root: DOMNode): TreeEdge[] {
  const edges: TreeEdge[] = [];

  const walk = (node: DOMNode) => {
    for (const child of node.children ?? []) {
      edges.push({ parentId: node.id, childId: child.id });
      walk(child);
    }
  };

  walk(root);
  return edges;
}

function computeTreeLayout(root: DOMNode, horizontalGap = 128, verticalGap = 108) {
  const rawNodes = new Map<number, PositionedNode>();
  let cursorX = 0;
  let maxDepth = 0;
  const leftGutter = 132;
  const rightGutter = 72;
  const topGutter = 56;

  const placeNode = (node: DOMNode, depth: number): number => {
    maxDepth = Math.max(maxDepth, depth);
    const children = node.children ?? [];

    let x: number;
    if (children.length === 0) {
      x = cursorX;
      cursorX += horizontalGap;
    } else {
      const childXs = children.map((child) => placeNode(child, depth + 1));
      x = (childXs[0] + childXs[childXs.length - 1]) / 2;
    }

    rawNodes.set(node.id, {
      node,
      x,
      y: depth * verticalGap,
    });

    return x;
  };

  placeNode(root, 0);

  const values = Array.from(rawNodes.values());
  const minX = Math.min(...values.map((item) => item.x));
  const maxX = Math.max(...values.map((item) => item.x));

  const nodes = values.map((item) => ({
    ...item,
    x: item.x - minX + leftGutter,
    y: item.y + topGutter,
  }));

  const byId = new Map(nodes.map((item) => [item.node.id, item]));

  return {
    nodes,
    byId,
    edges: collectEdges(root),
    width: Math.max(1200, maxX - minX + leftGutter + rightGutter),
    height: Math.max(560, maxDepth * verticalGap + 180),
  };
}

function edgeActive(parent: DOMNode, child: DOMNode, visitedIds: number[], currentId: number | null) {
  return (
    visitedIds.includes(parent.id) &&
    (visitedIds.includes(child.id) || currentId === child.id)
  );
}

function NodePill({
  node,
  state,
  selected,
  lcaA,
  lcaB,
  lcaResult,
  lcaPath,
  onClick,
}: {
  node: DOMNode;
  state: NodeState;
  selected: boolean;
  lcaA: boolean;
  lcaB: boolean;
  lcaResult: boolean;
  lcaPath: boolean;
  onClick: () => void;
}) {
  const stateClass =
    state === "match"
      ? "border-[rgba(255,158,0,0.9)] bg-[rgba(255,158,0,0.15)] text-[#e0f7ff] shadow-[0_0_24px_rgba(255,158,0,0.5)]"
      : state === "current"
      ? "border-[rgba(255,215,0,0.7)] bg-[rgba(255,215,0,0.12)] text-[#ffd700] animate-node-pulse"
      : state === "visited"
      ? "border-[rgba(0,255,200,0.5)] bg-[rgba(0,255,200,0.08)] text-[#00ffc8] shadow-[0_0_12px_rgba(0,255,200,0.25)]"
      : "border-[rgba(0,229,255,0.25)] bg-[rgba(10,20,35,0.88)] text-[#e0f7ff] hover:border-[rgba(0,229,255,0.5)]";

  const lcaClass = lcaResult
    ? "border-[rgba(139,92,246,0.9)] bg-[rgba(139,92,246,0.2)] text-[#e0f7ff] shadow-[0_0_28px_rgba(139,92,246,0.6)]"
    : lcaA
    ? "border-[rgba(139,92,246,0.8)] bg-[rgba(139,92,246,0.12)] text-[#c4b5fd] shadow-[0_0_16px_rgba(139,92,246,0.35)]"
    : lcaB
    ? "border-[rgba(139,92,246,0.8)] bg-[rgba(139,92,246,0.12)] text-[#c4b5fd] shadow-[0_0_16px_rgba(139,92,246,0.35)]"
    : lcaPath
    ? "border-[rgba(139,92,246,0.4)] bg-[rgba(139,92,246,0.06)] text-[#a78bfa]"
    : "";

  const effectiveClass = lcaA || lcaB || lcaResult || lcaPath ? lcaClass : stateClass;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.06, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className={`min-w-[86px] rounded-xl border px-4 py-2 text-xs font-mono font-semibold tracking-[0.03em] transition-all duration-300 ${
        selected && !lcaA && !lcaB && !lcaResult && !lcaPath ? "ring-2 ring-[#00e5ff]" : ""
      } ${effectiveClass}`}
    >
      {lcaA && <span className="mr-1 text-[#c4b5fd]">A:</span>}
      {lcaB && <span className="mr-1 text-[#c4b5fd]">B:</span>}
      {lcaResult && <span className="mr-1 text-[#e0f7ff]">★</span>}
      {"<"}
      {node.tag}
      {">"}
    </motion.button>
  );
}

function TreeCanvas({
  tree,
  selectedNodeId,
  currentAnimatedNodeId,
  visitedIds,
  matchIds,
  onSelectNode,
  zoom,
  lcaNodeA,
  lcaNodeB,
  lcaResultNodeId,
  lcaPathNodeIds,
}: {
  tree: DOMNode;
  selectedNodeId: number | null;
  currentAnimatedNodeId: number | null;
  visitedIds: number[];
  matchIds: number[];
  onSelectNode: (node: DOMNode) => void;
  zoom: number;
  lcaNodeA: number | null;
  lcaNodeB: number | null;
  lcaResultNodeId: number | null;
  lcaPathNodeIds: number[];
}) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const layout = useMemo(() => computeTreeLayout(tree), [tree]);
  const depthGuides = useMemo(() => {
    const depthToY = new Map<number, number>();

    for (const item of layout.nodes) {
      const depth = item.node.depth ?? 0;
      if (!depthToY.has(depth)) {
        depthToY.set(depth, item.y);
      }
    }

    return Array.from(depthToY.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([depth, y]) => ({ depth, y }));
  }, [layout.nodes]);
  const fitScale = useMemo(() => {
    if (viewportSize.width <= 0 || viewportSize.height <= 0) return 1;

    const paddedWidth = Math.max(1, viewportSize.width);
    const paddedHeight = Math.max(1, viewportSize.height);

    return Math.min(paddedWidth / layout.width, paddedHeight / layout.height);
  }, [viewportSize.width, viewportSize.height, layout.width, layout.height]);
  const effectiveScale = Math.max(0.25, fitScale * zoom);

  useEffect(() => {
    const container = viewportRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (!rect) return;

      setViewportSize({
        width: rect.width,
        height: rect.height,
      });
    });

    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={viewportRef}
      className="h-full w-full overflow-auto bg-[radial-gradient(120%_100%_at_50%_0%,rgba(0,229,255,0.12)_0%,rgba(3,5,8,0.95)_45%,rgba(3,5,8,1)_100%)]"
    >
      <div className="flex min-h-full min-w-full items-start justify-center">
        <div
          className="origin-top transition-transform duration-200"
          style={{ transform: `scale(${effectiveScale})` }}
        >
          <div
            className="relative"
            style={{ width: layout.width, height: layout.height }}
          >
            <svg className="pointer-events-none absolute inset-0 h-full w-full">
          {depthGuides.map(({ depth, y }) => (
            <g key={`depth-${depth}`}>
              <line
                x1={72}
                y1={y}
                x2={layout.width - 40}
                y2={y}
                stroke="rgba(0, 229, 255, 0.08)"
                strokeDasharray="4 8"
              />
              <text
                x={16}
                y={y + 4}
                fill="rgba(0, 229, 255, 0.35)"
                fontSize={10}
                style={{ letterSpacing: "0.12em" }}
              >
                D{depth}
              </text>
            </g>
          ))}

              {layout.edges.map((edge) => {
                const parent = layout.byId.get(edge.parentId);
                const child = layout.byId.get(edge.childId);
                if (!parent || !child) return null;

                const isActive = edgeActive(parent.node, child.node, visitedIds, currentAnimatedNodeId);
                const startX = parent.x;
                const startY = parent.y + 16;
                const endX = child.x;
                const endY = child.y - 16;
                const controlY = startY + (endY - startY) * 0.56;

                return (
                  <path
                    key={`${edge.parentId}-${edge.childId}`}
                    d={`M ${startX} ${startY} C ${startX} ${controlY}, ${endX} ${controlY}, ${endX} ${endY}`}
                    fill="none"
                    stroke={isActive ? "#00e5ff" : "rgba(0, 229, 255, 0.35)"}
                    strokeWidth={isActive ? 2.8 : 2}
                    strokeLinecap="round"
                    className={isActive ? "animate-edge-pulse" : ""}
                  />
                );
              })}
            </svg>

            {layout.nodes.map(({ node, x, y }) => {
              let state: NodeState = "default";
              if (matchIds.includes(node.id)) state = "match";
              else if (currentAnimatedNodeId === node.id) state = "current";
              else if (visitedIds.includes(node.id)) state = "visited";

              return (
                <div
                  key={node.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: x, top: y }}
                >
                  <NodePill
                    node={node}
                    state={state}
                    selected={selectedNodeId === node.id}
                    lcaA={lcaNodeA === node.id}
                    lcaB={lcaNodeB === node.id}
                    lcaResult={lcaResultNodeId === node.id}
                    lcaPath={lcaPathNodeIds.includes(node.id)}
                    onClick={() => onSelectNode(node)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExplorerPage() {
  const [sourceMode, setSourceMode] = useState<"URL" | "HTML">("HTML");
  const [sourceInput, setSourceInput] = useState(DUMMY_HTML);
  const [selectorInput, setSelectorInput] = useState(".active");
  const [algorithm, setAlgorithm] = useState<"BFS" | "DFS">("BFS");
  const [parallelMode, setParallelMode] = useState(false);
  const [resultMode, setResultMode] = useState<"ALL" | "TOP_N">("ALL");
  const [topNInput, setTopNInput] = useState("5");

  const [parseError, setParseError] = useState("");
  const [traversalError, setTraversalError] = useState("");
  const [hasParsed, setHasParsed] = useState(false);

  const [isParsing, setIsParsing] = useState(false);
  const [isTraversing, setIsTraversing] = useState(false);

  const [tree, setTree] = useState<DOMNode | null>(null);
  const [logs, setLogs] = useState<TraversalLogEntry[]>([]);

  const [speed, setSpeed] = useState(350);
  const [zoom, setZoom] = useState(1);

  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const [executionMs, setExecutionMs] = useState(0);
  const [bottomTab, setBottomTab] = useState<"logs" | "inspector">("logs");

  const [lcaMode, setLcaMode] = useState(false);
  const [lcaNodeA, setLcaNodeA] = useState<number | null>(null);
  const [lcaNodeB, setLcaNodeB] = useState<number | null>(null);
  const [lcaResultNodeId, setLcaResultNodeId] = useState<number | null>(null);
  const [lcaPathNodeIds, setLcaPathNodeIds] = useState<number[]>([]);
  const [lcaLoading, setLcaLoading] = useState(false);

  const [animationRunning, setAnimationRunning] = useState(false);
  const [animationIndex, setAnimationIndex] = useState(0);
  const logViewportRef = useRef<HTMLDivElement | null>(null);

  const selectedNode = useMemo(
    () => (tree && selectedNodeId ? findNodeById(tree, selectedNodeId) : null),
    [tree, selectedNodeId]
  );

  const topNValue = useMemo(() => {
    const parsed = Number.parseInt(topNInput.trim(), 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }, [topNInput]);

  const displayedLogs = useMemo(
    () => (resultMode === "TOP_N" ? logs.slice(0, topNValue) : logs),
    [logs, resultMode, topNValue]
  );

  const visitedIds = useMemo(
    () => logs.filter((_, index) => index < animationIndex).map((log) => log.nodeId),
    [logs, animationIndex]
  );

  const currentAnimatedNodeId =
    animationRunning && animationIndex < logs.length
      ? logs[animationIndex]?.nodeId ?? null
      : null;

  const matchIds = useMemo(
    () => logs.filter((log) => log.action === "match").map((log) => log.nodeId),
    [logs]
  );

  const flattenedNodes = useMemo(() => (tree ? flattenNodes(tree) : []), [tree]);
  const totalNodes = flattenedNodes.length;
  const treeMaxDepth = flattenedNodes.length
    ? Math.max(...flattenedNodes.map((node) => node.depth ?? 0))
    : 0;
  const maxDepth = logs.length
    ? Math.max(...logs.map((log) => log.depth))
    : treeMaxDepth;
  const activeModeLabel = parallelMode
    ? `Parallel ${algorithm === "BFS" ? "Breadth First Search" : "Depth First Search"}`
    : algorithm === "BFS"
      ? "Breadth First Search"
      : "Depth First Search";
  const visitedCount = Math.min(
    animationIndex,
    logs.filter((log) => log.action !== "skip").length
  );
  const matchCount = logs.filter((log) => log.action === "match").length;
  const visibleLogs = displayedLogs;
  const sideToggleClass =
    "flex-1 rounded-xl border px-4 py-3 text-sm font-semibold tracking-[0.04em] transition-all duration-200";
  const sidePrimaryButtonClass =
    "mt-4 w-full rounded-2xl border px-4 py-4 text-lg font-semibold transition-all duration-200";
  const calmActiveButtonClass =
    "border-[rgba(0,229,255,0.7)] bg-[rgba(0,229,255,0.12)] text-[#00e5ff] shadow-[0_0_12px_rgba(0,229,255,0.25)]";
  const calmInactiveButtonClass =
    "border-[rgba(0,229,255,0.15)] bg-[rgba(0,229,255,0.04)] text-[#6b8fa3] hover:border-[rgba(0,229,255,0.35)] hover:bg-[rgba(0,229,255,0.08)] hover:text-[#e0f7ff]";

  useEffect(() => {
    if (!animationRunning) return;
    if (animationIndex >= logs.length) {
      setAnimationRunning(false);
      setIsTraversing(false);
      return;
    }

    const timer = setTimeout(() => {
      setAnimationIndex((prev) => prev + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [animationRunning, animationIndex, logs, speed]);

  useEffect(() => {
    const viewport = logViewportRef.current;
    if (!viewport) return;

    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior: animationRunning && bottomTab === "logs" ? "smooth" : "auto",
    });
  }, [animationIndex, animationRunning, bottomTab]);

  async function handleParseHtml() {
    setParseError("");
    setTraversalError("");

    const trimmed = sourceInput.trim();

    if (!trimmed) {
      setParseError(sourceMode === "URL" ? "URL tidak boleh kosong." : "HTML tidak boleh kosong.");
      return;
    }

    if (sourceMode === "URL" && !isValidUrl(trimmed)) {
      setParseError("Masukkan URL yang valid dan diawali http:// atau https://");
      return;
    }

    if (sourceMode === "HTML" && !looksLikeHtml(trimmed)) {
      setParseError("Input HTML tidak valid. Masukkan isi HTML, bukan nama file.");
      return;
    }

    setIsParsing(true);

    try {
      const req = sourceMode === "URL" ? { url: trimmed } : { html: trimmed };
      const res = await scrapeHTML(req);

      if (!res.tree) {
        setParseError("Gagal membaca HTML. Pastikan format HTML valid.");
        return;
      }

      setTree(res.tree);
      setLogs([]);
      setHasParsed(true);
      setSelectedNodeId(null);
      setAnimationRunning(false);
      setAnimationIndex(0);
      setBottomTab("logs");
    } catch (err: any) {
      setParseError(err.message || "Gagal melakukan parse HTML. Pastikan backend berjalan.");
    } finally {
      setIsParsing(false);
    }
  }

  async function handleRunTraversal() {
    setTraversalError("");

    if (!hasParsed || !tree) {
      setTraversalError("Lakukan Parse HTML terlebih dahulu sebelum traversal.");
      return;
    }

    if (!selectorInput.trim()) {
      setTraversalError("CSS selector tidak boleh kosong.");
      return;
    }

    if (resultMode === "TOP_N" && (!/^\d+$/.test(topNInput.trim()) || Number(topNInput) <= 0)) {
      setTraversalError("Nilai N harus bilangan bulat lebih dari 0.");
      return;
    }

    setIsTraversing(true);
    setAnimationIndex(0);
    setBottomTab("logs");

    try {
      const limit = resultMode === "ALL" ? 0 : Number(topNInput.trim());
      const algo = parallelMode
        ? `parallel_${algorithm.toLowerCase()}`
        : algorithm.toLowerCase();
      const res = await traverseTree({
        tree,
        algorithm: algo as "bfs" | "dfs" | "parallel_bfs" | "parallel_dfs",
        selector: selectorInput.trim(),
        limit,
      });

      // Convert backend log format to frontend format
      const frontendLogs: TraversalLogEntry[] = res.log.map((entry) => ({
        step: entry.step,
        nodeId: entry.nodeId,
        tag: entry.tag,
        action: entry.action as "visit" | "match" | "skip",
        depth: entry.depth,
      }));

      setLogs(frontendLogs);
      setExecutionMs(res.executionMs);
      setAnimationRunning(true);
    } catch (err: any) {
      setTraversalError(err.message || "Gagal menjalankan traversal. Pastikan backend berjalan.");
      setIsTraversing(false);
    }
  }

  function handleZoomIn() {
    setZoom((prev) => Math.min(prev + 0.1, 1.5));
  }

  function handleZoomOut() {
    setZoom((prev) => Math.max(prev - 0.1, 0.4));
  }

  return (
    <section className="min-h-[calc(100vh-84px)] h-[calc(100vh+320px)] overflow-hidden">
      <div className="grid h-full grid-cols-[380px_minmax(0,1fr)]">
        <motion.aside
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex h-full flex-col border-r border-[rgba(0,229,255,0.12)] bg-[rgba(6,12,22,0.8)] backdrop-blur-md"
        >
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="mb-8">
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#00e5ff]" style={{ fontFamily: "'Exo 2', sans-serif" }}>
                  Source
                </p>
                <div className="mt-1 h-px w-8 bg-[#00e5ff] shadow-[0_0_8px_rgba(0,229,255,0.6)]" />
              </div>

              <div className="mb-4 flex gap-3">
                <button
                  onClick={() => setSourceMode("URL")}
                  className={`${sideToggleClass} ${
                    sourceMode === "URL"
                      ? calmActiveButtonClass
                      : calmInactiveButtonClass
                  }`}
                >
                  URL
                </button>
                <button
                  onClick={() => setSourceMode("HTML")}
                  className={`${sideToggleClass} ${
                    sourceMode === "HTML"
                      ? calmActiveButtonClass
                      : calmInactiveButtonClass
                  }`}
                >
                  HTML
                </button>
              </div>

              {sourceMode === "URL" ? (
                <input
                  value={sourceInput}
                  onChange={(event) => {
                    setSourceInput(event.target.value);
                    setHasParsed(false);
                  }}
                  className="w-full rounded-2xl border border-[rgba(0,229,255,0.2)] bg-[rgba(3,5,8,0.6)] px-4 py-3 text-sm text-[#e0f7ff] outline-none placeholder:text-[#6b8fa3] focus:border-[#00e5ff] focus:shadow-[0_0_12px_rgba(0,229,255,0.2)]"
                  placeholder="https://example.com"
                />
              ) : (
                <textarea
                  rows={10}
                  value={sourceInput}
                  onChange={(event) => {
                    setSourceInput(event.target.value);
                    setHasParsed(false);
                  }}
                  className="w-full resize-none rounded-2xl border border-[rgba(0,229,255,0.2)] bg-[rgba(3,5,8,0.6)] px-4 py-4 text-sm text-[#e0f7ff] outline-none placeholder:text-[#6b8fa3] focus:border-[#00e5ff] focus:shadow-[0_0_12px_rgba(0,229,255,0.2)]"
                  placeholder="<html><body><div>Hello</div></body></html>"
                />
              )}

              <motion.button
                onClick={handleParseHtml}
                disabled={isParsing}
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02 }}
                className={`${sidePrimaryButtonClass} ${
                  isParsing
                    ? "cursor-not-allowed border-[rgba(0,229,255,0.1)] bg-[rgba(6,12,22,0.6)] text-[#6b8fa3]"
                    : "btn-primary animate-shimmer"
                }`}
              >
                {isParsing ? "Parsing..." : "Parse HTML"}
              </motion.button>

              {parseError && <p className="mt-3 text-sm text-red-400">{parseError}</p>}
            </div>

            <div className="mb-8">
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#00e5ff]" style={{ fontFamily: "'Exo 2', sans-serif" }}>
                  Traversal
                </p>
                <div className="mt-1 h-px w-8 bg-[#00e5ff] shadow-[0_0_8px_rgba(0,229,255,0.6)]" />
              </div>

              <label className="mb-2 block text-sm text-[#6b8fa3]">CSS selector</label>
              <input
                value={selectorInput}
                onChange={(event) => setSelectorInput(event.target.value)}
                className="w-full rounded-2xl border border-[rgba(0,229,255,0.2)] bg-[rgba(3,5,8,0.6)] px-4 py-3 text-sm text-[#e0f7ff] outline-none placeholder:text-[#6b8fa3] focus:border-[#00e5ff] focus:shadow-[0_0_12px_rgba(0,229,255,0.2)]"
                placeholder=".active"
              />
            </div>

            <div>
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#00e5ff]" style={{ fontFamily: "'Exo 2', sans-serif" }}>
                  Result
                </p>
                <div className="mt-1 h-px w-8 bg-[#00e5ff] shadow-[0_0_8px_rgba(0,229,255,0.6)]" />
              </div>

              <div className="mb-4 flex gap-3">
                <button
                  onClick={() => setResultMode("ALL")}
                  className={`${sideToggleClass} ${
                    resultMode === "ALL"
                      ? calmActiveButtonClass
                      : calmInactiveButtonClass
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setResultMode("TOP_N")}
                  className={`${sideToggleClass} ${
                    resultMode === "TOP_N"
                      ? calmActiveButtonClass
                      : calmInactiveButtonClass
                  }`}
                >
                  Top N
                </button>
              </div>

              <input
                value={topNInput}
                onChange={(event) => setTopNInput(event.target.value)}
                inputMode="numeric"
                className="mb-5 w-full rounded-2xl border border-[rgba(0,229,255,0.2)] bg-[rgba(3,5,8,0.6)] px-4 py-3 text-sm text-[#e0f7ff] outline-none focus:border-[#00e5ff] focus:shadow-[0_0_12px_rgba(0,229,255,0.2)]"
              />

              <motion.button
                onClick={handleRunTraversal}
                disabled={!hasParsed || isTraversing}
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02 }}
                className={`flex w-full items-center justify-center gap-3 rounded-2xl border px-5 py-4 text-lg font-semibold transition-all duration-200 ${
                  !hasParsed || isTraversing
                    ? "cursor-not-allowed border-[rgba(0,229,255,0.1)] bg-[rgba(6,12,22,0.6)] text-[#6b8fa3]"
                    : "btn-primary"
                }`}
              >
        
                {isTraversing ? "Running..." : "Run Traversal"}
              </motion.button>

              {!hasParsed && !traversalError && (
                <p className="mt-3 text-sm text-[#6b8fa3]">
                  Parse HTML terlebih dahulu untuk mengaktifkan traversal.
                </p>
              )}

              {traversalError && <p className="mt-3 text-sm text-red-400">{traversalError}</p>}

              <div className="mt-5 space-y-3">
                <MultithreadToggle enabled={parallelMode} onChange={setParallelMode} />

                {/* Interactive LCA Mode */}
                <div className="rounded-xl border border-[rgba(139,92,246,0.25)] bg-[rgba(139,92,246,0.06)] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#c4b5fd]">LCA Finder</span>
                    <button
                      onClick={() => {
                        if (lcaMode) {
                          // Turn off: reset everything
                          setLcaMode(false);
                          setLcaNodeA(null);
                          setLcaNodeB(null);
                          setLcaResultNodeId(null);
                          setLcaPathNodeIds([]);
                        } else {
                          setLcaMode(true);
                        }
                      }}
                      className={`relative h-6 w-10 rounded-full transition-colors ${
                        lcaMode ? "bg-[rgba(139,92,246,0.4)]" : "bg-[rgba(107,143,163,0.2)]"
                      }`}
                    >
                      <motion.div
                        className="absolute top-0.5 h-4 w-4 rounded-full"
                        style={{ background: lcaMode ? "#c4b5fd" : "#6b8fa3" }}
                        animate={{ left: lcaMode ? "22px" : "2px" }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>

                  {lcaMode && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-2"
                    >
                      <p className="text-xs text-[#a78bfa]">
                        Klik 2 node di tree untuk mencari LCA.
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`rounded-md px-2 py-1 ${lcaNodeA !== null ? "bg-[rgba(139,92,246,0.2)] text-[#c4b5fd]" : "text-[#6b8fa3]"}`}>
                          A: {lcaNodeA !== null ? `#${lcaNodeA}` : "—"}
                        </span>
                        <span className={`rounded-md px-2 py-1 ${lcaNodeB !== null ? "bg-[rgba(139,92,246,0.2)] text-[#c4b5fd]" : "text-[#6b8fa3]"}`}>
                          B: {lcaNodeB !== null ? `#${lcaNodeB}` : "—"}
                        </span>
                      </div>
                      {lcaLoading && (
                        <p className="text-xs text-[#a78bfa]">Menghitung LCA...</p>
                      )}
                      {lcaResultNodeId !== null && !lcaLoading && (
                        <div className="rounded-lg bg-[rgba(139,92,246,0.12)] p-2">
                          <p className="text-xs text-[#c4b5fd]">
                            LCA: <span className="font-mono font-bold">#{lcaResultNodeId}</span>
                          </p>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setLcaNodeA(null);
                          setLcaNodeB(null);
                          setLcaResultNodeId(null);
                          setLcaPathNodeIds([]);
                        }}
                        className="w-full rounded-lg border border-[rgba(139,92,246,0.2)] px-2 py-1.5 text-xs text-[#a78bfa] transition hover:bg-[rgba(139,92,246,0.1)]"
                      >
                        Reset Selection
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.aside>

        <div className="grid h-full grid-rows-[82px_minmax(0,1fr)_clamp(320px,36vh,460px)]">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex items-center justify-between border-b border-[rgba(0,229,255,0.12)] bg-[rgba(3,5,8,0.6)] px-6 backdrop-blur-sm"
          >
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2 rounded-xl border border-[rgba(0,229,255,0.25)] bg-[rgba(3,5,8,0.5)] p-1">
                <button
                  onClick={() => setAlgorithm("BFS")}
                  className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition ${
                    algorithm === "BFS"
                      ? "bg-[#00e5ff] text-[#030508]"
                      : "text-[#6b8fa3] hover:bg-[rgba(0,229,255,0.1)] hover:text-[#00e5ff]"
                  }`}
                >
                  BFS
                </button>
                <button
                  onClick={() => setAlgorithm("DFS")}
                  className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition ${
                    algorithm === "DFS"
                      ? "bg-[#00e5ff] text-[#030508]"
                      : "text-[#6b8fa3] hover:bg-[rgba(0,229,255,0.1)] hover:text-[#00e5ff]"
                  }`}
                >
                  DFS
                </button>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-[rgba(0,229,255,0.25)] bg-[rgba(3,5,8,0.5)] px-4 py-3">
                <button
                  onClick={() => {
                    setAnimationRunning(false);
                    setAnimationIndex(0);
                    setIsTraversing(false);
                  }}
                  className="rounded-md px-2 py-1 text-[#6b8fa3] transition hover:bg-[rgba(0,229,255,0.1)] hover:text-[#00e5ff]"
                >
                  Reset
                </button>
                <button
                  onClick={() => setAnimationRunning((prev) => !prev)}
                  className="rounded-md bg-[#00e5ff] px-3 py-1 text-[#030508] transition hover:bg-[#00c2d6]"
                >
                  {animationRunning ? "Pause" : "Play"}
                </button>

                <div className="mx-2 h-6 w-px bg-[rgba(0,229,255,0.2)]" />

                <span className="text-xs uppercase tracking-[0.18em] text-[#6b8fa3]">
                  Speed
                </span>

                <input
                  type="range"
                  min={100}
                  max={1000}
                  step={50}
                  value={speed}
                  onChange={(event) => setSpeed(Number(event.target.value))}
                  className="accent-[#00e5ff]"
                />

                <span className="text-sm font-mono text-[#00e5ff]">{speed}ms</span>
                <span
                  className={`rounded-md border px-2 py-1 text-xs font-semibold tracking-[0.08em] ${
                    parallelMode
                      ? "border-[rgba(255,158,0,0.4)] bg-[rgba(255,158,0,0.12)] text-[#ff9e00]"
                      : "border-[rgba(0,229,255,0.4)] bg-[rgba(0,229,255,0.12)] text-[#00e5ff]"
                  }`}
                >
                  MODE {parallelMode ? `Parallel ${algorithm}` : algorithm}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm font-mono">
              <span>
                <strong className="text-[#00e5ff]">{totalNodes}</strong>{" "}
                <span className="text-[10px] uppercase tracking-wider text-[#6b8fa3]">nodes</span>
              </span>
              <span>
                <strong className="text-[#00e5ff]">{maxDepth}</strong>{" "}
                <span className="text-[10px] uppercase tracking-wider text-[#6b8fa3]">depth</span>
              </span>
              <span>
                <strong className="text-[#00e5ff]">{visitedCount}</strong>{" "}
                <span className="text-[10px] uppercase tracking-wider text-[#6b8fa3]">visited</span>
              </span>
              <span>
                <strong className="text-[#00e5ff]">{matchCount}</strong>{" "}
                <span className="text-[10px] uppercase tracking-wider text-[#6b8fa3]">matches</span>
              </span>
              <span className="text-[#ff9e00]">{executionMs.toFixed(1)} ms</span>
            </div>
          </motion.div>

          <div className="relative overflow-auto border-b border-[rgba(0,229,255,0.08)] bg-[#030508]">
            <div className="grid-bg absolute inset-0 opacity-70" />
            <Starfield className="z-0" />
            <div className="radial-glow pointer-events-none absolute inset-0" />

            <div className="absolute right-6 top-6 z-20 flex items-center gap-4 rounded-xl border border-[rgba(0,229,255,0.15)] bg-[rgba(6,12,22,0.7)] px-5 py-3 text-sm text-[#6b8fa3] backdrop-blur-md">
              <button onClick={handleZoomIn} className="rounded-md px-1 transition hover:text-[#00e5ff]">
                +
              </button>
              <span>{Math.round(zoom * 100)}%</span>
              <button onClick={handleZoomOut} className="rounded-md px-1 transition hover:text-[#00e5ff]">
                -
              </button>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative h-full w-full border-[rgba(0,229,255,0.08)] bg-[rgba(3,5,8,0.3)]"
            >
              {tree ? (
                <TreeCanvas
                  tree={tree}
                  selectedNodeId={selectedNodeId}
                  currentAnimatedNodeId={currentAnimatedNodeId}
                  visitedIds={visitedIds}
                  matchIds={matchIds}
                  onSelectNode={(node) => {
                    if (lcaMode) {
                      if (lcaNodeA === null) {
                        setLcaNodeA(node.id);
                      } else if (lcaNodeB === null && lcaNodeA !== node.id) {
                        setLcaNodeB(node.id);
                        // Auto-trigger LCA calculation
                        setLcaLoading(true);
                        findLCA({ tree, nodeIdA: lcaNodeA, nodeIdB: node.id })
                          .then((res) => {
                            setLcaResultNodeId(res.lcaNode.id);
                            const pathSet = new Set<number>([...res.pathA, ...res.pathB]);
                            pathSet.delete(res.lcaNode.id);
                            setLcaPathNodeIds(Array.from(pathSet));
                          })
                          .catch((err) => {
                            alert(err.message || "Gagal mencari LCA");
                          })
                          .finally(() => {
                            setLcaLoading(false);
                          });
                      } else if (lcaNodeA === node.id || lcaNodeB === node.id) {
                        // Deselect if clicked again
                        if (lcaNodeA === node.id) setLcaNodeA(null);
                        if (lcaNodeB === node.id) setLcaNodeB(null);
                        setLcaResultNodeId(null);
                        setLcaPathNodeIds([]);
                      }
                      return;
                    }
                    setSelectedNodeId(node.id);
                    setBottomTab("inspector");
                  }}
                  zoom={zoom}
                  lcaNodeA={lcaNodeA}
                  lcaNodeB={lcaNodeB}
                  lcaResultNodeId={lcaResultNodeId}
                  lcaPathNodeIds={lcaPathNodeIds}
                />
              ) : (
                <div className="pt-10 text-[#6b8fa3]">
                  Parse HTML terlebih dahulu untuk melihat DOM tree.
                </div>
              )}
            </motion.div>

            <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-xl border border-[rgba(0,229,255,0.15)] bg-[rgba(6,12,22,0.8)] px-3 py-2 text-xs font-semibold text-[#e0f7ff] shadow-[0_10px_30px_rgba(0,0,0,0.3)] backdrop-blur-md">
              <span className="flex items-center gap-2 rounded-md border border-[rgba(0,229,255,0.1)] bg-[rgba(0,229,255,0.04)] px-2 py-1">
                <span className="h-2.5 w-2.5 rounded-full bg-[#4b5563]" />
                Default
              </span>
              <span className="flex items-center gap-2 rounded-md border border-[rgba(0,255,200,0.3)] bg-[rgba(0,255,200,0.08)] px-2 py-1">
                <span className="h-2.5 w-2.5 rounded-full bg-[#00ffc8]" />
                Visited
              </span>
              <span className="flex items-center gap-2 rounded-md border border-[rgba(255,215,0,0.3)] bg-[rgba(255,215,0,0.08)] px-2 py-1">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ffd700]" />
                Current
              </span>
              <span className="flex items-center gap-2 rounded-md border border-[rgba(255,158,0,0.3)] bg-[rgba(255,158,0,0.1)] px-2 py-1">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff9e00]" />
                Match
              </span>
            </div>
          </div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex min-h-0 flex-col overflow-hidden border-t border-[rgba(0,229,255,0.12)] bg-[rgba(6,12,22,0.9)]"
          >
            <div className="flex items-center gap-2 border-b border-[rgba(0,229,255,0.1)] bg-[rgba(3,5,8,0.7)] px-4 py-3">
              <button
                onClick={() => setBottomTab("logs")}
                className={`rounded-md border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                  bottomTab === "logs"
                    ? "border-[rgba(0,255,200,0.45)] bg-[rgba(0,255,200,0.12)] text-[#00ffc8]"
                    : "border-transparent text-[#6b8fa3] hover:border-[rgba(0,229,255,0.15)] hover:bg-[rgba(0,229,255,0.05)] hover:text-[#e0f7ff]"
                }`}
              >
                Traversal Logs
              </button>

              <button
                onClick={() => setBottomTab("inspector")}
                className={`rounded-md border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                  bottomTab === "inspector"
                    ? "border-[rgba(0,229,255,0.45)] bg-[rgba(0,229,255,0.12)] text-[#00e5ff]"
                    : "border-transparent text-[#6b8fa3] hover:border-[rgba(0,229,255,0.15)] hover:bg-[rgba(0,229,255,0.05)] hover:text-[#e0f7ff]"
                }`}
              >
                Inspector
              </button>

              <div className="ml-auto flex items-center gap-3 font-mono text-xs text-[#6b8fa3]">
                <span>{bottomTab === "logs" ? `TERMINAL · ${algorithm}` : "NODE DETAILS"}</span>
                <span className="rounded border border-[rgba(0,229,255,0.15)] px-2 py-1 text-[#00e5ff]">
                  {bottomTab === "logs"
                    ? `${Math.min(animationIndex, logs.length)} / ${logs.length}`
                    : selectedNode
                    ? `node:${selectedNode.id}`
                    : "node:none"}
                </span>
              </div>
            </div>

            <div
              ref={logViewportRef}
              className="min-h-0 flex-1 overflow-auto bg-[#020408] px-4 py-4 font-mono text-sm"
            >
              {bottomTab === "logs" ? (
                logs.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-[rgba(0,229,255,0.15)] px-4 py-6 text-[#6b8fa3]">
                    Run a traversal to see step-by-step logs.
                  </p>
                ) : (
                  <div className="flex h-full min-h-0 flex-col gap-3 text-[#e0f7ff]">
                    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[rgba(0,229,255,0.08)] bg-[#010409] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                    <div className="flex shrink-0 items-center justify-between border-b border-[rgba(0,229,255,0.08)] bg-[rgba(0,229,255,0.06)] px-4 py-3 text-xs uppercase tracking-[0.2em] text-[rgba(0,229,255,0.5)]">
                        <span>Traversal Logs · {activeModeLabel}</span>
                        <span>{Math.min(animationIndex, logs.length)} / {logs.length}</span>
                      </div>

                      <div className="min-h-0 flex-1 overflow-y-auto divide-y divide-white/[0.03]">
                        {visibleLogs.map((log) => {
                          const isCurrent = currentAnimatedNodeId === log.nodeId;
                          const isMatch = log.action === "match";
                          const lineTone = isMatch
                            ? "text-[#ff9e00]"
                            : isCurrent
                            ? "text-[#ffd700]"
                            : visitedIds.includes(log.nodeId)
                            ? "text-[#00ffc8]"
                            : "text-[#6b8fa3]";

                          return (
                            <button
                              key={log.step}
                              type="button"
                              onClick={() => {
                                setSelectedNodeId(log.nodeId);
                                setBottomTab("inspector");
                              }}
                              className={`grid w-full grid-cols-[56px_76px_minmax(0,1fr)] items-center gap-4 px-4 py-2 text-left transition hover:bg-[rgba(0,229,255,0.04)] ${lineTone}`}
                            >
                              <span className="text-[#4b5563]">{String(log.step).padStart(3, "0")}</span>
                              <span
                                className={`font-semibold uppercase tracking-[0.18em] ${
                                  isMatch
                                    ? "text-[#ff9e00]"
                                    : isCurrent
                                    ? "text-[#ffd700]"
                                    : "text-[#6b8fa3]"
                                }`}
                              >
                                {log.action}
                              </span>
                              <span className="truncate">
                                visit {"<"}
                                {log.tag}
                                {">"} depth={log.depth}
                              </span>
                            </button>
                          );
                        })}

                        {animationRunning && animationIndex < logs.length && (
                          <div className="flex items-center gap-3 px-4 py-3 text-[#6b8fa3]">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-[#00e5ff]" />
                            waiting for next traversal step...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              ) : !selectedNode ? (
                <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-[rgba(0,229,255,0.15)] bg-[rgba(0,229,255,0.02)] px-6 text-center text-sm text-[#6b8fa3]">
                  Click any node in the tree or any log row to inspect it here.
                </div>
              ) : (
                <div className="grid gap-4 text-[#e0f7ff] md:grid-cols-[minmax(0,1fr)_280px]">
                  <div className="rounded-xl border border-[rgba(0,229,255,0.1)] bg-[rgba(0,229,255,0.04)]">
                    <div className="border-b border-[rgba(0,229,255,0.08)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#6b8fa3]">
                      Node Summary
                    </div>
                    <div className="space-y-4 px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span className="rounded-md border border-[rgba(0,229,255,0.3)] bg-[rgba(0,229,255,0.1)] px-2 py-1 text-xs uppercase tracking-[0.18em] text-[#00e5ff]">
                          selected
                        </span>
                        <span className="text-lg text-[#e0f7ff]">
                          {"<"}
                          {selectedNode.tag}
                          {">"}
                        </span>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg border border-[rgba(0,229,255,0.08)] bg-[rgba(3,5,8,0.6)] px-3 py-3">
                          <div className="text-xs uppercase tracking-[0.18em] text-[#6b8fa3]">Node ID</div>
                          <div className="mt-2 text-base text-[#e0f7ff]">{selectedNode.id}</div>
                        </div>
                        <div className="rounded-lg border border-[rgba(0,229,255,0.08)] bg-[rgba(3,5,8,0.6)] px-3 py-3">
                          <div className="text-xs uppercase tracking-[0.18em] text-[#6b8fa3]">Depth</div>
                          <div className="mt-2 text-base text-[#e0f7ff]">{selectedNode.depth ?? "-"}</div>
                        </div>
                        <div className="rounded-lg border border-[rgba(0,229,255,0.08)] bg-[rgba(3,5,8,0.6)] px-3 py-3">
                          <div className="text-xs uppercase tracking-[0.18em] text-[#6b8fa3]">Parent</div>
                          <div className="mt-2 text-base text-[#e0f7ff]">{selectedNode.parentId ?? "-"}</div>
                        </div>
                        <div className="rounded-lg border border-[rgba(0,229,255,0.08)] bg-[rgba(3,5,8,0.6)] px-3 py-3">
                          <div className="text-xs uppercase tracking-[0.18em] text-[#6b8fa3]">Children</div>
                          <div className="mt-2 text-base text-[#e0f7ff]">{selectedNode.children?.length ?? 0}</div>
                        </div>
                      </div>

                      <div className="rounded-lg border border-[rgba(0,229,255,0.08)] bg-[rgba(3,5,8,0.6)] px-3 py-3">
                        <div className="text-xs uppercase tracking-[0.18em] text-[#6b8fa3]">Inner Text</div>
                        <div className="mt-2 whitespace-pre-wrap text-sm text-[#e0f7ff]">
                          {selectedNode.innerText || "No inner text"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[rgba(0,229,255,0.1)] bg-[rgba(0,229,255,0.04)]">
                    <div className="border-b border-[rgba(0,229,255,0.08)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#6b8fa3]">
                      Attributes
                    </div>
                    <div className="px-4 py-4">
                      <pre className="overflow-auto rounded-lg border border-[rgba(0,229,255,0.08)] bg-[rgba(3,5,8,0.6)] p-4 text-xs leading-6 text-[#e0f7ff]">
                        {selectedNode.attributes
                          ? JSON.stringify(selectedNode.attributes, null, 2)
                          : '{\n  "message": "No attributes"\n}'}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
