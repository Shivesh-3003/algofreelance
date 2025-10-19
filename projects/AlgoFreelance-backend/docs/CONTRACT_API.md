# AlgoFreelance Smart Contract API

## Contract Overview

The AlgoFreelance smart contract implements a trustless escrow system for freelance work with automatic Proof-of-Work NFT minting.

**Contract Language:** Algopy (Python)  
**Generated Client:** `algo_freelance_client.py` (auto-generated from ARC-56 spec)  
**ABI Spec:** ARC-56 compliant

## Contract Addresses

- **TestNet:** [To be filled after deployment]
- **LocalNet:** Deployed per test run (ephemeral)

## Global State Schema

| Key | Type | Description |
|-----|------|-------------|
| `client_address` | address | Client's Algorand address |
| `freelancer_address` | address | Freelancer's Algorand address |
| `escrow_amount` | uint64 | Payment amount in microALGOs |
| `job_status` | uint64 | Current status (0-4, see below) |
| `work_hash` | string | IPFS CID of submitted work |
| `job_title` | string | Job title (max 64 bytes) |
| `created_at` | uint64 | Unix timestamp of creation |

## Job Status Values

| Status | Value | Description |
|--------|-------|-------------|
| Created | 0 | Contract deployed and initialized, awaiting funding |
| Funded | 1 | Client has funded the contract with escrow_amount |
| Submitted | 2 | Freelancer has submitted work (IPFS hash) |
| Completed | 3 | Client approved work, payment + NFT transferred |
| Canceled | 4 | Client canceled before work submitted, funds refunded |

---

## Contract Methods

### 1. `initialize(client_address, freelancer_address, escrow_amount, job_title)`

**Description:** Initialize a newly created contract with job parameters.

**Caller:** Contract creator (backend deployer account)

**Parameters:**
- `client_address` (address): Client's Algorand address
- `freelancer_address` (address): Freelancer's Algorand address
- `escrow_amount` (uint64): Payment amount in microALGOs (1 ALGO = 1,000,000 microALGOs)
- `job_title` (string): Job title (max 64 bytes, UTF-8)

**Returns:** void

**State Changes:**
- Sets all global state variables
- `job_status = 0` (Created)
- Records `created_at` timestamp

**Validation:**
- Sender must be contract creator
- `escrow_amount > 0`

**Example (Python):**
```python
from algo_freelance_client import AlgoFreelanceClient

client = AlgoFreelanceClient(algod_client=algod, creator=deployer)
result = client.create_bare()  # Deploy contract
client.initialize(
    client_address="CLIENTADDR...",
    freelancer_address="FREELANCERADDR...",
    escrow_amount=5_000_000,  # 5 ALGO
    job_title="Logo Design for SaaS Startup"
)
```

---

### 2. `fund()`

**Description:** Fund the contract with the escrow amount. Must be grouped with a payment transaction.

**Caller:** Client only

**Parameters:** None

**Returns:** void

**Group Requirements:**
- **Transaction 0:** Payment of `escrow_amount` microALGOs from client to contract address
- **Transaction 1:** App call to `fund()` method

**State Changes:**
- `job_status = 1` (Funded)

**Validation:**
- Sender must be `client_address`
- Current status must be 0 (Created)
- Group size must be 2
- Payment amount must equal `escrow_amount`
- Payment receiver must be contract address

**Example (Python):**
```python
from algosdk.atomic_transaction_composer import AtomicTransactionComposer
from algosdk.transaction import PaymentTxn

atc = AtomicTransactionComposer()

# Transaction 1: Payment
pay_txn = PaymentTxn(
    sender=client_address,
    sp=algod.suggested_params(),
    receiver=app_address,
    amt=5_000_000  # Must match escrow_amount
)
atc.add_transaction(TransactionWithSigner(pay_txn, client_signer))

# Transaction 2: App call
atc.add_method_call(
    app_id=app_id,
    method=get_method("fund"),
    sender=client_address,
    signer=client_signer,
    sp=algod.suggested_params()
)

atc.execute(algod, 4)
```

---

### 3. `submit_work(ipfs_hash)`

**Description:** Submit work deliverable via IPFS hash.

**Caller:** Freelancer only

**Parameters:**
- `ipfs_hash` (string): IPFS CID (46-59 bytes, supports CIDv0 and CIDv1)

**Returns:** void

**State Changes:**
- Stores `ipfs_hash` in `work_hash`
- `job_status = 2` (Submitted)

**Validation:**
- Sender must be `freelancer_address`
- Current status must be 1 (Funded)
- IPFS hash length must be between 46-59 bytes

**Example IPFS Hashes:**
- CIDv0: `QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG` (46 chars)
- CIDv1: `bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi` (59 chars)

**Example (Python):**
```python
client = AlgoFreelanceClient(algod_client=algod, app_id=app_id)
client.submit_work(
    ipfs_hash="QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
    transaction_parameters={"sender": freelancer_address, "signer": freelancer_signer}
)
```

---

### 4. `approve_work()` ⭐ **CORE INNOVATION**

**Description:** Approve work and execute atomic payment + NFT mint + transfer.

**Caller:** Client only

**Parameters:** None

**Returns:** void

**Inner Transactions (Executed Atomically):**

1. **Payment Transaction:**
   - Type: Payment
   - Receiver: `freelancer_address`
   - Amount: `escrow_amount`
   - Fee: 0 (covered by outer transaction)

