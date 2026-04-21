package lca

import "tubes2/model"

const maxLog = 20

type LCAProcessor struct {
	Up    [][]int
	Depth []int
	Nodes []*model.DOMNode
	N     int
}

func NewLCAProcessor(root *model.DOMNode) *LCAProcessor {
	model.RebuildParentPointers(root)

	totalNodes := countNodes(root)
	up := make([][]int, totalNodes)
	for i := range up {
		up[i] = make([]int, maxLog)
		for j := range up[i] {
			up[i][j] = -1
		}
	}
	depth := make([]int, totalNodes)
	nodes := make([]*model.DOMNode, totalNodes)

	fillTables(root, up, depth, nodes)

	for k := 1; k < maxLog; k++ {
		for v := 0; v < totalNodes; v++ {
			if up[v][k-1] != -1 {
				up[v][k] = up[up[v][k-1]][k-1]
			}
		}
	}

	return &LCAProcessor{
		Up:    up,
		Depth: depth,
		Nodes: nodes,
		N:     totalNodes,
	}
}

func countNodes(node *model.DOMNode) int {
	if node == nil {
		return 0
	}
	count := 1
	for _, child := range node.Children {
		count += countNodes(child)
	}
	return count
}

func fillTables(node *model.DOMNode, up [][]int, depth []int, nodes []*model.DOMNode) {
	if node == nil {
		return
	}
	depth[node.ID] = node.Depth
	nodes[node.ID] = node
	if node.ParentID == -1 {
		up[node.ID][0] = -1
	} else {
		up[node.ID][0] = node.ParentID
	}
	for _, child := range node.Children {
		fillTables(child, up, depth, nodes)
	}
}

func (lca *LCAProcessor) Query(u, v int) int {
	if lca.Depth[u] < lca.Depth[v] {
		u, v = v, u
	}

	diff := lca.Depth[u] - lca.Depth[v]
	for k := 0; k < maxLog; k++ {
		if (diff>>k)&1 == 1 {
			u = lca.Up[u][k]
		}
	}

	if u == v {
		return u
	}

	for k := maxLog - 1; k >= 0; k-- {
		if lca.Up[u][k] != lca.Up[v][k] {
			u = lca.Up[u][k]
			v = lca.Up[v][k]
		}
	}

	return lca.Up[u][0]
}

func (lca *LCAProcessor) GetPath(nodeID int) []int {
	var path []int
	for nodeID != -1 {
		path = append(path, nodeID)
		nodeID = lca.Up[nodeID][0]
	}
	return path
}

func (lca *LCAProcessor) FindLCA(idA, idB int) *model.DOMNode {
	result := lca.Query(idA, idB)
	return lca.Nodes[result]
}