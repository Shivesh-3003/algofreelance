# AlgoFreelance Backend - Algorand Service
# Updated to use algopy-generated client

import os
import sys
from pathlib import Path
from algosdk import account, mnemonic
from algokit_utils import AlgorandClient, Account
from dotenv import load_dotenv

# Import the auto-generated client from contracts artifacts
contracts_path = Path(__file__).parent.parent.parent.parent / "AlgoFreelance-contracts" / "smart_contracts" / "artifacts" / "algo_freelance"
sys.path.insert(0, str(contracts_path))

try:
    from algo_freelance_client import AlgoFreelanceClient, AlgoFreelanceFactory
except ImportError as e:
    raise ImportError(
        f"Failed to import AlgoFreelanceClient. Make sure the contract is compiled. "
        f"Path: {contracts_path}\nError: {e}"
    )

# Import Pydantic models
from ..models.job import JobCreateRequest

# --- Environment Configuration ---
# Load environment based on ALGORAND_NETWORK variable
network = os.getenv('ALGORAND_NETWORK', 'localnet')
env_file = Path(__file__).parent.parent.parent / f".env.{network}"

if not env_file.exists():
    raise FileNotFoundError(
        f"Environment file not found: {env_file}\n"
        f"Please create .env.{network} with required configuration."
    )

load_dotenv(env_file)

# --- Algorand Client Initialization ---
# Set environment variables for AlgorandClient.from_environment()
os.environ['ALGOD_SERVER'] = os.getenv('ALGOD_SERVER', '')
os.environ['ALGOD_TOKEN'] = os.getenv('ALGOD_TOKEN', '')
os.environ['INDEXER_SERVER'] = os.getenv('INDEXER_SERVER', '')
os.environ['INDEXER_TOKEN'] = os.getenv('INDEXER_TOKEN', '')

# Initialize AlgorandClient from environment
algorand_client = AlgorandClient.from_environment()

# --- Deployer Account ---
DEPLOYER_MNEMONIC = os.getenv("DEPLOYER_MNEMONIC")
if not DEPLOYER_MNEMONIC:
    raise ValueError(
        f"DEPLOYER_MNEMONIC not set in {env_file}. "
        "Backend needs an account to deploy contracts."
    )

deployer_private_key = mnemonic.to_private_key(DEPLOYER_MNEMONIC)
deployer_address = account.address_from_private_key(deployer_private_key)
deployer_account = Account(private_key=deployer_private_key)

print(f"[AlgoFreelance Backend] Initialized on {network}")
print(f"[AlgoFreelance Backend] Deployer address: {deployer_address}")


# --- Service Functions ---

async def deploy_new_job_contract(job_data: JobCreateRequest) -> dict:
    """
    Deploys a new instance of the AlgoFreelance contract.
    Uses the auto-generated factory from algopy.

    Args:
        job_data: JobCreateRequest with client/freelancer addresses, amount, title

    Returns:
        dict with app_id, app_address, txn_id, funding_amount
    """
    try:
        # Create factory for deploying new contracts
        factory = AlgoFreelanceFactory(
            algorand=algorand_client,
            default_sender=deployer_address,
            default_signer=deployer_account.signer,
        )

        # Deploy contract (create application with bare call)
        # The contract allows bare create (see contract.py bareActions)
        client, result = factory.send.create.bare()

        app_id = result.app_id
        app_address = result.app_address

        print(f"[Deploy] Created contract with App ID: {app_id}")
        print(f"[Deploy] Contract address: {app_address}")

        # Call initialize method
        init_result = client.send.initialize(
            args=(job_data.client_address, job_data.freelancer_address, job_data.escrow_amount, job_data.job_title)
        )

        # Use the initialization transaction ID (more meaningful than create)
        init_txn_id = init_result.tx_id

        print(f"[Deploy] Initialized contract. Txn ID: {init_txn_id}")
        print(f"[Deploy] Status should be 0 (Created)")

        # Calculate funding amount (escrow + 0.3 ALGO buffer for min balance + fees)
        funding_amount = job_data.escrow_amount + 300_000  # 0.3 ALGO

        return {
            "app_id": app_id,
            "app_address": app_address,
            "txn_id": init_txn_id,
            "funding_amount": funding_amount,
        }
    except ValueError as e:
        error_message = str(e)
        if "transaction already in ledger" in error_message:
            raise ValueError("Job creation already in progress. Please wait for the current transaction to complete and avoid clicking the button multiple times.")
        raise
    except Exception as e:
        print(f"[Deploy] Error during deployment: {e}")
        raise


