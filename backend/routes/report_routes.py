from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from typing import Optional, List, Dict, Any

try:
    from schemas.schemas import GenerateReportRequest
    from services.report_service import ReportService
except ImportError:
    from ..schemas.schemas import GenerateReportRequest
    from ..services.report_service import ReportService

router = APIRouter(prefix="/api/reports", tags=["Reports"])
report_service = ReportService()

@router.get("/history")
def get_report_history():
    """Retrieve history of previously generated PDF/CSV reports."""
    return report_service.list_reports()

@router.post("/generate")
def generate_report(req: GenerateReportRequest):
    """Generate a downloadable PDF and CSV report for a given cancer sample."""
    try:
        record = report_service.generate_pdf_report(req.sample_id, req.tissue)
        return record
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation error: {str(e)}")

@router.get("/download/{filename}")
def download_report(filename: str):
    """Download a generated PDF or CSV file."""
    file_path = report_service.get_report_file_path(filename)
    if not file_path:
        raise HTTPException(status_code=404, detail="Requested report file not found.")

    media_type = "application/pdf" if filename.lower().endswith(".pdf") else "text/csv"
    return FileResponse(
        path=file_path,
        media_type=media_type,
        filename=filename
    )
