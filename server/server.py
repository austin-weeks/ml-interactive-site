from flask import Flask, jsonify, request
from flask_cors import CORS
import inference

app = Flask(__name__)
CORS(app)


@app.route("/models", methods=["POST"])
def perform_inferences():
    data = request.json
    if not data or "image_data" not in data:
        return jsonify({"error": "Missing image_data from request body"}), 400
    img_data = data["image_data"]
    if type(img_data) != list:
        return jsonify({"error": "Invalid image_data type -> should be a float array"}), 400

    results = [
        inference.get_simple_inference(img_data)
    ]

    return jsonify({
        "results": results
    })


if __name__ == "__main__":
    # DEV MODE ONLY
    app.run(debug=True, port=8080)