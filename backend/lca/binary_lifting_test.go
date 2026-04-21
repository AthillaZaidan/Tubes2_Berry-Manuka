package lca_test

import (
	"testing"

	"tubes2/lca"
	"tubes2/model"
)

func buildTestTree() *model.DOMNode {
	n0 := &model.DOMNode{ID: 0, Tag: "html", Children: []*model.DOMNode{}, Attributes: map[string]string{}}
	n1 := &model.DOMNode{ID: 1, Tag: "head", Children: []*model.DOMNode{}, Attributes: map[string]string{}}
	n2 := &model.DOMNode{ID: 2, Tag: "body", Children: []*model.DOMNode{}, Attributes: map[string]string{}}
	n3 := &model.DOMNode{ID: 3, Tag: "div", Children: []*model.DOMNode{}, Attributes: map[string]string{}}
	n4 := &model.DOMNode{ID: 4, Tag: "span", Children: []*model.DOMNode{}, Attributes: map[string]string{}}
	n5 := &model.DOMNode{ID: 5, Tag: "p", Children: []*model.DOMNode{}, Attributes: map[string]string{}}
	n6 := &model.DOMNode{ID: 6, Tag: "a", Children: []*model.DOMNode{}, Attributes: map[string]string{}}

	n0.Children = []*model.DOMNode{n1, n2}
	n2.Children = []*model.DOMNode{n3, n4}
	n3.Children = []*model.DOMNode{n5, n6}

	model.RebuildParentPointers(n0)

	return n0
}

func TestLCA_SameNode(t *testing.T) {
	root := buildTestTree()
	proc := lca.NewLCAProcessor(root)

	result := proc.Query(5, 5)
	if result != 5 {
		t.Errorf("expected 5, got %d", result)
	}
}

func TestLCA_ParentChild(t *testing.T) {
	root := buildTestTree()
	proc := lca.NewLCAProcessor(root)

	result := proc.Query(3, 5)
	if result != 3 {
		t.Errorf("expected 3, got %d", result)
	}
}

func TestLCA_Siblings(t *testing.T) {
	root := buildTestTree()
	proc := lca.NewLCAProcessor(root)

	result := proc.Query(5, 6)
	if result != 3 {
		t.Errorf("expected 3, got %d", result)
	}
}

func TestLCA_DifferentSubtrees(t *testing.T) {
	root := buildTestTree()
	proc := lca.NewLCAProcessor(root)

	result := proc.Query(5, 4)
	if result != 2 {
		t.Errorf("expected 2, got %d", result)
	}
}

func TestLCA_Root(t *testing.T) {
	root := buildTestTree()
	proc := lca.NewLCAProcessor(root)

	result := proc.Query(1, 4)
	if result != 0 {
		t.Errorf("expected 0, got %d", result)
	}
}

func TestLCA_GetPath(t *testing.T) {
	root := buildTestTree()
	proc := lca.NewLCAProcessor(root)

	path := proc.GetPath(5)
	expected := []int{5, 3, 2, 0}
	if len(path) != len(expected) {
		t.Errorf("expected path length %d, got %d", len(expected), len(path))
	}
	for i, id := range expected {
		if path[i] != id {
			t.Errorf("expected path[%d]=%d, got %d", i, id, path[i])
		}
	}
}

func TestLCA_FindLCA(t *testing.T) {
	root := buildTestTree()
	proc := lca.NewLCAProcessor(root)

	result := proc.FindLCA(5, 6)
	if result.ID != 3 {
		t.Errorf("expected node with ID 3, got %d", result.ID)
	}
}