async def get_job_details_from_state(app_id: int) -> dict:
    """
    Reads the global state of a job contract using get_job_details() method.
    Enhanced with contract balance and status information.
    
    Args:
        app_id: Application ID of the deployed contract
        
    Returns:
        dict with all job details from contract state, plus:
        - contract_balance: Current balance of the contract
        - contract_address: The contract's Algorand address
        - status_string: Human-readable status
    """
    from algosdk.logic import get_application_address
    
    # Create client for existing app (sender needed even for readonly calls)
    client = AlgoFreelanceClient(
        algorand=algorand_client,
        app_id=app_id,
        default_sender=deployer_address,
        default_signer=deployer_account.signer,
    )
    
    # Call the readonly get_job_details method
    result = client.send.get_job_details()
    job_details = result.abi_return  # This is a typed JobDetails object
    
    # Get contract address and balance
    contract_address = get_application_address(app_id)
    
    try:
        account_info = algorand_client.client.algod.account_info(contract_address)
        contract_balance = account_info.get('amount', 0)
    except Exception as e:
        print(f"[GetDetails] Warning: Could not get contract balance: {e}")
        contract_balance = 0
    
    # Map status to human-readable string
    status_map = {
        0: "Created",
        1: "Funded",
        2: "Work Submitted",
        3: "Completed",
        4: "Canceled"
    }
    status_string = status_map.get(job_details.job_status, f"Unknown ({job_details.job_status})")
    
    print(f"[GetDetails] App {app_id} - Status: {status_string}, Balance: {contract_balance / 1_000_000} ALGO")
    
    # Convert to dict matching PRD §8 with enhancements
    return {
        "app_id": app_id,
        "client_address": job_details.client_address,
        "freelancer_address": job_details.freelancer_address,
        "escrow_amount": job_details.escrow_amount,
        "job_status": job_details.job_status,
        "status_string": status_string,
        "job_title": job_details.job_title,
        "work_hash": job_details.work_hash if job_details.work_hash else None,
        "created_at": job_details.created_at,
        "is_funded": job_details.job_status >= 1,  # Status 1+ means funded
        "contract_address": contract_address,
        "contract_balance": contract_balance,
    }


