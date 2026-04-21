# Backend Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement all remaining backend modules so the Go server can scrape HTML, parse DOM, traverse with BFS/DFS, and serve results via REST API.

**Architecture:** 3 feature branches from `develop`, each merged back via `--no-ff`. Phase 1 (html-parser + lca) are independent and can be parallelized. Phase 2 (http-server) depends on both.

**Tech Stack:** Go 1.25, `golang.org/x/net/html` for HTML tokenization, `net/http` for HTTP server, standard library only.

---

## File Structure

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `backend/parser/html_parser.go` | HTML string → DOMNode tree |
| Create | `backend/parser/html_parser_test.go` | Tests for parser |
| Create | `backend/lca/binary_lifting.go` | LCA preprocessing + query |
| Create | `backend/lca/binary_lifting_test.go` | Tests for LCA |
| Create | `backend/handler/scrape.go` | POST /api/scrape handler |
| Create | `backend/handler/traverse.go` | POST /api/traverse handler |
| Create | `backend/handler/lca.go` | POST /api/lca handler |
| Create | `backend/main.go` | HTTP server entry point |

---

## Phase 1 (Parallel — Independent)

### Task 1: feat/html-parser

**Branch:** `feat/html-parser` from `develop`

**Files:**
- Create: `backend/parser/html_parser.go`
- Create: `backend/parser/html_parser_test.go`

`ParseHTML(htmlStr string) (*model.DOMNode, error)` — tokenizes HTML using `golang.org/x/net/html`, walks tokens with a stack:
- `StartTagToken` → create node, push to stack, set as child of stack top
- `EndTagToken` → pop stack
- `SelfClosingTagToken` → create node, add as child, don't push
- `TextToken` → set as InnerText of current stack top (if non-whitespace)
- Assign incremental IDs, compute depth, set attributes map from token.Attr
- Return root node + totalNodes + maxDepth

Edge cases: self-closing tags (`br`, `img`, `input`, `hr`, `meta`, `link`), empty input, malformed HTML.

- [ ] Step 1: Create `feat/html-parser` branch from develop
- [ ] Step 2: Write `backend/parser/html_parser.go`
- [ ] Step 3: Write `backend/parser/html_parser_test.go`
- [ ] Step 4: Commit with `feat: implement HTML parser`
- [ ] Step 5: Merge `feat/html-parser` into `develop` with `--no-ff`

### Task 2: feat/lca

**Branch:** `feat/lca` from `develop`

**Files:**
- Create: `backend/lca/binary_lifting.go`
- Create: `backend/lca/binary_lifting_test.go`

`LCAProcessor` struct with `Up [][]int` and `Depth []int`. Methods:
- `NewLCAProcessor(root *model.DOMNode, totalNodes int) *LCAProcessor` — O(N log N) preprocessing
- `Query(u, v int) int` — O(log N) LCA query
- `GetPath(nodeID int) []int` — path from node to root (for pathA/pathB in API)

- [ ] Step 1: Create `feat/lca` branch from develop
- [ ] Step 2: Write `backend/lca/binary_lifting.go`
- [ ] Step 3: Write `backend/lca/binary_lifting_test.go`
- [ ] Step 4: Commit with `feat: implement LCA binary lifting`
- [ ] Step 5: Merge `feat/lca` into `develop` with `--no-ff`

---

## Phase 2 (Sequential — Depends on Phase 1)

### Task 3: feat/http-server

**Branch:** `feat/http-server` from `develop`

**Files:**
- Create: `backend/main.go`
- Create: `backend/handler/scrape.go`
- Create: `backend/handler/traverse.go`
- Create: `backend/handler/lca.go`

**handler/scrape.go:**
- `ScrapeHandler(w, r)` — POST only. Decode JSON `{url, html}`. If url → `scraper.FetchHTML` then `parser.ParseHTML`. If html → `parser.ParseHTML` directly. Return tree + maxDepth + totalNodes.

**handler/traverse.go:**
- `TraverseHandler(w, r)` — POST only. Decode JSON `{tree, algorithm, selector, limit}`. Parse selector, run BFS/DFS/ParallelBFS/ParallelDFS based on algorithm. Return TraversalResult.

**handler/lca.go:**
- `LCAHandler(w, r)` — POST only. Decode JSON `{tree, nodeIdA, nodeIdB}`. Build LCA processor, query LCA, get paths. Return lcaNode + pathA + pathB.

**main.go:**
- Chi or std mux. Routes: POST `/api/scrape`, `/api/traverse`, `/api/lca`. CORS middleware for frontend. Port 8080.

- [ ] Step 1: Create `feat/http-server` branch from develop
- [ ] Step 2: Write `backend/handler/scrape.go`
- [ ] Step 3: Write `backend/handler/traverse.go`
- [ ] Step 4: Write `backend/handler/lca.go`
- [ ] Step 5: Write `backend/main.go`
- [ ] Step 6: Commit with `feat: implement HTTP server and API handlers`
- [ ] Step 7: Merge `feat/http-server` into `develop` with `--no-ff`
