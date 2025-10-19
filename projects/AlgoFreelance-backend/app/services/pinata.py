# AlgoFreelance Backend - Pinata IPFS Service

import httpx
import os
from typing import Optional

# Pinata API Credentials
PINATA_API_KEY = "e2fa7892b3dd298feb06"
PINATA_SECRET = "e07f44611c56a69d34d8c477e4f326000a044922e3bb481768ef8e70d7e6e1ad"

# Pinata API endpoints
PINATA_PIN_FILE_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS"
PINATA_PIN_BY_HASH_URL = "https://api.pinata.cloud/pinning/pinByHash"
PINATA_PIN_LIST_URL = "https://api.pinata.cloud/data/pinList"

# Gateway URL for accessing IPFS content
PINATA_GATEWAY_URL = "https://gateway.pinata.cloud/ipfs/"


async def upload_to_ipfs(file_content: bytes, filename: str) -> dict:
    """
    Uploads a file to IPFS via Pinata API.
    
    Args:
        file_content: Binary content of the file
        filename: Name of the file (for metadata)
        
    Returns:
        dict with:
        - ipfs_hash: The IPFS CID
        - ipfs_url: ipfs:// protocol URL
        - gateway_url: HTTP gateway URL for accessing the file
        - size: Size of the file in bytes
        
    Raises:
        Exception if upload fails
    """
    headers = {
        "pinata_api_key": PINATA_API_KEY,
        "pinata_secret_api_key": PINATA_SECRET,
    }
    
    # Prepare file for upload
    files = {
        "file": (filename, file_content)
    }
    
    # Optional metadata
    metadata = {
        "name": filename,
        "keyvalues": {
            "project": "AlgoFreelance",
            "type": "deliverable"
        }
    }
    
    data = {
        "pinataMetadata": str(metadata),
        "pinataOptions": '{"cidVersion": 0}'  # Use CIDv0 for compatibility
    }
    
    print(f"[Pinata] Uploading file: {filename} ({len(file_content)} bytes)")
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(
                PINATA_PIN_FILE_URL,
                headers=headers,
                files=files,
                data=data
            )
            
            response.raise_for_status()
            result = response.json()
            
            ipfs_hash = result.get("IpfsHash")
            size = result.get("PinSize", len(file_content))
            
            print(f"[Pinata] Upload successful! CID: {ipfs_hash}")
            
            return {
                "ipfs_hash": ipfs_hash,
                "ipfs_url": f"ipfs://{ipfs_hash}",
                "gateway_url": f"{PINATA_GATEWAY_URL}{ipfs_hash}",
                "size": size
            }
            
        except httpx.HTTPStatusError as e:
            error_detail = e.response.text
            print(f"[Pinata] Upload failed: {e.response.status_code} - {error_detail}")
            raise Exception(f"Pinata upload failed: {error_detail}")
        except Exception as e:
            print(f"[Pinata] Upload error: {e}")
            raise Exception(f"Failed to upload to IPFS: {e}")


async def pin_by_hash(ipfs_hash: str, name: Optional[str] = None) -> bool:
    """
    Pins an existing IPFS hash on Pinata.
    Useful for ensuring content remains available.
    
    Args:
        ipfs_hash: The IPFS CID to pin
        name: Optional name for the pin
        
    Returns:
        True if successful
    """
    headers = {
        "pinata_api_key": PINATA_API_KEY,
        "pinata_secret_api_key": PINATA_SECRET,
        "Content-Type": "application/json"
    }
    
    data = {
        "hashToPin": ipfs_hash,
    }
    
    if name:
        data["pinataMetadata"] = {"name": name}
    
    print(f"[Pinata] Pinning hash: {ipfs_hash}")
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(
                PINATA_PIN_BY_HASH_URL,
                headers=headers,
                json=data
            )
            
            response.raise_for_status()
            print(f"[Pinata] Successfully pinned: {ipfs_hash}")
            return True
            
        except Exception as e:
            print(f"[Pinata] Pin error: {e}")
            return False


async def get_pinned_files(limit: int = 10) -> list:
    """
    Lists pinned files on Pinata (for debugging).
    
    Args:
        limit: Maximum number of files to return
        
    Returns:
        List of pinned files with metadata
    """
    headers = {
        "pinata_api_key": PINATA_API_KEY,
        "pinata_secret_api_key": PINATA_SECRET,
    }
    
    params = {
        "status": "pinned",
        "pageLimit": limit
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(
                PINATA_PIN_LIST_URL,
                headers=headers,
                params=params
            )
            
            response.raise_for_status()
            result = response.json()
            
            rows = result.get("rows", [])
            print(f"[Pinata] Found {len(rows)} pinned files")
            
            return [
                {
                    "ipfs_hash": row.get("ipfs_pin_hash"),
                    "name": row.get("metadata", {}).get("name", "Unnamed"),
                    "size": row.get("size"),
                    "timestamp": row.get("date_pinned")
                }
                for row in rows
            ]
            
        except Exception as e:
            print(f"[Pinata] List error: {e}")
            return []


async def test_pinata_connection() -> bool:
    """
    Tests Pinata API connection by listing pins.
    
    Returns:
        True if connection is successful
    """
    try:
        pins = await get_pinned_files(limit=1)
        print(f"[Pinata] Connection test successful (found {len(pins)} pins)")
        return True
    except Exception as e:
        print(f"[Pinata] Connection test failed: {e}")
        return False

