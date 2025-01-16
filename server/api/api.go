package api

import (
	"fmt"
	"net/http"
)

func HandlerInferDigit(w http.ResponseWriter, r *http.Request) {
	fmt.Println(r)
}
