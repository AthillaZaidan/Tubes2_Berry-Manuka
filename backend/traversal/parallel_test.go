package traversal_test

import (
	"testing"

	"tubes2/model"
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

func TestParallelTraversals_TopNStopsLogsAtLimit(t *testing.T) {
	root := buildTraversalTree()
	chain, err := selector.ParseSelector("p.match")
	if err != nil {
		t.Fatalf("parse error: %v", err)
	}

	pbfs := traversal.ParallelBFS(root, chain, 1)
	if len(pbfs.MatchedNodes) != 1 {
		t.Fatalf("parallel bfs expected 1 match with limit=1, got %d", len(pbfs.MatchedNodes))
	}
	if countMatches(pbfs.Log) != 1 {
		t.Fatalf("parallel bfs log should contain exactly 1 match entry, got %d", countMatches(pbfs.Log))
	}
	if len(pbfs.Log) == 0 || pbfs.Log[len(pbfs.Log)-1].Action != "match" {
		t.Fatalf("parallel bfs should stop logging at first match")
	}
	if pbfs.VisitedCount != len(pbfs.Log) {
		t.Fatalf("parallel bfs visitedCount should equal log length, got %d vs %d", pbfs.VisitedCount, len(pbfs.Log))
	}

	pdfs := traversal.ParallelDFS(root, chain, 1)
	if len(pdfs.MatchedNodes) != 1 {
		t.Fatalf("parallel dfs expected 1 match with limit=1, got %d", len(pdfs.MatchedNodes))
	}
	if countMatches(pdfs.Log) != 1 {
		t.Fatalf("parallel dfs log should contain exactly 1 match entry, got %d", countMatches(pdfs.Log))
	}
	if len(pdfs.Log) == 0 || pdfs.Log[len(pdfs.Log)-1].Action != "match" {
		t.Fatalf("parallel dfs should stop logging at first match")
	}
	if pdfs.VisitedCount != len(pdfs.Log) {
		t.Fatalf("parallel dfs visitedCount should equal log length, got %d vs %d", pdfs.VisitedCount, len(pdfs.Log))
	}
}

func countMatches(log []model.LogEntry) int {
	count := 0
	for _, entry := range log {
		if entry.Action == "match" {
			count++
		}
	}
	return count
}
