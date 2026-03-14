import os
import time
import json
import argparse
import psutil
import cv2
import numpy as np
from PIL import Image
from dotenv import load_dotenv

import pytesseract
from ultralytics import YOLO
from google import genai

# Setup paths based on project structure
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(SCRIPT_DIR)

# Tesseract path matching main.py
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# Load environment variables from backend/python/.env
load_dotenv(os.path.join(BACKEND_DIR, '.env'))
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Initialize models
try:
    print("Loading models...")
    yolo_model = YOLO(os.path.join(BACKEND_DIR, "yolov8n.pt"))
    client = genai.Client(api_key=GOOGLE_API_KEY)
    print("Models loaded successfully.")
except Exception as e:
    print(f"Error loading models: {e}")
    exit(1)

def run_ocr(img_cv):
    gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
    gray = cv2.resize(gray, None, fx=2, fy=2, interpolation=cv2.INTER_LINEAR)
    _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    denoised = cv2.fastNlMeansDenoising(thresh, h=30)
    ocr_text = pytesseract.image_to_string(denoised)
    # Simplified extraction for benchmark
    return "Dummy Expiry", "Dummy Batch"

def run_yolo(image_np):
    results = yolo_model.predict(image_np, verbose=False)
    detections = []
    for r in results:
        for c in r.boxes.cls:
            detections.append(yolo_model.names[int(c)])
    return detections if detections else ["No damage detected"]

def generate_gemini_comment(image_pil, expiry, batch, yolo_detections):
    prompt = f"""
    You are an expert medicine quality inspector.
    OCR Expiry: {expiry}
    OCR Batch: {batch}
    Detections: {', '.join(yolo_detections)}
    Please identify the product.
    """
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[prompt, image_pil]
        )
        return response.text.strip()
    except Exception as e:
        return f"Error from Gemini: {str(e)}"

def measure_execution(func, *args):
    """Measures execution time, CPU usage, and Memory usage of a function."""
    process = psutil.Process(os.getpid())
    # Reset CPU percentage
    process.cpu_percent(interval=None)
    
    start_time = time.time()
    result = func(*args)
    end_time = time.time()
    
    # Normalize CPU usage to 0-100% by dividing by number of logical cores
    cpu_usage = process.cpu_percent(interval=None) / psutil.cpu_count()
    memory_usage = process.memory_info().rss / (1024 * 1024) # Convert bytes to MB
    execution_time = end_time - start_time
    
    return result, execution_time, cpu_usage, memory_usage

def benchmark_image(image_path):
    print(f"\nBenchmarking image: {image_path}")
    
    if not os.path.exists(image_path):
        print("Image not found!")
        return None
        
    try:
        # Load image once
        image_pil = Image.open(image_path).convert("RGB")
        img_np = np.array(image_pil)
        img_cv = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
        
        results = {
            "image": os.path.basename(image_path),
            "measurements": {}
        }
        
        # Total start
        total_start = time.time()
        
        # 1. OCR
        print("Running OCR...")
        (expiry, batch), ocr_time, ocr_cpu, ocr_mem = measure_execution(run_ocr, img_cv)
        results["measurements"]["OCR"] = {"time_seconds": ocr_time, "cpu_percent": ocr_cpu, "memory_mb": ocr_mem}
        print(f"  -> Time: {ocr_time:.4f}s | CPU: {ocr_cpu:.1f}% | Memory: {ocr_mem:.1f}MB")

        # 2. YOLO
        print("Running YOLO...")
        detections, yolo_time, yolo_cpu, yolo_mem = measure_execution(run_yolo, img_np)
        
        # Filter out the placeholder to get a true detection count
        filtered_dets = [d for d in detections if d != "No damage detected"]
        num_dets = len(filtered_dets)

        results["measurements"]["YOLO"] = {
            "time_seconds": yolo_time, 
            "cpu_percent": yolo_cpu,
            "memory_mb": yolo_mem,
            "num_detections": num_dets
        }
        print(f"  -> Time: {yolo_time:.4f}s | CPU: {yolo_cpu:.1f}% | Memory: {yolo_mem:.1f}MB | Detections: {num_dets}")

        # 3. Gemini API
        print("Running Gemini API...")
        _, gemini_time, gemini_cpu, gemini_mem = measure_execution(generate_gemini_comment, image_pil, expiry, batch, detections)
        results["measurements"]["GeminiAPI"] = {"time_seconds": gemini_time, "cpu_percent": gemini_cpu, "memory_mb": gemini_mem}
        print(f"  -> Time: {gemini_time:.4f}s | CPU: {gemini_cpu:.1f}% | Memory: {gemini_mem:.1f}MB")
        
        # Total end
        total_time = time.time() - total_start
        results["measurements"]["TotalProcessing"] = {"time_seconds": total_time}
        print(f"\nTotal Processing Time: {total_time:.4f}s")
        
        return results

    except Exception as e:
        print(f"Error processing image {image_path}: {e}")
        return None

def main():
    parser = argparse.ArgumentParser(description="Benchmark YOLO, OCR, and Gemini inference times.")
    parser.add_argument("--image", required=True, help="Path to the test image")
    parser.add_argument("--output", default="performance_results.json", help="Output JSON file name")
    
    args = parser.parse_args()
    
    result = benchmark_image(args.image)
    
    if result:
        # Append to or create JSON file
        output_path = os.path.join(SCRIPT_DIR, args.output)
        data = []
        if os.path.exists(output_path):
            with open(output_path, 'r') as f:
                try:
                    data = json.load(f)
                except:
                    pass
        data.append(result)
        
        with open(output_path, 'w') as f:
            json.dump(data, f, indent=4)
        print(f"\nResults saved to {output_path}")

if __name__ == "__main__":
    main()
