package handler

import (
	"encoding/json"
	"net/http"

	"tubes2/model"
	"tubes2/selector"
	"tubes2/traversal"
)

type TraverseRequest struct {
	Tree      *model.DOMNode `json:"tree"`
	Algorithm string         `json:"algorithm"`
	Selector  string         `json:"selector"`
	Limit     int            `json:"limit"`
}

func TraverseHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req TraverseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Request body tidak valid")
		return
	}

	if req.Tree == nil {
		writeError(w, http.StatusBadRequest, "Tree tidak boleh kosong")
		return
	}

	chain, err := selector.ParseSelector(req.Selector)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	model.RebuildParentPointers(req.Tree)

	var result model.TraversalResult

	switch req.Algorithm {
	case "bfs":
		result = traversal.BFS(req.Tree, chain, req.Limit)
	case "dfs":
		result = traversal.DFS(req.Tree, chain, req.Limit)
	case "parallel_bfs":
		result = traversal.ParallelBFS(req.Tree, chain, req.Limit)
	case "parallel_dfs":
		result = traversal.ParallelDFS(req.Tree, chain, req.Limit)
	default:
		writeError(w, http.StatusBadRequest, "Algoritma tidak valid: gunakan bfs, dfs, parallel_bfs, atau parallel_dfs")
		return
	}

	result.MatchedNodes = cloneNodeList(result.MatchedNodes)

	writeJSON(w, http.StatusOK, result)
}

func cloneNodeList(nodes []*model.DOMNode) []*model.DOMNode {
	cloned := make([]*model.DOMNode, len(nodes))
	for i, n := range nodes {
		cloned[i] = model.CloneTreeWithoutParents(n)
	}
	return cloned
}
