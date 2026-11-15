# Multi-stage zero-cost Dockerfile for OncoMatch
# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Python Runtime & Production Server
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies for pymupdf and scientific computing
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend, ML artifacts, and featurizer
COPY backend/ /app/backend/
COPY ml/ /app/ml/
COPY tests/ /app/tests/

# Copy built frontend assets from stage 1
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Set Python path
ENV PYTHONPATH=/app:/app/backend:/app/ml
ENV PORT=7860

EXPOSE 7860

# Run automated tests at build time to guarantee production stability
RUN pytest /app/tests -v

# Start FastAPI serving both API and React SPA
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT}"]
