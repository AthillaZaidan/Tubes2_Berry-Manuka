# Frontend Design Spec — The Observatory

**Project:** Tubes2 Berry-Manuka — DOM Tree Explorer  
**Date:** 2026-04-21  
**Designer Direction:** Sci-fi cinematic "Observatory" aesthetic  
**Scope:** Visual-only overhaul. No structural/layout changes. No API changes.

---

## 1. Design Philosophy

Transform the existing dark-mode DOM explorer into a **cinematic sci-fi interface** that feels like analyzing a digital artifact in a deep-space observatory. The design must feel **luxurious and distinctive** without sacrificing the functional layout already built.

**Key principles:**
- Atmosphere through layered backgrounds (starfield, glow, grid)
- Neon edge glows on interactive elements (cyan primary, amber accent)
- Digital/monospace typography for data, geometric display font for headings
- Smooth, purposeful micro-interactions
- Glassmorphism panels with depth

---

## 2. Color Palette

### Core Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--obs-base` | `#030508` | Deepest background (near-black with blue tint) |
| `--obs-panel` | `rgba(6, 12, 22, 0.72)` | Glass panel background |
| `--obs-primary` | `#00e5ff` | Electric cyan — primary accent, borders, glows |
| `--obs-primary-dim` | `rgba(0, 229, 255, 0.15)` | Subtle cyan tint |
| `--obs-accent` | `#ff9e00` | Amber — match highlights, important stats |
| `--obs-visited` | `#00ffc8` | Teal-green — visited nodes (brighter than current) |
| `--obs-current` | `#ffd700` | Gold — current animated node |
| `--obs-text-main` | `#e0f7ff` | Main readable text (soft cyan-white) |
| `--obs-text-muted` | `#6b8fa3` | Muted labels, secondary text |
| `--obs-border` | `rgba(0, 229, 255, 0.12)` | Subtle cyan borders |
| `--obs-border-glow` | `rgba(0, 229, 255, 0.35)` | Glowing borders on hover/active |

### Node State Colors
| State | Background | Border | Glow |
|-------|-----------|--------|------|
| Default | `rgba(10, 20, 35, 0.88)` | `rgba(0, 229, 255, 0.25)` | none |
| Visited | `rgba(0, 255, 200, 0.08)` | `rgba(0, 255, 200, 0.5)` | `0 0 12px rgba(0,255,200,0.25)` |
| Current | `rgba(255, 215, 0, 0.12)` | `rgba(255, 215, 0, 0.7)` | `0 0 20px rgba(255,215,0,0.45)` + pulse |
| Match | `rgba(255, 158, 0, 0.15)` | `rgba(255, 158, 0, 0.8)` | `0 0 24px rgba(255,158,0,0.5)` |
| Selected | `rgba(0, 229, 255, 0.1)` | `rgba(0, 229, 255, 0.9)` | `0 0 16px rgba(0,229,255,0.4)` |

---

## 3. Typography

| Role | Font | Weight | Size | Notes |
|------|------|--------|------|-------|
| Display / Brand | `"Orbitron", sans-serif` | 700 | 22-28px | Sci-fi geometric display font |
| Section Headers | `"Exo 2", sans-serif` | 600 | 12-14px | Uppercase, letter-spacing 0.2em |
| Body | `"Space Grotesk", sans-serif` | 400-500 | 13-14px | Refined, already in use |
| Data / Stats | `"JetBrains Mono", monospace` | 500 | 13px | Numbers, node IDs, logs |
| Node Pills | `"JetBrains Mono", monospace` | 600 | 11px | Tag names in tree |

**Google Fonts to load:**
```
Orbitron: 400, 500, 600, 700
Exo 2: 400, 500, 600, 700
Space Grotesk: 400, 500, 600, 700
JetBrains Mono: 400, 500, 600
```

---

## 4. Global Background & Atmosphere

