import pytest
from algopy import Account, ARC4Contract, Application, Bytes, Global, Txn, arc4, op, gtxn, UInt64
from algopy_testing import AlgopyTestContext, algopy_testing_context
from collections.abc import Iterator

from smart_contracts.algo_freelance.contract import AlgoFreelance


@pytest.fixture()
def contract(context: AlgopyTestContext) -> AlgoFreelance:
    return AlgoFreelance()

# A valid 46-byte CIDv0 hash for testing
VALID_IPFS_HASH = "Qmaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"

def test_initialize(context: AlgopyTestContext, contract: AlgoFreelance) -> None:
    # Arrange
    client = context.any.account()
    freelancer = context.any.account()
    escrow_amount = 1_000_000
    job_title = "Test Job"

    # Act
    contract.initialize(
        client_address=arc4.Address(client),
        freelancer_address=arc4.Address(freelancer),
        escrow_amount=arc4.UInt64(escrow_amount),
        job_title=arc4.String(job_title),
    )

    # Assert - use .value to access GlobalState
    assert contract.client_address.value == arc4.Address(client)
    assert contract.freelancer_address.value == arc4.Address(freelancer)
    assert contract.escrow_amount.value == escrow_amount
    # job_title is stored as arc4.String, so compare with arc4.String
    assert contract.job_title.value == arc4.String(job_title)
    assert contract.job_status.value == 0  # Status: Created


def test_fund(context: AlgopyTestContext, contract: AlgoFreelance, app_id: Application) -> None:
    # Arrange
    client = context.any.account()
    freelancer = context.any.account()
    escrow_amount = 1_000_000
    job_title = "Test Job"

    # Initialize contract
    contract.initialize(
        client_address=arc4.Address(client),
        freelancer_address=arc4.Address(freelancer),
        escrow_amount=arc4.UInt64(escrow_amount),
        job_title=arc4.String(job_title),
    )
    assert contract.job_status.value == 0

    # Act - Call fund with payment transaction
    # Create payment and app call transactions
    payment = context.any.txn.payment(sender=client, receiver=app_id.address, amount=escrow_amount)
    app_call_txn = context.any.txn.application_call(sender=client, app_id=app_id)

    # Execute fund with transactions in group
    with context.txn._maybe_implicit_txn_group([app_call_txn, payment]):
        contract.fund()

    # Assert
    assert contract.job_status.value == arc4.UInt64(1)  # Status: Funded


def test_submit_work(context: AlgopyTestContext, contract: AlgoFreelance, app_id: Application) -> None:
    # Arrange
    client = context.any.account()
    freelancer = context.any.account()
    escrow_amount = 1_000_000
    job_title = "Test Job"

    contract.initialize(
        client_address=arc4.Address(client),
        freelancer_address=arc4.Address(freelancer),
        escrow_amount=arc4.UInt64(escrow_amount),
        job_title=arc4.String(job_title),
    )

    payment = context.any.txn.payment(sender=client, receiver=app_id.address, amount=escrow_amount)
    app_call = context.txn.defer_app_call(contract.fund)

    with context.txn.create_group([payment, app_call], active_txn_index=1):
        app_call.submit()

    assert contract.job_status.value == 1

    # Act - call submit_work within a transaction context
    app_call = context.txn.defer_app_call(contract.submit_work, ipfs_hash=arc4.String(VALID_IPFS_HASH))
    with context.txn.create_group(active_txn_overrides={"sender": freelancer}):
        app_call.submit()

    # Assert - work_hash is stored as arc4.String
    assert contract.work_hash.value == arc4.String(VALID_IPFS_HASH)
    assert contract.job_status.value == 2  # Status: Submitted


def test_approve_work(context: AlgopyTestContext, contract: AlgoFreelance, app_id: Application) -> None:
    # Arrange
    client = context.any.account()
    freelancer = context.any.account()
    escrow_amount = 1_000_000
    job_title = "Test Job"

    # Ensure contract and freelancer have minimum balance for inner transactions and asset opt-in
    context.ledger.update_account(app_id.address, balance=200_000)  # MBR for app + asset creation
    context.ledger.update_account(freelancer, balance=100_000)  # MBR for asset opt-in

    contract.initialize(
        client_address=arc4.Address(client),
        freelancer_address=arc4.Address(freelancer),
        escrow_amount=arc4.UInt64(escrow_amount),
        job_title=arc4.String(job_title),
    )

    payment = context.any.txn.payment(sender=client, receiver=app_id.address, amount=escrow_amount)
    app_call = context.txn.defer_app_call(contract.fund)

    with context.txn.create_group([payment, app_call], active_txn_index=1):
        app_call.submit()

    app_call = context.txn.defer_app_call(contract.submit_work, ipfs_hash=arc4.String(VALID_IPFS_HASH))
    with context.txn.create_group(active_txn_overrides={"sender": freelancer}):
        app_call.submit()

    # Act
    app_call = context.txn.defer_app_call(contract.approve_work)
    with context.txn.create_group(active_txn_overrides={"sender": client}):
        app_call.submit()

    # Assert
    assert contract.job_status.value == 3  # Status: Completed


def test_cancel(context: AlgopyTestContext, contract: AlgoFreelance, app_id: Application) -> None:
    # Arrange
    client = context.any.account()
    freelancer = context.any.account()
    escrow_amount = 1_000_000
    job_title = "Test Job"

    contract.initialize(
        client_address=arc4.Address(client),
        freelancer_address=arc4.Address(freelancer),
        escrow_amount=arc4.UInt64(escrow_amount),
        job_title=arc4.String(job_title),
    )
    assert contract.job_status.value == 0

    # Act - call cancel within a transaction context
    app_call = context.txn.defer_app_call(contract.cancel)
    with context.txn.create_group(active_txn_overrides={"sender": client}):
        app_call.submit()

    # Assert
    assert contract.job_status.value == 4  # Status: Canceled


def test_get_job_details(context: AlgopyTestContext, contract: AlgoFreelance) -> None:
    # Arrange
    client = context.any.account()
    freelancer = context.any.account()
    escrow_amount = 1_000_000
    job_title = "Test Job"

    contract.initialize(
        client_address=arc4.Address(client),
        freelancer_address=arc4.Address(freelancer),
        escrow_amount=arc4.UInt64(escrow_amount),
        job_title=arc4.String(job_title),
    )

    # Act
    details = contract.get_job_details()

    # Assert - compare ARC4 types directly
    assert details.client_address == arc4.Address(client)
    assert details.freelancer_address == arc4.Address(freelancer)
    assert details.escrow_amount == escrow_amount
    assert details.job_status == 0  # Status: Created
    assert details.job_title == arc4.String(job_title)
