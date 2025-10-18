import pytest
from algopy import Account, ARC4Contract, Bytes, Global, Txn, arc4, op, gtxn
from algopy_testing import AlgopyTestContext, algopy_testing_context
from collections.abc import Iterator

from smart_contracts.algo_freelance.contract import AlgoFreelance


@pytest.fixture()
def context() -> Iterator[AlgopyTestContext]:
    with algopy_testing_context() as ctx:
        yield ctx


@pytest.fixture()
def contract(context: AlgopyTestContext) -> AlgoFreelance:
    return AlgoFreelance()


def test_initialize(context: AlgopyTestContext, contract: AlgoFreelance) -> None:
    # Arrange
    client = context.any.account()
    freelancer = context.any.account()
    escrow_amount = 1000000
    job_title = "Test Job"

    # Act
    contract.initialize(
        client_address=arc4.Address(client.address),
        freelancer_address=arc4.Address(freelancer.address),
        escrow_amount=arc4.UInt64(escrow_amount),
        job_title=arc4.String(job_title),
    )

    # Assert
    assert contract.client_address.get() == client.address
    assert contract.freelancer_address.get() == freelancer.address
    assert contract.escrow_amount.get() == escrow_amount
    assert contract.job_title.get() == job_title.encode()
    assert contract.job_status.get() == 1


def test_fund(context: AlgopyTestContext, contract: AlgoFreelance) -> None:
    # Arrange
    client = context.any.account()
    freelancer = context.any.account()
    escrow_amount = 1000000
    job_title = "Test Job"

    contract.initialize(
        client_address=arc4.Address(client.address),
        freelancer_address=arc4.Address(freelancer.address),
        escrow_amount=arc4.UInt64(escrow_amount),
        job_title=arc4.String(job_title),
    )

    # Act
    with context.set_sender(client):
        payment = context.any.payment_transaction(receiver=contract.app_address, amount=escrow_amount)
        context.group().add_method_call(contract.fund, group_transaction=payment).execute()

    # Assert
    assert contract.job_status.get() == 2


def test_submit_work(context: AlgopyTestContext, contract: AlgoFreelance) -> None:
    # Arrange
    client = context.any.account()
    freelancer = context.any.account()
    escrow_amount = 1000000
    job_title = "Test Job"
    ipfs_hash = "QmXyz123"

    contract.initialize(
        client_address=arc4.Address(client.address),
        freelancer_address=arc4.Address(freelancer.address),
        escrow_amount=arc4.UInt64(escrow_amount),
        job_title=arc4.String(job_title),
    )

    with context.set_sender(client):
        payment = context.any.payment_transaction(receiver=contract.app_address, amount=escrow_amount)
        context.group().add_method_call(contract.fund, group_transaction=payment).execute()

    # Act
    with context.set_sender(freelancer):
        contract.submit_work(ipfs_hash=arc4.String(ipfs_hash))

    # Assert
    assert contract.work_hash.get() == ipfs_hash.encode()
    assert contract.job_status.get() == 3


def test_approve_work(context: AlgopyTestContext, contract: AlgoFreelance) -> None:
    # Arrange
    client = context.any.account()
    freelancer = context.any.account()
    escrow_amount = 1000000
    job_title = "Test Job"
    ipfs_hash = "QmXyz123"

    context.ensure_min_balance(contract.app_address, 1000000)

    contract.initialize(
        client_address=arc4.Address(client.address),
        freelancer_address=arc4.Address(freelancer.address),
        escrow_amount=arc4.UInt64(escrow_amount),
        job_title=arc4.String(job_title),
    )

    with context.set_sender(client):
        payment = context.any.payment_transaction(receiver=contract.app_address, amount=escrow_amount)
        context.group().add_method_call(contract.fund, group_transaction=payment).execute()

    with context.set_sender(freelancer):
        contract.submit_work(ipfs_hash=arc4.String(ipfs_hash))

    # Act
    with context.set_sender(client):
        contract.approve_work()

    # Assert
    assert contract.job_status.get() == 4


def test_cancel(context: AlgopyTestContext, contract: AlgoFreelance) -> None:
    # Arrange
    client = context.any.account()
    freelancer = context.any.account()
    escrow_amount = 1000000
    job_title = "Test Job"

    contract.initialize(
        client_address=arc4.Address(client.address),
        freelancer_address=arc4.Address(freelancer.address),
        escrow_amount=arc4.UInt64(escrow_amount),
        job_title=arc4.String(job_title),
    )

    # Act
    with context.set_sender(client):
        contract.cancel()

    # Assert
    assert contract.job_status.get() == 1 # Should not change


def test_get_job_details(context: AlgopyTestContext, contract: AlgoFreelance) -> None:
    # Arrange
    client = context.any.account()
    freelancer = context.any.account()
    escrow_amount = 1000000
    job_title = "Test Job"

    contract.initialize(
        client_address=arc4.Address(client.address),
        freelancer_address=arc4.Address(freelancer.address),
        escrow_amount=arc4.UInt64(escrow_amount),
        job_title=arc4.String(job_title),
    )

    # Act
    details = contract.get_job_details()

    # Assert
    assert details[0].as_bytes() == client.address.as_bytes()
    assert details[1].as_bytes() == freelancer.address.as_bytes()
    assert details[2].as_uint64() == escrow_amount
    assert details[3].as_uint64() == 1
    assert details[5].as_bytes() == job_title.encode()
