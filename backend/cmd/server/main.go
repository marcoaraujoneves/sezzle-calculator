package main

import (
	"log"
	"net/http"
	"os"

	calculator "sezzle-calculator"
)

func main() {
	addr := ":8080"
	if port := os.Getenv("PORT"); port != "" {
		addr = ":" + port
	}

	mux := http.NewServeMux()
	// Set when the SPA runs on another origin, e.g. the Vite dev server.
	allowedOrigin := os.Getenv("CORS_ALLOWED_ORIGIN")
	mux.Handle("/healthz", calculator.WithCORS(allowedOrigin, calculator.NewHandler()))

	// The container ships the built SPA next to the binary so a single process serves both.
	if dir := os.Getenv("STATIC_DIR"); dir != "" {
		mux.Handle("/", http.FileServer(http.Dir(dir)))
	}

	log.Printf("listening on %s", addr)
	log.Fatal(http.ListenAndServe(addr, mux))
}
