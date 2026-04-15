package model

// selector 
type SelectorType int

const (
	TagSelector SelectorType = iota
	ClassSelector
	IDSelector
	UniversalSelector
)

type SimpleSelector struct {
	Type  SelectorType `json:"type"`
	Value string       `json:"value"`
}

// relasi antar selector
type CombinatorType int

const (
	NoCombinator CombinatorType = iota
	ChildCombinator
	DescendantCombinator
	AdjacentSiblingCombinator
	GeneralSiblingCombinator
)

// 1 segment selector 
type SelectorSegment struct {
	Selectors  []SimpleSelector `json:"selectors"`
	Combinator CombinatorType   `json:"combinator"`
}

// urutan selector : kiri -> kanan
type SelectorChain []SelectorSegment