async def construct_fund_transaction(app_id: int, client_address: str) -> dict:
    """
    Constructs unsigned grouped transactions for funding a job contract.

    Returns:
        - Two unsigned transactions (payment + app call) as base64 strings
        - Group ID for the atomic transaction group

    The frontend wallet will sign both transactions and broadcast them.
    """
    from algosdk import transaction
    from algosdk.logic import get_application_address
    import base64

    try:
        print(f"[FundTxn] Starting fund transaction construction for app {app_id}")
        print(f"[FundTxn] Client address: {client_address}, type: {type(client_address)}")

        # Get job details to retrieve escrow amount
        job_details = await get_job_details_from_state(app_id)
        escrow_amount = job_details["escrow_amount"]
        print(f"[FundTxn] Escrow amount: {escrow_amount}")

        # Get contract address
        contract_address = get_application_address(app_id)
        print(f"[FundTxn] Contract address: {contract_address}")

        # Get suggested params
        sp = algorand_client.client.algod.suggested_params()
        print(f"[FundTxn] Got suggested params")
    except Exception as e:
        print(f"[FundTxn] Error in setup: {e}")
        raise
    
    try:
        # Transaction 1: Payment from client to contract
        print(f"[FundTxn] Creating payment transaction...")
        payment_txn = transaction.PaymentTxn(
            sender=client_address,
            sp=sp,
            receiver=contract_address,
            amt=escrow_amount,
        )
        print(f"[FundTxn] Payment transaction created")

        # Transaction 2: App call to fund() method
        print(f"[FundTxn] Creating app call transaction...")
        from algosdk.abi import Method as ABIMethod

        # Create algosdk Method object to get selector - fund() takes no arguments
        abi_method = ABIMethod.from_signature("fund()void")
        print(f"[FundTxn] ABI method created, selector: {abi_method.get_selector()}")

        app_call_txn = transaction.ApplicationCallTxn(
            sender=client_address,
            sp=sp,
            index=app_id,
            on_complete=transaction.OnComplete.NoOpOC,
            app_args=[abi_method.get_selector()],  # Just the method selector, no args
        )
        print(f"[FundTxn] App call transaction created")

        # Group the transactions
        print(f"[FundTxn] Grouping transactions...")
        group_id = transaction.calculate_group_id([payment_txn, app_call_txn])
        payment_txn.group = group_id
        app_call_txn.group = group_id
        print(f"[FundTxn] Transactions grouped")

        # Encode transactions to base64 using algosdk encoding
        # encoding.msgpack_encode() returns a base64 STRING directly, not bytes!
        print(f"[FundTxn] Encoding transactions...")
        from algosdk import encoding

        # These return base64 strings directly - do NOT encode again!
        payment_txn_b64 = encoding.msgpack_encode(payment_txn)
        app_call_txn_b64 = encoding.msgpack_encode(app_call_txn)

        print(f"[FundTxn] Transactions encoded successfully")
        print(f"[FundTxn] Payment txn type: {type(payment_txn_b64)}, length: {len(payment_txn_b64)}")
        print(f"[FundTxn] App call txn type: {type(app_call_txn_b64)}, length: {len(app_call_txn_b64)}")
    except Exception as e:
        print(f"[FundTxn] Error during transaction construction: {e}")
        import traceback
        traceback.print_exc()
        raise

    print(f"[FundTxn] Constructed grouped transactions for app {app_id}")
    print(f"[FundTxn] Payment: {escrow_amount} microALGOs from {client_address} to {contract_address}")
    print(f"[FundTxn] Group ID: {base64.b64encode(group_id).decode('utf-8')}")
    
    return {
        "transactions": [payment_txn_b64, app_call_txn_b64],
        "group_id": base64.b64encode(group_id).decode('utf-8'),
        "signer_address": client_address,
    }


async def construct_submit_work_transaction(app_id: int, freelancer_address: str, ipfs_hash: str) -> dict:
    """
    Constructs unsigned transaction for submitting work to a job contract.
    
    Args:
        app_id: Application ID
        freelancer_address: Freelancer's address (will sign this)
        ipfs_hash: IPFS CID (will be validated)
        
    Returns:
        Unsigned transaction as base64 string
    """
    from algosdk import transaction
    import base64
    
    # Validate IPFS hash format (46-59 characters for CIDv0/v1)
    if not ipfs_hash or len(ipfs_hash) < 46 or len(ipfs_hash) > 59:
        raise ValueError(f"Invalid IPFS hash length: {len(ipfs_hash)}. Must be 46-59 characters")
    
    # Validate characters (base58 for CIDv0 or base32 for CIDv1)
    # Basic validation - alphanumeric
    if not ipfs_hash.replace('Q', '').replace('b', '').isalnum():
        print(f"[SubmitWork] Warning: IPFS hash may contain invalid characters: {ipfs_hash}")
    
    print(f"[SubmitWork] Validated IPFS hash: {ipfs_hash} (length: {len(ipfs_hash)})")
    
    # Get suggested params
    sp = algorand_client.client.algod.suggested_params()
    
    # Create client to build the app call
    client = AlgoFreelanceClient(
        algorand=algorand_client,
        app_id=app_id,
        default_sender=freelancer_address,
        default_signer=None,
    )
    
    # Get the submit_work method from ABI
    submit_work_method = None
    for method in client.app_client.app_spec.methods:
        if method.name == "submit_work":
            submit_work_method = method
            break

    if not submit_work_method:
        raise ValueError("submit_work() method not found in contract ABI")

    # Create algosdk Method object to get selector
    from algosdk.abi import Method as ABIMethod, StringType
    abi_method = ABIMethod.from_signature(f"{submit_work_method.name}(string)void")

    # Encode the ipfs_hash argument (it's an arc4.String)
    string_type = StringType()
    encoded_hash = string_type.encode(ipfs_hash)

    # Build app call transaction
    app_call_txn = transaction.ApplicationCallTxn(
        sender=freelancer_address,
        sp=sp,
        index=app_id,
        on_complete=transaction.OnComplete.NoOpOC,
        app_args=[abi_method.get_selector(), encoded_hash],
    )

    # Encode to base64
    from algosdk import encoding
    txn_b64 = base64.b64encode(encoding.msgpack_encode(app_call_txn)).decode('utf-8')
    
    print(f"[SubmitWork] Constructed transaction for app {app_id}")
    print(f"[SubmitWork] Freelancer: {freelancer_address}, IPFS: {ipfs_hash}")
    
    return {
        "transaction": txn_b64,
        "signer_address": freelancer_address,
    }


