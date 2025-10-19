# AlgoFreelance: Decentralized Escrow with Proof-of-Work NFTs

AlgoFreelance replaces centralized freelance platforms with an autonomous Algorand smart contract. It trustlessly escrows client payments and, upon job completion, **atomically executes a grouped inner transaction** that:

1.  **Pays** the freelancer in ALGO.
2.  **Mints** a unique, immutable Proof-of-Work (POW) NFT certificate.
3.  **Transfers** the POW NFT directly to the freelancer's wallet.

This creates a verifiable, portable, on-chain reputation for freelancers, secured by Algorand, with zero platform fees and instant settlement.

---

## 📹 Demo & Code Walkthrough

_[Youtube Link]_

---

## 🖼️ Application Screenshots

_[Screenshot 1: Job Creation Form]_
_[Screenshot 2: Job Details Page (Awaiting Funding / Work Submission)]_
_[Screenshot 3: Freelancer's Work Submission Modal (with IPFS upload)]_
_[Screenshot 4: Client's View (with "Approve Work" button)]_
_[Screenshot 5: Freelancer's NFT Portfolio (showing the newly minted POW NFT)]_

---

## 🛠 Smart Contract: `AlgoFreelance (contract.py)`

The entire system is managed by a single, stateful Algorand smart contract (`AlgoFreelance`). This contract acts as the autonomous escrow agent, vault, and NFT minter.

**Purpose:**
To manage the full lifecycle of a single freelance job, from creation and funding to final payment and minting of a Proof-of-Work certificate.

### Key ABI Methods

- **`initialize(...)`**

  - **Who:** Called by the backend upon job creation.
  - **What:** Sets the initial state of the contract: `client_address`, `freelancer_address`, `escrow_amount`, and `job_title`.
  - **Status:** `0` (Created)

- **`fund()`**

  - **Who:** Called by the **Client**.
  - **What:** This method must be called in an atomic group with a payment transaction from the client to the contract. The contract verifies the payment amount matches the `escrow_amount` before proceeding.
  - **Status:** `1` (Funded)

- **`submit_work(ipfs_hash: String)`**

  - **Who:** Called by the **Freelancer**.
  - **What:** The freelancer submits the IPFS CID (hash) of their completed work. The contract validates the hash length (46-59 bytes) to ensure it's a valid CID.
  - **Status:** `2` (Submitted)

- **`approve_work()` ⭐ Core Innovation ⭐**

  - **Who:** Called by the **Client**.
  - **What:** This is the core of the project. When called, it triggers a sequence of **grouped inner transactions** _from the smart contract itself_:
    1.  **Payment:** Submits an `itxn.Payment` to transfer the full `escrow_amount` from the contract's balance to the `freelancer_address`.
    2.  **NFT Mint:** Submits an `itxn.AssetConfig` to create a new, unique ASA (NFT). The NFT's metadata is set using the `job_title` and the `work_hash` (e.g., `url: "ipfs://{work_hash}"`).
    3.  **NFT Transfer:** Submits an `itxn.AssetTransfer` to send the newly minted NFT (total supply: 1) to the `freelancer_address`.
  - **Atomicity:** All three actions succeed or fail together. It is impossible for the freelancer to be paid without receiving the NFT, or for the NFT to be minted without the freelancer being paid.
  - **Status:** `3` (Completed)

- **`cancel()`**

  - **Who:** Called by the **Client**.
  - **What:** A safety measure. The client can cancel the job and withdraw their funds _only_ if the job is in the `Created` (0) or `Funded` (1) state. This is disabled once the freelancer calls `submit_work()`.
  - **Status:** `4` (Canceled)

- **`get_job_details() -> JobDetails`**
  - **Who:** Anyone (Read-only).
  - **What:** Returns a struct containing all current job state variables.

### 🔒 Key Security Features

- **Strict Sender Checks:** Every state-changing method (`fund`, `submit_work`, `approve_work`, `cancel`) uses `assert Txn.sender == ...` to ensure only the authorized party (client or freelancer) can perform an action.
- **Status-Based Logic:** The contract uses a `job_status` enum to enforce a strict lifecycle. For example, `approve_work` will fail if the status isn't `Submitted` (2).
- **Grouped Transaction Validation:** The `fund` method explicitly checks that it is part of a 2-transaction group and that the _other_ transaction is a payment of the _exact_ escrow amount.
- **Immutable NFTs:** When minting the POW NFT, the `manager`, `reserve`, `freeze`, and `clawback` addresses are set to an empty `Account()`. This makes the NFT truly immutable and permanently owned by the freelancer, with no possibility of it being altered or clawed back.
- **IPFS Hash Validation:** The `submit_work` method performs a basic sanity check on the length of the IPFS hash to prevent storage of junk data.

---

## 🔗 System Interaction Flow

1.  **Job Creation:** The **Client** fills out a form on the frontend. The backend deploys a new `AlgoFreelance` contract instance with the job details.
2.  **Funding:** The **Client** signs and sends a grouped transaction: a `Payment` transaction (to fund the contract) and an `ApplicationCall` transaction (to the `fund()` method).
3.  **Work Submission:** The **Freelancer** uploads their deliverable to IPFS, gets the CID, and calls the `submit_work()` method with the CID.
4.  **Approval:** The **Client** reviews the work (via the IPFS link) and calls the `approve_work()` method.
5.  **Atomic Settlement:** The smart contract automatically executes the 3-part inner transaction group:
    - ALGO is paid to the freelancer.
    - POW NFT is minted.
    - POW NFT is transferred to the freelancer.
6.  **Completion:** The job is complete. The freelancer has their payment and a permanent, on-chain certificate of their work.

---

## 🔗 Deployed Contract (TestNet)

_[Your AlgoExplorer / Pera Explorer link to the deployed Application ID on TestNet here.]_

---

## ✅ Final Summary

This smart contract architecture ensures that:

- Clients can hire with confidence, knowing funds are only released upon approval.
- Freelancers can work with certainty, knowing payment is guaranteed and atomic with their on-chain reputation.
- Reputation (POW NFTs) is portable, immutable, and owned by the freelancer, not a platform.
- The entire process is autonomous, transparent, and removes the need for costly intermediaries, all thanks to Algorand's powerful inner transaction capabilities.
