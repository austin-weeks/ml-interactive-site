from flask import Flask, jsonify, request
from flask_cors import CORS
import inference

app = Flask(__name__)
CORS(app)


@app.route("/models/<string:model_name>", methods=["POST"])
def perform_inference(model_name):
    infer_fn = None
    if model_name == "Basic Neural Net":
        infer_fn = inference.get_basic_model_inference
    elif model_name == "LeNet-5":
        infer_fn = inference.get_lenet_5_inference
    elif model_name == "Advanced CNN":
        infer_fn = inference.get_advanced_cnn_inference
    else:
        return jsonify({"error": f"Invalid model name: {model_name} not found"}), 400


    data = request.json
    if not data or "image_data" not in data:
        return jsonify({"error": "Missing image_data from request body"}), 400
    img_data = data["image_data"]
    if type(img_data) != list:
        return jsonify({"error": "Invalid image_data type -> should be a float array"}), 400

    return jsonify(infer_fn(img_data))


if __name__ == "__main__":
    # DEV MODE ONLY
    app.run(debug=True, port=8080)