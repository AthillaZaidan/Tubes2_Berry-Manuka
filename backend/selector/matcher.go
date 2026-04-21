package selector

import (
	"strings"

	"tubes2/model"
)

// cocokin node dengan selector
func MatchSimple(node *model.DOMNode, simple model.SimpleSelector) bool {
	if node == nil {
		return false
	}

	switch simple.Type {
	case model.TagSelector:
		return strings.EqualFold(node.Tag, simple.Value)
	case model.ClassSelector:
		classAttr := strings.TrimSpace(node.Attributes["class"])
		if classAttr == "" {
			return false
		}
		for _, cls := range strings.Fields(classAttr) {
			if cls == simple.Value {
				return true
			}
		}
		return false
	case model.IDSelector:
		return node.Attributes["id"] == simple.Value
	case model.UniversalSelector:
		return true
	default:
		return false
	}
}

// cek selector di segment cocok dengan node
func MatchSegment(node *model.DOMNode, segment model.SelectorSegment) bool {
	if node == nil {
		return false
	}
	if len(segment.Selectors) == 0 {
		return false
	}

	for _, simple := range segment.Selectors {
		if !MatchSimple(node, simple) {
			return false
		}
	}
	return true
}

// cocokin selector chain dari kanan ke kiri
func MatchChain(node *model.DOMNode, chain model.SelectorChain) bool {
	if node == nil || len(chain) == 0 {
		return false
	}
	return matchChainRecursive(node, chain, len(chain)-1)
}

func matchChainRecursive(node *model.DOMNode, chain model.SelectorChain, idx int) bool {
	if node == nil || idx < 0 {
		return false
	}

	segment := chain[idx]
	if !MatchSegment(node, segment) {
		return false
	}

	if idx == 0 {
		return true
	}

	switch segment.Combinator {
	case model.ChildCombinator:
		return matchChainRecursive(node.Parent, chain, idx-1)
	case model.DescendantCombinator:
		for ancestor := node.Parent; ancestor != nil; ancestor = ancestor.Parent {
			if matchChainRecursive(ancestor, chain, idx-1) {
				return true
			}
		}
		return false
	case model.AdjacentSiblingCombinator:
		prev := GetPreviousSibling(node)
		return matchChainRecursive(prev, chain, idx-1)
	case model.GeneralSiblingCombinator:
		for sibling := GetPreviousSibling(node); sibling != nil; sibling = GetPreviousSibling(sibling) {
			if matchChainRecursive(sibling, chain, idx-1) {
				return true
			}
		}
		return false
	case model.NoCombinator:
		return idx == 0
	default:
		return false
	}
}

// return : sibling sebelumnya, atau nil jika tidak ada
func GetPreviousSibling(node *model.DOMNode) *model.DOMNode {
	if node == nil || node.Parent == nil {
		return nil
	}

	siblings := node.Parent.Children
	for i, sibling := range siblings {
		if sibling == node {
			if i == 0 {
				return nil
			}
			return siblings[i-1]
		}
	}
	return nil
}
