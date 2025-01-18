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

    inference, confidence = __infer(__simple_model, img_data)
    return ModelInference("Basic Neural Network", inference, confidence)

__lenet_5: torch.jit.ScriptModule = None
def get_lenet_5_inference(img_data: list[float]) -> ModelInference:
    global __lenet_5
    if not __lenet_5:
        __lenet_5 = torch.jit.load("../models/torchscript-models/lenet-5.pt")
        __lenet_5.eval()
        __lenet_5.to(device)
    
    # calculate from lenet-5
    inference, confidence = __infer(__lenet_5, img_data)
    return ModelInference("LeNet-5", inference, confidence)

def __infer(model: torch.jit.ScriptModule, img_data: list[float]) -> tuple[int, float]:
    input = torch.tensor(img_data, dtype=torch.float)
    input = input.unsqueeze(0)
    input = input.to(device)
    with torch.no_grad():
        raw_out = model(input).squeeze()
    output = torch.softmax(raw_out, 0)
    inference = output.argmax().item()
    confidence = output[inference].item()

    return inference, confidence
