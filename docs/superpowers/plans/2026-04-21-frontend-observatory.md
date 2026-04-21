# Frontend Observatory Design Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the existing dark-mode DOM tree explorer into a cinematic sci-fi "Observatory" aesthetic with electric cyan/amber neon glows, glassmorphism panels, distinctive sci-fi typography, and atmospheric starfield background — while preserving all existing functionality, layout, and state management.

**Architecture:** Visual-only overhaul. No structural changes to component hierarchy, layout grid, data flow, or state management. Changes are confined to CSS variables, Tailwind classes, inline styles, and one new presentational component (Starfield canvas). All logic and API integration remain untouched.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, TypeScript, Google Fonts (Orbitron, Exo 2, Space Grotesk, JetBrains Mono)

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `frontend/src/app/layout.tsx` | Modify | Add Google Fonts `<link>` tags in `<head>` |
| `frontend/src/app/globals.css` | Modify | Overhaul CSS variables, add keyframes, update body/bg styles |
| `frontend/src/components/Navbar.tsx` | Modify | Update brand font, nav link styles, borders |
| `frontend/src/components/Footer.tsx` | Modify | Update colors, borders, logo placeholder |
| `frontend/src/components/Starfield.tsx` | **Create** | Static canvas starfield background for tree area |
| `frontend/src/app/explorer/page.tsx` | Modify | Update ALL visual classes and inline styles (6 sections) |
| `frontend/src/app/page.tsx` | Modify | Update landing page to match Observatory theme |

---

### Task 1: Add Google Fonts to Layout

**Files:**
- Modify: `frontend/src/app/layout.tsx`

Add Google Fonts link tags for Orbitron, Exo 2, Space Grotesk, and JetBrains Mono in the `<head>`.

- [ ] **Step 1: Modify layout.tsx to add font imports**

```tsx
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "iloveTree — DOM Observatory",
  description: "Explore and visualize DOM trees using BFS and DFS traversal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Orbitron:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <div className="min-h-screen">
          <Navbar />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Verify fonts load**

Run dev server: `cd frontend && bun run dev`
Open browser dev tools → Elements → `<head>` should contain 4 font `<link>` tags.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/layout.tsx
git commit -m "feat: add Google Fonts (Orbitron, Exo 2, Space Grotesk, JetBrains Mono)"
```

---

### Task 2: Overhaul globals.css with Observatory Design System

**Files:**
- Modify: `frontend/src/app/globals.css`

Replace the entire file content. This is the foundation — all CSS variables, custom properties, keyframes, and base styles.

- [ ] **Step 1: Replace globals.css with Observatory design system**

