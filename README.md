# 💊 MedSecure - Intelligent Medicine Quality & Inventory Management

**MedSecure** is a comprehensive web application powered by cutting-edge AI (YOLOv8 + GenAI) and built on a secure NodeJS/FastAPI backend. It’s designed to ensure the safety of pharmaceutical products via visual damage inspection, intelligent medicine purpose discovery, and automated inventory data extraction directly from packaging.

---

## 🚀 Features

### 🔍 Real-Time Visual Damage Inspection
- Ensure medicine safety before consumption or restocking.
- Detects broken strips, faded labels, and suspicious packaging automatically using YOLOv8.
- Analyzes results and delivers an expert verdict (✅ **Acceptable** | ❌ **Not Acceptable**) powered by **Gemini 2.5 Flash**.

### 💡 Purpose Discovery & Safety Warnings
- Upload an image of a medicine package to automatically identify the medicine name and find out its **Primary Purpose**.
- Extracts critical **Usage Instructions** and **Safety Warnings** instantly.

### 📦 Smart Inventory Extraction (Adding Medicines)
- Automate manual data entry when onboarding new medicines.
- Upload packaging photos to accurately extract structured details:
  - Medicine Name & Manufacturer
  - **Batch Number** & **Expiry Date**
  - Quantity & Price

### 📊 Comprehensive Dashboard & Reporting
- Maintain organized records of your medicine inventory.
- Track real-time inspection outcomes with timestamped logs.
- Generate and download PDF reports directly from the UI.

### 🔐 Secure User Authentication
- Complete Login and Registration flow.
- Fast and secure user management powered by Node.js, Express, and MySQL (Sequelize).

---

## 🛠 Tech Stack

- **Frontend**: React.js, Vite, TailwindCSS, Recharts
- **AI/ML Backend (Python)**: FastAPI, YOLOv8, Tesseract OCR, Google Generative AI (Gemini 2.5 Flash), OpenCV
- **Authentication & Database Backend (Node.js)**: Node.js, Express, Sequelize, MySQL
- **Other Tools**: JWT Auth, jsPDF (PDF reports)

---

## 🔧 Local Setup

### Prerequisites
- Node.js & npm
- Python 3.9+
- Tesseract OCR installed locally (`C:\Program Files\Tesseract-OCR\tesseract.exe`)
- MySQL database server running
- API Keys setup in respective `.env` files (e.g., `GOOGLE_API_KEY`)

### Clone & Run

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/Med_Mitra.git
cd Med_Mitra

# 2. Start Auth Backend (Node.js)
cd backend/node
npm install
npm run dev

# 3. Start AI/ML Backend (FastAPI Python)
cd ../python
pip install -r requirements.txt
uvicorn main:app --reload

# 4. Start Frontend (React/Vite)
cd ../../frontend
npm install
npm run dev
```
