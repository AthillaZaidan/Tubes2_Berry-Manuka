package parser

import (
	"fmt"
	"strings"

	"tubes2/model"

	"golang.org/x/net/html"
)

var voidElements = map[string]bool{
	"area": true, "base": true, "br": true, "col": true,
	"embed": true, "hr": true, "img": true, "input": true,
	"link": true, "meta": true, "source": true, "track": true,
	"wbr": true,
}

func ParseHTML(htmlStr string) (*model.DOMNode, int, int, error) {
	if strings.TrimSpace(htmlStr) == "" {
		return nil, 0, 0, fmt.Errorf("HTML tidak boleh kosong")
	}

	tokenizer := html.NewTokenizer(strings.NewReader(htmlStr))
	var stack []*model.DOMNode
	var root *model.DOMNode
	idCounter := 0

	for {
		tokenType := tokenizer.Next()

		if tokenType == html.ErrorToken {
			break
		}

		switch tokenType {
		case html.StartTagToken:
			tag, hasAttr := tokenizer.TagName()
			tagStr := strings.ToLower(string(tag))
			attrs := make(map[string]string)
			if hasAttr {
				for {
					key, val, more := tokenizer.TagAttr()
					attrs[strings.ToLower(string(key))] = string(val)
					if !more {
						break
					}
				}
			}

			node := &model.DOMNode{
				ID:         idCounter,
				Tag:        tagStr,
				Attributes: attrs,
				Children:   make([]*model.DOMNode, 0),
			}
			idCounter++

			if len(stack) > 0 {
				parent := stack[len(stack)-1]
				parent.Children = append(parent.Children, node)
			}

			if voidElements[tagStr] {
				break
			}

			if root == nil {
				root = node
			}
			stack = append(stack, node)

		case html.EndTagToken:
			if len(stack) > 0 {
				stack = stack[:len(stack)-1]
			}

		case html.SelfClosingTagToken:
			tag, hasAttr := tokenizer.TagName()
			tagStr := strings.ToLower(string(tag))
			attrs := make(map[string]string)
			if hasAttr {
				for {
					key, val, more := tokenizer.TagAttr()
					attrs[strings.ToLower(string(key))] = string(val)
					if !more {
						break
					}
				}
			}

			node := &model.DOMNode{
				ID:         idCounter,
				Tag:        tagStr,
				Attributes: attrs,
				Children:   make([]*model.DOMNode, 0),
			}
			idCounter++

			if len(stack) > 0 {
				parent := stack[len(stack)-1]
				parent.Children = append(parent.Children, node)
			}

		case html.TextToken:
			text := strings.TrimSpace(string(tokenizer.Text()))
			if text != "" && len(stack) > 0 {
				parent := stack[len(stack)-1]
				if parent.InnerText == "" {
					parent.InnerText = text
				} else {
					parent.InnerText += " " + text
				}
			}
		}
	}

	if root == nil {
		return nil, 0, 0, fmt.Errorf("HTML tidak valid: tidak ada elemen root")
	}

	model.RebuildParentPointers(root)

	totalNodes := countNodes(root)
	maxDepth := model.MaxDepth(root)

	return root, totalNodes, maxDepth, nil
}

func countNodes(root *model.DOMNode) int {
	if root == nil {
		return 0
	}
	count := 1
	for _, child := range root.Children {
		count += countNodes(child)
	}
	return count
}
