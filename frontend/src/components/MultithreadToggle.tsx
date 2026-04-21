"use client";

import { motion } from "framer-motion";

interface MultithreadToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export default function MultithreadToggle({ enabled, onChange }: MultithreadToggleProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[rgba(0,229,255,0.15)] bg-[rgba(3,5,8,0.5)] px-4 py-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold text-[#e0f7ff]">Parallel Mode</span>
        <span className="text-[11px] text-[#6b8fa3]">
          {enabled ? "Multithreading ON" : "Sequential traversal"}
        </span>
      </div>

      <button
        onClick={() => onChange(!enabled)}
        className="relative h-7 w-12 rounded-full transition-colors duration-200"
        style={{
          background: enabled ? "rgba(0, 229, 255, 0.3)" : "rgba(107, 143, 163, 0.2)",
          border: enabled ? "1px solid rgba(0, 229, 255, 0.5)" : "1px solid rgba(107, 143, 163, 0.3)",
        }}
      >
        <motion.div
          className="absolute top-0.5 h-5 w-5 rounded-full shadow-md"
          style={{
            background: enabled ? "#00e5ff" : "#6b8fa3",
            boxShadow: enabled ? "0 0 10px rgba(0, 229, 255, 0.5)" : "none",
          }}
          animate={{ left: enabled ? "26px" : "4px" }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}
