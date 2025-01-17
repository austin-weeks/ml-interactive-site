from dataclasses import dataclass
import torch

@dataclass
class ModelInference():
    model_name: str
    inference: int
    confidence: float

__simple_model = None
def get_simple_inference(img_data: list[float]):
    if not __simple_model:
        # Load the simple model from memory
        pass
    # calculate from simple model

    return ModelInference("model", 1, 0.2)

__let_net_model = None
def get_le_net_inference(img_data: list[float]):
    if not __let_net_model:
        pass
    pass