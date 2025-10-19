import pytest
import algopy
from algopy_testing import AlgopyTestContext

from smart_contracts.algo_freelance.contract import AlgoFreelance

VALID_IPFS_HASH = "Qmaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"

@pytest.fixture
def contract() -> AlgoFreelance:
    return AlgoFreelance()

@pytest.fixture
def submitted_contract(context: AlgopyTestContext, contract: AlgoFreelance, app_id) -> tuple[AlgoFreelance, algopy.Account, algopy.Account]:
    client = context.any.account()
    freelancer = context.any.account()
    escrow_amount = 5_000_000
    job_title = "Logo Design"

    # Use contract methods for proper state transitions
    contract.initialize(
        client_address=algopy.arc4.Address(client),
        freelancer_address=algopy.arc4.Address(freelancer),
        escrow_amount=algopy.arc4.UInt64(escrow_amount),
        job_title=algopy.arc4.String(job_title),
    )

    # Directly set contract state to bypass grouped transaction requirement for fund()
    contract.job_status.value = algopy.arc4.UInt64(1)  # Status: Funded
    
    # Fund the contract account with escrow + fees
    context.ledger.update_account(app_id.address, balance=escrow_amount + 200_000)

    # Submit work - directly set state to bypass transaction context issues
    contract.work_hash.value = algopy.arc4.String(VALID_IPFS_HASH)
    contract.job_status.value = algopy.arc4.UInt64(2)  # Status: Submitted

    return contract, client, freelancer

def test_approve_work_success(context: AlgopyTestContext, submitted_contract: tuple[AlgoFreelance, algopy.Account, algopy.Account]) -> None:
    contract, client, freelancer = submitted_contract
    escrow_amount = contract.escrow_amount.value
    # Use dictionary access for balance
    freelancer_balance_before = context.ledger.get_account(freelancer)["amount"]

    approve_call = context.txn.defer_app_call(contract.approve_work)
    with context.txn.create_group(active_txn_overrides={"sender": client}):
        approve_call.submit()

    assert contract.job_status.value == 3
    # Use dictionary access for balance
    freelancer_balance_after = context.ledger.get_account(freelancer)["amount"]
    assert freelancer_balance_after == freelancer_balance_before + escrow_amount

    created_asset_id = approve_call.created_asset
    assert created_asset_id > 0
    assert context.ledger.get_asset_balance(freelancer, created_asset_id) == 1