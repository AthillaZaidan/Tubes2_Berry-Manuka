"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import MeshBackground from "@/components/MeshBackground";
import TextPressure from "@/components/TextPressure";

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
    <section className="relative h-screen overflow-hidden">
      {/* Pure CSS animated mesh background */}
      <MeshBackground />

      <motion.div
        className="relative z-10 flex h-full items-center justify-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="space-y-8">
            {/* TextPressure title — plain cyan with neon glow */}
            <motion.div variants={itemVariants} className="h-[120px] md:h-[160px]">
              <TextPressure
                text="BERRY-MANUKA"
                textColor="#00e5ff"
                flex
                width
                weight
                italic
                minFontSize={32}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <p className="text-base md:text-lg max-w-xl mx-auto leading-8 text-[#a0b4c4]">
                Explore and visualize DOM trees using BFS and DFS traversal
                with CSS selectors in a clean interactive interface.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-4">
            <Link
              href="/explorer"
              className="inline-flex items-center rounded-xl bg-[#00e5ff] px-10 py-5 text-lg font-semibold text-[#030508] shadow-[0_0_40px_rgba(0,229,255,0.35),0_0_80px_rgba(0,229,255,0.15)] transition hover:scale-[1.04] hover:shadow-[0_0_50px_rgba(0,229,255,0.45),0_0_100px_rgba(0,229,255,0.2)]"
            >
              Open Explorer
            </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}