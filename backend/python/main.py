# main.py
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pytesseract
import base64, os, json, cv2, re
from io import BytesIO
from PIL import Image
import numpy as np
from datetime import datetime
from dotenv import load_dotenv
from ultralytics import YOLO
from google import genai
from google.genai import types
from fastapi import File, UploadFile

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
load_dotenv()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Load models
yolo_model = YOLO("yolov8n.pt")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
client = genai.Client(api_key=GOOGLE_API_KEY)





LOG_FILE = "inspection_log.json"


def is_image_clear(image_cv, threshold=120.0):
    gray = cv2.cvtColor(image_cv, cv2.COLOR_BGR2GRAY)
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    return laplacian_var > threshold


def run_ocr(img_cv):
    gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
    gray = cv2.resize(gray, None, fx=2, fy=2, interpolation=cv2.INTER_LINEAR)
    _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    denoised = cv2.fastNlMeansDenoising(thresh, h=30)
    ocr_text = pytesseract.image_to_string(denoised)

    expiry_match = re.search(r'(EXP|Exp|exp|Expiry)[^\d]*(\d{2}[/-]\d{2,4})', ocr_text)
    batch_match = re.search(r'(Batch|BATCH|batch)[^\d]*(\w+)', ocr_text)

    expiry = expiry_match.group(2) if expiry_match else "Not found"
    batch = batch_match.group(2) if batch_match else "Not found"
    return expiry, batch


def run_yolo(image_np):
    results = yolo_model.predict(image_np)
    detections = []
    for r in results:
        for c in r.boxes.cls:
            detections.append(yolo_model.names[int(c)])
    return detections if detections else ["No damage detected"]


def generate_gemini_comment(image_pil, expiry, batch, yolo_detections):
    try:
        prompt = f"""
You are an expert medicine quality inspector.

Extracted details from image (OCR/YOLO):
- OCR Expiry Date: {expiry}
- OCR Batch Number: {batch}
- Visual Detections: {', '.join(yolo_detections)}

TASK:
1. Identify the product: Start your response by identifying what the item in the image is (e.g., "This is a medicine strip of Paracetamol", "This is an apple", etc.).
   - Header: **Product Identification**: [Your identification here]

2. Categorize and Act:
   - **If the product IS NOT a medicine or pharmaceutical item**:
     - Immediately follow with: **"⚠️ WARNING: This item is NOT a medical product."**
     - Add: **"DO NOT CONSUME OR USE THIS ITEM AS MEDICINE."**
     - Do not provide an inspection summary.

   - **If the product IS a medicine or pharmaceutical item**:
     - Provide a **Detailed Inspection Report**:
       - **Damage Detected**: (Yes/No based on visual inspection)
       - **OCR Expiry Status**: {expiry}
       - **OCR Batch Status**: {batch}
       - **Overall Verdict**: (Acceptable / Unacceptable / Needs Return)
     
     - Provide a professional, point-wise explanation of the condition (packaging integrity, label clarity, signs of physical damage).
     - Use **bold** for critical points and *italics* for emphasis.
"""

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[prompt, image_pil]
        )


        return response.text.strip()

    except Exception as e:
        return f"Error from Gemini: {str(e)}"


def log_inspection(data):
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        **data
    }
    if os.path.exists(LOG_FILE):
        with open(LOG_FILE, "r+") as file:
            try:
                existing = json.load(file)
            except json.JSONDecodeError:
                existing = []
            existing.append(log_entry)
            file.seek(0)
            json.dump(existing, file, indent=2)
    else:
        with open(LOG_FILE, "w") as file:
            json.dump([log_entry], file, indent=2)


class ImagePayload(BaseModel):
    image: str

    class Config:
        extra = "allow"



@app.post("/analyze")
async def analyze_image(payload: dict):  # Accept raw JSON as dict
    image_data_str = payload.get("image", "")
    print("Received raw payload:", image_data_str[:100])

    if not image_data_str or "," not in image_data_str:
        return JSONResponse(content={"error": "Invalid image data"}, status_code=400)

    try:
        image_data = base64.b64decode(image_data_str.split(",")[1])
        image_pil = Image.open(BytesIO(image_data)).convert("RGB")
        img_np = np.array(image_pil)
        img_cv = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)

        #if not is_image_clear(img_cv):
        #    return JSONResponse(content={"error": "Image not clear enough"}, status_code=422)

        expiry, batch = run_ocr(img_cv)
        detections = run_yolo(img_np)
        commentary = generate_gemini_comment(image_pil, expiry, batch, detections)

        inspection_data = {
            "commentary": commentary
        }

        log_inspection(inspection_data)
        return inspection_data

    except Exception as e:
        return JSONResponse(content={"error": f"Processing failed: {str(e)}"}, status_code=500)


@app.get("/log")
def get_logs():
    if os.path.exists(LOG_FILE):
        with open(LOG_FILE, "r") as file:
            try:
                return json.load(file)
            except json.JSONDecodeError:
                return []
    return []


@app.post("/explain-purpose")
async def explain_purpose(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image_pil = Image.open(BytesIO(contents)).convert("RGB")
        
        prompt = """
        You are a medical pharmacology assistant. 
        Analyze this medicine packaging image and provide:
        1. **Medicine Name**: (Official name)
        2. **Primary Purpose**: (What this medicine is used for)
        3. **Usage Instructions**: (Standard dosage/usage guidelines commonly found on the pack)
        4. **Safety Warnings**: (Critical warning labels present, e.g., 'Do not drive', 'Take with food')
        
        Keep the response professional, concise, and structured with Markdown headers and bullet points. 
        If it's NOT a medicine, state that clearly and do not provide medical advice.
        """
        
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[prompt, image_pil]
            )
            return {"purpose": response.text.strip()}
        except Exception as e:
            return {"error": f"Gemini API failure: {str(e)}"}
            
    except Exception as e:
        return {"error": f"Image processing failed: {str(e)}"}

@app.post("/extract-fields")
async def extract_fields(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image_pil = Image.open(BytesIO(contents)).convert("RGB")
        
        prompt = """
        Extract the following information from this medicine packaging image and return it ONLY as a valid JSON object:
        {
            "name": "Exact name of the medicine",
            "manufacturer": "Company name",
            "batch_number": "Batch ID",
            "expiry_date": "YYYY-MM-DD",
            "price": 10.50,
            "quantity": 10
        }
        If a field is not found, use null. Be precise.
        """
        
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash",
            contents=[prompt, image_pil]
        )
            print(f"Gemini raw response: {response.text}")
        except Exception as e:
            print(f"Gemini API Error: {e}")
            return {"error": f"API Call Failed: {str(e)}"}
            
        raw_text = response.text.strip()
        # Extract JSON from markdown if exists
        json_match = re.search(r'\{.*\}', raw_text, re.DOTALL)
        if json_match:
            raw_text = json_match.group(0)
            
        try:
            return json.loads(raw_text)
        except json.JSONDecodeError as e:
            print(f"JSON Parse Error: {e} | Raw: {raw_text}")
            return {"error": f"Invalid AI Output Format: {str(e)}"}
    except Exception as e:
        print(f"Extraction error: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)