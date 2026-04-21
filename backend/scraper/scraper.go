package scraper

import (
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

const (
	maxBodySize = 5 * 1024 * 1024
	httpTimeout = 15 * time.Second
)

var validSchemes = map[string]bool{"http": true, "https": true}

func FetchHTML(rawURL string) (string, error) {
	rawURL = strings.TrimSpace(rawURL)
	if rawURL == "" {
		return "", fmt.Errorf("URL tidak boleh kosong")
	}

	if !hasValidScheme(rawURL) {
		return "", fmt.Errorf("URL harus menggunakan http atau https")
	}

	client := &http.Client{Timeout: httpTimeout}

	resp, err := client.Get(rawURL)
	if err != nil {
		return "", fmt.Errorf("gagal mengambil HTML dari URL: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("server mengembalikan status %d: %s", resp.StatusCode, resp.Status)
	}

	if !isHTMLContentType(resp.Header.Get("Content-Type")) {
		return "", fmt.Errorf("URL tidak mengembalikan HTML (Content-Type: %s)", resp.Header.Get("Content-Type"))
	}

	limited := io.LimitReader(resp.Body, maxBodySize)
	body, err := io.ReadAll(limited)
	if err != nil {
		return "", fmt.Errorf("gagal membaca body respons: %w", err)
	}

	if len(body) == 0 {
		return "", fmt.Errorf("body respons kosong")
	}

	return string(body), nil
}

func hasValidScheme(rawURL string) bool {
	lower := strings.ToLower(rawURL)
	for scheme := range validSchemes {
		if strings.HasPrefix(lower, scheme+"://") {
			return true
		}
	}
	return false
}

func isHTMLContentType(ct string) bool {
	ct = strings.ToLower(ct)
	return strings.Contains(ct, "text/html")
}
