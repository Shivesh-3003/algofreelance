# In backend/app/routes/jobs.py
from fastapi import APIRouter, HTTPException, Body, Query
from typing import Annotated, Optional

# Import your Pydantic models and service functions
from ..models.job import (
    JobCreateRequest, JobCreateResponse,
    JobDetailsResponse, PortfolioResponse,
    FundJobRequest, FundJobResponse, SubmitWorkRequest, SubmitWorkResponse,
    ApproveWorkRequest, ApproveWorkResponse, BroadcastTransactionRequest, BroadcastTransactionResponse,
    JobListResponse  # Added for job listing
)
from ..services import algorand_service
from ..services.algorand import (
    deploy_new_job_contract, get_job_details_from_state, get_freelancer_nfts,
    construct_fund_transaction, construct_submit_work_transaction,
    construct_approve_work_transaction, broadcast_signed_transaction,
    list_jobs  # Added for job listing
)

# This creates a "router" that you'll include in your main app
router = APIRouter(prefix="/api/v1", tags=["Jobs"])


# Corresponds to PRD Section 8: POST /api/v1/jobs/create
@router.post("/jobs/create", response_model=JobCreateResponse)
async def create_job(job_data: JobCreateRequest):
    try:
        # Call your service function
        contract_details = await deploy_new_job_contract(job_data)
        
        # Format the response to match PRD
        return JobCreateResponse(
            app_id=contract_details["app_id"],
            app_address=contract_details["app_address"],
            funding_amount=job_data.escrow_amount + 300000, # 0.3 ALGO buffer
            txn_id=contract_details["txn_id"],
            explorer_url=f"https://testnet.explorer.perawallet.app/application/{contract_details['app_id']}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Contract deployment failed: {e}")


# Corresponds to PRD Section 8: GET /api/v1/jobs/{app_id}
@router.get("/jobs/{app_id}", response_model=JobDetailsResponse)
async def get_job(app_id: int):
    try:
        state = await get_job_details_from_state(app_id)
        return JobDetailsResponse(**state)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Job not found or error: {e}")


# NEW: GET /api/v1/jobs - List all jobs with filtering and pagination
@router.get("/jobs", response_model=JobListResponse)
async def list_all_jobs(
    status: Optional[int] = Query(None, description="Filter by job status (0=Created, 1=Funded, 2=Submitted, 3=Completed)"),
    client_address: Optional[str] = Query(None, description="Filter by client address"),
    freelancer_address: Optional[str] = Query(None, description="Filter by freelancer address"),
    limit: int = Query(10, ge=1, le=100, description="Number of results to return (max 100)"),
    offset: int = Query(0, ge=0, description="Pagination offset")
):
    """
    List all AlgoFreelance job contracts with optional filtering and pagination.
    
    **Query Parameters:**
    - status: Filter by job status (0=Created, 1=Funded, 2=Submitted, 3=Completed)
    - client_address: Filter by specific client Algorand address
    - freelancer_address: Filter by specific freelancer Algorand address
    - limit: Number of results per page (default: 10, max: 100)
    - offset: Pagination offset (default: 0)
    
    **Returns:**
    - jobs: List of job summaries
    - total_count: Total number of jobs matching filters
    - has_more: Whether there are more results beyond current page
    
    **Example:**
    ```
    GET /api/v1/jobs?status=1&limit=5&offset=0
    ```
    """
    try:
        result = await list_jobs(
            status=status,
            client_address=client_address,
            freelancer_address=freelancer_address,
            limit=limit,
            offset=offset
        )
        return JobListResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list jobs: {e}")


# Corresponds to PRD Section 8: GET /api/v1/freelancers/{address}/nfts
@router.get("/freelancers/{address}/nfts", response_model=PortfolioResponse)
async def get_nfts(address: str):
    try:
        nfts = await get_freelancer_nfts(address)
        return PortfolioResponse(**nfts)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get NFTs: {e}")

# --- Transaction Construction Endpoints ---

@router.post("/jobs/{app_id}/fund", response_model=FundJobResponse)
async def fund_job(app_id: int, request: FundJobRequest):
    """
    Constructs unsigned grouped transactions for funding a job contract.

    **Flow:**
    1. Backend constructs payment + app call transactions
    2. Frontend wallet signs both transactions
    3. Frontend broadcasts to Algorand network

    **Args:**
    - app_id: Application ID of the job contract
    - request.client_address: Client's Algorand address (must match contract)

    **Returns:**
    - Two unsigned transactions as base64 strings
    - Group ID for atomic execution
    - Instructions for frontend
    """
    try:
        result = await construct_fund_transaction(app_id, request.client_address)
        return FundJobResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to construct fund transaction: {e}")


@router.post("/jobs/{app_id}/submit", response_model=SubmitWorkResponse)
async def submit_work(app_id: int, request: SubmitWorkRequest):
    """
    Constructs unsigned transaction for submitting work.
    
    **Flow:**
    1. Backend validates IPFS hash and constructs transaction
    2. Frontend wallet signs transaction
    3. Frontend broadcasts to Algorand network
    
    **Args:**
    - app_id: Application ID of the job contract
    - ipfs_hash: IPFS CID of the deliverable (46-59 characters)
    - freelancer_address: Freelancer's Algorand address (must match contract)
    
    **Returns:**
    - Unsigned transaction as base64 string
    - Instructions for frontend
    """
    try:
        result = await construct_submit_work_transaction(
            app_id, 
            request.freelancer_address, 
            request.ipfs_hash
        )
        return SubmitWorkResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to construct submit work transaction: {e}")


@router.post("/jobs/{app_id}/approve", response_model=ApproveWorkResponse)
async def approve_work(app_id: int, request: ApproveWorkRequest):
    """
    Constructs unsigned transaction for approving work and minting NFT.

    **Core Innovation:**
    This triggers 3 grouped inner transactions atomically:
    1. Payment to freelancer
    2. Mint POWCERT NFT
    3. Transfer NFT to freelancer

    **Flow:**
    1. Backend constructs app call with increased fee (4000 microALGOs)
    2. Frontend wallet signs transaction
    3. Frontend broadcasts to Algorand network
    4. Smart contract executes all 3 inner transactions

    **Args:**
    - app_id: Application ID of the job contract
    - request.client_address: Client's Algorand address (must match contract)

    **Returns:**
    - Unsigned transaction as base64 string
    - Expected NFT name and payment amount
    - Instructions for frontend
    """
    try:
        result = await construct_approve_work_transaction(app_id, request.client_address)
        return ApproveWorkResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to construct approve transaction: {e}")


@router.post("/broadcast", response_model=BroadcastTransactionResponse)
async def broadcast_transaction(request: BroadcastTransactionRequest):
    """
    Optional helper endpoint to broadcast a signed transaction.
    
    **Note:** Frontend can also broadcast directly to Algorand node.
    This endpoint is provided for convenience.
    
    **Args:**
    - signed_transaction: Base64-encoded signed transaction
    
    **Returns:**
    - Transaction ID
    - Block explorer URL
    """
    try:
        result = await broadcast_signed_transaction(request.signed_transaction)
        return BroadcastTransactionResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to broadcast transaction: {e}")