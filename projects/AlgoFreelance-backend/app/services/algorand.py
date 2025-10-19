# In backend/app/services/algorand.py
import os
from algosdk.v2client import algod, indexer
from algokit_utils import (
    get_algod_client,
    get_indexer_client,
    get_account,
    ApplicationClient
)
from beaker import Application

# Import your smart contract and Pydantic models
from ..models.job import JobCreateRequest
from contracts.escrow import AlgoFreelance # For this part 


# --- Client Initialization ---
# This is how you connect to Algorand
# AlgoKit will automatically use environment variables
# (ALGO_ALGOD_TOKEN, ALGO_ALGOD_SERVER, etc.)
algod_client = get_algod_client()
indexer_client = get_indexer_client()

# Get a "deployer" account from its mnemonic
# Store this in a .env file, NOT in the code
DEPLOYER_MNEMONIC = os.environ.get("DEPLOYER_MNEMONIC")
deployer_account = get_account(DEPLOYER_MNEMONIC)

# --- Service Functions ---

async def deploy_new_job_contract(job_data: JobCreateRequest) -> dict:
    """
    Deploys a new instance of the AlgoFreelance contract.
    """
    # 1. Create an ApplicationClient for the contract
    app_client = ApplicationClient(
        client=algod_client,
        app=Application(AlgoFreelance()), # Your Beaker contract
        signer=deployer_account.signer,
    )

    # 2. Deploy (create) the new application
    # This sends the transaction to the network
    create_result = app_client.create()
    app_id = create_result.app_id
    app_address = create_result.app_address
    
    # 3. Call the 'initialize' method on your new contract
    # This is the same as your smart contract's @abimethod
    await app_client.call(
        "initialize",
        client_address=job_data.client_address,
        freelancer_address=job_data.freelancer_address,
        escrow_amount=job_data.escrow_amount,
        job_title=job_data.job_title,
    )

    # 4. Return the details as specified in your PRD
    return {
        "app_id": app_id,
        "app_address": app_address,
        "txn_id": create_result.tx_id,
        # TODO: Calculate funding_amount (escrow + 0.3 ALGO)
    }

async def get_job_details_from_state(app_id: int) -> dict:
    """
    Reads the global state of a job contract.
    """
    # 1. Create a client for an *existing* application
    app_client = ApplicationClient(
        client=algod_client,
        app=Application(AlgoFreelance()),
        app_id=app_id,
    )

    # 2. Get the contract's global state
    global_state = await app_client.get_global_state()
    
    # 3. Format the state to match your Pydantic model
    return {
        "app_id": app_id,
        "client_address": global_state.get("client_address"),
        "freelancer_address": global_state.get("freelancer_address"),
        "escrow_amount": global_state.get("escrow_amount", 0),
        "job_status": global_state.get("job_status", 0),
        "job_title": global_state.get("job_title", ""),
        "work_hash": global_state.get("work_hash"),
        "created_at": global_state.get("created_at", 0),
        # TODO: Add logic to check if contract balance > 0
        "is_funded": global_state.get("job_status", 0) > 1 
    }

async def get_freelancer_nfts(address: str) -> dict:
    """
    Uses the Indexer to find all POWCERT NFTs for an address.
    """
    # 1. Query the indexer for assets owned by the address
    response = indexer_client.account_assets(address)
    
    certificates = []
    # 2. Filter for your "POWCERT" NFTs
    for asset in response.get("assets", []):
        if (asset["params"].get("unit-name") == "POWCERT"):
            certificates.append({
                "asset_id": asset["asset-id"],
                "asset_name": asset["params"].get("name"),
                # TODO: Add logic to get other NFT details
                "job_title": "Job Title from NFT", 
                "ipfs_url": asset["params"].get("url"),
                "client_address": "Client from NFT",
                "completed_at": 123456789,
                "block_explorer": f"https://testnet.explorer.perawallet.app/asset/{asset['asset-id']}"
            })

    return {
        "freelancer_address": address,
        "total_jobs": len(certificates),
        "certificates": certificates
    }