from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field

class PredictRequest(BaseModel):
    drug_id: Optional[int] = Field(None, description="GDSC2 Drug ID")
    drug_name: Optional[str] = Field(None, description="GDSC2 Drug Name (e.g. Cisplatin)")
    tissue: str = Field("BRCA", description="TCGA tissue abbreviation (e.g. LUAD, BRCA)")
    min_conc: Optional[float] = Field(None, description="Minimum screening concentration in uM")
    max_conc: Optional[float] = Field(None, description="Maximum screening concentration in uM")

class BatchPredictRequest(BaseModel):
    tissue: str = Field("BRCA", description="Target TCGA tissue code")

class SampleCreateRequest(BaseModel):
    sample_id: Optional[str] = None
    name: str
    cell_line_name: Optional[str] = None
    cosmic_id: Optional[int] = None
    sample_type: str = "Established cancer cell line"
    cancer_type: Optional[str] = None
    cancer_subtype: Optional[str] = "Unspecified"
    tcga_desc: str = "BRCA"
    description: Optional[str] = ""
    research_project_id: Optional[str] = "PROJ-ONCO-01"
    expression: Dict[str, float] = Field(default_factory=dict)

class GenerateReportRequest(BaseModel):
    sample_id: str
    tissue: Optional[str] = None
    drug_id: Optional[int] = None
