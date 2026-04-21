package model

type LogEntry struct {
	Step   int    `json:"step"`
	NodeID int    `json:"nodeId"`
	Tag    string `json:"tag"`
	Action string `json:"action"`
	Depth  int    `json:"depth"`
}

type TraversalResult struct {
	MatchedNodes []*DOMNode `json:"matchedNodes"`
	Log          []LogEntry `json:"log"`
	VisitedCount int        `json:"visitedCount"`
	ExecutionMs  float64    `json:"executionMs"`
	MaxDepth     int        `json:"maxDepth"`
	Algorithm    string     `json:"algorithm"`
}
