# In backend/app/routes/jobs.py
from fastapi import APIRouter, HTTPException, Body
from typing import Annotated

# Import your Pydantic models and service functions
from ..models.job import (
    JobCreateRequest, JobCreateResponse, 
    JobDetailsResponse, PortfolioResponse
)
from ..services import algorand_service

# This creates a "router" that you'll include in your main app
router = APIRouter(prefix="/api/v1", tags=["Jobs"])


# Corresponds to PRD Section 8: POST /api/v1/jobs/create
@router.post("/jobs/create", response_model=JobCreateResponse)
async def create_job(job_data: JobCreateRequest):
    try:
        # Call your service function
        contract_details = await algorand_service.deploy_new_job_contract(job_data)
        
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
        state = await algorand_service.get_job_details_from_state(app_id)
        return JobDetailsResponse(**state)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Job not found or error: {e}")


# Corresponds to PRD Section 8: GET /api/v1/freelancers/{address}/nfts
@router.get("/freelancers/{address}/nfts", response_model=PortfolioResponse)
async def get_nfts(address: str):
    try:
        nfts = await algorand_service.get_freelancer_nfts(address)
        return PortfolioResponse(**nfts)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get NFTs: {e}")

# --- STUBS for other endpoints in your PRD ---
# These are placeholders you need to implement

@router.post("/jobs/{app_id}/submit")
async def submit_work(app_id: int, signed_txn: Annotated[str, Body()]):
    # 1. Your frontend will CREATE and SIGN this transaction
    # 2. This endpoint will RECEIVE the signed transaction string
    # 3. Use algorand_service.send_raw_transaction(signed_txn)
    # This is more secure as the backend never sees private keys
    return {"message": "Submit endpoint not implemented yet", "app_id": app_id}

@router.post("/jobs/{app_id}/approve")
async def approve_work(app_id: int, signed_txn: Annotated[str, Body()]):
    # 1. Frontend CREATES and SIGNS the 'approve_work' group transaction
    # 2. This endpoint RECEIVES it
    # 3. Use algorand_service.send_raw_transaction(signed_txn)
    return {"message": "Approve endpoint not implemented yet", "app_id": app_id}