### 4.1 Starfield Canvas (Tree Area Only)
- **Where:** Behind the tree visualizer canvas, NOT behind sidebar or bottom panel
- **Implementation:** `<canvas>` element with 150-250 small white dots (stars)
- **Behavior:** Static (no animation to save performance), subtle parallax on mouse move (optional)
- **Opacity:** 60-70% so tree nodes remain readable

### 4.2 Radial Glow
- Soft radial gradient from center of tree area: `radial-gradient(circle at 50% 40%, rgba(0, 229, 255, 0.04), transparent 60%)`
- Creates a subtle "light source" feel

### 4.3 Grid Background
- Keep existing grid pattern but change color to faint cyan: `rgba(0, 229, 255, 0.04)`
- Mask stays the same (radial fade)

---

## 5. Component Styling

### 5.1 Navbar
- **Background:** `rgba(3, 5, 8, 0.85)` with `backdrop-filter: blur(16px)`
- **Border-bottom:** `1px solid rgba(0, 229, 255, 0.1)`
- **Brand text:** `"Orbitron"` font, weight 700
  - "ilove" in `--obs-text-main`
  - "Tree" in `--obs-primary` with `text-shadow: 0 0 16px rgba(0, 229, 255, 0.4)`
- **Nav links:** `"Exo 2"` font, weight 500, uppercase feel
  - Inactive: `--obs-text-muted`
  - Hover: `--obs-primary` with `text-shadow: 0 0 12px rgba(0, 229, 255, 0.5)`
  - Active: `--obs-primary` with underline glow (pseudo-element)

### 5.2 Sidebar (Input Panel)
- **Background:** `rgba(6, 12, 22, 0.8)` with `backdrop-filter: blur(12px)`
- **Border-right:** `1px solid rgba(0, 229, 255, 0.08)`
- **Section headers:** `"Exo 2"`, uppercase, letter-spacing `0.2em`, color `--obs-primary`, with a thin underline bar (2px height, 24px width, cyan)
- **Toggle buttons (URL/HTML, ALL/TOP_N):**
  - Inactive: `border: 1px solid rgba(0, 229, 255, 0.15)`, bg `rgba(0, 229, 255, 0.04)`
  - Hover: `border-color: rgba(0, 229, 255, 0.4)`, bg `rgba(0, 229, 255, 0.08)`
  - Active: `border-color: rgba(0, 229, 255, 0.7)`, bg `rgba(0, 229, 255, 0.12)`, `box-shadow: 0 0 20px rgba(0, 229, 255, 0.15)`
- **Inputs (text/textarea):**
  - Border: `1px solid rgba(0, 229, 255, 0.12)`
  - Background: `rgba(0, 229, 255, 0.03)`
  - Focus: `border-color: rgba(0, 229, 255, 0.6)`, `box-shadow: 0 0 12px rgba(0, 229, 255, 0.15)`
  - Text: `--obs-text-main`
  - Placeholder: `--obs-text-muted`
- **Parse HTML button:**
  - Background: linear-gradient(135deg, `rgba(0, 229, 255, 0.9)`, `rgba(0, 180, 220, 0.9)`)
  - Text: `#030508` (dark on bright cyan)
  - Border: none
  - Hover: `box-shadow: 0 0 30px rgba(0, 229, 255, 0.35)`, `transform: scale(1.02)`
  - Active/pressed: `transform: scale(0.98)`
- **Run Traversal button:**
  - Same as Parse button but with amber gradient when traversing
  - Idle: cyan gradient
  - Disabled: `opacity: 0.4`, no glow

### 5.3 Algorithm Toggle (Top Bar)
- **Container:** rounded-xl, border `rgba(0, 229, 255, 0.15)`, bg `rgba(0, 229, 255, 0.04)`
- **Active button:** bg `--obs-primary`, text `#030508`, font-weight 700
- **Inactive button:** text `--obs-text-muted`, hover text `--obs-primary`
- **Transition:** `all 0.25s ease`

### 5.4 Animation Controls (Top Bar)
- **Play/Pause button:** bg `rgba(0, 229, 255, 0.15)`, text `--obs-primary`, rounded-md
  - Hover: bg `rgba(0, 229, 255, 0.25)`, glow
