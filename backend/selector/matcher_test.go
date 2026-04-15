package selector_test

import (
	"testing"

	"tubes2/backend/model"
	"tubes2/backend/selector"
)

func buildMatcherTree() *model.DOMNode {
	root := &model.DOMNode{ID: 1, Tag: "html", Attributes: map[string]string{}}
	body := &model.DOMNode{ID: 2, Tag: "body", Attributes: map[string]string{}}
	div := &model.DOMNode{ID: 3, Tag: "div", Attributes: map[string]string{"id": "main", "class": "container wrapper"}}
	span := &model.DOMNode{ID: 4, Tag: "span", Attributes: map[string]string{"class": "label"}}
	p1 := &model.DOMNode{ID: 5, Tag: "p", Attributes: map[string]string{"class": "highlight"}}
	p2 := &model.DOMNode{ID: 6, Tag: "p", Attributes: map[string]string{}}
	section := &model.DOMNode{ID: 7, Tag: "section", Attributes: map[string]string{}}
	p3 := &model.DOMNode{ID: 8, Tag: "p", Attributes: map[string]string{"class": "highlight"}}

	root.Children = []*model.DOMNode{body}
	body.Children = []*model.DOMNode{div, section}
	div.Children = []*model.DOMNode{span, p1, p2}
	section.Children = []*model.DOMNode{p3}
	model.RebuildParentPointers(root)
	return root
}

func TestMatchSimple_ClassAndID(t *testing.T) {
	root := buildMatcherTree()
	div := root.Children[0].Children[0]

	if !selector.MatchSimple(div, model.SimpleSelector{Type: model.IDSelector, Value: "main"}) {
		t.Fatal("expected id selector to match")
	}
	if !selector.MatchSimple(div, model.SimpleSelector{Type: model.ClassSelector, Value: "wrapper"}) {
		t.Fatal("expected class selector to match")
	}
}

func TestMatchChain_Combinators(t *testing.T) {
	root := buildMatcherTree()
	div := root.Children[0].Children[0]
	p1 := div.Children[1]
	p2 := div.Children[2]
	p3 := root.Children[0].Children[1].Children[0]

	cases := []struct {
		selector string
		node     *model.DOMNode
		want     bool
	}{
		{"div > p.highlight", p1, true},
		{"body div p", p1, true},
		{"span + p", p1, true},
		{"span ~ p", p2, true},
		{"div > p.highlight", p3, false},
	}

	for _, tc := range cases {
		chain, err := selector.ParseSelector(tc.selector)
		if err != nil {
			t.Fatalf("parse error for %q: %v", tc.selector, err)
		}
		got := selector.MatchChain(tc.node, chain)
		if got != tc.want {
			t.Fatalf("selector %q on node %d: got %v, want %v", tc.selector, tc.node.ID, got, tc.want)
		}
	}
}
