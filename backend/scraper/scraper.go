package scraper

import (
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

const (
	maxBodySize      = 5 * 1024 * 1024
	httpTimeout      = 15 * time.Second
	defaultUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
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

	req, err := http.NewRequest(http.MethodGet, rawURL, nil)
	if err != nil {
		return "", fmt.Errorf("URL tidak valid: %w", err)
	}
	req.Header.Set("User-Agent", defaultUserAgent)
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
	req.Header.Set("Accept-Language", "en-US,en;q=0.9,id;q=0.8")
	req.Header.Set("Cache-Control", "no-cache")
	req.Header.Set("Pragma", "no-cache")

	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("gagal mengambil HTML dari URL: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		if resp.StatusCode == http.StatusForbidden {
			return "", fmt.Errorf("server mengembalikan status 403 Forbidden. Situs target menolak request otomatis")
		}
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
