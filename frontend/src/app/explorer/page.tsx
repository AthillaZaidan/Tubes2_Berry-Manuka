"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type DOMNode = {
  id: string;
  tag: string;
  children?: DOMNode[];
  depth?: number;
  parentId?: string;
  innerText?: string;
  attributes?: Record<string, string>;
};

type TraversalLogEntry = {
  step: number;
  nodeId: string;
  tag: string;
  action: "visit" | "match" | "skip";
  depth: number;
};

type NodeState = "default" | "visited" | "current" | "match";

const DUMMY_TREE: DOMNode = {
  id: "html",
  tag: "html",
  depth: 0,
  children: [
    {
      id: "head",
      tag: "head",
      parentId: "html",
      depth: 1,
      children: [
        {
          id: "title",
          tag: "title",
          parentId: "head",
          depth: 2,
          innerText: "Sample",
        },
      ],
    },
    {
      id: "body",
      tag: "body",
      parentId: "html",
      depth: 1,
      children: [
        {
          id: "header",
          tag: "header",
          parentId: "body",
          depth: 2,
          children: [
            {
              id: "nav",
              tag: "nav",
              parentId: "header",
              depth: 3,
              children: [
                {
                  id: "a1",
                  tag: "a",
                  parentId: "nav",
                  depth: 4,
                  innerText: "Home",
                  attributes: { href: "/" },
                },
                {
                  id: "a2",
                  tag: "a",
                  parentId: "nav",
                  depth: 4,
                  innerText: "About",
                  attributes: { href: "/about" },
                },
                {
                  id: "a3",
                  tag: "a",
                  parentId: "nav",
                  depth: 4,
                  innerText: "Explorer",
                  attributes: { href: "/explorer", class: "active" },
                },
              ],
            },
          ],
        },
        {
          id: "main",
          tag: "main",
          parentId: "body",
          depth: 2,
          children: [
            {
              id: "article1",
              tag: "article",
              parentId: "main",
              depth: 3,
              children: [
                {
                  id: "h1",
                  tag: "h1",
                  parentId: "article1",
                  depth: 4,
                  innerText: "Hello",
                },
                {
                  id: "p1",
                  tag: "p",
                  parentId: "article1",
                  depth: 4,
                  innerText: "Paragraph",
                },
                {
                  id: "span1",
                  tag: "span",
                  parentId: "p1",
                  depth: 5,
                  innerText: "child span",
                },
              ],
            },
            {
              id: "article2",
              tag: "article",
              parentId: "main",
              depth: 3,
              children: [
                {
                  id: "h2",
                  tag: "h2",
                  parentId: "article2",
                  depth: 4,
                  innerText: "Sub heading",
                },
                {
                  id: "p2",
                  tag: "p",
                  parentId: "article2",
                  depth: 4,
                  innerText: "Paragraph 2",
                },
                {
                  id: "span2",
                  tag: "span",
                  parentId: "p2",
                  depth: 5,
                  innerText: "span 2",
                },
              ],
            },
            {
              id: "aside",
              tag: "aside",
              parentId: "main",
              depth: 3,
              children: [
                {
                  id: "ul",
                  tag: "ul",
                  parentId: "aside",
                  depth: 4,
                  children: [
                    {
                      id: "li1",
                      tag: "li",
                      parentId: "ul",
                      depth: 5,
                      innerText: "One",
                    },
                    {
                      id: "li2",
                      tag: "li",
                      parentId: "ul",
                      depth: 5,
                      innerText: "Two",
                      attributes: { class: "active" },
                    },
                    {
                      id: "li3",
                      tag: "li",
                      parentId: "ul",
                      depth: 5,
                      innerText: "Three",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: "footer",
          tag: "footer",
          parentId: "body",
          depth: 2,
          children: [
            {
              id: "small",
              tag: "small",
              parentId: "footer",
              depth: 3,
              innerText: "Footer text",
            },
          ],
        },
      ],
    },
  ],
};

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

const DUMMY_LOGS: TraversalLogEntry[] = [
  { step: 1, nodeId: "html", tag: "html", action: "visit", depth: 0 },
  { step: 2, nodeId: "head", tag: "head", action: "visit", depth: 1 },
  { step: 3, nodeId: "body", tag: "body", action: "visit", depth: 1 },
  { step: 4, nodeId: "title", tag: "title", action: "visit", depth: 2 },
  { step: 5, nodeId: "header", tag: "header", action: "visit", depth: 2 },
  { step: 6, nodeId: "main", tag: "main", action: "visit", depth: 2 },
  { step: 7, nodeId: "footer", tag: "footer", action: "visit", depth: 2 },
  { step: 8, nodeId: "nav", tag: "nav", action: "visit", depth: 3 },
  { step: 9, nodeId: "article1", tag: "article", action: "visit", depth: 3 },
  { step: 10, nodeId: "article2", tag: "article", action: "visit", depth: 3 },
  { step: 11, nodeId: "aside", tag: "aside", action: "visit", depth: 3 },
  { step: 12, nodeId: "small", tag: "small", action: "visit", depth: 3 },
  { step: 13, nodeId: "a1", tag: "a", action: "visit", depth: 4 },
  { step: 14, nodeId: "a2", tag: "a", action: "visit", depth: 4 },
  { step: 15, nodeId: "a3", tag: "a", action: "match", depth: 4 },
  { step: 16, nodeId: "h1", tag: "h1", action: "visit", depth: 4 },
  { step: 17, nodeId: "p1", tag: "p", action: "visit", depth: 4 },
  { step: 18, nodeId: "h2", tag: "h2", action: "visit", depth: 4 },
  { step: 19, nodeId: "p2", tag: "p", action: "visit", depth: 4 },
  { step: 20, nodeId: "ul", tag: "ul", action: "visit", depth: 4 },
  { step: 21, nodeId: "span1", tag: "span", action: "visit", depth: 5 },
  { step: 22, nodeId: "span2", tag: "span", action: "visit", depth: 5 },
  { step: 23, nodeId: "li1", tag: "li", action: "visit", depth: 5 },
  { step: 24, nodeId: "li2", tag: "li", action: "match", depth: 5 },
  { step: 25, nodeId: "li3", tag: "li", action: "visit", depth: 5 },
];

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

function findNodeById(node: DOMNode, id: string): DOMNode | null {
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

function parseSelectorMatch(node: DOMNode, selector: string): boolean {
  const normalized = selector.trim();
  if (!normalized) return false;

  if (normalized.startsWith(".")) {
    const className = normalized.slice(1);
    const classValue = node.attributes?.class ?? "";
    return classValue.split(/\s+/).filter(Boolean).includes(className);
  }

  if (normalized.startsWith("#")) {
    const idValue = normalized.slice(1);
    return node.attributes?.id === idValue;
  }

  if (normalized.startsWith("[") && normalized.endsWith("]")) {
    const inner = normalized.slice(1, -1).trim();
    if (!inner) return false;

    if (!inner.includes("=")) {
      return Boolean(node.attributes?.[inner]);
    }

    const [rawKey, rawValue] = inner.split("=");
    const key = rawKey.trim();
    const value = rawValue.trim().replace(/^["']|["']$/g, "");
    return node.attributes?.[key] === value;
  }

  return node.tag.toLowerCase() === normalized.toLowerCase();
}

function generateTraversalLogs(
  root: DOMNode,
  algorithm: "BFS" | "DFS",
  selector: string
): TraversalLogEntry[] {
  const logs: TraversalLogEntry[] = [];
  let step = 1;

  if (algorithm === "BFS") {
    const queue: DOMNode[] = [root];
    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) continue;

      logs.push({
        step: step++,
        nodeId: current.id,
        tag: current.tag,
        action: parseSelectorMatch(current, selector) ? "match" : "visit",
        depth: current.depth ?? 0,
      });

      queue.push(...(current.children ?? []));
    }
    return logs;
  }

  const stack: DOMNode[] = [root];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;

    logs.push({
      step: step++,
      nodeId: current.id,
      tag: current.tag,
      action: parseSelectorMatch(current, selector) ? "match" : "visit",
      depth: current.depth ?? 0,
    });

    const children = current.children ?? [];
    for (let index = children.length - 1; index >= 0; index -= 1) {
      stack.push(children[index]);
    }
  }

  return logs;
}

function parseHtmlInputToTree(html: string): DOMNode | null {
  if (typeof window === "undefined") return null;

  const doc = new DOMParser().parseFromString(html, "text/html");
  const root = doc.documentElement;
  if (!root) return null;

  const counter = { value: 1 };

  const buildNode = (element: Element, depth: number, parentId?: string): DOMNode => {
    const tag = element.tagName.toLowerCase();
    const id = `${tag}-${counter.value++}`;

    const attributes: Record<string, string> = {};
    for (const attr of Array.from(element.attributes)) {
      attributes[attr.name] = attr.value;
    }

    const ownText = Array.from(element.childNodes)
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent?.trim() ?? "")
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    const children = Array.from(element.children).map((child) =>
      buildNode(child, depth + 1, id)
    );

    return {
      id,
      tag,
      parentId,
      depth,
      innerText: ownText || undefined,
      attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
      children,
    };
  };

  return buildNode(root, 0);
}

type TreeEdge = {
  parentId: string;
  childId: string;
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
  const rawNodes = new Map<string, PositionedNode>();
  let cursorX = 0;
  let maxDepth = 0;

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
    x: item.x - minX + 70,
    y: item.y + 56,
  }));

  const byId = new Map(nodes.map((item) => [item.node.id, item]));

  return {
    nodes,
    byId,
    edges: collectEdges(root),
    width: Math.max(1200, maxX - minX + 140),
    height: Math.max(560, maxDepth * verticalGap + 180),
  };
}

function edgeActive(parent: DOMNode, child: DOMNode, visitedIds: string[], currentId: string | null) {
  return (
    visitedIds.includes(parent.id) &&
    (visitedIds.includes(child.id) || currentId === child.id)
  );
}

function NodePill({
  node,
  state,
  selected,
  onClick,
}: {
  node: DOMNode;
  state: NodeState;
  selected: boolean;
  onClick: () => void;
}) {
  const stateClass =
    state === "match"
      ? "border-primary/90 bg-primary/25 text-primary-foreground shadow-[0_0_24px_hsl(var(--primary)/0.45)]"
      : state === "current"
      ? "border-yellow-300 bg-yellow-300/20 text-yellow-100 shadow-[0_0_20px_rgba(250,204,21,0.35)]"
      : state === "visited"
      ? "border-emerald-300/70 bg-emerald-300/14 text-emerald-100 shadow-[0_0_16px_rgba(16,185,129,0.22)]"
      : "border-emerald-200/25 bg-[#0f1722]/88 text-[#deefe7] hover:border-emerald-200/60 hover:bg-[#122132] hover:text-white";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-[86px] rounded-xl border px-4 py-2 text-xs font-mono font-semibold tracking-[0.03em] transition-all duration-300 ${
        selected ? "ring-2 ring-primary/80 ring-offset-1 ring-offset-[#08101b]" : ""
      } ${stateClass}`}
    >
      {"<"}
      {node.tag}
      {">"}
    </button>
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
}: {
  tree: DOMNode;
  selectedNodeId: string | null;
  currentAnimatedNodeId: string | null;
  visitedIds: string[];
  matchIds: string[];
  onSelectNode: (node: DOMNode) => void;
  zoom: number;
}) {
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

  return (
    <div
      className="origin-top transition-transform duration-200"
      style={{ transform: `scale(${zoom})` }}
    >
      <div
        className="relative rounded-2xl border border-emerald-100/8 bg-[#071017]/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
        style={{ width: layout.width, height: layout.height }}
      >
        <svg className="pointer-events-none absolute inset-0 h-full w-full">
          {depthGuides.map(({ depth, y }) => (
            <g key={`depth-${depth}`}>
              <line
                x1={34}
                y1={y}
                x2={layout.width - 34}
                y2={y}
                stroke="rgba(165, 214, 196, 0.13)"
                strokeDasharray="6 10"
              />
              <text
                x={8}
                y={y + 4}
                fill="rgba(190, 225, 210, 0.52)"
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
                stroke={isActive ? "hsl(var(--primary))" : "rgba(87, 229, 171, 0.62)"}
                strokeWidth={isActive ? 2.8 : 2}
                strokeLinecap="round"
                className={isActive ? "drop-shadow-[0_0_10px_hsl(var(--primary)/0.58)]" : ""}
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
                onClick={() => onSelectNode(node)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ExplorerPage() {
  const [sourceMode, setSourceMode] = useState<"URL" | "HTML">("HTML");
  const [sourceInput, setSourceInput] = useState(DUMMY_HTML);
  const [selectorInput, setSelectorInput] = useState(".active");
  const [algorithm, setAlgorithm] = useState<"BFS" | "DFS">("BFS");
  const [resultMode, setResultMode] = useState<"ALL" | "TOP_N">("ALL");

  const [parseError, setParseError] = useState("");
  const [traversalError, setTraversalError] = useState("");
  const [hasParsed, setHasParsed] = useState(true);

  const [isParsing, setIsParsing] = useState(false);
  const [isTraversing, setIsTraversing] = useState(false);

  const [tree, setTree] = useState<DOMNode | null>(DUMMY_TREE);
  const [logs, setLogs] = useState<TraversalLogEntry[]>(DUMMY_LOGS);

  const [speed, setSpeed] = useState(350);
  const [zoom, setZoom] = useState(0.7);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [bottomTab, setBottomTab] = useState<"logs" | "inspector">("logs");

  const [animationRunning, setAnimationRunning] = useState(false);
  const [animationIndex, setAnimationIndex] = useState(0);
  const logViewportRef = useRef<HTMLDivElement | null>(null);

  const selectedNode = useMemo(
    () => (tree && selectedNodeId ? findNodeById(tree, selectedNodeId) : null),
    [tree, selectedNodeId]
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
  const maxDepth = flattenedNodes.length
    ? Math.max(...flattenedNodes.map((node) => node.depth ?? 0))
    : 0;
  const visitedCount = Math.min(animationIndex, logs.filter((log) => log.action !== "skip").length);
  const matchCount = logs.filter((log) => log.action === "match").length;
  const visibleLogs = logs.slice(0, Math.max(animationIndex, 1));

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
      await new Promise((resolve) => setTimeout(resolve, 650));

      const parsedTree =
        sourceMode === "HTML" ? parseHtmlInputToTree(trimmed) : DUMMY_TREE;

      if (!parsedTree) {
        setParseError("Gagal membaca HTML. Pastikan format HTML valid.");
        return;
      }

      setTree(parsedTree);
      setLogs([]);
      setHasParsed(true);
      setSelectedNodeId(null);
      setAnimationRunning(false);
      setAnimationIndex(0);
      setBottomTab("logs");
    } catch {
      setParseError("Gagal melakukan parse HTML.");
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

    setIsTraversing(true);
    setAnimationIndex(0);
    setBottomTab("logs");

    try {
      await new Promise((resolve) => setTimeout(resolve, 250));

      const computedLogs = generateTraversalLogs(tree, algorithm, selectorInput);
      setLogs(computedLogs);
      setAnimationRunning(true);
    } catch {
      setTraversalError("Gagal menjalankan traversal.");
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
    <section className="h-[calc(100vh-176px)] min-h-[700px] overflow-hidden">
      <div className="grid h-full grid-cols-[380px_minmax(0,1fr)]">
        <aside className="flex h-full flex-col border-r border-border bg-background/80">
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="mb-8">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Source
              </p>

              <div className="mb-4 flex gap-3">
                <button
                  onClick={() => setSourceMode("URL")}
                  className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                    sourceMode === "URL"
                      ? "border-primary bg-primary/15 text-primary shadow-[0_0_14px_hsl(var(--primary)/0.16)]"
                      : "border-border bg-card/40 text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                  }`}
                >
                  URL
                </button>
                <button
                  onClick={() => setSourceMode("HTML")}
                  className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                    sourceMode === "HTML"
                      ? "border-primary bg-primary/15 text-primary shadow-[0_0_14px_hsl(var(--primary)/0.16)]"
                      : "border-border bg-card/40 text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
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
                  className="w-full rounded-2xl border border-border bg-card/40 px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
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
                  className="w-full resize-none rounded-2xl border border-border bg-card/40 px-4 py-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                  placeholder="<html><body><div>Hello</div></body></html>"
                />
              )}

              <button
                onClick={handleParseHtml}
                disabled={isParsing}
                className={`mt-4 w-full rounded-2xl px-4 py-4 text-lg font-semibold transition ${
                  isParsing
                    ? "cursor-not-allowed bg-primary/50 text-primary-foreground"
                    : "bg-primary text-primary-foreground shadow-[0_0_24px_hsl(var(--primary)/0.22)] hover:opacity-90"
                }`}
              >
                {isParsing ? "Parsing..." : "Parse HTML"}
              </button>

              {parseError && <p className="mt-3 text-sm text-red-400">{parseError}</p>}
            </div>

            <div className="mb-8">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Traversal
              </p>

              <label className="mb-2 block text-sm text-muted-foreground">CSS selector</label>
              <input
                value={selectorInput}
                onChange={(event) => setSelectorInput(event.target.value)}
                className="w-full rounded-2xl border border-border bg-card/40 px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                placeholder=".active"
              />
            </div>

            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Result
              </p>

              <div className="mb-4 flex gap-3">
                <button
                  onClick={() => setResultMode("ALL")}
                  className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                    resultMode === "ALL"
                      ? "border-primary bg-primary/15 text-primary shadow-[0_0_14px_hsl(var(--primary)/0.16)]"
                      : "border-border bg-card/40 text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setResultMode("TOP_N")}
                  className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                    resultMode === "TOP_N"
                      ? "border-primary bg-primary/15 text-primary shadow-[0_0_14px_hsl(var(--primary)/0.16)]"
                      : "border-border bg-card/40 text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                  }`}
                >
                  Top N
                </button>
              </div>

              <input
                defaultValue="5"
                className="mb-5 w-full rounded-2xl border border-border bg-card/40 px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
              />

              <button
                onClick={handleRunTraversal}
                disabled={!hasParsed || isTraversing}
                className={`flex w-full items-center justify-center gap-3 rounded-2xl px-5 py-4 text-lg font-semibold transition ${
                  !hasParsed || isTraversing
                    ? "cursor-not-allowed bg-primary/50 text-primary-foreground"
                    : "bg-primary text-primary-foreground shadow-[0_0_24px_hsl(var(--primary)/0.22)] hover:opacity-90"
                }`}
              >
                <span>{">"}</span>
                {isTraversing ? "Running..." : "Run Traversal"}
              </button>

              {!hasParsed && !traversalError && (
                <p className="mt-3 text-sm text-muted-foreground">
                  Parse HTML terlebih dahulu untuk mengaktifkan traversal.
                </p>
              )}

              {traversalError && <p className="mt-3 text-sm text-red-400">{traversalError}</p>}
            </div>
          </div>
        </aside>

        <div className="grid h-full grid-rows-[82px_minmax(0,1fr)_240px]">
          <div className="flex items-center justify-between border-b border-border px-6">
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2 rounded-xl border border-border bg-card/40 p-1">
                <button
                  onClick={() => setAlgorithm("BFS")}
                  className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition ${
                    algorithm === "BFS"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                  }`}
                >
                  BFS
                </button>
                <button
                  onClick={() => setAlgorithm("DFS")}
                  className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition ${
                    algorithm === "DFS"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                  }`}
                >
                  DFS
                </button>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-border bg-card/40 px-4 py-3">
                <button
                  onClick={() => {
                    setAnimationRunning(false);
                    setAnimationIndex(0);
                    setIsTraversing(false);
                  }}
                  className="rounded-md px-2 py-1 text-muted-foreground transition hover:bg-primary/5 hover:text-primary"
                >
                  reset
                </button>
                <button
                  onClick={() => setAnimationRunning((prev) => !prev)}
                  className="rounded-md bg-primary/20 px-3 py-1 text-primary transition hover:bg-primary/30"
                >
                  {animationRunning ? "pause" : "play"}
                </button>

                <div className="mx-2 h-6 w-px bg-border" />

                <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Speed
                </span>

                <input
                  type="range"
                  min={100}
                  max={1000}
                  step={50}
                  value={speed}
                  onChange={(event) => setSpeed(Number(event.target.value))}
                  className="accent-primary"
                />

                <span className="text-sm text-muted-foreground">{speed}ms</span>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <span className="text-foreground">
                <strong>{totalNodes}</strong>{" "}
                <span className="text-muted-foreground">nodes</span>
              </span>
              <span className="text-foreground">
                <strong>{maxDepth}</strong>{" "}
                <span className="text-muted-foreground">depth</span>
              </span>
              <span className="text-foreground">
                <strong>{visitedCount}</strong>{" "}
                <span className="text-muted-foreground">visited</span>
              </span>
              <span className="text-foreground">
                <strong>{matchCount}</strong>{" "}
                <span className="text-muted-foreground">matches</span>
              </span>
              <span className="text-muted-foreground">2.8 ms</span>
            </div>
          </div>

          <div className="relative overflow-auto border-b border-border bg-background/40">
            <div className="grid-bg absolute inset-0 opacity-40" />

            <div className="absolute right-6 top-6 z-20 flex items-center gap-4 rounded-xl border border-border bg-card/50 px-5 py-3 text-sm text-muted-foreground backdrop-blur-sm">
              <button onClick={handleZoomIn} className="rounded-md px-1 transition hover:text-primary">
                +
              </button>
              <span>{Math.round(zoom * 100)}%</span>
              <button onClick={handleZoomOut} className="rounded-md px-1 transition hover:text-primary">
                -
              </button>
            </div>

            <div className="relative flex min-h-full min-w-[1300px] items-start justify-center px-10 py-10">
              {tree ? (
                <TreeCanvas
                  tree={tree}
                  selectedNodeId={selectedNodeId}
                  currentAnimatedNodeId={currentAnimatedNodeId}
                  visitedIds={visitedIds}
                  matchIds={matchIds}
                  onSelectNode={(node) => {
                    setSelectedNodeId(node.id);
                    setBottomTab("inspector");
                  }}
                  zoom={zoom}
                />
              ) : (
                <div className="pt-10 text-muted-foreground">
                  Parse HTML terlebih dahulu untuk melihat DOM tree.
                </div>
              )}
            </div>

            <div className="absolute bottom-4 left-4 flex items-center gap-4 rounded-xl border border-border bg-card/50 px-4 py-3 text-xs text-muted-foreground backdrop-blur-sm">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/70" />
                default
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-green-300/40" />
                visited
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                current
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                match
              </span>
            </div>
          </div>

          <div className="flex min-h-0 flex-col overflow-hidden border-t border-white/5 bg-[#111317]">
            <div className="flex items-center gap-2 border-b border-white/5 bg-[#181b20] px-4 py-3">
              <button
                onClick={() => setBottomTab("logs")}
                className={`rounded-md border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                  bottomTab === "logs"
                    ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                    : "border-transparent text-[#8b949e] hover:border-white/10 hover:bg-white/5 hover:text-[#d7e2f0]"
                }`}
              >
                Traversal Logs
              </button>

              <button
                onClick={() => setBottomTab("inspector")}
                className={`rounded-md border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                  bottomTab === "inspector"
                    ? "border-cyan-400/40 bg-cyan-500/10 text-cyan-200"
                    : "border-transparent text-[#8b949e] hover:border-white/10 hover:bg-white/5 hover:text-[#d7e2f0]"
                }`}
              >
                Inspector
              </button>

              <div className="ml-auto flex items-center gap-3 font-mono text-xs text-[#8b949e]">
                <span>{bottomTab === "logs" ? "TERMINAL" : "NODE DETAILS"}</span>
                <span className="rounded border border-white/10 px-2 py-1 text-[#c9d1d9]">
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
              className="h-[220px] overflow-auto bg-[#0d1117] px-4 py-4 font-mono text-sm"
            >
              {bottomTab === "logs" ? (
                logs.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-white/10 px-4 py-6 text-[#8b949e]">
                    Run a traversal to see step-by-step logs.
                  </p>
                ) : (
                  <div className="space-y-3 text-[#c9d1d9]">
                    <div className="flex items-center gap-4 rounded-lg border border-white/5 bg-white/[0.03] px-4 py-2 text-xs text-[#8b949e]">
                      <span className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#4b5563]" />
                        default
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                        visited
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                        current
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                        match
                      </span>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-white/5 bg-[#010409] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                      <div className="flex items-center justify-between border-b border-white/5 bg-[#0b0f14] px-4 py-3 text-xs uppercase tracking-[0.2em] text-[#8b949e]">
                        <span>Traversal Logs</span>
                        <span>{Math.min(animationIndex, logs.length)} / {logs.length}</span>
                      </div>

                      <div className="divide-y divide-white/[0.03]">
                        {visibleLogs.map((log) => {
                          const isCurrent = currentAnimatedNodeId === log.nodeId;
                          const isMatch = log.action === "match";
                          const lineTone = isMatch
                            ? "text-emerald-300"
                            : isCurrent
                            ? "text-yellow-200"
                            : visitedIds.includes(log.nodeId)
                            ? "text-[#d7e2f0]"
                            : "text-[#8b949e]";

                          return (
                            <button
                              key={log.step}
                              type="button"
                              onClick={() => {
                                setSelectedNodeId(log.nodeId);
                                setBottomTab("inspector");
                              }}
                              className={`grid w-full grid-cols-[56px_76px_minmax(0,1fr)] items-center gap-4 px-4 py-2 text-left transition hover:bg-white/[0.04] ${lineTone}`}
                            >
                              <span className="text-[#6e7681]">{String(log.step).padStart(3, "0")}</span>
                              <span
                                className={`font-semibold uppercase tracking-[0.18em] ${
                                  isMatch
                                    ? "text-emerald-300"
                                    : isCurrent
                                    ? "text-yellow-200"
                                    : "text-[#8b949e]"
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
                          <div className="flex items-center gap-3 px-4 py-3 text-[#6e7681]">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                            waiting for next traversal step...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              ) : !selectedNode ? (
                <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center text-sm text-[#8b949e]">
                  Click any node in the tree or any log row to inspect it here.
                </div>
              ) : (
                <div className="grid gap-4 text-[#c9d1d9] md:grid-cols-[minmax(0,1fr)_280px]">
                  <div className="rounded-xl border border-white/5 bg-white/[0.03]">
                    <div className="border-b border-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#8b949e]">
                      Node Summary
                    </div>
                    <div className="space-y-4 px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span className="rounded-md border border-cyan-400/30 bg-cyan-400/10 px-2 py-1 text-xs uppercase tracking-[0.18em] text-cyan-200">
                          selected
                        </span>
                        <span className="text-lg text-white">
                          {"<"}
                          {selectedNode.tag}
                          {">"}
                        </span>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg border border-white/5 bg-[#0b0f14] px-3 py-3">
                          <div className="text-xs uppercase tracking-[0.18em] text-[#6e7681]">Node ID</div>
                          <div className="mt-2 text-base text-white">{selectedNode.id}</div>
                        </div>
                        <div className="rounded-lg border border-white/5 bg-[#0b0f14] px-3 py-3">
                          <div className="text-xs uppercase tracking-[0.18em] text-[#6e7681]">Depth</div>
                          <div className="mt-2 text-base text-white">{selectedNode.depth ?? "-"}</div>
                        </div>
                        <div className="rounded-lg border border-white/5 bg-[#0b0f14] px-3 py-3">
                          <div className="text-xs uppercase tracking-[0.18em] text-[#6e7681]">Parent</div>
                          <div className="mt-2 text-base text-white">{selectedNode.parentId ?? "-"}</div>
                        </div>
                        <div className="rounded-lg border border-white/5 bg-[#0b0f14] px-3 py-3">
                          <div className="text-xs uppercase tracking-[0.18em] text-[#6e7681]">Children</div>
                          <div className="mt-2 text-base text-white">{selectedNode.children?.length ?? 0}</div>
                        </div>
                      </div>

                      <div className="rounded-lg border border-white/5 bg-[#0b0f14] px-3 py-3">
                        <div className="text-xs uppercase tracking-[0.18em] text-[#6e7681]">Inner Text</div>
                        <div className="mt-2 whitespace-pre-wrap text-sm text-[#d7e2f0]">
                          {selectedNode.innerText || "No inner text"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/5 bg-white/[0.03]">
                    <div className="border-b border-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#8b949e]">
                      Attributes
                    </div>
                    <div className="px-4 py-4">
                      <pre className="overflow-auto rounded-lg border border-white/5 bg-[#0b0f14] p-4 text-xs leading-6 text-[#d7e2f0]">
                        {selectedNode.attributes
                          ? JSON.stringify(selectedNode.attributes, null, 2)
                          : '{\n  "message": "No attributes"\n}'}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
