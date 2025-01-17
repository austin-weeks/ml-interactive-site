package api

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/austin-weeks/ml-interactive-site/models"
)

func HandlerInferDigit(w http.ResponseWriter, r *http.Request) {
	params := struct {
		ImageData []float32 `json:"image_data"`
	}{}
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&params)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, fmt.Errorf("could not decode request body: %w", err))
		return
	}
	defer r.Body.Close()
	if params.ImageData == nil {
		respondWithError(w, http.StatusBadRequest, fmt.Errorf("no image_data provided"))
		return
	}
	if len(params.ImageData) != 28*28 {
		respondWithError(w, http.StatusBadRequest, fmt.Errorf("image_data is not of length 28 * 28"))
		return
	}

	results, err := models.PerformInferences(params.ImageData)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Errorf("could not perform inference: %w", err))
		return
	}
	// Mock results
	modelResp := struct {
		Results []models.ModelResult `json:"results"`
	}{
		Results: results,
	}
	respondWithJSON(w, http.StatusOK, modelResp)
}

func respondWithJSON(w http.ResponseWriter, code int, payload any) error {
	resp, err := json.Marshal(payload)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return err
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(code)
	_, err = w.Write(resp)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return err
	}
	return nil
}

func respondWithError(w http.ResponseWriter, code int, err error) error {
	return respondWithJSON(w, code, struct {
		Error string `json:"error"`
	}{
		Error: err.Error(),
	})
}