- **Reset button:** same but more subtle
- **Speed slider:**
  - Track: `rgba(0, 229, 255, 0.15)`
  - Thumb: `--obs-primary` with glow
  - Value text: `"JetBrains Mono"`, `--obs-primary`

### 5.5 Stats Bar (Top Right)
- **Font:** `"JetBrains Mono"`, weight 500
- **Numbers:** `--obs-primary` (cyan) for values, larger font size (15px)
- **Labels:** `--obs-text-muted`, smaller (11px), uppercase, letter-spacing `0.1em`
- **Execution time:** amber color `--obs-accent` with subtle glow

### 5.6 Tree Visualizer
- **Canvas container:** bg `rgba(3, 5, 8, 0.4)`, rounded-2xl
- **Depth guide lines:**
  - Color: `rgba(0, 229, 255, 0.08)`
  - Dash: `4 8`
  - Label text: `"JetBrains Mono"`, 10px, `rgba(0, 229, 255, 0.35)`
- **Edges (SVG paths):**
  - Default: `rgba(0, 229, 255, 0.35)`, stroke-width 1.8
  - Active (traversed): `rgba(0, 229, 255, 0.85)`, stroke-width 2.5, `drop-shadow: 0 0 8px rgba(0,229,255,0.5)`
- **Node pills:**
  - Default: bg `rgba(10, 20, 35, 0.88)`, border `rgba(0, 229, 255, 0.25)`, text `--obs-text-main`
  - Hover: border `rgba(0, 229, 255, 0.5)`, bg `rgba(0, 229, 255, 0.06)`, cursor pointer
  - **All state classes updated** per Color Palette section above
  - Font: `"JetBrains Mono"`, 11px, weight 600
  - Border-radius: 12px (slightly more rounded)
  - Padding: px-4 py-2
- **Zoom controls:**
  - Container: glassmorphism (blur + semi-transparent bg)
  - Border: `rgba(0, 229, 255, 0.12)`
  - Buttons: text `--obs-text-muted`, hover `--obs-primary`
- **Legend (bottom-left):**
  - Container: glassmorphism
  - Dots: colored per state, with subtle glow
  - Text: `"JetBrains Mono"`, 10px, `--obs-text-muted`

### 5.7 Bottom Panel (Logs + Inspector)
- **Container bg:** `rgba(6, 12, 22, 0.9)`
- **Tab bar bg:** `rgba(10, 18, 32, 0.95)`
- **Tab buttons:**
  - Inactive: text `--obs-text-muted`, border transparent
  - Active (Logs): text `rgba(0, 255, 200, 0.9)`, border `rgba(0, 255, 200, 0.3)`, bg `rgba(0, 255, 200, 0.06)`
  - Active (Inspector): text `rgba(0, 229, 255, 0.9)`, border `rgba(0, 229, 255, 0.3)`, bg `rgba(0, 229, 255, 0.06)`
- **Log viewport:** bg `#020408` (very dark)
- **Log table:**
  - Header: bg `rgba(0, 229, 255, 0.06)`, text `rgba(0, 229, 255, 0.5)`, uppercase tracking
  - Rows:
    - Match: text `rgba(255, 158, 0, 0.9)` (amber)
    - Current: text `rgba(255, 215, 0, 0.9)` (gold)
    - Visited: text `rgba(0, 255, 200, 0.7)` (teal)
    - Default: text `rgba(107, 143, 163, 0.6)` (muted)
  - Action badge: uppercase, `"JetBrains Mono"`, font-weight 600
  - Hover row: bg `rgba(255, 255, 255, 0.03)`
- **Inspector cards:**
  - Border: `1px solid rgba(0, 229, 255, 0.08)`
  - Bg: `rgba(0, 229, 255, 0.02)`
  - Label text: uppercase, `"JetBrains Mono"`, 10px, `--obs-text-muted`
  - Value text: `"JetBrains Mono"`, 14px, `--obs-text-main`
  - JSON pre: bg `rgba(0, 0, 0, 0.4)`, border `rgba(0, 229, 255, 0.06)`

