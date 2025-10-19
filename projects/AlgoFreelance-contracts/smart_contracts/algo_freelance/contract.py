from algopy import ARC4Contract, String, UInt64, Bytes, Global, Txn, itxn, Asset, arc4, op, gtxn, Account, GlobalState
from typing import NamedTuple

# --- PRD §6.1: Job Status Enum ---
# 0: Created - Contract deployed, awaiting funding.
# 1: Funded - Client has funded the escrow.
# 2: Submitted - Freelancer has submitted the work hash.
# 3: Completed - Client has approved the work, payment and NFT transfer are done.
# 4: Canceled - Client has canceled the job.

class JobDetails(NamedTuple):
    client_address: arc4.Address
    freelancer_address: arc4.Address
    escrow_amount: arc4.UInt64
    job_status: arc4.UInt64
    work_hash: arc4.String
    job_title: arc4.String
    created_at: arc4.UInt64
    app_id: arc4.UInt64

class AlgoFreelance(ARC4Contract):
    # --- PRD §6.1: Global State Schema ---
    def __init__(self) -> None:
        self.client_address = GlobalState(arc4.Address, key="client_address")
        self.freelancer_address = GlobalState(arc4.Address, key="freelancer_address")
        self.escrow_amount = GlobalState(arc4.UInt64, key="escrow_amount")
        self.job_status = GlobalState(arc4.UInt64, key="job_status")
        self.work_hash = GlobalState(arc4.String, key="work_hash")
        self.job_title = GlobalState(arc4.String, key="job_title")
        self.created_at = GlobalState(arc4.UInt64, key="created_at")

    @arc4.abimethod
    def initialize(
        self,
        client_address: arc4.Address,
        freelancer_address: arc4.Address,
        escrow_amount: arc4.UInt64,
        job_title: arc4.String,
    ) -> None:
        # --- PRD §6.2: initialize() ---
        assert Txn.sender == Global.creator_address, "Only the creator can initialize the contract"
        # Extract native values from ARC4 types
        assert escrow_amount > UInt64(0), "Escrow amount must be greater than 0"

        # Use .value to set global state
        self.client_address.value = client_address
        self.freelancer_address.value = freelancer_address
        self.escrow_amount.value = escrow_amount
        self.job_title.value = job_title  # Store ARC4 String directly
        self.created_at.value = arc4.UInt64(Global.latest_timestamp)
        self.job_status.value = arc4.UInt64(0)  # Status: Created
        self.work_hash.value = arc4.String("")  # Initialize to empty arc4 string

    @arc4.abimethod
    def fund(self) -> None:
        # This method provides a robust way to atomically fund the contract and update its state.
        assert self.job_status.value == arc4.UInt64(0), "Job not in Created status"
        assert Txn.sender == self.client_address.value.native, "Only client can fund"

        # Verify this app call is grouped with a payment transaction to this contract
        assert Global.group_size == UInt64(2), "Must be grouped with a payment transaction"
        payment_txn = gtxn.PaymentTransaction(1)
        assert payment_txn.receiver == Global.current_application_address, "Payment must be to the contract"
        assert payment_txn.amount == self.escrow_amount.value.native, "Payment amount must match escrow amount"

        self.job_status.value = arc4.UInt64(1)  # Status: Funded

    @arc4.abimethod
    def submit_work(self, ipfs_hash: arc4.String) -> None:
        # --- PRD §6.2: submit_work() ---
        assert self.job_status.value == arc4.UInt64(1), "Job not in Funded status"
        assert Txn.sender == self.freelancer_address.value.native, "Only freelancer can submit work"

        # --- PRD §6.2 Validation: ipfs_hash length between 46-59 bytes (CIDv0/v1) ---
        # Get hash length using .bytes.length
        hash_len = ipfs_hash.bytes.length
        assert hash_len >= UInt64(46) and hash_len <= UInt64(59), "Invalid IPFS hash length"

        # Store the arc4.String directly
        self.work_hash.value = ipfs_hash
        self.job_status.value = arc4.UInt64(2)  # Status: Submitted

    @arc4.abimethod
    def approve_work(self) -> None:
        # --- PRD §6.2: approve_work() ---
        assert self.job_status.value == arc4.UInt64(2), "Job not in Submitted status"
        assert Txn.sender == self.client_address.value.native, "Only client can approve work"

        # --- PRD §6.2 Core Innovation: Grouped Inner Transactions ---
        # 1. Payment to Freelancer
        itxn.Payment(
            receiver=self.freelancer_address.value.native,
            amount=self.escrow_amount.value.native,
            fee=UInt64(0)  # Covered by outer transaction fee
        ).submit()

        # 2. Mint POW NFT
        # Get native string from arc4.String for concatenation
        job_title_bytes = self.job_title.value.native.bytes
        work_hash_bytes = self.work_hash.value.native.bytes

        nft_creation = itxn.AssetConfig(
            total=UInt64(1),
            decimals=UInt64(0),
            asset_name=op.concat(Bytes(b"AlgoFreelance: "), job_title_bytes),
            unit_name=Bytes(b"POWCERT"),
            url=op.concat(Bytes(b"ipfs://"), work_hash_bytes),  # Add ipfs:// prefix for standard compliance
            manager=Account(),
            reserve=Account(),
            freeze=Account(),
            clawback=Account(),
        ).submit()

        # 3. Transfer NFT to Freelancer
        itxn.AssetTransfer(
            xfer_asset=nft_creation.created_asset,
            asset_receiver=self.freelancer_address.value.native,
            asset_amount=UInt64(1),
            fee=UInt64(0)  # Covered by outer transaction fee
        ).submit()

        self.job_status.value = arc4.UInt64(3)  # Status: Completed

    @arc4.abimethod
    def cancel(self) -> None:
        # Allows client to cancel before work is submitted and retrieve funds.
        assert self.job_status.value.native < UInt64(2), "Job cannot be canceled after work has been submitted"  # Status 0 or 1
        assert Txn.sender == self.client_address.value.native, "Only client can cancel"

        # Refund the client, leaving the minimum balance to keep the account open.
        # A separate "delete" method would be needed to close the account entirely.
        itxn.Payment(
            receiver=self.client_address.value.native,
            amount=Global.current_application_address.balance - Global.min_balance,
        ).submit()

        self.job_status.value = arc4.UInt64(4)  # Status: Canceled

    @arc4.abimethod(readonly=True)
    def get_job_details(self) -> JobDetails:
        # Return job details - arc4.Strings and arc4.Addresses are stored directly and can be returned as-is
        return JobDetails(
            client_address=self.client_address.value,
            freelancer_address=self.freelancer_address.value,
            escrow_amount=self.escrow_amount.value,
            job_status=self.job_status.value,
            work_hash=self.work_hash.value,
            job_title=self.job_title.value,
            created_at=self.created_at.value,
            app_id=arc4.UInt64(Global.current_application_id.id),
        )
