from flask import Flask, render_template, request, jsonify
import cv2
import numpy as np
from ultralytics import YOLO

app = Flask(__name__)

# ================= LOAD MODEL =================
model = YOLO("best.pt")

# ================= CLASS NAME DARI MODEL =================
CLASS_NAMES = model.names  # otomatis dari model

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/detect", methods=["POST"])
def detect():
    if "image" not in request.files:
        return jsonify({"error": "No image"}), 400

    file = request.files["image"]

    # decode image
    img_bytes = np.frombuffer(file.read(), np.uint8)
    frame = cv2.imdecode(img_bytes, cv2.IMREAD_COLOR)

    if frame is None:
        return jsonify({"error": "Invalid image"}), 400

    # 🔥 INFERENSI DENGAN IMG SIZE 640
    results = model(
        frame,
        imgsz=640,      # sesuai training
        conf=0.15,
        verbose=False
    )[0]

    detections = []

    if results.boxes is not None:
        for box in results.boxes:
            cls_id = int(box.cls[0])
            label = CLASS_NAMES[cls_id]
            conf = float(box.conf[0])

            x1, y1, x2, y2 = map(int, box.xyxy[0])

            detections.append({
                "label": label,
                "confidence": round(conf, 2),
                "bbox": [x1, y1, x2, y2]
            })

    return jsonify({
        "detections": detections,
        "total": len(detections),
        "jenis": detections[0]["label"] if detections else "-",
        "confidence": detections[0]["confidence"] if detections else "-"
    })

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )
