package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/austin-weeks/ml-interactive-site/api"
)

func main() {
	serveMux := http.NewServeMux()
	serveMux.HandleFunc("/models", MiddlewareCORS(api.HandlerInferDigit, "POST"))

	server := http.Server{
		Handler: serveMux,
		Addr:    ":8080",
	}
	fmt.Printf("Server listening on port %s...\n", server.Addr)
	err := server.ListenAndServe()
	log.Fatal(err)
}

func MiddlewareCORS(next http.HandlerFunc, methods string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", fmt.Sprint(methods, ", OPTIONS"))
		w.Header().Set("Access-Control-Allow-Headers", "*")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next(w, r)
	}
}
