package traversal_test

import "tubes2/model"

func buildTraversalTree() *model.DOMNode {
	root := &model.DOMNode{ID: 1, Tag: "html", Attributes: map[string]string{}}
	head := &model.DOMNode{ID: 2, Tag: "head", Attributes: map[string]string{}}
	body := &model.DOMNode{ID: 3, Tag: "body", Attributes: map[string]string{}}
	divA := &model.DOMNode{ID: 4, Tag: "div", Attributes: map[string]string{"class": "box"}}
	divB := &model.DOMNode{ID: 5, Tag: "div", Attributes: map[string]string{"class": "box"}}
	p1 := &model.DOMNode{ID: 6, Tag: "p", Attributes: map[string]string{"class": "match"}}
	span := &model.DOMNode{ID: 7, Tag: "span", Attributes: map[string]string{}}
	p2 := &model.DOMNode{ID: 8, Tag: "p", Attributes: map[string]string{"class": "match"}}

	root.Children = []*model.DOMNode{head, body}
	body.Children = []*model.DOMNode{divA, divB}
	divA.Children = []*model.DOMNode{p1}
	divB.Children = []*model.DOMNode{span, p2}
	model.RebuildParentPointers(root)
	return root
}
