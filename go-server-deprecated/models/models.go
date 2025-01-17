package models

import (
	"fmt"
	"os"

	"github.com/owulveryck/onnx-go"
	"github.com/owulveryck/onnx-go/backend/simple"
)

const modelPath = "./simple_model.onnx"

type ModelResult struct {
	ModelName  string  `json:"model_name"`
	Inference  int     `json:"inference"`
	Confidence float64 `json:"confidence"`
}

func PerformInferences(inputImg []float32) ([]ModelResult, error) {
	if inputImg == nil || len(inputImg) != 28*28 {
		return nil, fmt.Errorf("input image is not of size 28x28")
	}

	backend := simple.NewSimpleGraph()
	model := onnx.NewModel(backend)
	modelBinary, err := os.ReadFile(modelPath)
	if err != nil {
		return nil, err
	}
	err = model.UnmarshalBinary(modelBinary)

	modelResp := []ModelResult{
		{
			ModelName:  "Linear",
			Inference:  2,
			Confidence: 0.5,
		},
		{
			ModelName:  "LeNet-5",
			Inference:  1,
			Confidence: 0.97,
		},
	}
	return modelResp, nil
}
