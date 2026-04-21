"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { findLCA } from "@/lib/api";
import { DOMNode, LCAResponse } from "@/lib/types";

interface LCAFinderProps {
  tree: DOMNode | null;
}

function collectAllNodes(node: DOMNode): DOMNode[] {
  const nodes: DOMNode[] = [node];
  for (const child of node.children || []) {
    nodes.push(...collectAllNodes(child));
  }
  return nodes;
}

export default function LCAFinder({ tree }: LCAFinderProps) {
  const [open, setOpen] = useState(false);
  const [nodeA, setNodeA] = useState<number | null>(null);
  const [nodeB, setNodeB] = useState<number | null>(null);
  const [result, setResult] = useState<LCAResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const allNodes = tree ? collectAllNodes(tree) : [];

  async function handleFind() {
    if (nodeA === null || nodeB === null) {
      setError("Pilih kedua node terlebih dahulu.");
      return;
    }
    if (nodeA === nodeB) {
      setError("Pilih dua node yang berbeda.");
      return;
    }
    if (!tree) {
      setError("Tree tidak tersedia.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await findLCA({
        tree,
        nodeIdA: nodeA,
        nodeIdB: nodeB,
      });
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Gagal mencari LCA.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setNodeA(null);
    setNodeB(null);
    setResult(null);
    setError("");
  }

  function handleClose() {
    setOpen(false);
    handleReset();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={!tree}
        className="w-full rounded-xl border border-[rgba(139,92,246,0.3)] bg-[rgba(139,92,246,0.08)] px-4 py-3 text-sm font-semibold text-[#a78bfa] transition hover:bg-[rgba(139,92,246,0.15)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        🔍 Find LCA
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="mx-4 w-full max-w-lg rounded-2xl border border-[rgba(0,229,255,0.15)] bg-[#060c16] p-6 shadow-[0_0_40px_rgba(0,229,255,0.1)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#e0f7ff]" style={{ fontFamily: "Orbitron, sans-serif" }}>
                  Lowest Common Ancestor
                </h2>
                <button
                  onClick={handleClose}
                  className="rounded-lg px-2 py-1 text-[#6b8fa3] transition hover:bg-[rgba(0,229,255,0.1)] hover:text-[#00e5ff]"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4 space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#6b8fa3]">
                    Node A
                  </label>
                  <select
                    value={nodeA ?? ""}
                    onChange={(e) => setNodeA(e.target.value ? Number(e.target.value) : null)}
                    className="w-full rounded-lg border border-[rgba(0,229,255,0.2)] bg-[rgba(0,229,255,0.05)] px-3 py-2.5 text-sm text-[#e0f7ff] outline-none focus:border-[rgba(0,229,255,0.5)]"
                  >
                    <option value="" className="bg-[#060c16]">Pilih node...</option>
                    {allNodes.map((node) => (
                      <option key={node.id} value={node.id} className="bg-[#060c16]">
                        #{node.id} &lt;{node.tag}&gt;{node.innerText ? ` — "${node.innerText.substring(0, 30)}"` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#6b8fa3]">
                    Node B
                  </label>
                  <select
                    value={nodeB ?? ""}
                    onChange={(e) => setNodeB(e.target.value ? Number(e.target.value) : null)}
                    className="w-full rounded-lg border border-[rgba(0,229,255,0.2)] bg-[rgba(0,229,255,0.05)] px-3 py-2.5 text-sm text-[#e0f7ff] outline-none focus:border-[rgba(0,229,255,0.5)]"
                  >
                    <option value="" className="bg-[#060c16]">Pilih node...</option>
                    {allNodes.map((node) => (
                      <option key={node.id} value={node.id} className="bg-[#060c16]">
                        #{node.id} &lt;{node.tag}&gt;{node.innerText ? ` — "${node.innerText.substring(0, 30)}"` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4 flex gap-3">
                <button
                  onClick={handleFind}
                  disabled={loading}
                  className="flex-1 rounded-xl bg-[#00e5ff] px-4 py-2.5 text-sm font-bold text-[#030508] transition hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? "Mencari..." : "Find LCA"}
                </button>
                <button
                  onClick={handleReset}
                  className="rounded-xl border border-[rgba(0,229,255,0.2)] px-4 py-2.5 text-sm font-semibold text-[#6b8fa3] transition hover:bg-[rgba(0,229,255,0.1)] hover:text-[#00e5ff]"
                >
                  Reset
                </button>
              </div>

              {error && (
                <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                  {error}
                </div>
              )}

              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 rounded-xl border border-[rgba(139,92,246,0.3)] bg-[rgba(139,92,246,0.08)] p-4"
                >
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#a78bfa]">LCA Node</span>
                    <div className="mt-1 text-sm text-[#e0f7ff]">
                      <span className="font-mono text-[#00e5ff]">#{result.lcaNode.id}</span>{" "}
                      &lt;{result.lcaNode.tag}&gt;
                      {result.lcaNode.innerText && (
                        <span className="text-[#6b8fa3]"> — "{result.lcaNode.innerText}"</span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-[#6b8fa3]">Depth: {result.depthLCA}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#a78bfa]">Path A → LCA</span>
                      <div className="mt-1 font-mono text-xs text-[#e0f7ff]">
                        {result.pathA.join(" → ")}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#a78bfa]">Path B → LCA</span>
                      <div className="mt-1 font-mono text-xs text-[#e0f7ff]">
                        {result.pathB.join(" → ")}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
