package handler

import (
	"encoding/json"
	"net/http"

	"tubes2/lca"
	"tubes2/model"
)

type LCARequest struct {
	Tree    *model.DOMNode `json:"tree"`
	NodeIDA int            `json:"nodeIdA"`
	NodeIDB int            `json:"nodeIdB"`
}

type LCAResponse struct {
	LCANode *model.DOMNode `json:"lcaNode"`
	PathA   []int          `json:"pathA"`
	PathB   []int          `json:"pathB"`
	Depth   int            `json:"depthLCA"`
}

func LCAHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req LCARequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Request body tidak valid")
		return
	}

	if req.Tree == nil {
		writeError(w, http.StatusBadRequest, "Tree tidak boleh kosong")
		return
	}

	if req.NodeIDA < 0 || req.NodeIDB < 0 {
		writeError(w, http.StatusBadRequest, "Node ID harus non-negatif")
		return
	}

	model.RebuildParentPointers(req.Tree)

	proc := lca.NewLCAProcessor(req.Tree)

	if req.NodeIDA >= proc.N || req.NodeIDB >= proc.N {
		writeError(w, http.StatusBadRequest, "Node ID tidak ditemukan dalam tree")
		return
	}

	lcaNode := proc.FindLCA(req.NodeIDA, req.NodeIDB)
	pathA := proc.GetPath(req.NodeIDA)
	pathB := proc.GetPath(req.NodeIDB)

	clonedNode := model.CloneTreeWithoutParents(lcaNode)

	writeJSON(w, http.StatusOK, LCAResponse{
		LCANode: clonedNode,
		PathA:   pathA,
		PathB:   pathB,
		Depth:   lcaNode.Depth,
	})
}
