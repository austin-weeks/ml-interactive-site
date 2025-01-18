import torch
import torchvision
from torch.utils.data import DataLoader
from torchvision.transforms import ToTensor, Compose


def get_loaders(batch_size: int) -> tuple[DataLoader, DataLoader]:
    """
    Returns -> training_dataloader, test_dataloader
    """
    class FlattenTensor:
        def __call__(self, x):
            return torch.flatten(x)

    transform_fn = Compose([
        ToTensor(),
        FlattenTensor()
    ])

    training_set = torchvision.datasets.MNIST(
        root="data",
        train=True,
        download=True,
        transform=transform_fn
    )
    test_set = torchvision.datasets.MNIST(
        root="data",
        train=False,
        download=True,
        transform=transform_fn
    )

    training_loader = DataLoader(training_set, batch_size=batch_size, shuffle=True)
    test_loader = DataLoader(test_set, batch_size=batch_size, shuffle=True)
    return training_loader, test_loader