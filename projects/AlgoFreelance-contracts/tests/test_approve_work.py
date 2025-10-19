"""
Approve Work Method Tests
"""

import pytest
from algopy import arc4, Account, Asset
from algopy_testing import AlgopyTestContext

from smart_contracts.algo_freelance.contract import AlgoFreelance

VALID_IPFS_HASH = "Qmaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"

@pytest.fixture
def contract() -> AlgoFreelance:
    return AlgoFreelance()

@pytest.fixture
def submitted_contract(context: AlgopyTestContext, contract: AlgoFreelance, app_id) -> tuple[AlgoFreelance, Account, Account]:
    client = context.any.account()
    freelancer = context.any.account()
    escrow_amount = 1_000_000

    # Initialize contract first
    contract.initialize(
        client_address=arc4.Address(client),
        freelancer_address=arc4.Address(freelancer),
        escrow_amount=arc4.UInt64(escrow_amount),
        job_title=arc4.String("Test Job"),
    )

    # Directly set contract state to bypass grouped transaction requirement for fund()
    contract.job_status.value = arc4.UInt64(1)  # Status: Funded
    
    # Fund the contract account with escrow + fees
    context.ledger.update_account(app_id.address, balance=escrow_amount + 200_000)

    # Submit work - directly set state to bypass transaction context issues
    contract.work_hash.value = arc4.String(VALID_IPFS_HASH)
    contract.job_status.value = arc4.UInt64(2)  # Status: Submitted

    return contract, client, freelancer

def test_approve_work_success(context: AlgopyTestContext, submitted_contract: tuple[AlgoFreelance, Account, Account]) -> None:
    contract, client, freelancer = submitted_contract
    freelancer_balance_before = context.ledger.get_account(freelancer)["amount"]
    escrow_amount = contract.escrow_amount.value

    approve_call = context.txn.defer_app_call(contract.approve_work)
    with context.txn.create_group(active_txn_overrides={"sender": client}):
        approve_call.submit()

    freelancer_balance_after = context.ledger.get_account(freelancer)["amount"]
    assert freelancer_balance_after == freelancer_balance_before + escrow_amount

    created_asset_id = approve_call.created_asset
    assert created_asset_id > 0
    freelancer_asset_balance = context.ledger.get_asset_balance(freelancer, created_asset_id)
    assert freelancer_asset_balance == 1

    nft = context.ledger.get_asset(created_asset_id)
    assert nft.total == 1
    assert nft.decimals == 0
    assert nft.unit_name == "POWCERT"
    assert nft.name == "AlgoFreelance: Test Job"
    assert nft.url == f"ipfs://{VALID_IPFS_HASH}"

    assert not nft.manager
    assert not nft.freeze
    assert not nft.clawback
    assert not nft.reserve

    assert contract.job_status.value == 3
