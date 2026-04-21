package traversal_test

import (
	"testing"

	"tubes2/selector"
	"tubes2/traversal"
)

func TestDFS_OrderAndAllMatches(t *testing.T) {
	root := buildTraversalTree()
	chain, err := selector.ParseSelector("p.match")
	if err != nil {
		t.Fatalf("parse error: %v", err)
	}

	res := traversal.DFS(root, chain, 0)
	if res.Algorithm != "dfs" {
		t.Fatalf("unexpected algorithm %q", res.Algorithm)
	}
	if len(res.MatchedNodes) != 2 {
		t.Fatalf("expected 2 matches, got %d", len(res.MatchedNodes))
	}
	if res.MatchedNodes[0].ID != 6 || res.MatchedNodes[1].ID != 8 {
		t.Fatalf("unexpected DFS match order: got IDs %d then %d", res.MatchedNodes[0].ID, res.MatchedNodes[1].ID)
	}
}