2. **Asset Creation Transaction (Mint NFT):**
   - Type: Asset Config
   - Total: 1 (unique NFT)
   - Decimals: 0 (non-divisible)
   - Asset Name: `"AlgoFreelance: " + job_title`
   - Unit Name: `"POWCERT"` (Proof-of-Work Certificate)
   - URL: `"ipfs://" + work_hash`
   - Manager: Zero address (immutable)
   - Reserve: Zero address (immutable)
   - Freeze: Zero address (cannot be frozen)
   - Clawback: Zero address (cannot be clawed back)

3. **Asset Transfer Transaction:**
   - Type: Asset Transfer
   - Asset: Created NFT from transaction 2
   - Receiver: `freelancer_address`
   - Amount: 1
   - Fee: 0 (covered by outer transaction)

**State Changes:**
- `job_status = 3` (Completed)

**Validation:**
- Sender must be `client_address`
- Current status must be 2 (Submitted)
- Freelancer must have opted into the NFT asset (checked implicitly by atomic transfer)

**Fee Calculation:**
- Outer transaction fee must cover: 1 app call + 3 inner transactions = 4 × 0.001 ALGO = 0.004 ALGO minimum

**Atomicity Guarantee:**
All 3 inner transactions succeed together or fail together. If any transaction fails (e.g., freelancer not opted in to NFT), the entire group reverts and no state changes occur.

**Example (Python):**
```python
client = AlgoFreelanceClient(algod_client=algod, app_id=app_id)

# Increase fee to cover inner transactions
sp = algod.suggested_params()
sp.fee = 4000  # 4 × minimum fee
sp.flat_fee = True

client.approve_work(
    transaction_parameters={"sender": client_address, "signer": client_signer, "suggested_params": sp}
)
```

---

### 5. `cancel()`

**Description:** Cancel job before work is submitted and refund client.

**Caller:** Client only

**Parameters:** None

**Returns:** void

**State Changes:**
- Refunds `contract_balance - min_balance` to client
- `job_status = 4` (Canceled)

**Validation:**
- Sender must be `client_address`
- Current status must be < 2 (Created or Funded only)

**Note:** Cannot cancel after freelancer has submitted work (status 2+).

**Example (Python):**
```python
client = AlgoFreelanceClient(algod_client=algod, app_id=app_id)
client.cancel(
    transaction_parameters={"sender": client_address, "signer": client_signer}
)
```

---

### 6. `get_job_details()` [readonly]

**Description:** Query all contract state. This is a readonly method that does not modify state.

**Caller:** Anyone (no authentication required)

**Parameters:** None

**Returns:** `JobDetails` struct containing:
- `client_address` (address)
- `freelancer_address` (address)
- `escrow_amount` (uint64)
- `job_status` (uint64)
- `work_hash` (string)
- `job_title` (string)
- `created_at` (uint64)
- `app_id` (uint64)

**Example (Python):**
```python
client = AlgoFreelanceClient(algod_client=algod, app_id=app_id)
result = client.get_job_details()
job_details = result.return_value

print(f"Job: {job_details.job_title}")
print(f"Status: {job_details.job_status}")
print(f"Escrow: {job_details.escrow_amount / 1_000_000} ALGO")
```

---

## Minimum Balance Requirements

The contract requires sufficient ALGO balance to maintain state and create assets:

| Requirement | Amount | Description |
|-------------|--------|-------------|
| Base account | 0.1 ALGO | Minimum to keep account open |
| Global state | 0.028 ALGO | 7 key-value pairs |
| Created asset | 0.1 ALGO | Per NFT minted |
| **Recommended buffer** | **0.3 ALGO** | **Additional buffer for fees and safety** |

**Client Funding Amount:** `escrow_amount + 0.3 ALGO`

Example: For a 5 ALGO job, client should fund with 5.3 ALGO.

---

## Transaction Fees

| Operation | Fee | Notes |
|-----------|-----|-------|
| Deploy (create_bare) | 0.001 ALGO | Standard transaction fee |
| Initialize | 0.001 ALGO | App call |
| Fund (grouped) | 0.002 ALGO | Payment + app call |
| Submit work | 0.001 ALGO | App call |
| **Approve work** | **0.004 ALGO** | **App call + 3 inner transactions** |
| Cancel | 0.002 ALGO | App call + inner payment |
| Get details | 0 ALGO | Readonly, no fee |

---

## Security Properties

1. **Trustless Escrow:** Funds locked in contract until conditions met
2. **Atomic Execution:** Payment and NFT transfer succeed/fail together
3. **Immutable NFTs:** No manager/freeze/clawback = permanent certificate
4. **State Machine:** Enforced status transitions prevent invalid operations
5. **Authorization:** Each method validates caller identity

---

## Testing Resources

- **LocalNet Dispenser:** Use `algokit localnet start` and fund test accounts
- **TestNet Dispenser:** https://bank.testnet.algorand.network/
- **TestNet Explorer:** https://testnet.explorer.perawallet.app/
- **IPFS Gateway (test):** https://gateway.pinata.cloud/ipfs/

---

## References

- **Contract Source:** `AlgoFreelance-contracts/smart_contracts/algo_freelance/contract.py`
- **ABI Specification:** `AlgoFreelance-contracts/smart_contracts/artifacts/algo_freelance/AlgoFreelance.arc56.json`
- **Generated Client:** `AlgoFreelance-contracts/smart_contracts/artifacts/algo_freelance/algo_freelance_client.py`
- **PRD:** See project root `PRD.md` for full requirements

---

**Last Updated:** Oct 19, 2025  
**Version:** 1.0

