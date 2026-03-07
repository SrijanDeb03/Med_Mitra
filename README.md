# 💊 Medicine-Quality-Inspection-Web-App-using-YOLOv8-GenAI

**MedSecure** is a cutting-edge web application that uses AI and computer vision to **inspect the quality of medicines in real-time** using your webcam. This tool helps users ensure the safety of pharmaceutical products by checking for **physical damage, expiry dates, and packaging authenticity** — all in one click.

---

## 🚀 Features

🔍 **Real-Time Visual Inspection**  
Detects broken strips, faded labels, and suspicious packaging using YOLOv8.

📅 **Expiry & Batch Detection**  
Extracts expiry and batch information from packaging using advanced OCR.

🧠 **GenAI Commentary (GPT-4 Vision)**  
Provides human-like analysis of the medicine's condition, including a summary verdict:  
✅ Acceptable | ❌ Not Acceptable

📷 **Webcam Integration**  
Capture images directly from your webcam — supports both manual and auto capture.

🧾 **Inspection Logs**  
Keep track of previous inspections with timestamped reports.

---

## 📸 Live Demo

> Coming Soon... 🔗 *(Optional: Link to a hosted version or video demo)*

---

## 🛠 Tech Stack

- **Frontend**: React.js + TailwindCSS + Vite
- **Backend**: FastAPI (Python)
- **AI Models**:  
  - YOLOv8 (damage detection)  
  - Tesseract OCR (expiry & batch)  
  - GPT-4 Vision / Gemini Pro (GenAI reasoning)

---

## 🔧 Local Setup

### Prerequisites
- Node.js & npm
- Python 3.9+
- OpenCV, Ultralytics, Tesseract
- (Optional) GPT-4V API access

### Clone & Run

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/medsecure.git
cd medsecure

# 2. Start backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# 3. Start frontend
cd ../frontend
npm install
npm run dev