async def construct_approve_work_transaction(app_id: int, client_address: str) -> dict:
    """
    Constructs unsigned transaction for approving work.
    This will trigger payment + NFT minting + NFT transfer (3 inner transactions).
    
    Args:
        app_id: Application ID
        client_address: Client's address (will sign this)
        
    Returns:
        Unsigned transaction as base64 string with expected outcomes
    """
    from algosdk import transaction
    import base64
    
    # Get job details to show expected outcomes
    job_details = await get_job_details_from_state(app_id)
    escrow_amount = job_details["escrow_amount"]
    job_title = job_details["job_title"]
    
    # Get suggested params
    sp = algorand_client.client.algod.suggested_params()
    
    # Increase fee to cover 3 inner transactions
    # Base fee (1000) + 3 inner txns (3000) = 4000 microALGOs
    sp.fee = 4000
    sp.flat_fee = True
    
    # Create client to build the app call
    client = AlgoFreelanceClient(
        algorand=algorand_client,
        app_id=app_id,
        default_sender=client_address,
        default_signer=None,
    )
    
    # Get the approve_work method from ABI
    approve_method = None
    for method in client.app_client.app_spec.methods:
        if method.name == "approve_work":
            approve_method = method
            break

    if not approve_method:
        raise ValueError("approve_work() method not found in contract ABI")

    # Create algosdk Method object to get selector
    from algosdk.abi import Method as ABIMethod
    abi_method = ABIMethod.from_signature(f"{approve_method.name}()void")

    # Build app call transaction (no arguments for approve_work)
    app_call_txn = transaction.ApplicationCallTxn(
        sender=client_address,
        sp=sp,
        index=app_id,
        on_complete=transaction.OnComplete.NoOpOC,
        app_args=[abi_method.get_selector()],
    )

    # Encode to base64
    from algosdk import encoding
    txn_b64 = base64.b64encode(encoding.msgpack_encode(app_call_txn)).decode('utf-8')
    
    expected_nft_name = f"AlgoFreelance: {job_title}"
    
    print(f"[ApproveWork] Constructed transaction for app {app_id}")
    print(f"[ApproveWork] Client: {client_address}")
    print(f"[ApproveWork] Will pay: {escrow_amount} microALGOs and mint NFT: {expected_nft_name}")
    
    return {
        "transaction": txn_b64,
        "signer_address": client_address,
        "expected_nft_name": expected_nft_name,
        "expected_payment_amount": escrow_amount,
    }


