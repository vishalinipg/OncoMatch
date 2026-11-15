import os
import sys
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Ensure proper paths
backend_dir = Path(__file__).resolve().parent
root_dir = backend_dir.parent
sys.path.insert(0, str(backend_dir))
sys.path.insert(0, str(root_dir / "ml"))
sys.path.insert(0, str(root_dir))

from routes.predict_routes import router as predict_router
from routes.sample_routes import router as sample_router
from routes.analytics_routes import router as analytics_router
from routes.report_routes import router as report_router

app = FastAPI(
    title="OncoMatch API",
    description="Personalized Chemotherapy Drug Response Prediction in Cancer Treatments",
    version="1.0.0"
)

# Enable CORS for local Vite dev and public domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(predict_router)
app.include_router(sample_router)
app.include_router(analytics_router)
app.include_router(report_router)

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "OncoMatch API",
        "version": "1.0.0",
        "dataset": "GDSC2 (242,036 fitted dose-response curves)",
        "model": "HistGradientBoostingRegressor (tuned production refit)"
    }

# Mount static frontend build if present
frontend_dist = root_dir / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't intercept API routes
        if full_path.startswith("api/"):
            return None
        file_path = frontend_dist / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(frontend_dist / "index.html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
