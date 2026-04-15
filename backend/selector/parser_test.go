package selector_test

import (
	"testing"

	"tubes2/model"
	"tubes2/selector"
)

func TestParseSelector_BasicAndCompound(t *testing.T) {
	chain, err := selector.ParseSelector("div > p.highlight")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(chain) != 2 {
		t.Fatalf("expected 2 segments, got %d", len(chain))
	}
	if chain[0].Selectors[0].Type != model.TagSelector || chain[0].Selectors[0].Value != "div" {
		t.Fatalf("unexpected first segment: %+v", chain[0])
	}
	if chain[1].Combinator != model.ChildCombinator {
		t.Fatalf("expected child combinator, got %v", chain[1].Combinator)
	}
	if len(chain[1].Selectors) != 2 {
		t.Fatalf("expected compound selector in second segment, got %+v", chain[1].Selectors)
	}
}

func TestParseSelector_Invalid(t *testing.T) {
	_, err := selector.ParseSelector(">>>")
	if err == nil {
		t.Fatal("selektor invalid")
	}
}