```css
@import "tailwindcss";

/* ============================================
   OBSERVATORY DESIGN SYSTEM
   Tubes2 Berry-Manuka — DOM Tree Explorer
   ============================================ */

:root {
  /* Observatory Base Palette */
  --obs-base: #030508;
  --obs-base-rgb: 3, 5, 8;
  --obs-panel: rgba(6, 12, 22, 0.72);
  --obs-panel-solid: #060c16;

  /* Primary — Electric Cyan */
  --obs-primary: #00e5ff;
  --obs-primary-rgb: 0, 229, 255;
  --obs-primary-dim: rgba(0, 229, 255, 0.15);
  --obs-primary-soft: rgba(0, 229, 255, 0.08);

  /* Accent — Amber */
  --obs-accent: #ff9e00;
  --obs-accent-rgb: 255, 158, 0;
  --obs-accent-dim: rgba(255, 158, 0, 0.15);

  /* State Colors */
  --obs-visited: #00ffc8;
  --obs-visited-rgb: 0, 255, 200;
  --obs-current: #ffd700;
  --obs-current-rgb: 255, 215, 0;
  --obs-match: #ff9e00;
  --obs-match-rgb: 255, 158, 0;

  /* Text */
  --obs-text-main: #e0f7ff;
  --obs-text-main-rgb: 224, 247, 255;
  --obs-text-muted: #6b8fa3;
  --obs-text-muted-rgb: 107, 143, 163;

  /* Borders */
  --obs-border: rgba(0, 229, 255, 0.12);
  --obs-border-glow: rgba(0, 229, 255, 0.35);
  --obs-border-subtle: rgba(0, 229, 255, 0.06);

  /* Legacy shadcn variable remapping (for compatibility) */
  --background: 220 40% 2%;
  --foreground: 195 100% 94%;
  --card: 220 40% 5%;
  --card-foreground: 195 100% 94%;
  --popover: 220 40% 5%;
  --popover-foreground: 195 100% 94%;
  --primary: 187 100% 50%;
  --primary-foreground: 220 40% 2%;
  --secondary: 220 20% 10%;
  --secondary-foreground: 195 100% 88%;
  --muted: 220 15% 8%;
  --muted-foreground: 200 20% 45%;
  --accent: 187 100% 50%;
  --accent-foreground: 195 100% 95%;
  --destructive: 0 70% 55%;
  --destructive-foreground: 0 0% 98%;
  --border: 187 100% 50% / 0.12;
  --input: 220 20% 10%;
  --ring: 187 100% 50%;
  --radius: 0.625rem;
}

/* ============================================
   BASE STYLES
   ============================================ */

html {
  font-feature-settings: "ss01", "cv11";
  background-color: var(--obs-base);
}

body {
  margin: 0;
  min-height: 100vh;
  background-color: var(--obs-base);
  color: var(--obs-text-main);
  font-family: "Space Grotesk", system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}

* {
  box-sizing: border-box;
  border-color: var(--obs-border);
}

a {
  color: inherit;
  text-decoration: none;
}

/* ============================================
   TYPOGRAPHY UTILITIES
   ============================================ */

.font-display {
  font-family: "Orbitron", "Space Grotesk", sans-serif;
  letter-spacing: 0.02em;
}

.font-heading {
  font-family: "Exo 2", "Space Grotesk", sans-serif;
  letter-spacing: 0.04em;
}

.font-body {
  font-family: "Space Grotesk", system-ui, sans-serif;
}

.font-mono {
  font-family: "JetBrains Mono", ui-monospace, monospace;
  letter-spacing: 0.02em;
}

/* ============================================
   GRADIENT & GLOW UTILITIES
   ============================================ */

.text-gradient {
  background-image: linear-gradient(135deg, var(--obs-text-main), var(--obs-primary));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.text-gradient-accent {
  background-image: linear-gradient(135deg, var(--obs-primary), var(--obs-accent));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.text-glow-cyan {
  text-shadow: 0 0 12px rgba(var(--obs-primary-rgb), 0.5),
    0 0 24px rgba(var(--obs-primary-rgb), 0.25);
}

.text-glow-amber {
  text-shadow: 0 0 12px rgba(var(--obs-accent-rgb), 0.5),
    0 0 24px rgba(var(--obs-accent-rgb), 0.25);
}

/* ============================================
   GLASSMORPHISM PANEL
   ============================================ */

.glass-panel {
  background: var(--obs-panel);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--obs-border);
}

.glass-panel-strong {
  background: rgba(6, 12, 22, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--obs-border);
}

/* ============================================
   BACKGROUND EFFECTS
   ============================================ */

.grid-bg {
  background-image:
    linear-gradient(rgba(var(--obs-primary-rgb), 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(var(--obs-primary-rgb), 0.04) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
}

.radial-glow {
  background: radial-gradient(circle at 50% 40%, rgba(var(--obs-primary-rgb), 0.04), transparent 60%);
}

/* ============================================
   ANIMATIONS & KEYFRAMES
   ============================================ */

@keyframes nodePulse {
  0%, 100% {
    box-shadow: 0 0 12px rgba(var(--obs-current-rgb), 0.3),
      0 0 24px rgba(var(--obs-current-rgb), 0.15);
  }
  50% {
    box-shadow: 0 0 20px rgba(var(--obs-current-rgb), 0.5),
      0 0 40px rgba(var(--obs-current-rgb), 0.25);
  }
}

@keyframes edgePulse {
  0%, 100% {
    stroke-opacity: 0.85;
    filter: drop-shadow(0 0 6px rgba(var(--obs-primary-rgb), 0.4));
  }
  50% {
    stroke-opacity: 1;
    filter: drop-shadow(0 0 12px rgba(var(--obs-primary-rgb), 0.7));
  }
}

@keyframes shimmerSweep {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes statFlash {
  0%, 100% {
    color: var(--obs-primary);
  }
  50% {
    color: var(--obs-text-main);
  }
}

.animate-node-pulse {
  animation: nodePulse 1.2s ease-in-out infinite;
}

.animate-edge-pulse {
  animation: edgePulse 1.5s ease-in-out infinite;
}

.animate-shimmer {
  position: relative;
  overflow: hidden;
}

.animate-shimmer::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  transform: translateX(-100%);
  animation: shimmerSweep 2s ease-in-out infinite;
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out forwards;
}

.animate-stat-flash {
  animation: statFlash 0.4s ease;
}

/* ============================================
   BUTTON STYLES
   ============================================ */

.btn-primary {
  position: relative;
  background: linear-gradient(135deg, var(--obs-primary), #00b4dc);
  color: var(--obs-base);
  font-weight: 700;
  border: none;
  border-radius: 0.75rem;
  padding: 0.75rem 1.5rem;
  font-family: "Space Grotesk", sans-serif;
  cursor: pointer;
  transition: all 0.2s ease-out;
  overflow: hidden;
}

.btn-primary:hover {
  transform: scale(1.02);
  box-shadow: 0 0 30px rgba(var(--obs-primary-rgb), 0.35),
    0 0 60px rgba(var(--obs-primary-rgb), 0.15);
}

.btn-primary:active {
  transform: scale(0.98);
}

.btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

/* ============================================
   INPUT STYLES
   ============================================ */

.input-obs {
  width: 100%;
  border-radius: 1rem;
  border: 1px solid var(--obs-border);
  background: rgba(var(--obs-primary-rgb), 0.03);
  color: var(--obs-text-main);
  padding: 0.75rem 1rem;
  font-family: "Space Grotesk", sans-serif;
  font-size: 0.875rem;
  outline: none;
  transition: all 0.2s ease;
}

.input-obs::placeholder {
  color: var(--obs-text-muted);
}

.input-obs:focus {
  border-color: var(--obs-border-glow);
  box-shadow: 0 0 12px rgba(var(--obs-primary-rgb), 0.15);
}

/* ============================================
   SCROLLBAR STYLING
   ============================================ */

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--obs-border);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--obs-border-glow);
}

/* ============================================
   REDUCED MOTION
   ============================================ */

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* ============================================
   SELECTION
   ============================================ */

::selection {
  background: rgba(var(--obs-primary-rgb), 0.25);
  color: var(--obs-text-main);
}
```

- [ ] **Step 2: Verify CSS compiles**

Run: `cd frontend && bun run build`
Expected: Build succeeds without CSS errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/globals.css
git commit -m "feat: overhaul design system with Observatory theme — CSS vars, keyframes, glassmorphism, typography"
```

---

### Task 3: Create Starfield Background Component

**Files:**
- **Create:** `frontend/src/components/Starfield.tsx`

A static canvas-based starfield that renders behind the tree visualizer. No animation loop to save performance.

- [ ] **Step 1: Create Starfield.tsx**

```tsx
"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
}

