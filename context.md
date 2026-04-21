# CONTEXT.md — Tubes2 Berry-Manuka

## Project Info

- **Course:** IF2211 Strategi Algoritma — Tugas Besar 2
- **Team:** Berry-Manuka
  - Agatha Tatianingseto (13524008)
  - Stefani Angeline Oroh (13524064)
  - Athilla Zaidan Zidna Fann (13524068)
- **Deadline:** 25 April 2026, 23:59 WIB
- **Repo:** `AthillaZaidan/Tubes2_Berry-Manuka` (GitHub)

## What It Does

Web app that:
1. Accepts HTML (URL scraping or manual input)
2. Parses HTML into a DOM Tree
3. Traverses the tree using BFS or DFS to find elements matching a CSS Selector
4. Visualizes the traversal interactively (D3.js tree, highlighted paths, animation)
5. Shows stats (time, nodes visited) and a traversal log
6. Bonus: multithreaded traversal, LCA Binary Lifting, Docker, animation

---

## Architecture

```
backend/          → Go (module: tubes2, Go 1.25)
  main.go         → HTTP server :8080, CORS, 3 routes
  handler/        → scrape.go, traverse.go, lca.go
  model/          → dom.go, selector.go, traversal.go
  selector/       → parser.go, matcher.go
  traversal/      → bfs.go, dfs.go, parallel.go
  parser/         → html_parser.go
  lca/            → binary_lifting.go
  scraper/        → scraper.go

frontend/         → Next.js 16.2.3, React 19, Tailwind CSS 4, Bun (NOT STARTED)

docs/             → LaTeX report (partially written)
  main.tex        → Document structure, ITB/STEI headers, title page
  dafpus.bib      → 17 references ready
  sections/       → 01-pendahuluan.tex (DONE), 02-06 (EMPTY)
  public/         → foto-kelompok.jpg, logo-itb.png, logo-stei.png
```

---

## Git Workflow

- Feature branches: `feat/<name>` from `develop`
- Merge to `develop` with `--no-ff`
- NEVER push directly to `main`
- Docs branch: `docs/laporan`
- Commit format: `feat: implement <thing>`, `fix:`, `chore:`, `docs:`, `test:`, `style:`

---

## Backend — COMPLETE (100%)

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/scrape` | Scrape HTML from URL or accept raw HTML, parse to DOM tree |
| POST | `/api/traverse` | BFS/DFS/Parallel traversal with CSS selector matching |
| POST | `/api/lca` | Find Lowest Common Ancestor of two nodes |

### Modules

**model/dom.go** — `DOMNode` struct (ID, Tag, Attributes, Children, ParentID, Depth, InnerText). Utilities: `CloneTreeWithoutParents`, `RebuildParentPointers`, `MaxDepth`.

**model/selector.go** — `SelectorType` (Tag/Class/ID/Universal), `CombinatorType` (No/Child/Descendant/AdjacentSibling/GeneralSibling), `SelectorSegment` (compound selectors), `SelectorChain`.

**model/traversal.go** — `LogEntry` (Step, NodeID, Tag, Action, Depth), `TraversalResult` (MatchedNodes, Log, VisitedCount, ExecutionMs, MaxDepth, Algorithm).

**parser/html_parser.go** — `ParseHTML(htmlStr)` using `golang.org/x/net/html` tokenizer. Handles void elements, self-closing tags, text nodes. Assigns incremental IDs.

**scraper/scraper.go** — `FetchHTML(rawURL)` with 15s timeout, 5MB limit, scheme/content-type validation.

**selector/parser.go** — `ParseSelector(input)` supports `.class`, `#id`, `tag`, `*`, combinators `>`, `+`, `~`, space.

**selector/matcher.go** — `MatchChain(node, chain)` right-to-left matching. Supports all four combinators via parent/sibling pointers.

**traversal/bfs.go** — Queue-based BFS with logging and limit (top-N).

**traversal/dfs.go** — Iterative stack-based DFS. Children pushed in reverse for left-first order. Supports limit.

**traversal/parallel.go** — `ParallelBFS` (per-level goroutine parallelism), `ParallelDFS` (per-subtree goroutine parallelism). Both use `sync.WaitGroup`, `sync.Mutex`, `sync/atomic`.

**lca/binary_lifting.go** — `LCAProcessor` with `maxLog=20`. O(N log N) preprocessing, O(log N) query. `GetPath(nodeID)` returns path to root.

