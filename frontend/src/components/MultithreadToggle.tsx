"use client";

import { motion } from "framer-motion";

interface MultithreadToggleProps {
  title?: string;
  subtitleOn?: string;
  subtitleOff?: string;
  variant?: "cyan" | "violet" | "amber";
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

const VARIANT_STYLES = {
  cyan: {
    card: "border-[rgba(0,229,255,0.15)] bg-[rgba(3,5,8,0.5)]",
    title: "text-[#e0f7ff]",
    subtitle: "text-[#6b8fa3]",
    onTrack: "bg-[rgba(0,229,255,0.3)] border-[rgba(0,229,255,0.5)]",
    offTrack: "bg-[rgba(107,143,163,0.2)] border-[rgba(107,143,163,0.3)]",
    onThumb: "#00e5ff",
    offThumb: "#6b8fa3",
    onShadow: "0 0 10px rgba(0, 229, 255, 0.5)",
  },
  violet: {
    card: "border-[rgba(139,92,246,0.25)] bg-[rgba(139,92,246,0.06)]",
    title: "text-[#c4b5fd]",
    subtitle: "text-[#a78bfa]",
    onTrack: "bg-[rgba(139,92,246,0.35)] border-[rgba(139,92,246,0.55)]",
    offTrack: "bg-[rgba(107,143,163,0.2)] border-[rgba(107,143,163,0.3)]",
    onThumb: "#c4b5fd",
    offThumb: "#6b8fa3",
    onShadow: "0 0 10px rgba(139, 92, 246, 0.45)",
  },
  amber: {
    card: "border-[rgba(255,158,0,0.25)] bg-[rgba(255,158,0,0.08)]",
    title: "text-[#ffcc85]",
    subtitle: "text-[#c48a45]",
    onTrack: "bg-[rgba(255,158,0,0.35)] border-[rgba(255,158,0,0.55)]",
    offTrack: "bg-[rgba(65,39,9,0.55)] border-[rgba(255,158,0,0.2)]",
    onThumb: "#ff9e00",
    offThumb: "#a66b1e",
    onShadow: "0 0 10px rgba(255, 158, 0, 0.5)",
  },
} as const;

export default function MultithreadToggle({
  title = "Parallel Mode",
  subtitleOn = "Multithreading ON",
  subtitleOff = "Sequential traversal",
  variant = "cyan",
  enabled,
  onChange,
}: MultithreadToggleProps) {
  const theme = VARIANT_STYLES[variant];

  return (
    <div className={`flex items-center justify-between rounded-xl border px-4 py-3 ${theme.card}`}>
      <div className="flex flex-col gap-0.5">
        <span className={`text-sm font-semibold ${theme.title}`}>{title}</span>
        <span className={`text-[11px] ${theme.subtitle}`}>
          {enabled ? subtitleOn : subtitleOff}
        </span>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={title}
        onClick={() => onChange(!enabled)}
        className={`relative h-7 w-12 rounded-full border transition-colors duration-200 ${
          enabled ? theme.onTrack : theme.offTrack
        }`}
      >
        <motion.div
          className="absolute left-1 top-1 h-5 w-5 rounded-full shadow-md"
          style={{
            background: enabled ? theme.onThumb : theme.offThumb,
            boxShadow: enabled ? theme.onShadow : "none",
          }}
          animate={{ x: enabled ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}
