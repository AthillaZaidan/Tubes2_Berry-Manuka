package selector

import (
	"fmt"
	"strings"
	"unicode"

	"tubes2/model"
)

// mengubah string selector CSS jadi SelectorChain
func ParseSelector(input string) (model.SelectorChain, error) {
	trimmed := strings.TrimSpace(input)
	if trimmed == "" {
		return nil, fmt.Errorf("selector tidak boleh kosong")
	}

	runes := []rune(trimmed)
	segments := make([]model.SelectorSegment, 0)
	current := model.SelectorSegment{Selectors: []model.SimpleSelector{}}

	hasContent := false
	pendingCombinator := model.NoCombinator
	i := 0
	for i < len(runes) {
		r := runes[i]

		switch {
		case unicode.IsSpace(r):
			j := i
			for j < len(runes) && unicode.IsSpace(runes[j]) {
				j++
			}
			if len(current.Selectors) > 0 {
				segments = appendSegment(segments, current, pendingCombinator)
				current = model.SelectorSegment{Selectors: []model.SimpleSelector{}}
				pendingCombinator = model.DescendantCombinator
				hasContent = true
			}
			i = j
			continue

		case r == '>':
			if len(current.Selectors) > 0 {
				segments = appendSegment(segments, current, pendingCombinator)
				current = model.SelectorSegment{Selectors: []model.SimpleSelector{}}
				hasContent = true
			} else if !hasContent {
				return nil, fmt.Errorf("selector tidak valid: combinator '>' di awal")
			}
			pendingCombinator = model.ChildCombinator
			i++
			continue

		case r == '+':
			if len(current.Selectors) > 0 {
				segments = appendSegment(segments, current, pendingCombinator)
				current = model.SelectorSegment{Selectors: []model.SimpleSelector{}}
				hasContent = true
			} else if !hasContent {
				return nil, fmt.Errorf("selector tidak valid: combinator '+' di awal")
			}
			pendingCombinator = model.AdjacentSiblingCombinator
			i++
			continue

		case r == '~':
			if len(current.Selectors) > 0 {
				segments = appendSegment(segments, current, pendingCombinator)
				current = model.SelectorSegment{Selectors: []model.SimpleSelector{}}
				hasContent = true
			} else if !hasContent {
				return nil, fmt.Errorf("selector tidak valid: combinator '~' di awal")
			}
			pendingCombinator = model.GeneralSiblingCombinator
			i++
			continue

		case r == '.':
			ident, next, err := readIdentifier(runes, i+1)
			if err != nil {
				return nil, fmt.Errorf("class selector tidak valid: %w", err)
			}
			current.Selectors = append(current.Selectors, model.SimpleSelector{
				Type:  model.ClassSelector,
				Value: ident,
			})
			i = next
			continue

		case r == '#':
			ident, next, err := readIdentifier(runes, i+1)
			if err != nil {
				return nil, fmt.Errorf("id selector tidak valid: %w", err)
			}
			current.Selectors = append(current.Selectors, model.SimpleSelector{
				Type:  model.IDSelector,
				Value: ident,
			})
			i = next
			continue

		case r == '*':
			current.Selectors = append(current.Selectors, model.SimpleSelector{
				Type:  model.UniversalSelector,
				Value: "*",
			})
			i++
			continue

		case isIdentifierStart(r):
			ident, next, err := readIdentifier(runes, i)
			if err != nil {
				return nil, err
			}
			current.Selectors = append(current.Selectors, model.SimpleSelector{
				Type:  model.TagSelector,
				Value: strings.ToLower(ident),
			})
			i = next
			continue
		default:
			return nil, fmt.Errorf("karakter selector tidak dikenali: %q", string(r))
		}
	}

	if len(current.Selectors) > 0 {
		segments = appendSegment(segments, current, pendingCombinator)
	} else if pendingCombinator != model.NoCombinator {
		return nil, fmt.Errorf("selector tidak valid: selector berakhir dengan combinator")
	}

	if len(segments) == 0 {
		return nil, fmt.Errorf("selector tidak valid")
	}

	return model.SelectorChain(segments), nil
}

func appendSegment(segments []model.SelectorSegment, segment model.SelectorSegment, combinator model.CombinatorType) []model.SelectorSegment {
	segment.Combinator = combinator
	return append(segments, segment)
}

func readIdentifier(runes []rune, start int) (string, int, error) {
	if start >= len(runes) {
		return "", start, fmt.Errorf("identifier kosong")
	}
	if !isIdentifierStart(runes[start]) {
		return "", start, fmt.Errorf("identifier harus diawali huruf, underscore, atau hyphen")
	}

	j := start
	for j < len(runes) && isIdentifierPart(runes[j]) {
		j++
	}
	return string(runes[start:j]), j, nil
}

func isIdentifierStart(r rune) bool {
	return unicode.IsLetter(r) || r == '_' || r == '-'
}

func isIdentifierPart(r rune) bool {
	return unicode.IsLetter(r) || unicode.IsDigit(r) || r == '_' || r == '-'
}
