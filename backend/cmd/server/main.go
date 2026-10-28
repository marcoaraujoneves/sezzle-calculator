package main

import (
	"log"
	"net/http"
	"os"

	calculator "sezzle-calculator"
	"sezzle-calculator/internal/middleware"
)

const defaultPort = "8080"

func main() {
	listenAddress := ":" + valueOrDefault(os.Getenv("PORT"), defaultPort)

	mux := http.NewServeMux()

	// Set when the SPA runs on another origin, e.g. the Vite dev server.
	allowedOrigin := os.Getenv("CORS_ALLOWED_ORIGIN")
	api := middleware.WithCORS(allowedOrigin, calculator.NewHandler())
	mux.Handle("/healthz", api)
	mux.Handle("/basic-calculations", api)
	mux.Handle("/advanced-calculations", api)

	// The container ships the built SPA next to the binary so a single process serves both.
	staticDir := os.Getenv("STATIC_DIR")
	if staticDir != "" {
		mux.Handle("/", http.FileServer(http.Dir(staticDir)))
	}

	log.Printf("listening on %s", listenAddress)
	log.Fatal(http.ListenAndServe(listenAddress, mux))
}

func valueOrDefault(value, fallback string) string {
	if value == "" {
		return fallback
	}

	return value
}
