package model

// node pada DOM tree
type DOMNode struct {
	ID         int               `json:"id"`
	Tag        string            `json:"tag"`
	Attributes map[string]string `json:"attributes"`
	Children   []*DOMNode        `json:"children"`
	ParentID   int               `json:"parentId"`
	Depth      int               `json:"depth"`
	InnerText  string            `json:"innerText,omitempty"`
	Parent     *DOMNode          `json:"-"`
}

// membuat salinan pohon tanpa referensi parent
func CloneTreeWithoutParents(root *DOMNode) *DOMNode {
	if root == nil {
		return nil
	}

	copyNode := &DOMNode{
		ID:         root.ID,
		Tag:        root.Tag,
		Attributes: map[string]string{},
		Children:   make([]*DOMNode, 0, len(root.Children)),
		ParentID:   root.ParentID,
		Depth:      root.Depth,
		InnerText:  root.InnerText,
	}

	for k, v := range root.Attributes {
		copyNode.Attributes[k] = v
	}

	for _, child := range root.Children {
		copyNode.Children = append(copyNode.Children, CloneTreeWithoutParents(child))
	}

	return copyNode
}

// membangun ulang pointer parent dan ParentID
func RebuildParentPointers(root *DOMNode) {
	if root == nil {
		return
	}
	rebuildParentPointers(root, nil)
}

func rebuildParentPointers(node *DOMNode, parent *DOMNode) {
	node.Parent = parent
	if parent == nil {
		node.ParentID = -1
		node.Depth = 0
	} else {
		node.ParentID = parent.ID
		node.Depth = parent.Depth + 1
	}

	for _, child := range node.Children {
		rebuildParentPointers(child, node)
	}
}

func MaxDepth(root *DOMNode) int {
	if root == nil {
		return 0
	}
	maxDepth := root.Depth
	for _, child := range root.Children {
		childMax := MaxDepth(child)
		if childMax > maxDepth {
			maxDepth = childMax
		}
	}
	return maxDepth
}
