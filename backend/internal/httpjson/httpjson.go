// Package httpjson writes the JSON responses shared by every handler and middleware of the API.
package httpjson

import (
	"encoding/json"
	"net/http"
)

const (
	contentTypeJSON     = "application/json"
	internalErrorBody   = `{"error":"internal error"}` + "\n"
	responseBodyNewline = '\n'
)

// Write encodes body as JSON with the given status. The body is encoded before the header is
// sent, so a value JSON cannot carry (such as Inf) becomes a 500 instead of an empty 200.
func Write(w http.ResponseWriter, status int, body any) {
	encodedBody, err := json.Marshal(body)
	if err != nil {
		w.Header().Set("Content-Type", contentTypeJSON)
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte(internalErrorBody))

		return
	}

	w.Header().Set("Content-Type", contentTypeJSON)
	w.WriteHeader(status)
	_, _ = w.Write(append(encodedBody, responseBodyNewline))
}

// WriteError answers with {"error": message}.
func WriteError(w http.ResponseWriter, status int, message string) {
	Write(w, status, map[string]string{"error": message})
}