### Tests

- `parser/html_parser_test.go` — 6 tests (simple, attributes, nested, self-closing, empty, complex)
- `scraper/scraper_test.go` — 7 tests with httptest
- `selector/parser_test.go` — 2 tests (basic/compound, invalid)
- `selector/matcher_test.go` — 2 tests (class/ID, combinator chain)
- `traversal/bfs_test.go` — 2 tests (order, limit)
- `traversal/dfs_test.go` — 2 tests (order, all-matches)
- `traversal/parallel_test.go` — 2 tests (parallel BFS/DFS)
- `traversal/testdata_test.go` — Shared test tree builder

### Dependencies

- `golang.org/x/net v0.39.0` (HTML tokenizer)

---

## Frontend — NOT STARTED (0%)

Current state: Default Next.js 16.2.3 scaffold. `page.tsx` is the boilerplate template.

### Needed

- `components/` — TreeVisualization (D3.js), ControlPanel, TraversalLog, StatsPanel, LCASelector, AnimationPlayer
- `lib/api.ts` — API client for backend endpoints
- `lib/types.ts` — TypeScript types mirroring backend models
- `lib/tree-utils.ts` — D3 hierarchy helpers
- `hooks/useTraversal.ts`, `hooks/useAnimation.ts`
- `app/page.tsx` — Main page layout
- Install: D3.js, shadcn/ui

---

## Docs (Laporan) — PARTIAL

| Section | Status |
|---------|--------|
| Cover page | Done |
| Table of contents | Auto-generated |
| Bab 1 — Pendahuluan | Done (Kisah, Latar Belakang, Deskripsi Tugas) |
| Bab 2 — Dasar Teori | **EMPTY — NEXT TO WRITE** |
| Bab 3 — Implementasi | Empty |
| Bab 4 — Eksperimen | Empty |
| Bab 5 — Penutup | Empty |
| Bab 6 — Lampiran | Empty |
| Daftar Pustaka | 17 references ready in dafpus.bib |

### Bab 2 Plan (agreed sections)

| Section | Content |
|---------|---------|
| 2.1 | Document Object Model (DOM) |
| 2.2 | HTML dan HTML Parsing |
| 2.3 | CSS Selector |
| 2.4 | Breadth-First Search (BFS) |
| 2.5 | Depth-First Search (DFS) |
| 2.6 | Perbandingan BFS dan DFS |
| 2.7 | Web Scraping |
| 2.8 | Lowest Common Ancestor dan Binary Lifting |
| 2.9 | Konkurensi dan Goroutine |
| 2.10 | Containerization dan Docker |

---

## Docker — NOT STARTED

No Dockerfile or docker-compose.yml. PRD includes templates.

---

## Bonus Features Status

| Feature | Points | Status |
|---------|--------|--------|
| Multithreading | 3 pts | **Done** (ParallelBFS + ParallelDFS) |
| LCA Binary Lifting | 3 pts | **Done** (full impl + tests) |
| Animasi Penelusuran | 6 pts | Not started (needs frontend) |
| Docker | 2 pts | Not started |
| Deploy Azure VM | 5 pts | Not started |
| Video YouTube | 4 pts | Not started |

---

## Environment Notes

- **Go is NOT installed** on the machine — only `gopls` exists in `~/go/bin/`
- Cannot run `go mod tidy`, `go test`, `go build` locally
- Bun is available for frontend
- User language: Indonesian (casual/slang)

## Conventions

- No comments in Go code unless necessary
- Error messages in Indonesian (Bahasa Indonesia)
- Laporan style reference: `/home/athilla/Documents/IF_ITB/Semester-4/Strategi-Algoritma/Tucil/Tucil2_13524061_13524068/docs/`
- Bonus features written naturally WITHOUT "(bonus)" labels in laporan

## Git Branches

**Local:** `develop` (current), `feat/html-parser`, `feat/http-server`, `feat/lca`, `feat/scraper`, `main`

**Remote:** `origin/main`, `origin/develop`, `origin/docs/laporan`, `origin/feat/bfs`, `origin/feat/dfs`, `origin/feat/html-parser`, `origin/feat/http-server`, `origin/feat/lca`, `origin/feat/matcher`, `origin/feat/multithread`, `origin/feat/scraper`, `origin/feat/selector`, `origin/frontend`
