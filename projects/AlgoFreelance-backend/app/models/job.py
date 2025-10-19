# In backend/app/models/job.py
from pydantic import BaseModel
from typing import List, Optional

# From PRD Section 8: POST /api/v1/jobs/create
class JobCreateRequest(BaseModel):
    client_address: str
    freelancer_address: str
    escrow_amount: int  # in microALGOs
    job_title: str
    job_description: str # This was in your PRD's example

# Response for the create endpoint
class JobCreateResponse(BaseModel):
    success: bool = True
    app_id: int
    app_address: str
    funding_amount: int # escrow + min balance
    txn_id: str
    explorer_url: str

# From PRD Section 8: GET /api/v1/jobs/{app_id}
class JobDetailsResponse(BaseModel):
    app_id: int
    client_address: str
    freelancer_address: str
    escrow_amount: int
    job_status: int
    job_title: str
    work_hash: Optional[str] = None
    created_at: int
    is_funded: bool

# From PRD Section 8: GET /api/v1/freelancers/{address}/nfts
class Certificate(BaseModel):
    asset_id: int
    asset_name: str
    job_title: str
    ipfs_url: str
    client_address: str
    completed_at: int
    block_explorer: str

class PortfolioResponse(BaseModel):
    freelancer_address: str
    total_jobs: int
    certificates: List[Certificate]
    
# From PRD Section 8: POST /api/v1/ipfs/upload
class IPFSUploadResponse(BaseModel):
    success: bool = True
    ipfs_hash: str
    ipfs_url: str
    gateway_url: str