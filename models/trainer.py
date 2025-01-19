import torch
from torch.utils.data import DataLoader

def train_model(
    model: torch.nn.Module,
    training_loader: DataLoader,
    test_loader: DataLoader,
    loss_fn: torch.nn.Module,
    optimizer: torch.optim.Optimizer,
    scheduler: torch.optim.lr_scheduler.LRScheduler | None = None,
    print_freq: int | None = 100,
    epochs: int = 10,
    stop_loss: float | None = None,
    device: str = "cpu"
):
    for i in range(epochs):
        print(f"\n---- EPOCH {i + 1} ----")
        loss = train_one_epoch(model, training_loader, loss_fn, optimizer, scheduler=scheduler, print_freq=print_freq, device=device)
        print(f"Epoch Loss: {loss:>8f}")
        if stop_loss and loss <= stop_loss:
            print(f"Reached loss of {loss}")
            break

    evaluate_model(model, test_loader, loss_fn, device=device)

def train_one_epoch(
    model: torch.nn.Module,
    dataloader: DataLoader,
    loss_fn: torch.nn.Module,
    optimizer: torch.optim.Optimizer,
    scheduler: torch.optim.lr_scheduler.LRScheduler | None = None,
    print_freq: int | None = 100,
    device: str = "cpu"
) -> float:
    
    total_loss = 0.0
    model.train()
    model.to(device)
    for i, (inputs, labels) in enumerate(dataloader):
        inputs, labels = inputs.to(device), labels.to(device)
        inference = model(inputs)
        loss = loss_fn(inference, labels)

        loss.backward()
        optimizer.step()
        optimizer.zero_grad()
        if scheduler:
            scheduler.step()

        loss_val = loss.item()
        total_loss += loss_val

        if print_freq and (i + 1) % print_freq == 0:
            print(f"loss: {loss.item():>8f}")
    return total_loss / len(dataloader)

def evaluate_model(
    model: torch.nn.Module,
    dataloader: DataLoader,
    loss_fn: torch.nn.Module,
    device: str = "cpu"
):
    model.eval()
    model.to(device)
    total_loss, total_correct = 0, 0

    with torch.no_grad():
        for inputs, labels in dataloader:
            inputs, labels = inputs.to(device), labels.to(device)
            inference = model(inputs)
            total_loss += loss_fn(inference, labels).item()
            # what in the world is this doing???
            total_correct += (inference.argmax(1) == labels).type(torch.float).sum().item()

    avg_loss = total_loss / len(dataloader) # number of batches
    accuracy =  total_correct / len(dataloader.dataset)
    print(f"---- Test Results ----")
    print(f"Accuracy: {(accuracy * 100):>0.2f}% | Avg Loss: {avg_loss:>8f}")
