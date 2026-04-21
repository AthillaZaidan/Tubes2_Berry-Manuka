package parser_test

import (
	"testing"

	"tubes2/model"
	"tubes2/parser"
)

func TestParseHTML_SimpleDocument(t *testing.T) {
	htmlStr := `<html><body><p>Hello</p></body></html>`
	root, totalNodes, maxDepth, err := parser.ParseHTML(htmlStr)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if root.Tag != "html" {
		t.Errorf("expected root tag 'html', got %q", root.Tag)
	}
	if totalNodes != 3 {
		t.Errorf("expected totalNodes 3, got %d", totalNodes)
	}
	body := root.Children[0]
	if body.Tag != "body" {
		t.Errorf("expected body tag, got %q", body.Tag)
	}
	p := body.Children[0]
	if p.Tag != "p" {
		t.Errorf("expected p tag, got %q", p.Tag)
	}
	if p.InnerText != "Hello" {
		t.Errorf("expected InnerText 'Hello', got %q", p.InnerText)
	}
	if maxDepth != 2 {
		t.Errorf("expected maxDepth 2, got %d", maxDepth)
	}
}

func TestParseHTML_WithAttributes(t *testing.T) {
	htmlStr := `<div id="x" class="box"><p></p></div>`
	root, _, _, err := parser.ParseHTML(htmlStr)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if root.Tag != "div" {
		t.Errorf("expected root tag 'div', got %q", root.Tag)
	}
	if root.Attributes["id"] != "x" {
		t.Errorf("expected id='x', got %q", root.Attributes["id"])
	}
	if root.Attributes["class"] != "box" {
		t.Errorf("expected class='box', got %q", root.Attributes["class"])
	}
	if len(root.Children) != 1 {
		t.Fatalf("expected 1 child, got %d", len(root.Children))
	}
	if root.Children[0].Tag != "p" {
		t.Errorf("expected child tag 'p', got %q", root.Children[0].Tag)
	}
}

func TestParseHTML_NestedStructure(t *testing.T) {
	htmlStr := `<html><body><div><ul><li>item</li></ul></div></body></html>`
	root, _, _, err := parser.ParseHTML(htmlStr)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	var findNode func(*model.DOMNode, string) *model.DOMNode
	findNode = func(n *model.DOMNode, tag string) *model.DOMNode {
		if n == nil {
			return nil
		}
		if n.Tag == tag {
			return n
		}
		for _, c := range n.Children {
			if found := findNode(c, tag); found != nil {
				return found
			}
		}
		return nil
	}

	li := findNode(root, "li")
	if li == nil {
		t.Fatal("expected to find li element")
	}
	if li.InnerText != "item" {
		t.Errorf("expected InnerText 'item', got %q", li.InnerText)
	}
	if li.ParentID == -1 {
		t.Error("li should have a parent")
	}
	if li.Depth != 4 {
		t.Errorf("expected li depth 4, got %d", li.Depth)
	}
	ul := findNode(root, "ul")
	if ul == nil {
		t.Fatal("expected to find ul element")
	}
	if ul.Depth != 3 {
		t.Errorf("expected ul depth 3, got %d", ul.Depth)
	}
}

func TestParseHTML_SelfClosingTags(t *testing.T) {
	htmlStr := `<div><br><img src="test.jpg"></div>`
	root, totalNodes, _, err := parser.ParseHTML(htmlStr)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if root.Tag != "div" {
		t.Errorf("expected root tag 'div', got %q", root.Tag)
	}
	if len(root.Children) != 2 {
		t.Fatalf("expected 2 children, got %d", len(root.Children))
	}
	br := root.Children[0]
	if br.Tag != "br" {
		t.Errorf("expected tag 'br', got %q", br.Tag)
	}
	if len(br.Children) != 0 {
		t.Errorf("br should have no children, got %d", len(br.Children))
	}
	img := root.Children[1]
	if img.Tag != "img" {
		t.Errorf("expected tag 'img', got %q", img.Tag)
	}
	if img.Attributes["src"] != "test.jpg" {
		t.Errorf("expected src='test.jpg', got %q", img.Attributes["src"])
	}
	if len(img.Children) != 0 {
		t.Errorf("img should have no children, got %d", len(img.Children))
	}
	if totalNodes != 3 {
		t.Errorf("expected totalNodes 3, got %d", totalNodes)
	}
}

func TestParseHTML_EmptyInput(t *testing.T) {
	_, _, _, err := parser.ParseHTML("")
	if err == nil {
		t.Fatal("expected error for empty input")
	}

	_, _, _, err = parser.ParseHTML("   ")
	if err == nil {
		t.Fatal("expected error for whitespace input")
	}
}

func TestParseHTML_ComplexDocument(t *testing.T) {
	htmlStr := `<html><head><title>Test</title></head><body><header class="main"><nav><a href="/home">Home</a><a href="/about">About</a></nav></header><main><section id="content"><h1>Welcome</h1><p class="intro">Hello world</p></section></main><footer><p>Footer</p></footer></body></html>`
	root, totalNodes, maxDepth, err := parser.ParseHTML(htmlStr)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if root.Tag != "html" {
		t.Errorf("expected root tag 'html', got %q", root.Tag)
	}
	if len(root.Children) != 2 {
		t.Errorf("expected 2 children (head, body), got %d", len(root.Children))
	}
	head := root.Children[0]
	if head.Tag != "head" {
		t.Errorf("expected head, got %q", head.Tag)
	}
	body := root.Children[1]
	if body.Tag != "body" {
		t.Errorf("expected body, got %q", body.Tag)
	}
	if totalNodes < 12 {
		t.Errorf("expected at least 12 nodes, got %d", totalNodes)
	}
	if maxDepth < 4 {
		t.Errorf("expected maxDepth at least 4, got %d", maxDepth)
	}

	var findNode func(*model.DOMNode, string) *model.DOMNode
	findNode = func(n *model.DOMNode, tag string) *model.DOMNode {
		if n == nil {
			return nil
		}
		if n.Tag == tag {
			return n
		}
		for _, c := range n.Children {
			if found := findNode(c, tag); found != nil {
				return found
			}
		}
		return nil
	}

	header := findNode(root, "header")
	if header == nil {
		t.Fatal("expected to find header element")
	}
	if header.Attributes["class"] != "main" {
		t.Errorf("expected class='main', got %q", header.Attributes["class"])
	}

	section := findNode(root, "section")
	if section == nil {
		t.Fatal("expected to find section element")
	}
	if section.Attributes["id"] != "content" {
		t.Errorf("expected id='content', got %q", section.Attributes["id"])
	}
}

func TestParseHTML_MaxDepth(t *testing.T) {
	htmlStr := `<div><div><div><div><div>deep</div></div></div></div></div>`
	root, totalNodes, maxDepth, err := parser.ParseHTML(htmlStr)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if totalNodes != 5 {
		t.Errorf("expected totalNodes 5, got %d", totalNodes)
	}
	if maxDepth != 4 {
		t.Errorf("expected maxDepth 4, got %d", maxDepth)
	}

	var findDeepest func(*model.DOMNode) *model.DOMNode
	findDeepest = func(n *model.DOMNode) *model.DOMNode {
		if len(n.Children) == 0 {
			return n
		}
		return findDeepest(n.Children[0])
	}

	deepest := findDeepest(root)
	if deepest.Depth != 4 {
		t.Errorf("expected deepest node depth 4, got %d", deepest.Depth)
	}
	if deepest.InnerText != "deep" {
		t.Errorf("expected InnerText 'deep', got %q", deepest.InnerText)
	}
}
