package main

import (
	"fmt"
	"log"
	"net/http"

	"tubes2/handler"
)

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("/api/scrape", handler.ScrapeHandler)
	mux.HandleFunc("/api/traverse", handler.TraverseHandler)
	mux.HandleFunc("/api/lca", handler.LCAHandler)

	handler := corsMiddleware(mux)

	port := ":8080"
	fmt.Printf("Server berjalan di http://localhost%s\n", port)
	log.Fatal(http.ListenAndServe(port, handler))
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
