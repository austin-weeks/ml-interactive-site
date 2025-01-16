# Machine-Learning Interactive Site
This project consists of 3 parts:
- The Frontend - an interactive site where users can draw a digit, send off their drawing to the backend, and view the results of running their drawing through various model architectures.
- The Models - the various PyTorch models and pipelines for their training
- The Backend - a simple API server that receives drawings, runs them through each model, and sends the results back to the client


## TODO - Project Plan
- Frontend
    - Simple page for drawing a digit
    - convert drawing to json or other format
    - send off to backend for inference
    - display results/performance for each model in pretty chart
- Models
    - various model architectures for MNIST-style inputs
- Backend
    - Go server
    - receives drawings from clients and runs through each model
    - sends results back to client for viewing