function generateStars(width: number, height: number, count: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.3,
      opacity: Math.random() * 0.6 + 0.2,
    });
  }
  return stars;
}

export default function Starfield({
  starCount = 200,
  className = "",
}: {
  starCount?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;

      const stars = generateStars(canvas.width, canvas.height, starCount);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#ffffff";

      for (const star of stars) {
        ctx.globalAlpha = star.opacity;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [starCount]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{ opacity: 0.6 }}
    />
  );
}
```

- [ ] **Step 2: Verify component renders**

Import Starfield temporarily into `frontend/src/app/explorer/page.tsx`:
```tsx
import Starfield from "@/components/Starfield";
// Add inside tree visualizer div:
<Starfield className="z-0" />
```
Run dev server and visually confirm white dots appear behind tree.
Remove temporary import after confirming.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/Starfield.tsx
git commit -m "feat: add Starfield background component for Observatory theme"
```

---

### Task 4: Update Navbar Component

**Files:**
- Modify: `frontend/src/components/Navbar.tsx`

Replace entire file. Update brand font to Orbitron, nav links to Exo 2, add cyan glow effects.

- [ ] **Step 1: Replace Navbar.tsx**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Explorer", href: "/explorer" },
  ];

  return (
    <header
      className="sticky top-0 z-50 border-b border-[rgba(0,229,255,0.1)]"
      style={{
        background: "rgba(3, 5, 8, 0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="text-[22px] font-bold"
          style={{ fontFamily: "Orbitron, sans-serif" }}
        >
          <span style={{ color: "var(--obs-text-main)" }}>ilove</span>
          <span
            className="text-[#00e5ff]"
            style={{
              textShadow: "0 0 16px rgba(0, 229, 255, 0.4)",
            }}
          >
            Tree
          </span>
        </Link>

        <nav className="flex items-center gap-10">
          {navItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative rounded-lg px-2 py-1 text-[17px] font-medium transition-all duration-200"
                style={{
                  fontFamily: "Exo 2, sans-serif",
                  color: active ? "#00e5ff" : "#6b8fa3",
                  textShadow: active
                    ? "0 0 12px rgba(0, 229, 255, 0.5)"
                    : "none",
                  transform: active ? "scale(1.05)" : "scale(1)",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = "#00e5ff";
                    e.currentTarget.style.textShadow =
                      "0 0 12px rgba(0, 229, 255, 0.5)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = "#6b8fa3";
                    e.currentTarget.style.textShadow = "none";
                  }
                }}
              >
                {item.label}
                {active && (
                  <span
                    className="absolute -bottom-1 left-1/2 h-[2px] w-6 -translate-x-1/2 rounded-full"
                    style={{
                      background: "#00e5ff",
                      boxShadow: "0 0 8px rgba(0, 229, 255, 0.6)",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Verify navbar renders correctly**

Run dev server. Check:
- Brand "iloveTree" uses Orbitron font
- "Tree" has cyan glow
- Nav links use Exo 2 font
- Active link has underline glow
- Hover on inactive links turns cyan

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/Navbar.tsx
git commit -m "feat: redesign Navbar with Observatory theme — Orbitron brand, Exo 2 nav, cyan glows"
```

---

### Task 5: Update Footer Component

**Files:**
- Modify: `frontend/src/components/Footer.tsx`

Update colors, borders, and logo placeholder to match Observatory theme.

- [ ] **Step 1: Replace Footer.tsx**

```tsx
export default function Footer() {
  return (
    <footer
      className="border-t border-[rgba(0,229,255,0.08)]"
      style={{
        background: "rgba(3, 5, 8, 0.9)",
      }}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
            style={{
              border: "1px solid rgba(0, 229, 255, 0.2)",
              background: "rgba(0, 229, 255, 0.05)",
              color: "#00e5ff",
              fontFamily: "Orbitron, sans-serif",
            }}
          >
            B
          </div>
          <p>
            <span
              className="font-semibold"
              style={{ color: "var(--obs-text-main)" }}
            >
              iloveTree
            </span>{" "}
            <span style={{ color: "#6b8fa3" }}>— DOM Tree Explorer</span>
          </p>
        </div>

        <p style={{ color: "#6b8fa3" }}>
          Berry-Manuka &bull; IF2211 Strategi Algoritma
        </p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Verify footer renders correctly**

Run dev server. Check:
- Border is faint cyan
- Background is near-black
- Logo placeholder has cyan border and text
- Text colors are correct

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/Footer.tsx
git commit -m "feat: redesign Footer with Observatory theme — cyan borders, Orbitron logo"
```

---

### Task 6: Update Landing Page (page.tsx)

**Files:**
- Modify: `frontend/src/app/page.tsx`

Update the landing page to match Observatory theme — new text colors, glow effects, gradient button.

- [ ] **Step 1: Replace page.tsx**

```tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <section className="relative flex min-h-[calc(100vh-140px)] items-center justify-center overflow-hidden">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <div className="space-y-6">
          <h1
            className="font-display text-[64px] font-bold leading-[0.9] tracking-[-0.03em] md:text-[88px] lg:text-[110px]"
            style={{ fontFamily: "Orbitron, sans-serif" }}
          >
            <span style={{ color: "var(--obs-text-main)" }}>Hello,</span>
            <br />
            <span style={{ color: "var(--obs-text-main)" }}>Welcome to</span>
            <br />
            <span
              className="text-gradient drop-shadow-[0_0_25px_rgba(0,229,255,0.25)]"
              style={{
                textShadow: "0 0 30px rgba(0, 229, 255, 0.3)",
              }}
            >
              iloveTree
            </span>
          </h1>
          <p
            className="mx-auto max-w-xl text-base leading-8 md:text-lg"
            style={{ color: "#6b8fa3" }}
          >
            Explore and visualize DOM trees using BFS and DFS traversal
            with CSS selectors in a cinematic sci-fi interface.
          </p>

          <div className="pt-4">
            <Link
              href="/explorer"
              className="btn-primary animate-shimmer inline-flex items-center rounded-xl px-6 py-3 text-lg font-semibold"
            >
              Open Explorer
            </Link>
          </div>
        </div>
      </div>

      {/* Subtle background glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle_at_center, rgba(0, 229, 255, 0.08), transparent 60%)",
        }}
      />
    </section>
  );
}
```

- [ ] **Step 2: Verify landing page**

Run dev server, visit `/`. Check:
- "iloveTree" has cyan gradient + glow
- Description text is muted cyan
- Button has gradient + shimmer effect
- Background radial glow is present

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/page.tsx
git commit -m "feat: redesign landing page with Observatory theme — cyan glows, gradient button"
```

---

### Task 7: Update Explorer Page — Sidebar Styling

**Files:**
- Modify: `frontend/src/app/explorer/page.tsx`

Update the sidebar (left panel) visual styles. This is a **targeted edit** — only change className strings and inline styles, NOT logic or structure.

Key areas to update in the sidebar JSX:

- **Sidebar container** (`<aside>`): 
  - Change bg to glassmorphism: `bg-background/80` → custom style with `rgba(6,12,22,0.8)` + backdrop-blur
  - Border-right: `border-border` → `border-[rgba(0,229,255,0.08)]`

- **Section headers** ("Source", "Traversal", "Result"):
  - Add underline bar pseudo-element or border-bottom
  - Color: text-muted-foreground → `#00e5ff`
  - Font: add `font-heading` class

- **Toggle buttons** (URL/HTML, ALL/TOP_N):
  - Inactive: `border-border bg-card/40 text-muted-foreground` → `border-[rgba(0,229,255,0.15)] bg-[rgba(0,229,255,0.04)] text-[#6b8fa3]`
  - Hover: add `hover:border-[rgba(0,229,255,0.4)] hover:bg-[rgba(0,229,255,0.08)] hover:text-[#00e5ff]`
  - Active: `border-primary bg-primary/15 text-primary shadow-[...]` → `border-[rgba(0,229,255,0.7)] bg-[rgba(0,229,255,0.12)] text-[#00e5ff] shadow-[0_0_20px_rgba(0,229,255,0.15)]`

- **Inputs** (URL input, textarea, selector input, limit input):
  - Replace all input/textarea classes with `input-obs` class from globals.css
  - OR manually set: border `rgba(0,229,255,0.12)`, bg `rgba(0,229,255,0.03)`, text `#e0f7ff`, focus border `rgba(0,229,255,0.6)` + shadow

- **Parse HTML button**:
  - Replace with `btn-primary` class + `animate-shimmer`
  - Remove old conditional className string

- **Run Traversal button**:
  - Same `btn-primary` styling
  - Keep disabled state logic

- **Error messages**:
  - `text-red-400` → `text-[#ff6b6b]` (keep visible on dark)

- [ ] **Step 1: Apply sidebar style changes**

Use Edit tool on `frontend/src/app/explorer/page.tsx`. Make these targeted replacements:

1. Sidebar `<aside>` opening tag:
```
<aside className="flex h-full flex-col border-r border-border bg-background/80">
```
→
```
<aside
  className="flex h-full flex-col border-r"
  style={{
    background: "rgba(6, 12, 22, 0.8)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderRightColor: "rgba(0, 229, 255, 0.08)",
  }}
>
```

2. Section headers (all 3):
Replace each `<p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">`
with:
```
<div className="mb-4 flex items-center gap-2">
  <span
    className="text-xs font-semibold uppercase tracking-[0.2em]"
    style={{
      fontFamily: "Exo 2, sans-serif",
      color: "#00e5ff",
    }}
  >
    {text}
  </span>
  <span
    className="h-[2px] w-6 rounded-full"
    style={{
      background: "rgba(0, 229, 255, 0.5)",
      boxShadow: "0 0 6px rgba(0, 229, 255, 0.3)",
    }}
  />
</div>
```

3. Toggle buttons — replace className logic for inactive/active states:
Inactive:
```
border-[rgba(0,229,255,0.15)] bg-[rgba(0,229,255,0.04)] text-[#6b8fa3] hover:border-[rgba(0,229,255,0.4)] hover:bg-[rgba(0,229,255,0.08)] hover:text-[#00e5ff]
```
Active:
```
border-[rgba(0,229,255,0.7)] bg-[rgba(0,229,255,0.12)] text-[#00e5ff] shadow-[0_0_20px_rgba(0,229,255,0.15)]
```

4. All `<input>` and `<textarea>` elements:
Add className `input-obs` (from globals.css) and remove old Tailwind classes.

5. Parse HTML button:
Replace className with `btn-primary animate-shimmer mt-4 w-full rounded-2xl px-4 py-4 text-lg font-semibold`
Remove conditional bg classes — handle disabled via `:disabled` in CSS.

6. Run Traversal button:
Same `btn-primary` class approach.

- [ ] **Step 2: Verify sidebar visually**

Run dev server, visit `/explorer`. Check:
- Sidebar has glassmorphism blur
- Section headers have cyan color + underline bar
- Toggle buttons glow when active
- Inputs have cyan focus glow
- Parse button has gradient + shimmer

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/explorer/page.tsx
git commit -m "feat: redesign explorer sidebar with Observatory theme — glassmorphism, cyan glows, shimmer button"
```

---

### Task 8: Update Explorer Page — Top Bar (Algorithm, Controls, Stats)

**Files:**
- Modify: `frontend/src/app/explorer/page.tsx`

Update the top bar area containing algorithm toggle, animation controls, and stats. Targeted edits only.

- **Algorithm toggle container**:
  - `border-border bg-card/40` → `border-[rgba(0,229,255,0.15)] bg-[rgba(0,229,255,0.04)]`

- **Algorithm buttons** (BFS/DFS):
  - Active: `bg-primary text-primary-foreground` → `bg-[#00e5ff] text-[#030508] font-bold`
  - Inactive: `text-muted-foreground hover:bg-primary/5 hover:text-primary` → `text-[#6b8fa3] hover:bg-[rgba(0,229,255,0.08)] hover:text-[#00e5ff]`

- **Animation controls container**:
  - Same border/bg as algorithm toggle

- **Reset/Play/Pause buttons**:
  - Reset: `text-muted-foreground hover:bg-primary/5 hover:text-primary` → `text-[#6b8fa3] hover:text-[#00e5ff]`
  - Play/Pause: `bg-primary/20 text-primary` → `bg-[rgba(0,229,255,0.15)] text-[#00e5ff] hover:bg-[rgba(0,229,255,0.25)]`

- **Speed slider**:
  - `accent-primary` stays (Tailwind accent uses CSS var --primary which maps to cyan)
  - Value text: `text-muted-foreground` → `text-[#00e5ff] font-mono`

- **Stats bar** (right side):
  - Numbers: `<strong>` with `text-[#00e5ff]` and `font-mono`
  - Labels: `text-muted-foreground` → `text-[#6b8fa3] uppercase text-[11px] tracking-[0.1em]`
  - Execution time: `text-muted-foreground` → `text-[#ff9e00] font-mono` (amber)

- [ ] **Step 1: Apply top bar style changes**

Use Edit tool on `frontend/src/app/explorer/page.tsx` for targeted replacements.

1. Algorithm toggle container:
```
className="flex items-center gap-2 rounded-xl border border-border bg-card/40 p-1"
```
→
```
className="flex items-center gap-2 rounded-xl border p-1"
style={{ borderColor: "rgba(0, 229, 255, 0.15)", background: "rgba(0, 229, 255, 0.04)" }}
```

2. Active algorithm button:
```
bg-primary text-primary-foreground
```
→
```
bg-[#00e5ff] text-[#030508] font-bold
```

3. Inactive algorithm button:
```
text-muted-foreground hover:bg-primary/5 hover:text-primary
```
→
```
text-[#6b8fa3] hover:bg-[rgba(0,229,255,0.08)] hover:text-[#00e5ff]
```

4. Animation controls container:
Same as algorithm toggle container styling.

5. Reset button:
```
text-muted-foreground transition hover:bg-primary/5 hover:text-primary
```
→
```
text-[#6b8fa3] transition hover:text-[#00e5ff]
```

6. Play/Pause button:
```
rounded-md bg-primary/20 px-3 py-1 text-primary transition hover:bg-primary/30
```
→
```
rounded-md px-3 py-1 transition hover:bg-[rgba(0,229,255,0.25)]
style={{ background: "rgba(0, 229, 255, 0.15)", color: "#00e5ff" }}
```

7. Speed value:
```
<span className="text-sm text-muted-foreground">{speed}ms</span>
```
→
```
<span className="font-mono text-sm" style={{ color: "#00e5ff" }}>{speed}ms</span>
```

8. Stats numbers (all `<strong>` elements in stats bar):
Wrap or style each `<strong>` with `style={{ color: "#00e5ff", fontFamily: "JetBrains Mono, monospace" }}`

9. Stats labels (adjacent spans):
Replace `text-muted-foreground` with `text-[#6b8fa3] text-[11px] uppercase tracking-[0.1em]`

10. Execution time span:
```
<span className="text-muted-foreground">2.8 ms</span>
```
→
```
<span className="font-mono" style={{ color: "#ff9e00" }}>2.8 ms</span>
```

- [ ] **Step 2: Verify top bar visually**

Run dev server. Check:
- Algorithm toggle has cyan active state
- Play/pause button glows
- Stats numbers are cyan monospace
- Execution time is amber
- Speed value is cyan monospace

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/explorer/page.tsx
git commit -m "feat: redesign explorer top bar with Observatory theme — cyan stats, glowing controls"
```

---

### Task 9: Update Explorer Page — Tree Visualizer (NodePill, TreeCanvas, Starfield)

**Files:**
- Modify: `frontend/src/app/explorer/page.tsx`

Update the tree visualizer area: background, grid, starfield, node pills, edges, depth guides, zoom controls, legend. This is the most visually impactful change.

- **Tree container background**:
  - `bg-background/40` → `bg-[rgba(3,5,8,0.4)]`
  - Add radial glow div inside

- **Grid background**:
  - Already has `grid-bg` class — globals.css updated it to cyan

- **Starfield integration**:
  - Import Starfield component
  - Place `<Starfield className="z-0" />` inside tree container div (absolute, behind tree)

- **Zoom controls**:
  - `border-border bg-card/50` → glassmorphism with cyan border
  - Buttons: `hover:text-primary` → `hover:text-[#00e5ff]`

- **Legend**:
  - Same glassmorphism styling
  - Dots should use new state colors:
    - default: `#4b5563` (keep muted)
    - visited: `#00ffc8` (teal)
    - current: `#ffd700` (gold)
    - match: `#ff9e00` (amber)

- **Tree canvas container**:
  - `border-emerald-100/8 bg-[#071017]/30` → `border-[rgba(0,229,255,0.08)] bg-[rgba(3,5,8,0.3)]`

- **Depth guide lines** (SVG `<line>`):
  - `stroke="rgba(165, 214, 196, 0.13)"` → `stroke="rgba(0, 229, 255, 0.08)"`
  - `strokeDasharray="6 10"` → `strokeDasharray="4 8"`

- **Depth guide labels** (SVG `<text>`):
  - `fill="rgba(190, 225, 210, 0.52)"` → `fill="rgba(0, 229, 255, 0.35)"`
  - `fontSize={10}` stays

- **Edges (SVG `<path>`)**:
  - Default stroke: `rgba(87, 229, 171, 0.62)` → `rgba(0, 229, 255, 0.35)`
  - Active stroke: `hsl(var(--primary))` → `#00e5ff`
  - Default strokeWidth: 2 → 1.8
  - Active strokeWidth: 2.8 → 2.5
  - Active dropShadow: keep but change to cyan

- **NodePill component**:
  - Complete color overhaul per state:
    - match: border `rgba(255,158,0,0.9)`, bg `rgba(255,158,0,0.15)`, text `#e0f7ff`, glow `0 0 24px rgba(255,158,0,0.5)`
    - current: border `rgba(255,215,0,0.7)`, bg `rgba(255,215,0,0.12)`, text `#ffd700`, glow pulse animation
    - visited: border `rgba(0,255,200,0.5)`, bg `rgba(0,255,200,0.08)`, text `#00ffc8`, glow `0 0 12px rgba(0,255,200,0.25)`
    - default: border `rgba(0,229,255,0.25)`, bg `rgba(10,20,35,0.88)`, text `#e0f7ff`, hover border `rgba(0,229,255,0.5)`
  - Selected ring: `ring-2 ring-primary/80` → `ring-2 ring-[#00e5ff]` with glow
  - Font: ensure `font-mono` (JetBrains Mono)

- [ ] **Step 1: Apply tree visualizer style changes**

Use Edit tool on `frontend/src/app/explorer/page.tsx`. Key replacements:

1. Tree area container div (the one with `grid-bg`):
Add radial glow as sibling before grid-bg:
```
<div className="radial-glow pointer-events-none absolute inset-0" />
```
And add Starfield:
```
<Starfield className="z-0" />
```

2. Zoom controls container:
```
className="absolute right-6 top-6 z-20 flex items-center gap-4 rounded-xl border border-border bg-card/50 px-5 py-3 text-sm text-muted-foreground backdrop-blur-sm"
```
→
```
className="absolute right-6 top-6 z-20 flex items-center gap-4 rounded-xl px-5 py-3 text-sm backdrop-blur-sm"
style={{
  border: "1px solid rgba(0, 229, 255, 0.12)",
  background: "rgba(6, 12, 22, 0.6)",
  color: "#6b8fa3",
}}
```

3. Zoom buttons: `hover:text-primary` → `hover:text-[#00e5ff]`

4. Legend container:
Same glassmorphism styling as zoom controls.

5. Legend dots:
```
bg-muted-foreground/70
```
→
```
style={{ background: "#4b5563" }}
```

```
bg-green-300/40
```
→
```
style={{ background: "#00ffc8" }}
```

```
bg-yellow-400
```
→
```
style={{ background: "#ffd700" }}
```

```
bg-primary
```
→
```
style={{ background: "#ff9e00" }}
```

6. Tree canvas inner container:
```
className="relative rounded-2xl border border-emerald-100/8 bg-[#071017]/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
```
→
```
className="relative rounded-2xl border shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
style={{
  borderColor: "rgba(0, 229, 255, 0.08)",
  background: "rgba(3, 5, 8, 0.3)",
}}
```

7. Depth guide line:
```
stroke="rgba(165, 214, 196, 0.13)" strokeDasharray="6 10"
```
→
```
stroke="rgba(0, 229, 255, 0.08)" strokeDasharray="4 8"
```

8. Depth guide text:
```
fill="rgba(190, 225, 210, 0.52)"
```
→
```
fill="rgba(0, 229, 255, 0.35)"
```

9. Edges default:
```
stroke={isActive ? "hsl(var(--primary))" : "rgba(87, 229, 171, 0.62)"}
```
→
```
stroke={isActive ? "#00e5ff" : "rgba(0, 229, 255, 0.35)"}
```

10. Edges strokeWidth:
```
strokeWidth={isActive ? 2.8 : 2}
```
→
```
strokeWidth={isActive ? 2.5 : 1.8}
```

11. Edges active class:
```
className={isActive ? "drop-shadow-[0_0_10px_hsl(var(--primary)/0.58)]" : ""}
```
→
```
className={isActive ? "animate-edge-pulse" : ""}
style={isActive ? { filter: "drop-shadow(0 0 8px rgba(0, 229, 255, 0.5))" } : {}}
```

12. NodePill stateClass overhaul:
Replace the entire `stateClass` ternary in NodePill:
```
const stateClass =
  state === "match"
    ? "border-[rgba(255,158,0,0.9)] bg-[rgba(255,158,0,0.15)] text-[#e0f7ff] shadow-[0_0_24px_rgba(255,158,0,0.5)]"
    : state === "current"
    ? "border-[rgba(255,215,0,0.7)] bg-[rgba(255,215,0,0.12)] text-[#ffd700] animate-node-pulse"
    : state === "visited"
    ? "border-[rgba(0,255,200,0.5)] bg-[rgba(0,255,200,0.08)] text-[#00ffc8] shadow-[0_0_12px_rgba(0,255,200,0.25)]"
    : "border-[rgba(0,229,255,0.25)] bg-[rgba(10,20,35,0.88)] text-[#e0f7ff] hover:border-[rgba(0,229,255,0.5)] hover:bg-[rgba(0,229,255,0.06)]";
```

13. NodePill selected ring:
```
ring-2 ring-primary/80 ring-offset-1 ring-offset-[#08101b]
```
→
```
ring-2 ring-[#00e5ff] ring-offset-1
style={{ boxShadow: selected ? "0 0 16px rgba(0, 229, 255, 0.4)" : undefined }}
```

14. Add Starfield import at top of file:
```tsx
import Starfield from "@/components/Starfield";
```

- [ ] **Step 2: Verify tree visualizer visually**

Run dev server. Check:
- Starfield appears behind tree
- Radial glow visible
- Grid is faint cyan
- Node pills glow per state (amber=match, gold=current, teal=visited)
- Edges are cyan, active edges pulse
- Depth guides are faint cyan dashes
- Zoom controls have glassmorphism
- Legend colors match new palette

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/explorer/page.tsx
git commit -m "feat: redesign tree visualizer with Observatory theme — starfield, neon nodes, cyan edges"
```

---

### Task 10: Update Explorer Page — Bottom Panel (Logs + Inspector)

**Files:**
- Modify: `frontend/src/app/explorer/page.tsx`

Update the bottom panel: container, tab bar, log table, inspector cards.

- **Bottom panel container**:
  - `bg-[#111317]` → `bg-[rgba(6,12,22,0.9)]`
  - `border-t border-white/5` → `border-t border-[rgba(0,229,255,0.06)]`

- **Tab bar**:
  - `bg-[#181b20]` → `bg-[rgba(10,18,32,0.95)]`
  - `border-b border-white/5` → `border-b border-[rgba(0,229,255,0.06)]`

- **Tab buttons inactive**:
  - `text-[#8b949e]` → `text-[#6b8fa3]`
  - Hover: `hover:border-white/10 hover:bg-white/5 hover:text-[#d7e2f0]` → `hover:border-[rgba(0,229,255,0.1)] hover:bg-[rgba(0,229,255,0.04)] hover:text-[#e0f7ff]`

- **Tab buttons active (Logs)**:
  - `border-emerald-400/40 bg-emerald-500/10 text-emerald-200` → `border-[rgba(0,255,200,0.3)] bg-[rgba(0,255,200,0.06)] text-[#00ffc8]`

- **Tab buttons active (Inspector)**:
  - `border-cyan-400/40 bg-cyan-500/10 text-cyan-200` → `border-[rgba(0,229,255,0.3)] bg-[rgba(0,229,255,0.06)] text-[#00e5ff]`

- **Tab meta info** (right side):
  - `text-[#8b949e]` → `text-[#6b8fa3]`
  - Badge: `text-[#c9d1d9]` → `text-[#e0f7ff]`

- **Log viewport**:
  - `bg-[#0d1117]` → `bg-[#020408]`

- **Log table header**:
  - `bg-[#0b0f14]` → `bg-[rgba(0,229,255,0.06)]`
  - `text-[#8b949e]` → `text-[rgba(0,229,255,0.5)]`

- **Log table rows**:
  - Match: `text-emerald-300` → `text-[#ff9e00]` (amber)
  - Current: `text-yellow-200` → `text-[#ffd700]` (gold)
  - Visited: `text-[#d7e2f0]` → `text-[#00ffc8]` (teal)
  - Default: `text-[#8b949e]` → `text-[#6b8fa3]`
  - Action badge colors match above

- **Waiting indicator**:
  - `bg-emerald-400` → `bg-[#00e5ff]`

- **Inspector cards**:
  - `border-white/5 bg-white/[0.03]` → `border-[rgba(0,229,255,0.08)] bg-[rgba(0,229,255,0.02)]`
  - Header: `text-[#8b949e]` → `text-[#6b8fa3]`
  - Labels: `text-[#6e7681]` → `text-[#4a5d6b]`
  - Values: `text-white` → `text-[#e0f7ff]`
  - Inner cards: `bg-[#0b0f14]` stays (dark enough)
  - JSON pre: `bg-[#0b0f14] border-white/5` → `bg-[rgba(0,0,0,0.4)] border-[rgba(0,229,255,0.06)]`

- **Empty states**:
  - `text-[#8b949e]` → `text-[#6b8fa3]`
  - `border-white/10` → `border-[rgba(0,229,255,0.08)]`

- [ ] **Step 1: Apply bottom panel style changes**

Use Edit tool on `frontend/src/app/explorer/page.tsx` for targeted replacements:

1. Bottom panel container:
```
className="flex min-h-0 flex-col overflow-hidden border-t border-white/5 bg-[#111317]"
```
→
```
className="flex min-h-0 flex-col overflow-hidden border-t"
style={{
  borderTopColor: "rgba(0, 229, 255, 0.06)",
  background: "rgba(6, 12, 22, 0.9)",
}}
```

2. Tab bar:
```
className="flex items-center gap-2 border-b border-white/5 bg-[#181b20] px-4 py-3"
```
→
```
className="flex items-center gap-2 border-b px-4 py-3"
style={{
  borderBottomColor: "rgba(0, 229, 255, 0.06)",
  background: "rgba(10, 18, 32, 0.95)",
}}
```

3. Inactive tab:
```
border-transparent text-[#8b949e] hover:border-white/10 hover:bg-white/5 hover:text-[#d7e2f0]
```
→
```
border-transparent text-[#6b8fa3] hover:border-[rgba(0,229,255,0.1)] hover:bg-[rgba(0,229,255,0.04)] hover:text-[#e0f7ff]
```

4. Active Logs tab:
```
border-emerald-400/40 bg-emerald-500/10 text-emerald-200
```
→
```
border-[rgba(0,255,200,0.3)] bg-[rgba(0,255,200,0.06)] text-[#00ffc8]
```

5. Active Inspector tab:
```
border-cyan-400/40 bg-cyan-500/10 text-cyan-200
```
→
```
border-[rgba(0,229,255,0.3)] bg-[rgba(0,229,255,0.06)] text-[#00e5ff]
```

6. Log viewport:
```
className="min-h-0 flex-1 overflow-auto bg-[#0d1117] px-4 py-4 font-mono text-sm"
```
→
```
className="min-h-0 flex-1 overflow-auto px-4 py-4 font-mono text-sm"
style={{ background: "#020408" }}
```

7. Log table header:
```
className="flex items-center justify-between border-b border-white/5 bg-[#0b0f14] px-4 py-3 text-xs uppercase tracking-[0.2em] text-[#8b949e]"
```
→
```
className="flex items-center justify-between border-b px-4 py-3 text-xs uppercase tracking-[0.2em]"
style={{
  borderBottomColor: "rgba(0, 229, 255, 0.06)",
  background: "rgba(0, 229, 255, 0.06)",
  color: "rgba(0, 229, 255, 0.5)",
}}
```

8. Log row tone colors:
Replace all instances:
- `text-emerald-300` → `text-[#ff9e00]`
- `text-yellow-200` → `text-[#ffd700]`
- `text-[#d7e2f0]` → `text-[#00ffc8]` (for visited)
- `text-[#8b949e]` → `text-[#6b8fa3]` (for default)

9. Action badge colors:
- Match: `text-emerald-300` → `text-[#ff9e00]`
- Current: `text-yellow-200` → `text-[#ffd700]`
- Visit: `text-[#8b949e]` → `text-[#6b8fa3]`

10. Waiting indicator dot:
```
bg-emerald-400
```
→
```
style={{ background: "#00e5ff" }}
```

11. Inspector cards:
```
border-white/5 bg-white/[0.03]
```
→
```
style={{ borderColor: "rgba(0, 229, 255, 0.08)", background: "rgba(0, 229, 255, 0.02)" }}
```

12. Inspector inner cards:
Keep `bg-[#0b0f14]` — dark enough.

13. Inspector labels:
```
text-[#6e7681]
```
→
```
style={{ color: "#4a5d6b" }}
```

14. Inspector values:
```
text-white
```
→
```
style={{ color: "#e0f7ff" }}
```

15. JSON pre:
```
bg-[#0b0f14] border-white/5
```
→
```
style={{ background: "rgba(0, 0, 0, 0.4)", borderColor: "rgba(0, 229, 255, 0.06)" }}
```

16. Empty state borders:
```
border-white/10
```
→
```
style={{ borderColor: "rgba(0, 229, 255, 0.08)" }}
```

17. Empty state text:
```
text-[#8b949e]
```
→
```
style={{ color: "#6b8fa3" }}
```

- [ ] **Step 2: Verify bottom panel visually**

Run dev server. Check:
- Tab bar has dark background
- Active tabs have correct glow colors
- Logs table has correct state colors (amber=match, gold=current, teal=visited)
- Inspector cards have subtle cyan borders
- Empty states look correct

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/explorer/page.tsx
git commit -m "feat: redesign bottom panel with Observatory theme — cyan logs, glassmorphism inspector"
```

---

### Task 11: Final Build Verification

**Files:**
- All modified files

- [ ] **Step 1: Run production build**

```bash
cd frontend && bun run build
```

Expected: Build succeeds with 0 errors.

- [ ] **Step 2: Run dev server for visual QA**

```bash
cd frontend && bun run dev
```

Open `http://localhost:3000` and verify:
- Landing page: brand glows, button shimmers
- Explorer sidebar: glassmorphism, cyan accents, shimmer on Parse button
- Top bar: algorithm toggle glows, stats are cyan monospace, execution time amber
- Tree visualizer: starfield visible, nodes glow (amber=match, gold=current, teal=visited), edges are cyan
- Bottom panel: logs have correct colors, inspector has glassmorphism cards
- All functionality preserved: parse, traverse, animation, zoom, inspector, tab switching

- [ ] **Step 3: Commit any final fixes**

If any tweaks needed, commit them. Otherwise final commit:

```bash
git add .
git commit -m "feat: complete Observatory theme overhaul — cinematic sci-fi DOM explorer"
```

---

## Color Reference (for all tasks)

```
--obs-base: #030508
--obs-panel: rgba(6, 12, 22, 0.72)
--obs-primary: #00e5ff
--obs-primary-dim: rgba(0, 229, 255, 0.15)
--obs-accent: #ff9e00
--obs-visited: #00ffc8
--obs-current: #ffd700
--obs-text-main: #e0f7ff
--obs-text-muted: #6b8fa3
--obs-border: rgba(0, 229, 255, 0.12)
--obs-border-glow: rgba(0, 229, 255, 0.35)
```

---
