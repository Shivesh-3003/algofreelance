"""
Edge Cases & Invalid State Transition Tests
"""

import pytest
from algopy import arc4, Account
from algopy_testing import AlgopyTestContext

from smart_contracts.algo_freelance.contract import AlgoFreelance

VALID_IPFS_HASH = "Qmaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"

@pytest.fixture
def contract() -> AlgoFreelance:
    return AlgoFreelance()

@pytest.fixture
def initialized_contract(context: AlgopyTestContext, contract: AlgoFreelance) -> tuple[AlgoFreelance, Account, Account]:
    client = context.any.account()
    freelancer = context.any.account()
    contract.initialize(
        client_address=arc4.Address(client),
        freelancer_address=arc4.Address(freelancer),
        escrow_amount=arc4.UInt64(1_000_000),
        job_title=arc4.String("Test Job"),
    )
    return contract, client, freelancer

@pytest.fixture
def funded_contract(context: AlgopyTestContext, initialized_contract: tuple[AlgoFreelance, Account, Account], app_id) -> tuple[AlgoFreelance, Account, Account]:
    contract, client, freelancer = initialized_contract
    escrow_amount = contract.escrow_amount.value
    # Directly set contract state to bypass grouped transaction requirement
    contract.job_status.value = arc4.UInt64(1)  # Status: Funded
    # Fund the contract account
    context.ledger.update_account(app_id.address, balance=escrow_amount + 200_000)
    return contract, client, freelancer

@pytest.fixture
def submitted_contract(context: AlgopyTestContext, funded_contract: tuple[AlgoFreelance, Account, Account], app_id) -> tuple[AlgoFreelance, Account, Account]:
    contract, client, freelancer = funded_contract
    # Directly set state to submitted
    contract.work_hash.value = arc4.String(VALID_IPFS_HASH)
    contract.job_status.value = arc4.UInt64(2)  # Status: Submitted
    return contract, client, freelancer

def test_double_approval(context: AlgopyTestContext, submitted_contract: tuple[AlgoFreelance, Account, Account]) -> None:
    contract, client, _ = submitted_contract

    approve_call = context.txn.defer_app_call(contract.approve_work)
    with context.txn.create_group(active_txn_overrides={"sender": client}):
        approve_call.submit()
    assert contract.job_status.value == 3

    with pytest.raises(AssertionError, match="Job not in Submitted status"):
        approve_call_2 = context.txn.defer_app_call(contract.approve_work)
        with context.txn.create_group(active_txn_overrides={"sender": client}):
            approve_call_2.submit()

def test_cancel_after_funding(context: AlgopyTestContext, funded_contract: tuple[AlgoFreelance, Account, Account]) -> None:
    contract, client, _ = funded_contract
    escrow_amount = contract.escrow_amount.value
    client_balance_before = context.ledger.get_account(client)["amount"]

    cancel_call = context.txn.defer_app_call(contract.cancel)
    with context.txn.create_group(active_txn_overrides={"sender": client}):
        cancel_call.submit()

    assert contract.job_status.value == 4
    assert context.ledger.get_account(client)["amount"] > client_balance_before + escrow_amount - 1000
