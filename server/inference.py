from dataclasses import dataclass
import torch

device = "cuda" if torch.cuda.is_available() else "cpu"

@dataclass
class ModelInference():
    inference: int
    confidence: float

__simple_model: torch.jit.ScriptModule = None
def get_basic_model_inference(img_data: list[float]) -> ModelInference:
    global __simple_model
    if not __simple_model:
        __simple_model = torch.jit.load("torchscript-models/basic_model.pt")
        __simple_model.to(device)
        __simple_model.eval()

    inference, confidence = __infer(__simple_model, img_data)
    return ModelInference(inference, confidence)

__lenet_5: torch.jit.ScriptModule = None
def get_lenet_5_inference(img_data: list[float]) -> ModelInference:
    global __lenet_5
    if not __lenet_5:
        __lenet_5 = torch.jit.load("torchscript-models/lenet-5.pt")
        __lenet_5.to(device)
        __lenet_5.eval()
    
    # calculate from lenet-5
    inference, confidence = __infer(__lenet_5, img_data)
    return ModelInference(inference, confidence)

__advanced_cnn: torch.jit.ScriptModule = None
def get_advanced_cnn_inference(img_data: list[float]) -> ModelInference:
    global __advanced_cnn
    if not __advanced_cnn:
        __advanced_cnn = torch.jit.load("torchscript-models/advanced_cnn.pt")
        __advanced_cnn.to(device)
        __advanced_cnn.eval()

    inference, confidence = __infer(__advanced_cnn, img_data)
    return ModelInference(inference, confidence)

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
