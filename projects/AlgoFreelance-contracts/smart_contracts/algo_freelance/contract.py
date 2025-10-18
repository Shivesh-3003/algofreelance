from algopy import ARC4Contract, String, UInt64, Bytes, Global, Txn, itxn, Asset, Local, arc4, op, gtxn
from algopy.arc4 import abimethod

class AlgoFreelance(ARC4Contract):
    def __init__(self) -> None:
        self.client_address = Global.bytes_("client_address")
        self.freelancer_address = Global.bytes_("freelancer_address")
        self.escrow_amount = Global.uint64("escrow_amount")
        self.job_status = Global.uint64("job_status")
        self.work_hash = Global.bytes_("work_hash")
        self.job_title = Global.bytes_("job_title")
        self.created_at = Global.uint64("created_at")

    @abimethod
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

    @abimethod
    def fund(self) -> None:
        assert self.job_status.get() == 1, "Job not in Created status"
        assert Txn.sender == self.client_address.get(), "Only client can fund"
        assert gtxn.group_size == 2, "Must be grouped with a payment transaction"
        assert gtxn.transactions[1].type_enum == op.TxnType.Payment, "Second transaction must be a payment"
        assert gtxn.transactions[1].receiver == Global.current_application_address, "Payment must be to the contract"
        assert gtxn.transactions[1].amount == self.escrow_amount.get(), "Payment amount must match escrow amount"

        self.job_status.set(UInt64(2)) # Status: Funded

    @abimethod
    def submit_work(self, ipfs_hash: arc4.String) -> None:
        assert self.job_status.get() == 2, "Job not in Funded status"
        assert Txn.sender == self.freelancer_address.get(), "Only freelancer can submit work"

        self.work_hash.set(ipfs_hash.get())
        self.job_status.set(UInt64(3)) # Status: Submitted

    @abimethod
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

    @abimethod
    def cancel(self) -> None:
        assert self.job_status.get() == 1 or self.job_status.get() == 2, "Job cannot be canceled in its current state"
        assert Txn.sender == self.client_address.get(), "Only client can cancel"

        itxn.Payment(
            receiver=self.client_address.get(),
            amount=Global.current_application_address.balance - Global.min_balance,
            close_remainder_to=self.client_address.get(),
        ).submit()

    @abimethod(allow_actions=["read_only"])
    def get_job_details(self) -> arc4.Tuple[
        arc4.Address,
        arc4.Address,
        arc4.UInt64,
        arc4.UInt64,
        arc4.String,
        arc4.String,
        arc4.UInt64,
    ]:
        return arc4.Tuple(
            arc4.arc4_from_bytes(self.client_address.get()),
            arc4.arc4_from_bytes(self.freelancer_address.get()),
            arc4.arc4_from_uint64(self.escrow_amount.get()),
            arc4.arc4_from_uint64(self.job_status.get()),
            arc4.arc4_from_bytes(self.work_hash.get()),
            arc4.arc4_from_bytes(self.job_title.get()),
            arc4.arc4_from_uint64(self.created_at.get()),
        )
    


    #sometimes clients want to change the details of the job (so maybe we need to allow for changes in job details)