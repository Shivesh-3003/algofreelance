# AlgoFreelance Backend - IPFS Routes

from fastapi import APIRouter, HTTPException, File, UploadFile
from ..models.job import IPFSUploadResponse
from ..services.pinata import upload_to_ipfs, test_pinata_connection

router = APIRouter(prefix="/api/v1/ipfs", tags=["IPFS"])


@router.post("/upload", response_model=IPFSUploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """
    Uploads a file to IPFS via Pinata.
    
    **Accepts:** multipart/form-data file upload
    
    **Use Case:**
    Freelancers upload their deliverables (logos, documents, code, etc.)
    to IPFS before submitting work to the smart contract.
    
    **Args:**
    - file: The file to upload (any type, reasonable size limits apply)
    
    **Returns:**
    - ipfs_hash: The IPFS CID (Content Identifier)
    - ipfs_url: Standard ipfs:// protocol URL
    - gateway_url: HTTP gateway URL for browser access
    - size: File size in bytes
    
    **Example Usage (curl):**
    ```bash
    curl -X POST http://localhost:8000/api/v1/ipfs/upload \
      -F "file=@logo_final.png"
    ```
    
    **Example Usage (JavaScript):**
    ```javascript
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    
    const response = await fetch('/api/v1/ipfs/upload', {
      method: 'POST',
      body: formData
    });
    ```
    """
    try:
        # Read file content
        file_content = await file.read()
        
        # Validate file size (max 10MB for MVP)
        max_size = 10 * 1024 * 1024  # 10MB
        if len(file_content) > max_size:
            raise HTTPException(
                status_code=400, 
                detail=f"File too large. Maximum size is {max_size/1024/1024}MB"
            )
        
        if len(file_content) == 0:
            raise HTTPException(status_code=400, detail="File is empty")
        
        # Upload to Pinata
        result = await upload_to_ipfs(file_content, file.filename or "unnamed_file")
        
        return IPFSUploadResponse(**result)
        
    except HTTPException:
        raise  # Re-raise HTTP exceptions as-is
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {e}")


@router.get("/health")
async def check_ipfs_health():
    """
    Health check endpoint to verify Pinata API connection.
    
    **Returns:**
    - status: "healthy" if connected, "unhealthy" otherwise
    - message: Details about the connection
    """
    is_healthy = await test_pinata_connection()
    
    if is_healthy:
        return {
            "status": "healthy",
            "message": "Pinata API connection successful"
        }
    else:
        return {
            "status": "unhealthy",
            "message": "Failed to connect to Pinata API"
        }

