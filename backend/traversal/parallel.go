package traversal

import (
	"sort"
	"sync"
	"time"

	"tubes2/model"
	"tubes2/selector"
)

// ParallelBFS memproses node per level
func ParallelBFS(root *model.DOMNode, chain model.SelectorChain, limit int) model.TraversalResult {
	start := time.Now()
	result := model.TraversalResult{
		MatchedNodes: make([]*model.DOMNode, 0),
		Log:          make([]model.LogEntry, 0),
		Algorithm:    "parallel_bfs",
	}
	if root == nil {
		result.ExecutionMs = float64(time.Since(start).Microseconds()) / 1000.0
		return result
	}

	model.RebuildParentPointers(root)
	result.MaxDepth = model.MaxDepth(root)

	currentLevel := []*model.DOMNode{root}
	stepCounter := 0
	reachedLimit := false

	type levelResult struct {
		entry    model.LogEntry
		node     *model.DOMNode
		matched  bool
		children []*model.DOMNode
	}

	for len(currentLevel) > 0 && !reachedLimit {
		levelResults := make([]levelResult, len(currentLevel))
		var wg sync.WaitGroup

		for idx, node := range currentLevel {
			step := stepCounter + idx + 1
			wg.Add(1)
			go func(i int, n *model.DOMNode, s int) {
				defer wg.Done()

				action := "visit"
				matched := selector.MatchChain(n, chain)
				if matched {
					action = "match"
				}

				levelResults[i] = levelResult{
					entry: model.LogEntry{
						Step:   s,
						NodeID: n.ID,
						Tag:    n.Tag,
						Action: action,
						Depth:  n.Depth,
					},
					node:     n,
					matched:  matched,
					children: n.Children,
				}
			}(idx, node, step)
		}

		wg.Wait()
		stepCounter += len(levelResults)

		nextLevel := make([]*model.DOMNode, 0, len(currentLevel)*2)
		for _, item := range levelResults {
			result.Log = append(result.Log, item.entry)
			if item.matched {
				result.MatchedNodes = append(result.MatchedNodes, item.node)
				if limit > 0 && len(result.MatchedNodes) >= limit {
					reachedLimit = true
					break
				}
			}
			nextLevel = append(nextLevel, item.children...)
		}
		currentLevel = nextLevel
	}

	result.VisitedCount = len(result.Log)
	result.ExecutionMs = float64(time.Since(start).Microseconds()) / 1000.0
	return result
}

// ParallelDFS memproses subtree anak root secara paralel
func ParallelDFS(root *model.DOMNode, chain model.SelectorChain, limit int) model.TraversalResult {
	start := time.Now()
	result := model.TraversalResult{
		MatchedNodes: make([]*model.DOMNode, 0),
		Log:          make([]model.LogEntry, 0),
		Algorithm:    "parallel_dfs",
	}
	if root == nil {
		result.ExecutionMs = float64(time.Since(start).Microseconds()) / 1000.0
		return result
	}

	model.RebuildParentPointers(root)
	result.MaxDepth = model.MaxDepth(root)

	// Proses root dulu
	step := 1
	result.VisitedCount = 1
	rootAction := "visit"
	if selector.MatchChain(root, chain) {
		rootAction = "match"
		result.MatchedNodes = append(result.MatchedNodes, root)
	}
	result.Log = append(result.Log, model.LogEntry{
		Step:   step,
		NodeID: root.ID,
		Tag:    root.Tag,
		Action: rootAction,
		Depth:  root.Depth,
	})
	if limit > 0 && len(result.MatchedNodes) >= limit {
		result.ExecutionMs = float64(time.Since(start).Microseconds()) / 1000.0
		return result
	}

	type subtreeResult struct {
		index int
		data  model.TraversalResult
	}

	var wg sync.WaitGroup
	out := make(chan subtreeResult, len(root.Children))

	for idx, child := range root.Children {
		wg.Add(1)
		go func(i int, subtreeRoot *model.DOMNode) {
			defer wg.Done()
			out <- subtreeResult{index: i, data: DFS(subtreeRoot, chain, 0)}
		}(idx, child)
	}

	wg.Wait()
	close(out)

	subResults := make([]subtreeResult, 0, len(root.Children))
	for item := range out {
		subResults = append(subResults, item)
	}
	sort.Slice(subResults, func(i, j int) bool {
		return subResults[i].index < subResults[j].index
	})

	for _, sub := range subResults {
		matchIdx := 0
		for _, entry := range sub.data.Log {
			step++
			entry.Step = step
			result.Log = append(result.Log, entry)

			if entry.Action != "match" {
				continue
			}

			if matchIdx < len(sub.data.MatchedNodes) {
				result.MatchedNodes = append(result.MatchedNodes, sub.data.MatchedNodes[matchIdx])
			}
			matchIdx++

			if limit > 0 && len(result.MatchedNodes) >= limit {
				result.VisitedCount = len(result.Log)
				result.ExecutionMs = float64(time.Since(start).Microseconds()) / 1000.0
				return result
			}
		}
	}

	result.VisitedCount = len(result.Log)
	result.ExecutionMs = float64(time.Since(start).Microseconds()) / 1000.0
	return result
}
