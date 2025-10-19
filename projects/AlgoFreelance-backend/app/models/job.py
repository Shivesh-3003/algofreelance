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
    status_string: str  # Human-readable status
    job_title: str
    work_hash: Optional[str] = None
    created_at: int
    is_funded: bool
    contract_address: str  # Contract's Algorand address
    contract_balance: int  # Current balance in microALGOs

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
    size: Optional[int] = None

# Transaction Construction Models

class FundJobRequest(BaseModel):
    """Request to construct fund transaction"""
    client_address: str  # Address that will sign the funding transactions

class FundJobResponse(BaseModel):
    """Response containing unsigned grouped transactions for funding a job"""
    success: bool = True
    transactions: List[str]  # Base64-encoded unsigned transactions
    group_id: str  # Group ID for the atomic transaction group
    signer_address: str  # Address that should sign these transactions
    message: str = "Sign and send these grouped transactions to fund the contract"

class SubmitWorkRequest(BaseModel):
    """Request to construct submit work transaction"""
    ipfs_hash: str  # IPFS CID (46-59 characters)
    freelancer_address: str  # Address that will sign the transaction

class SubmitWorkResponse(BaseModel):
    """Response containing unsigned submit work transaction"""
    success: bool = True
    transaction: str  # Base64-encoded unsigned transaction
    signer_address: str  # Address that should sign this transaction
    message: str = "Sign and send this transaction to submit your work"

class ApproveWorkRequest(BaseModel):
    """Request to construct approve work transaction"""
    client_address: str  # Address that will sign the approval transaction

class ApproveWorkResponse(BaseModel):
    """Response containing unsigned approve work transaction"""
    success: bool = True
    transaction: str  # Base64-encoded unsigned transaction
    signer_address: str  # Address that should sign this transaction
    expected_nft_name: str  # Expected NFT name that will be minted
    expected_payment_amount: int  # Amount that will be paid to freelancer
    message: str = "Sign and send this transaction to approve work and mint NFT"

class BroadcastTransactionRequest(BaseModel):
    """Request to broadcast a signed transaction"""
    signed_transaction: str  # Base64-encoded signed transaction

class BroadcastTransactionResponse(BaseModel):
    """Response after broadcasting a transaction"""
    success: bool = True
    txn_id: str
    explorer_url: str

# Job Listing Models

class JobListRequest(BaseModel):
    """Query parameters for job listing"""
    status: Optional[int] = None  # Filter by job status (0=Created, 1=Funded, 2=Submitted, 3=Completed)
    client_address: Optional[str] = None  # Filter by client address
    freelancer_address: Optional[str] = None  # Filter by freelancer address
    limit: int = 10  # Number of jobs to return (default: 10, max: 100)
    offset: int = 0  # Pagination offset (default: 0)

class JobSummary(BaseModel):
    """Lightweight job information for list view"""
    app_id: int
    job_title: str
    job_status: int
    status_string: str  # Human-readable status
    escrow_amount: int
    client_address: str
    freelancer_address: str
    created_at: int
    contract_address: str

class JobListResponse(BaseModel):
    """Paginated response for job listing"""
    success: bool = True
    jobs: List[JobSummary]
    total_count: int  # Total number of jobs matching filters
    limit: int
    offset: int
    has_more: bool  # Whether there are more results beyond current page