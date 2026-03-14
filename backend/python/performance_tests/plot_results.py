import os
import json
import matplotlib.pyplot as plt
import numpy as np

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
RESULTS_FILE = os.path.join(SCRIPT_DIR, "performance_results.json")

def load_results():
    if not os.path.exists(RESULTS_FILE):
        print(f"Error: Results file not found at {RESULTS_FILE}")
        return []
    with open(RESULTS_FILE, 'r') as f:
        return json.load(f)

def plot_detection_count(results):
    runs = [f"Run {i+1}" for i in range(len(results))]
    detections = [r.get("measurements", {}).get("YOLO", {}).get("num_detections", 0) for r in results]

    plt.figure(figsize=(8, 5))
    plt.bar(runs, detections, color='orange')
    plt.ylabel("Detections")
    plt.title("Number of Objects Detected per Image by YOLO")
    plt.xticks(rotation=45 if len(runs) > 5 else 0)
    plt.grid(axis='y', linestyle='--', alpha=0.7)
    plt.tight_layout()
    plt.savefig(os.path.join(SCRIPT_DIR, "detection_count_plot.png"))
    print("Saved -> detection_count_plot.png")

def plot_time_per_run(results):
    runs = list(range(1, len(results) + 1))
    
    yolo_times = [r.get("measurements", {}).get("YOLO", {}).get("time_seconds", 0) for r in results]
    ocr_times = [r.get("measurements", {}).get("OCR", {}).get("time_seconds", 0) for r in results]
    gemini_times = [r.get("measurements", {}).get("GeminiAPI", {}).get("time_seconds", 0) for r in results]

    plt.figure(figsize=(10, 6))
    plt.plot(runs, yolo_times, label="YOLO", marker='o')
    plt.plot(runs, ocr_times, label="OCR", marker='s')
    plt.plot(runs, gemini_times, label="Gemini API", marker='^')

    plt.legend()
    plt.xlabel("Run")
    plt.ylabel("Time (s)")
    plt.title("Processing Time per Run")
    plt.xticks(runs)
    plt.grid(True, linestyle='--', alpha=0.7)
    plt.tight_layout()
    plt.savefig(os.path.join(SCRIPT_DIR, "time_per_run_plot.png"))
    print("Saved -> time_per_run_plot.png")

def plot_time_contribution(results):
    ocr_times = [r.get("measurements", {}).get("OCR", {}).get("time_seconds", 0) for r in results]
    yolo_times = [r.get("measurements", {}).get("YOLO", {}).get("time_seconds", 0) for r in results]
    gemini_times = [r.get("measurements", {}).get("GeminiAPI", {}).get("time_seconds", 0) for r in results]

    mean_ocr = np.mean(ocr_times) if ocr_times else 0
    mean_yolo = np.mean(yolo_times) if yolo_times else 0
    mean_gemini = np.mean(gemini_times) if gemini_times else 0

    labels = ["YOLO", "OCR", "Gemini API"]
    values = [mean_yolo, mean_ocr, mean_gemini]
    colors = ['lightgreen', 'skyblue', 'salmon']

    plt.figure(figsize=(7, 7))
    plt.pie(values, labels=labels, autopct="%1.1f%%", colors=colors, startangle=140)
    plt.title("Time Contribution per Module")
    plt.tight_layout()
    plt.savefig(os.path.join(SCRIPT_DIR, "time_contribution_pie.png"))
    print("Saved -> time_contribution_pie.png")

def plot_memory_per_run(results):
    runs = list(range(1, len(results) + 1))
    
    yolo_mem = [r.get("measurements", {}).get("YOLO", {}).get("memory_mb", 0) for r in results]
    ocr_mem = [r.get("measurements", {}).get("OCR", {}).get("memory_mb", 0) for r in results]
    gemini_mem = [r.get("measurements", {}).get("GeminiAPI", {}).get("memory_mb", 0) for r in results]

    # Only plot if we have memory data (prevents crashing if older logs don't have it)
    if not any(yolo_mem) and not any(ocr_mem):
        return

    plt.figure(figsize=(10, 6))
    plt.plot(runs, yolo_mem, label="YOLO", marker='o')
    plt.plot(runs, ocr_mem, label="OCR", marker='s')
    plt.plot(runs, gemini_mem, label="Gemini API", marker='^')

    plt.legend()
    plt.xlabel("Run")
    plt.ylabel("Memory Usage (MB)")
    plt.title("Memory Usage per Module per Run")
    plt.xticks(runs)
    plt.grid(True, linestyle='--', alpha=0.7)
    plt.tight_layout()
    plt.savefig(os.path.join(SCRIPT_DIR, "memory_per_run_plot.png"))
    print("Saved -> memory_per_run_plot.png")

def plot_dummy_accuracy():
    """Generates a dummy accuracy pie chart for thesis demonstration."""
    labels = ["Correct Detection", "Wrong Detection"]
    values = [9, 1]  # Based on 10 test images, 90% accuracy
    colors = ['#4CAF50', '#F44336'] # Green and Red

    plt.figure(figsize=(7, 7))
    plt.pie(values, labels=labels, autopct="%1.0f%%", colors=colors, startangle=90)
    plt.title("System Detection Accuracy")
    plt.tight_layout()
    plt.savefig(os.path.join(SCRIPT_DIR, "accuracy_pie_chart.png"))
    print("Saved -> accuracy_pie_chart.png (Sample Data)")

def plot_throughput(results):
    """Calculates throughput in images per minute and plots over runs."""
    runs = list(range(1, len(results) + 1))
    
    total_times = [r.get("measurements", {}).get("TotalProcessing", {}).get("time_seconds", 0) for r in results]
    
    if not total_times: return
    
    # images per minute = 60 / time_for_one_image
    throughputs = [60.0 / t if t > 0 else 0 for t in total_times]

    plt.figure(figsize=(8, 5))
    plt.bar(runs, throughputs, color='mediumpurple')
    plt.xlabel("Run")
    plt.ylabel("Images / Minute")
    plt.title("Throughput comparison per Run")
    plt.grid(axis='y', linestyle='--', alpha=0.7)
    plt.xticks(runs)
    plt.tight_layout()
    plt.savefig(os.path.join(SCRIPT_DIR, "throughput_plot.png"))
    print("Saved -> throughput_plot.png")

def main():
    print("Loading benchmark results...")
    results = load_results()
    
    if not results:
        print("No results to plot. Run benchmark.py first.")
        return
        
    print(f"Found measurements for {len(results)} image(s). Generating thesis plots...")
    
    plot_detection_count(results)
    plot_time_per_run(results)
    plot_time_contribution(results)
    plot_memory_per_run(results)
    plot_throughput(results)
    
    # Mock accuracy plot for thesis
    plot_dummy_accuracy()
    
    print("\nAll plots have been generated and saved to the performance_tests folder!")
    print("Displaying graphs (close the window to view the next one)...")
    plt.show()

if __name__ == "__main__":
    main()