async def broadcast_signed_transaction(signed_txn_b64: str) -> dict:
    """
    Optional helper to broadcast a signed transaction.
    Frontend can also broadcast directly to Algorand.
    
    Args:
        signed_txn_b64: Base64-encoded signed transaction
        
    Returns:
        Transaction ID and explorer URL
    """
    import base64
    
    # Decode the transaction
    signed_txn_bytes = base64.b64decode(signed_txn_b64)
    
    # Send to network
    txn_id = algorand_client.client.algod.send_raw_transaction(signed_txn_bytes)
    
    # Wait for confirmation
    algorand_client.client.algod.status_after_block(
        algorand_client.client.algod.status()['last-round'] + 1
    )
    
    network = os.getenv('ALGORAND_NETWORK', 'testnet')
    explorer_base = "https://testnet.explorer.perawallet.app" if network == "testnet" else "http://localhost:8980"
    explorer_url = f"{explorer_base}/tx/{txn_id}"
    
    print(f"[Broadcast] Transaction sent: {txn_id}")
    
    return {
        "txn_id": txn_id,
        "explorer_url": explorer_url,
    }


async def get_freelancer_nfts(address: str) -> dict:
    """
    Uses the Indexer to find all POWCERT NFTs for an address.
    Filters by unit_name = "POWCERT".
    
    Args:
        address: Algorand address of the freelancer
        
    Returns:
        dict with freelancer_address, total_jobs, and certificates list
    """
    indexer_client = algorand_client.client.indexer
    
    try:
        # Query assets owned by address
        response = indexer_client.lookup_account_assets(address)
        
        certificates = []
        for asset_info in response.get("assets", []):
            asset_id = asset_info["asset-id"]
            
            # Get asset details to check unit name
            asset_details = indexer_client.lookup_asset_by_id(asset_id)
            params = asset_details.get("asset", {}).get("params", {})
            
            # Filter for POWCERT NFTs
            if params.get("unit-name") == "POWCERT":
                # Extract job title from asset name "AlgoFreelance: {title}"
                asset_name = params.get("name", "")
                job_title = asset_name.replace("AlgoFreelance: ", "") if asset_name.startswith("AlgoFreelance: ") else asset_name
                
                certificates.append({
                    "asset_id": asset_id,
                    "asset_name": asset_name,
                    "job_title": job_title,
                    "ipfs_url": params.get("url", ""),  # Should be "ipfs://..."
                    "client_address": params.get("creator", ""),  # Contract creator
                    "completed_at": 0,  # TODO: Could query transaction timestamp from indexer
                    "block_explorer": f"https://testnet.explorer.perawallet.app/asset/{asset_id}"
                })
        
        print(f"[GetNFTs] Found {len(certificates)} POWCERT certificates for {address}")
        
        return {
            "freelancer_address": address,
            "total_jobs": len(certificates),
            "certificates": certificates
        }
        
    except Exception as e:
        print(f"[GetNFTs] Error querying address {address}: {e}")
        # Return empty result on error
        return {
            "freelancer_address": address,
            "total_jobs": 0,
            "certificates": []
        }


# Simple in-memory cache for job listings
_job_list_cache = {}
_cache_timeout = 30  # seconds


