package handler

import (
	"encoding/json"
	"net/http"
	"strings"

	"tubes2/model"
	"tubes2/parser"
	"tubes2/scraper"
)

type ScrapeRequest struct {
	URL  string `json:"url"`
	HTML string `json:"html"`
}

type ScrapeResponse struct {
	Tree       *model.DOMNode `json:"tree"`
	MaxDepth   int            `json:"maxDepth"`
	TotalNodes int            `json:"totalNodes"`
}

func ScrapeHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req ScrapeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Request body tidak valid")
		return
	}

	req.URL = strings.TrimSpace(req.URL)
	req.HTML = strings.TrimSpace(req.HTML)

	if req.URL == "" && req.HTML == "" {
		writeError(w, http.StatusBadRequest, "URL dan HTML tidak boleh kosong bersamaan")
		return
	}

	var htmlStr string
	var err error

	if req.URL != "" {
		htmlStr, err = scraper.FetchHTML(req.URL)
		if err != nil {
			writeError(w, http.StatusBadGateway, err.Error())
			return
		}
	} else {
		htmlStr = req.HTML
	}

	root, totalNodes, maxDepth, err := parser.ParseHTML(htmlStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, ScrapeResponse{
		Tree:       model.CloneTreeWithoutParents(root),
		MaxDepth:   maxDepth,
		TotalNodes: totalNodes,
	})
}

func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{"error": msg})
}
