# Dashboard Deteksi Sampah Bawah Laut

Aplikasi GUI berbasis Python untuk menampilkan kamera smartphone
dan mendeteksi objek sampah bawah laut menggunakan algoritma YOLOv11n.
Pada tahap ini, aplikasi masih menggunakan simulasi deteksi
karena model belum diintegrasikan.

## Fitur
- Tampilan kamera iPhone (DroidCam)
- Dashboard GUI berbasis Tkinter
- Simulasi bounding box deteksi
- Tampilan FPS dan status kamera

## Cara Menjalankan
1. Hubungkan iPhone ke laptop menggunakan DroidCam
2. Pastikan kamera sudah terdeteksi sebagai webcam
3. Masuk ke folder aplikasi
4. Jalankan perintah:
   python app.py

## Teknologi
- Python
- OpenCV
- Tkinter
- Pillow
- DroidCam
- YOLOv11n (akan diintegrasikan)

## Catatan
File model YOLOv11n (`best.pt`) akan ditambahkan pada tahap integrasi model.
