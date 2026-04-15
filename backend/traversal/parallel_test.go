package traversal_test

import (
	"testing"

	"tubes2/selector"
	"tubes2/traversal"
)

func TestParallelTraversals_FindMatches(t *testing.T) {
	root := buildTraversalTree()
	chain, err := selector.ParseSelector("div > p.match")
	if err != nil {
		t.Fatalf("parse error: %v", err)
	}

	pbfs := traversal.ParallelBFS(root, chain, 0)
	if len(pbfs.MatchedNodes) != 2 {
		t.Fatalf("parallel bfs expected 2 matches, got %d", len(pbfs.MatchedNodes))
	}

	pdfs := traversal.ParallelDFS(root, chain, 0)
	if len(pdfs.MatchedNodes) != 2 {
		t.Fatalf("parallel dfs expected 2 matches, got %d", len(pdfs.MatchedNodes))
	}
}
