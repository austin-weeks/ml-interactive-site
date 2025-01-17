package api

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type modelResult struct {
	ModelName  string  `json:"model_name"`
	Inference  int     `json:"inference"`
	Confidence float64 `json:"confidence"`
}

func HandlerInferDigit(w http.ResponseWriter, r *http.Request) {
	params := struct {
		ImageData []float64 `json:"image_data"`
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

	// Mock results
	modelResp := struct {
		Results []modelResult `json:"results"`
	}{
		Results: []modelResult{
			{
				ModelName:  "Linear",
				Inference:  2,
				Confidence: 0.5,
			},
			{
				ModelName:  "LeNet-5",
				Inference:  1,
				Confidence: 0.999,
			},
		},
	}
	respondWithJSON(w, http.StatusOK, modelResp)
}

func respondWithJSON(w http.ResponseWriter, code int, payload any) error {
	resp, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(code)
	_, err = w.Write(resp)
	return err
}

func respondWithError(w http.ResponseWriter, code int, err error) error {
	return respondWithJSON(w, code, struct {
		Error string `json:"error"`
	}{
		Error: err.Error(),
	})
}
