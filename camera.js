let stream = null;
let detectInterval = null;
let lastTime = performance.now();

// ===== ELEMENT CAMERA =====
const video = document.getElementById("video");
const overlay = document.getElementById("overlay");
const ctx = overlay.getContext("2d");

// ===== ELEMENT UPLOAD =====
const uploadCanvas = document.getElementById("uploadCanvas");
const uploadCtx = uploadCanvas.getContext("2d");
const imageInput = document.getElementById("imageInput");
const clearBtn = document.getElementById("clearImage");

// ================= START CAMERA =================
async function startCamera() {
    if (stream) return;

    stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false
    });

    video.srcObject = stream;

    video.onloadedmetadata = () => {
        video.play();

        overlay.width = video.videoWidth;
        overlay.height = video.videoHeight;

        detectInterval = setInterval(sendFrame, 700);
    };
}

// ================= STOP CAMERA =================
function stopCamera() {
    if (detectInterval) clearInterval(detectInterval);
    detectInterval = null;

    if (stream) {
        stream.getTracks().forEach(t => t.stop());
        stream = null;
    }

    ctx.clearRect(0, 0, overlay.width, overlay.height);
}

// ================= SEND FRAME =================
function sendFrame() {
    if (!video.videoWidth) return;

    const now = performance.now();
    document.getElementById("fps").innerText =
        Math.round(1000 / (now - lastTime));
    lastTime = now;

    const capture = document.createElement("canvas");
    capture.width = video.videoWidth;
    capture.height = video.videoHeight;
    capture.getContext("2d").drawImage(video, 0, 0);

    capture.toBlob(blob => {
        const form = new FormData();
        form.append("image", blob, "frame.jpg");

        fetch("/detect", { method: "POST", body: form })
            .then(r => r.json())
            .then(data => {
                updateStats(data);
                drawBoxes(data.detections);
            });
    }, "image/jpeg", 0.8);
}

// ================= DRAW CAMERA BOX =================
function drawBoxes(detections) {
    ctx.clearRect(0, 0, overlay.width, overlay.height);

    ctx.strokeStyle = "lime";
    ctx.lineWidth = 3;
    ctx.fillStyle = "lime";
    ctx.font = "16px Arial";

    detections.forEach(d => {
        const [x1, y1, x2, y2] = d.bbox;
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
        ctx.fillText(
            `${d.label} (${d.confidence})`,
            x1,
            y1 > 20 ? y1 - 5 : y1 + 20
        );
    });
}

// ================= UPDATE STATS =================
function updateStats(data) {
    document.getElementById("total").innerText = data.total;
    document.getElementById("jenis").innerText = data.jenis;
    document.getElementById("conf").innerText = data.confidence;
}

// ================= UPLOAD IMAGE =================
document.getElementById("uploadForm").addEventListener("submit", e => {
    e.preventDefault();

    const file = imageInput.files[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
        uploadCanvas.width = img.width;
        uploadCanvas.height = img.height;
        uploadCtx.clearRect(0, 0, uploadCanvas.width, uploadCanvas.height);
        uploadCtx.drawImage(img, 0, 0);

        clearBtn.style.display = "inline-block"; // tampilkan ❌
    };
    img.src = URL.createObjectURL(file);

    const form = new FormData();
    form.append("image", file);

    fetch("/detect", { method: "POST", body: form })
        .then(r => r.json())
        .then(data => {
            drawUploadBoxes(data.detections);
        });
});

// ================= DRAW UPLOAD BOX =================
function drawUploadBoxes(detections) {
    uploadCtx.strokeStyle = "red";
    uploadCtx.lineWidth = 3;
    uploadCtx.fillStyle = "red";
    uploadCtx.font = "16px Arial";

    detections.forEach(d => {
        const [x1, y1, x2, y2] = d.bbox;
        uploadCtx.strokeRect(x1, y1, x2 - x1, y2 - y1);
        uploadCtx.fillText(
            `${d.label} (${d.confidence})`,
            x1,
            y1 > 20 ? y1 - 5 : y1 + 20
        );
    });
}

// ================= CLEAR UPLOAD IMAGE =================
clearBtn.addEventListener("click", () => {
    uploadCtx.clearRect(0, 0, uploadCanvas.width, uploadCanvas.height);
    uploadCanvas.width = 0;
    uploadCanvas.height = 0;
    imageInput.value = "";
    clearBtn.style.display = "none";
});
