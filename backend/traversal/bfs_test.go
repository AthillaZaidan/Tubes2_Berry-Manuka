package traversal_test

import (
	"testing"

	"tubes2/selector"
	"tubes2/traversal"
)

func TestBFS_OrderAndLimit(t *testing.T) {
	root := buildTraversalTree()
	chain, err := selector.ParseSelector("p.match")
	if err != nil {
		t.Fatalf("parse error: %v", err)
	}

	res := traversal.BFS(root, chain, 1)
	if res.Algorithm != "bfs" {
		t.Fatalf("unexpected algorithm %q", res.Algorithm)
	}
	if res.VisitedCount != 6 {
		t.Fatalf("expected 6 visited nodes before first match in BFS, got %d", res.VisitedCount)
	}
	if len(res.MatchedNodes) != 1 || res.MatchedNodes[0].ID != 6 {
		t.Fatalf("unexpected matched nodes: %+v", res.MatchedNodes)
	}
}