### 5.8 Footer
- **Background:** `rgba(3, 5, 8, 0.9)`
- **Border-top:** `1px solid rgba(0, 229, 255, 0.08)`
- **Text:** `--obs-text-muted`
- **Logo placeholder:** rounded-full, border `rgba(0, 229, 255, 0.2)`, bg `rgba(0, 229, 255, 0.05)`, text `--obs-primary`

---

## 6. Animations & Micro-interactions

| Interaction | Effect | Duration | Easing |
|-------------|--------|----------|--------|
| Button hover | Scale 1.02, glow intensifies | 200ms | ease-out |
| Button active/press | Scale 0.98 | 100ms | ease-in |
| Node hover | Border brightens, subtle lift | 200ms | ease |
| Node state change (current) | Pulse glow (keyframes) | 800ms loop | ease-in-out |
| Edge activate | Stroke brightens + glow | 300ms | ease |
| Tab switch | Underline slide (if possible) or instant color change | 200ms | ease |
| Panel open/close | Fade + slight translateY | 250ms | ease-out |
| Input focus | Border glow fade-in | 200ms | ease |
| Parse button | Shimmer sweep on hover (pseudo-element gradient translate) | 1.5s loop | linear |
| Stats number update | Color flash (cyan → white → cyan) | 400ms | ease |

### Current Node Pulse Keyframes
```css
@keyframes nodePulse {
  0%, 100% { box-shadow: 0 0 12px rgba(255, 215, 0, 0.3); }
  50% { box-shadow: 0 0 28px rgba(255, 215, 0, 0.6); }
}
```

### Parse Button Shimmer
```css
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
/* pseudo-element with linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent) */
```

---

## 7. Files to Modify

### Modified Files (existing)
1. `frontend/src/app/globals.css` — Complete CSS variable overhaul, add keyframes, font imports
2. `frontend/src/app/layout.tsx` — Add Google Fonts import (`<link>` tags)
3. `frontend/src/app/explorer/page.tsx` — Update all Tailwind classes and inline styles to match new palette
4. `frontend/src/components/Navbar.tsx` — Update brand font, nav link styles
5. `frontend/src/components/Footer.tsx` — Update border, text colors

### New Files
1. `frontend/src/components/Starfield.tsx` — Canvas-based static starfield background

---

## 8. What Stays The Same (Intentionally)

To minimize risk and preserve functionality:

- **Layout grid:** `grid-cols-[380px_minmax(0,1fr)]` and `grid-rows-[82px_minmax(0,1fr)_280px]`
- **State management:** All useState, useEffect, useMemo hooks
- **Tree layout algorithm:** `computeTreeLayout` function
- **SVG edge rendering:** Path logic, bezier curves
- **Animation timing logic:** setTimeout, speed slider
- **Data flow:** parse → tree → logs → animationIndex
- **Component boundaries:** No new components except Starfield
- **Type definitions:** Keep as-is (inconsistency fix is a separate task)
- **API integration:** Out of scope — purely visual

---

## 9. Edge Cases & Constraints

- **Performance:** Starfield canvas must be static (no requestAnimationFrame). Use a single canvas behind tree, not full-page.
- **Accessibility:** Ensure contrast ratios remain WCAG AA. Cyan on near-black is generally good. Amber on dark is good. Avoid pure cyan on white.
- **Reduced motion:** Respect `prefers-reduced-motion` — disable pulse animations, shimmer, and transitions.
- **Mobile:** The current layout is desktop-first. These visual changes should not break mobile but full mobile optimization is out of scope.

---

## 10. Success Criteria

- [ ] The interface feels "sci-fi" and cinematic, not generic dark-mode
- [ ] All existing functionality works identically (parse, traverse, animation, zoom, inspector)
- [ ] Typography feels intentional and distinctive (Orbitron for brand, JetBrains Mono for data)
- [ ] Glow effects and micro-interactions add delight without distraction
- [ ] No console errors or visual glitches
- [ ] Build passes (`npm run build` or `bun run build`)