async def list_jobs(
    status: int | None = None,
    client_address: str | None = None,
    freelancer_address: str | None = None,
    limit: int = 10,
    offset: int = 0
) -> dict:
    """
    Query Algorand Indexer to list all AlgoFreelance job contracts.
    Filters by creator address (deployer) and applies optional filters.
    
    Args:
        status: Filter by job status (0=Created, 1=Funded, 2=Submitted, 3=Completed)
        client_address: Filter by client address
        freelancer_address: Filter by freelancer address
        limit: Number of results to return (max 100)
        offset: Pagination offset
        
    Returns:
        dict with jobs list, total_count, limit, offset, has_more
    """
    import time
    
    # Create cache key
    cache_key = f"{status}:{client_address}:{freelancer_address}:{limit}:{offset}"
    
    # Check cache
    if cache_key in _job_list_cache:
        cached_data, cached_time = _job_list_cache[cache_key]
        if time.time() - cached_time < _cache_timeout:
            print(f"[ListJobs] Returning cached result for {cache_key}")
            return cached_data
    
    indexer_client = algorand_client.client.indexer
    
    try:
        # Query applications created by deployer
        print(f"[ListJobs] Querying applications created by {deployer_address}")
        response = indexer_client.lookup_account_application_by_creator(deployer_address)
        
        apps = response.get("applications", [])
        print(f"[ListJobs] Found {len(apps)} total applications")
        
        jobs = []
        
        for app_info in apps:
            app_id = app_info.get("id")
            
            try:
                # Get global state for this application
                global_state = app_info.get("params", {}).get("global-state", [])
                
                # Parse global state
                state_dict = {}
                for state_item in global_state:
                    key = state_item.get("key", "")
                    value_obj = state_item.get("value", {})
                    value_type = value_obj.get("type")
                    
                    # Decode base64 key
                    import base64
                    try:
                        key_decoded = base64.b64decode(key).decode('utf-8')
                    except:
                        continue
                    
                    # Extract value
                    if value_type == 1:  # bytes
                        value_bytes = base64.b64decode(value_obj.get("bytes", ""))
                        state_dict[key_decoded] = value_bytes
                    elif value_type == 2:  # uint
                        state_dict[key_decoded] = value_obj.get("uint", 0)
                
                # Extract job details from state
                job_status_val = state_dict.get("job_status", 0)
                job_title_bytes = state_dict.get("job_title", b"")
                job_title = job_title_bytes.decode('utf-8') if isinstance(job_title_bytes, bytes) else str(job_title_bytes)
                escrow_amount_val = state_dict.get("escrow_amount", 0)
                client_addr_bytes = state_dict.get("client_address", b"")
                freelancer_addr_bytes = state_dict.get("freelancer_address", b"")
                created_at_val = state_dict.get("created_at", 0)
                
                # Decode addresses (they're stored as 32-byte addresses)
                from algosdk import encoding
                try:
                    if len(client_addr_bytes) == 32:
                        client_addr_str = encoding.encode_address(client_addr_bytes)
                    else:
                        client_addr_str = ""
                    
                    if len(freelancer_addr_bytes) == 32:
                        freelancer_addr_str = encoding.encode_address(freelancer_addr_bytes)
                    else:
                        freelancer_addr_str = ""
                except:
                    client_addr_str = ""
                    freelancer_addr_str = ""
                
                # Apply filters
                if status is not None and job_status_val != status:
                    continue
                
                if client_address and client_addr_str != client_address:
                    continue
                
                if freelancer_address and freelancer_addr_str != freelancer_address:
                    continue
                
                # Status string mapping
                status_map = {
                    0: "Created",
                    1: "Funded",
                    2: "Submitted",
                    3: "Completed",
                    4: "Canceled"
                }
                status_string = status_map.get(job_status_val, "Unknown")
                
                # Get contract address
                contract_address = app_info.get("params", {}).get("address", "")
                
                jobs.append({
                    "app_id": app_id,
                    "job_title": job_title,
                    "job_status": job_status_val,
                    "status_string": status_string,
                    "escrow_amount": escrow_amount_val,
                    "client_address": client_addr_str,
                    "freelancer_address": freelancer_addr_str,
                    "created_at": created_at_val,
                    "contract_address": contract_address
                })
                
            except Exception as e:
                print(f"[ListJobs] Error parsing app {app_id}: {e}")
                continue
        
        # Sort by created_at descending (newest first)
        jobs.sort(key=lambda x: x["created_at"], reverse=True)
        
        # Apply pagination
        total_count = len(jobs)
        paginated_jobs = jobs[offset:offset + limit]
        has_more = (offset + limit) < total_count
        
        result = {
            "jobs": paginated_jobs,
            "total_count": total_count,
            "limit": limit,
            "offset": offset,
            "has_more": has_more
        }
        
        # Cache result
        _job_list_cache[cache_key] = (result, time.time())
        
        print(f"[ListJobs] Returning {len(paginated_jobs)} jobs (total: {total_count})")
        return result
        
    except Exception as e:
        print(f"[ListJobs] Error querying applications: {e}")
        return {
            "jobs": [],
            "total_count": 0,
            "limit": limit,
            "offset": offset,
            "has_more": False
        }
