# Performance Measurement Tools

This directory contains scripts to measure and visualize the core inference times and CPU usage of the main inspection pipeline components (OCR, YOLOv8, and Gemini API).

## Prerequisites

Ensure you have your python virtual environment activated and the backend dependencies installed.
Additionally, you need to install the following packages for benchmarking and plotting:

```bash
cd backend/python
pip install matplotlib psutil
```

## Running the Benchmark

The `benchmark.py` script mimics the primary pipeline and records execution time and CPU usage for OCR, YOLO, and Gemini.

### Usage

```bash
cd backend/python
python performance_tests/benchmark.py --image path/to/your/test_image.jpg
```

**What it does:**
1. Loads the specified image.
2. Runs the OCR pipeline and measures time/CPU.
3. Runs YOLOv8 inference and records time/CPU.
4. Generates a Gemini commentary and records time/CPU.
5. Saves all metrics to `backend/python/performance_tests/performance_results.json`.

*(You can run this multiple times on different images, and the results will be appended to the JSON array.)*

## Plotting the Results

Once you have run the benchmark on one or more images, you can generate visualizations.

### Usage

```bash
cd backend/python
python performance_tests/plot_results.py
```

**What it does:**
1. Reads `performance_results.json`.
2. Calculates average inference times and CPU usage.
3. Saves `inference_times_plot.png` and `cpu_usage_plot.png` to this folder.
4. Opens an interactive `matplotlib` window displaying the charts.
