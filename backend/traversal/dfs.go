package traversal

import (
	"time"

	"tubes2/model"
	"tubes2/selector"
)

func DFS(root *model.DOMNode, chain model.SelectorChain, limit int) model.TraversalResult {
	start := time.Now()
	result := model.TraversalResult{
		MatchedNodes: make([]*model.DOMNode, 0),
		Log:          make([]model.LogEntry, 0),
		Algorithm:    "dfs",
	}

	if root == nil {
		result.ExecutionMs = float64(time.Since(start).Microseconds()) / 1000.0
		return result
	}
	if root.Parent == nil {
		model.RebuildParentPointers(root)
	}
	result.MaxDepth = model.MaxDepth(root)

	stack := []*model.DOMNode{root}
	step := 0

	for len(stack) > 0 {
		lastIdx := len(stack) - 1
		node := stack[lastIdx]
		stack = stack[:lastIdx]
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

		for i := len(node.Children) - 1; i >= 0; i-- {
			stack = append(stack, node.Children[i])
		}
	}

	result.ExecutionMs = float64(time.Since(start).Microseconds()) / 1000.0
	return result
}
