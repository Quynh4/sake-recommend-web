# Dockerfile tối ưu cho ML Service - Build nhanh hơn
# Sử dụng Python base và cài PyTorch CPU-only qua pip

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies s
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip
RUN pip install --no-cache-dir --upgrade pip

# Copy requirements
COPY requirements-fast.txt requirements.txt

# Install Python dependencies (nhanh hơn với PyTorch CPU-only)
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Run the application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
