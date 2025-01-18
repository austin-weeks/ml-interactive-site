from dataclasses import dataclass
import torch

device = "cuda" if torch.cuda.is_available() else "cpu"

@dataclass
class ModelInference():
    model_name: str
    inference: int
    confidence: float

__simple_model: torch.jit.ScriptModule = None
def get_basic_model_inference(img_data: list[float]) -> ModelInference:
    global __simple_model
    if not __simple_model:
        __simple_model = torch.jit.load("../models/torchscript-models/basic_model.pt")
        __simple_model.eval()
        __simple_model.to(device)

    # calculate from simple model
    input = torch.tensor(img_data, dtype=torch.float)
    input = input.unsqueeze(0)
    input = input.to(device)
    with torch.no_grad():
        raw_out = __simple_model(input).squeeze()
    output = torch.softmax(raw_out, 0)
    inference = output.argmax().item()
    confidence = output[inference].item()

    return ModelInference("Basic Neural Network", inference, confidence)
