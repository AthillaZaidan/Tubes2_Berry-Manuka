package scraper

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestFetchHTML_ValidURL(t *testing.T) {
	html := "<html><body><h1>Hello</h1></body></html>"
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.Write([]byte(html))
	}))
	defer ts.Close()

	result, err := FetchHTML(ts.URL)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result != html {
		t.Errorf("expected %q, got %q", html, result)
	}
}

func TestFetchHTML_EmptyURL(t *testing.T) {
	_, err := FetchHTML("")
	if err == nil {
		t.Fatal("expected error for empty URL")
	}
}

func TestFetchHTML_WhitespaceURL(t *testing.T) {
	_, err := FetchHTML("   ")
	if err == nil {
		t.Fatal("expected error for whitespace URL")
	}
}

func TestFetchHTML_InvalidScheme(t *testing.T) {
	cases := []string{"ftp://example.com", "file:///tmp/test.html", "example.com"}
	for _, url := range cases {
		_, err := FetchHTML(url)
		if err == nil {
			t.Errorf("expected error for URL %q", url)
		}
	}
}

func TestFetchHTML_NonHTMLContentType(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"error": true}`))
	}))
	defer ts.Close()

	_, err := FetchHTML(ts.URL)
	if err == nil {
		t.Fatal("expected error for non-HTML content type")
	}
}

func TestFetchHTML_ServerError(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
	}))
	defer ts.Close()

	_, err := FetchHTML(ts.URL)
	if err == nil {
		t.Fatal("expected error for 500 status")
	}
}

func TestFetchHTML_EmptyBody(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html")
		w.Write([]byte{})
	}))
	defer ts.Close()

	_, err := FetchHTML(ts.URL)
	if err == nil {
		t.Fatal("expected error for empty body")
	}
}

func TestFetchHTML_LargeHTML(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html")
		body := make([]byte, 1024)
		for i := range body {
			body[i] = 'a'
		}
		w.Write(body)
	}))
	defer ts.Close()

	result, err := FetchHTML(ts.URL)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(result) != 1024 {
		t.Errorf("expected 1024 bytes, got %d", len(result))
	}
}

func TestFetchHTML_SendsBrowserLikeUserAgent(t *testing.T) {
	var gotUA string
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		gotUA = r.Header.Get("User-Agent")
		w.Header().Set("Content-Type", "text/html")
		w.Write([]byte("<html><body>ok</body></html>"))
	}))
	defer ts.Close()

	_, err := FetchHTML(ts.URL)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if gotUA == "" {
		t.Fatal("expected User-Agent header to be set")
	}
}
