from algopy import ARC4Contract, String, UInt64, Bytes, Global, Txn, itxn, Asset, arc4, op, gtxn
from typing import NamedTuple

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
    def __init__(self) -> None:
        self.client_address = Global.bytes_variable()
        self.freelancer_address = Global.bytes_variable()
        self.escrow_amount = Global.uint64_variable()
        self.job_status = Global.uint64_variable()
        self.work_hash = Global.bytes_variable()
        self.job_title = Global.bytes_variable()
        self.created_at = Global.uint64_variable()

    @arc4.abimethod
    def initialize(
        self,
        client_address: arc4.Address,
        freelancer_address: arc4.Address,
        escrow_amount: arc4.UInt64,
        job_title: arc4.String,
    ) -> None:
        assert Txn.sender == Global.creator_address
        assert self.job_status.get() == 0, "Contract already initialized"

        self.client_address.set(client_address.get())
        self.freelancer_address.set(freelancer_address.get())
        self.escrow_amount.set(escrow_amount.get())
        self.job_title.set(job_title.get())
        self.created_at.set(Txn.block_timestamp)
        self.job_status.set(UInt64(1)) # Status: Created

    @arc4.abimethod
    def fund(self) -> None:
        assert self.job_status.get() == 1, "Job not in Created status"
        assert Txn.sender == self.client_address.get(), "Only client can fund"
        assert gtxn.group_size == 2, "Must be grouped with a payment transaction"
        assert gtxn.transactions[1].type_enum == op.TxnType.Payment, "Second transaction must be a payment"
        assert gtxn.transactions[1].receiver == Global.current_application_address, "Payment must be to the contract"
        assert gtxn.transactions[1].amount == self.escrow_amount.get(), "Payment amount must match escrow amount"

        self.job_status.set(UInt64(2)) # Status: Funded

    @arc4.abimethod
    def submit_work(self, ipfs_hash: arc4.String) -> None:
        assert self.job_status.get() == 2, "Job not in Funded status"
        assert Txn.sender == self.freelancer_address.get(), "Only freelancer can submit work"

        self.work_hash.set(ipfs_hash.get())
        self.job_status.set(UInt64(3)) # Status: Submitted

    @arc4.abimethod
    def approve_work(self) -> None:
        assert self.job_status.get() == 3, "Job not in Submitted status"
        assert Txn.sender == self.client_address.get(), "Only client can approve work"

        # 1. Pay the freelancer
        itxn.Payment(
            receiver=self.freelancer_address.get(),
            amount=self.escrow_amount.get(),
        ).submit()

        # 2. Mint the NFT
        nft_creation = itxn.AssetConfig(
            total=1,
            decimals=0,
            asset_name=op.concat(Bytes("AlgoFreelance: "), self.job_title.get()),
            unit_name=Bytes("POWCERT"),
            url=self.work_hash.get(),
            manager_address=Global.zero_address,
            reserve_address=Global.zero_address,
            freeze_address=Global.zero_address,
            clawback_address=Global.zero_address,
        ).submit()

        # 3. Transfer the NFT to the freelancer
        itxn.AssetTransfer(
            xfer_asset=nft_creation.created_asset,
            asset_receiver=self.freelancer_address.get(),
            asset_amount=1,
        ).submit()

        self.job_status.set(UInt64(4)) # Status: Completed

    @arc4.abimethod
    def cancel(self) -> None:
        assert self.job_status.get() == 1 or self.job_status.get() == 2, "Job cannot be canceled in its current state"
        assert Txn.sender == self.client_address.get(), "Only client can cancel"

        itxn.Payment(
            receiver=self.client_address.get(),
            amount=Global.current_application_address.balance - Global.min_balance,
            close_remainder_to=self.client_address.get(),
        ).submit()

    @arc4.abimethod(readonly=True)
    def get_job_details(self) -> JobDetails:
        return JobDetails(
            client_address=arc4.arc4_from_bytes(self.client_address.get()),
            freelancer_address=arc4.arc4_from_bytes(self.freelancer_address.get()),
            escrow_amount=arc4.arc4_from_uint64(self.escrow_amount.get()),
            job_status=arc4.arc4_from_uint64(self.job_status.get()),
            work_hash=arc4.arc4_from_bytes(self.work_hash.get()),
            job_title=arc4.arc4_from_bytes(self.job_title.get()),
            created_at=arc4.arc4_from_uint64(self.created_at.get()),
            app_id=arc4.arc4_from_uint64(Global.current_application_id),
        )