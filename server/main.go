package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/austin-weeks/ml-interactive-server/server/api"
)

func main() {
	serveMux := http.NewServeMux()
	serveMux.HandleFunc("POST /models/{modelType}", api.HandlerInferDigit)

	server := http.Server{
		Handler: serveMux,
		Addr:    ":8080",
	}
	fmt.Printf("Server listening on port %s...\n", server.Addr)
	err := server.ListenAndServe()
	log.Fatal(err)
}
