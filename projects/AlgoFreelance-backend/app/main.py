# In backend/app/main.py
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import logging

# Import your route handlers
from .routes import jobs
from .routes import ipfs

# Import custom exceptions
from .services.exceptions import (
    AlgoFreelanceError,
    ContractNotFoundError,
    InvalidTransactionStateError,
    InvalidAddressError,
    InsufficientBalanceError,
    IPFSUploadError,
    InvalidIPFSHashError,
    TransactionConstructionError,
    InvalidEscrowAmountError
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AlgoFreelance API",
    description="Backend for the Decentralized Freelancer Escrow Platform",
    version="1.0.0"
)

# --- Custom Exception Handlers ---

@app.exception_handler(ContractNotFoundError)
async def contract_not_found_handler(request: Request, exc: ContractNotFoundError):
    logger.warning(f"Contract not found: {exc.message}")
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={
            "error": exc.error_code,
            "detail": exc.message,
            "app_id": exc.app_id
        }
    )


@app.exception_handler(InvalidTransactionStateError)
async def invalid_state_handler(request: Request, exc: InvalidTransactionStateError):
    logger.warning(f"Invalid transaction state: {exc.message}")
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error": exc.error_code,
            "detail": exc.message,
            "current_state": exc.current_state,
            "required_state": exc.required_state,
            "action": exc.action
        }
    )


@app.exception_handler(InvalidAddressError)
async def invalid_address_handler(request: Request, exc: InvalidAddressError):
    logger.warning(f"Invalid address: {exc.message}")
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error": exc.error_code,
            "detail": exc.message,
            "address": exc.address
        }
    )


@app.exception_handler(InsufficientBalanceError)
async def insufficient_balance_handler(request: Request, exc: InsufficientBalanceError):
    logger.warning(f"Insufficient balance: {exc.message}")
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error": exc.error_code,
            "detail": exc.message,
            "address": exc.address,
            "required": exc.required,
            "available": exc.available
        }
    )


@app.exception_handler(IPFSUploadError)
async def ipfs_upload_handler(request: Request, exc: IPFSUploadError):
    logger.error(f"IPFS upload error: {exc.message}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": exc.error_code,
            "detail": exc.message
        }
    )


@app.exception_handler(InvalidIPFSHashError)
async def invalid_ipfs_hash_handler(request: Request, exc: InvalidIPFSHashError):
    logger.warning(f"Invalid IPFS hash: {exc.message}")
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error": exc.error_code,
            "detail": exc.message,
            "ipfs_hash": exc.ipfs_hash
        }
    )


@app.exception_handler(TransactionConstructionError)
async def transaction_construction_handler(request: Request, exc: TransactionConstructionError):
    logger.error(f"Transaction construction error: {exc.message}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": exc.error_code,
            "detail": exc.message,
            "transaction_type": exc.transaction_type
        }
    )


@app.exception_handler(InvalidEscrowAmountError)
async def invalid_escrow_amount_handler(request: Request, exc: InvalidEscrowAmountError):
    logger.warning(f"Invalid escrow amount: {exc.message}")
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error": exc.error_code,
            "detail": exc.message,
            "amount": exc.amount
        }
    )


@app.exception_handler(AlgoFreelanceError)
async def general_algofreelance_error_handler(request: Request, exc: AlgoFreelanceError):
    """Catch-all for any AlgoFreelance errors not handled above"""
    logger.error(f"AlgoFreelance error: {exc.message}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": exc.error_code,
            "detail": exc.message
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle FastAPI validation errors with detailed messages"""
    logger.warning(f"Validation error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "VALIDATION_ERROR",
            "detail": "Request validation failed",
            "errors": exc.errors()
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Catch-all for unexpected errors"""
    logger.exception(f"Unexpected error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "INTERNAL_SERVER_ERROR",
            "detail": "An unexpected error occurred. Please contact support."
        }
    )


# --- Add CORS Middleware ---
# This is the "glue" that lets your React app (on localhost:5173)
# talk to this backend (on localhost:8000)
origins = [
    "http://localhost:5173", # Default for React+Vite <---We will be using this
    "http://localhost:3000", # Default for Create React App
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allow all methods
    allow_headers=["*"], # Allow all headers
)

# --- Include Your Routers ---
app.include_router(jobs.router)
app.include_router(ipfs.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the AlgoFreelance API"}

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AlgoFreelance Backend",
        "version": "1.0.0"
    }