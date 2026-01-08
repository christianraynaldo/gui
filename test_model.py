from ultralytics import YOLO
import cv2

model = YOLO("best.pt")

# 1️⃣ CEK CLASS MODEL
print("CLASS MODEL:")
print(model.names)

# 2️⃣ TEST 1 GAMBAR
img = cv2.imread("contoh.jpg")  # ganti dengan gambar laut
results = model(img, conf=0.1)[0]

print("\nHASIL DETEKSI:")
for box in results.boxes:
    cls_id = int(box.cls[0])
    conf = float(box.conf[0])
    label = model.names[cls_id]

    print(f"{label} | confidence: {conf:.2f}")
