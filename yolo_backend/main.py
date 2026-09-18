from fastapi import FastAPI, File, UploadFile, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from ultralytics import YOLO
import os
import time
import re
import shutil
import cv2
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="UrbanPulse YOLO Waste Detection API")

# Configure CORS origins
raw_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5000,http://127.0.0.1:5000"
)
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    raw_origins += f",{frontend_url}"

allowed_origins = [origin.strip().rstrip("/") for origin in raw_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Serve the uploads folder so the frontend can view images
app.mount("/uploads", StaticFiles(directory="uploads", html=True), name="uploads")

# Load model if weight file exists, or fallback gracefully
model_path = os.getenv("MODEL_PATH", "weights/my_model.pt")
model = None
if os.path.exists(model_path):
    try:
        model = YOLO(model_path)
    except Exception as e:
        print(f"Warning: Could not load model from {model_path}: {e}")
else:
    print(f"Warning: Model weight file not found at {model_path}")

@app.get("/")
async def root():
    return {"status": "success", "message": "YOLO Waste Detection API is running!"}

@app.post("/scan")
async def scan_image(request: Request, file: UploadFile = File(...)):
    # 1. Save the uploaded file locally with safe filename
    raw_name = os.path.splitext(file.filename)[0]
    safe_name = re.sub(r'[^a-zA-Z0-9_-]', '_', raw_name)[:40] or "upload"
    timestamp = int(time.time() * 1000)
    input_filename = f"raw_{timestamp}_{safe_name}.jpg"
    file_path = os.path.join(UPLOAD_DIR, input_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    print(f"Uploaded file saved at: {file_path}")

    # Fallback if model is not loaded
    if model is None:
        public_base_url = os.getenv("YOLO_PUBLIC_URL", str(request.base_url).rstrip("/"))
        image_url = f"{public_base_url}/uploads/{input_filename}"
        return JSONResponse({
            "status": "success",
            "message": "Model weight not found, returned original image.",
            "image_url": image_url,
            "detections": [],
            "count": 0
        })

    # 2. Run Inference using YOLO (conf=0.25 standard threshold)
    results = model(file_path, conf=0.25, iou=0.5, augment=True)
    result = results[0]  # Get the first result

    # 3. Check if any objects/garbage were detected
    if len(result.boxes) == 0:
        return JSONResponse({
            "status": "failed",
            "message": "No garbage detected.",
            "objects_detected": False,
            "detections": [],
            "count": 0
        }, status_code=200)

    # 4. Extract structured detection results
    detections = []
    for box in result.boxes:
        cls_id = int(box.cls[0].item())
        cls_name = result.names.get(cls_id, str(cls_id))
        conf = float(box.conf[0].item())
        xyxy = [round(float(coord), 1) for coord in box.xyxy[0].tolist()]
        detections.append({
            "class": cls_name,
            "confidence": round(conf, 3),
            "bbox": xyxy
        })

    # 5. Annotate the image with detected boxes and labels  
    annotated_image = result.plot()

    # 6. Save the annotated image with unique filename
    marked_filename = f"marked_{timestamp}_{safe_name}.jpg"
    marked_path = os.path.join(UPLOAD_DIR, marked_filename)
    cv2.imwrite(marked_path, annotated_image)

    # 7. Generate the URL dynamically to send back to frontend
    public_base_url = os.getenv("YOLO_PUBLIC_URL", str(request.base_url).rstrip("/"))
    image_url = f"{public_base_url}/uploads/{marked_filename}"

    return JSONResponse({
        "status": "success",
        "message": "Objects detected.",
        "image_url": image_url,
        "detections": detections,
        "count": len(detections)
    })