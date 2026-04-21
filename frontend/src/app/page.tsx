"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function HomePage() {
  return (
    <motion.section
      className="relative flex min-h-[calc(100vh-140px)] items-center justify-center overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="mx-auto max-w-3xl px-6 text-center">
        <div className="space-y-6">
          <motion.div variants={itemVariants}>
            <h1 className="font-display text-[64px] font-bold leading-[0.9] tracking-[-0.03em] md:text-[88px] lg:text-[110px]">
              <span className="text-gradient drop-shadow-[0_0_25px_rgba(34,197,94,0.25)]">
                Berry-Manuka
              </span>
            </h1>
          </motion.div>
          <motion.div variants={itemVariants}>
            <p className="text-base md:text-lg max-w-xl mx-auto leading-8 text-muted-foreground">
              Explore and visualize DOM trees using BFS and DFS traversal
              with CSS selectors in a clean interactive interface.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="pt-4">
            <Link
              href="/explorer"
              className="inline-flex items-center rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground shadow-[0_0_30px_hsl(var(--primary)/0.15)] transition hover:scale-[1.03] hover:opacity-95"
            >
              Open Explorer
            </Link>
          </motion.div>
        </div>
      </div>

      {/* subtle background glow */}
      <motion.div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: "radial-gradient(circle at center, rgba(0, 229, 255, 0.08), transparent 60%)",
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.6, 0.8, 0.6],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.section>
  );
}