package traversal

import (
	"sort"
	"sync"
	"sync/atomic"
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
	var stepCounter int64
	var visitedCount int64
	var stop int32
	var mu sync.Mutex

	for len(currentLevel) > 0 && atomic.LoadInt32(&stop) == 0 {
		nextBuckets := make([][]*model.DOMNode, len(currentLevel))
		levelLog := make([]model.LogEntry, 0, len(currentLevel))
		levelMatches := make([]*model.DOMNode, 0)
		var wg sync.WaitGroup

		for idx, node := range currentLevel {
			wg.Add(1)
			go func(i int, n *model.DOMNode) {
				defer wg.Done()

				step := int(atomic.AddInt64(&stepCounter, 1))
				atomic.AddInt64(&visitedCount, 1)

				action := "visit"
				matched := selector.MatchChain(n, chain)
				if matched {
					action = "match"
				}

				entry := model.LogEntry{
					Step:   step,
					NodeID: n.ID,
					Tag:    n.Tag,
					Action: action,
					Depth:  n.Depth,
				}

				mu.Lock()
				levelLog = append(levelLog, entry)
				if matched {
					levelMatches = append(levelMatches, n)
					if limit > 0 && len(result.MatchedNodes)+len(levelMatches) >= limit {
						atomic.StoreInt32(&stop, 1)
					}
				}
				mu.Unlock()

				nextBuckets[i] = append(nextBuckets[i], n.Children...)
			}(idx, node)
		}

		wg.Wait()

		sort.Slice(levelLog, func(i, j int) bool {
			return levelLog[i].Step < levelLog[j].Step
		})
		sort.Slice(levelMatches, func(i, j int) bool {
			return levelMatches[i].ID < levelMatches[j].ID
		})

		result.Log = append(result.Log, levelLog...)
		result.MatchedNodes = append(result.MatchedNodes, levelMatches...)
		if limit > 0 && len(result.MatchedNodes) > limit {
			result.MatchedNodes = result.MatchedNodes[:limit]
		}

		nextLevel := make([]*model.DOMNode, 0)
		for _, bucket := range nextBuckets {
			nextLevel = append(nextLevel, bucket...)
		}
		currentLevel = nextLevel
	}

	result.VisitedCount = int(visitedCount)
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

	// Proses root dulu agar konsisten dengan traversal DFS biasa.
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
		for _, entry := range sub.data.Log {
			step++
			entry.Step = step
			result.Log = append(result.Log, entry)
		}
		result.VisitedCount += sub.data.VisitedCount
		result.MatchedNodes = append(result.MatchedNodes, sub.data.MatchedNodes...)
		if limit > 0 && len(result.MatchedNodes) >= limit {
			result.MatchedNodes = result.MatchedNodes[:limit]
			break
		}
	}

	result.ExecutionMs = float64(time.Since(start).Microseconds()) / 1000.0
	return result
}
