package traversal

import (
	"time"
	"tubes2/model"
	"tubes2/selector"
)

func BFS(root *model.DOMNode, chain model.SelectorChain, limit int) model.TraversalResult {
	start := time.Now()
	result := model.TraversalResult{
		MatchedNodes: make([]*model.DOMNode, 0),
		Log:          make([]model.LogEntry, 0),
		Algorithm:    "bfs",
	}

	if root == nil {
		result.ExecutionMs = float64(time.Since(start).Microseconds()) / 1000.0
		return result
	}

	model.RebuildParentPointers(root)
	result.MaxDepth = model.MaxDepth(root)

	queue := []*model.DOMNode{root}
	step := 0

	for len(queue) > 0 {
		node := queue[0]
		queue = queue[1:]
		step++
		result.VisitedCount++

		action := "visit"
		if selector.MatchChain(node, chain) {
			action = "match"
			result.MatchedNodes = append(result.MatchedNodes, node)
		}

		result.Log = append(result.Log, model.LogEntry{
			Step:   step,
			NodeID: node.ID,
			Tag:    node.Tag,
			Action: action,
			Depth:  node.Depth,
		})

		if limit > 0 && len(result.MatchedNodes) >= limit {
			break
		}

		queue = append(queue, node.Children...)
	}

	result.ExecutionMs = float64(time.Since(start).Microseconds()) / 1000.0
	return result
}
