"""
Initialize Method Tests - PRD §6.2
Tests for contract initialization including success cases, validation, and edge cases
"""
import pytest
from algopy import arc4, Account, Application, Global
from algopy_testing import AlgopyTestContext

from smart_contracts.algo_freelance.contract import AlgoFreelance

@pytest.fixture
def contract() -> AlgoFreelance:
    return AlgoFreelance()

# --- Success Cases ---

def test_initialize_success(context: AlgopyTestContext, contract: AlgoFreelance, app_id: Application) -> None:
    """Test successful initialization with valid parameters"""
    client = context.any.account()
    freelancer = context.any.account()
    escrow_amount = 5_000_000
    job_title = "Logo Design"

    contract.initialize(
        client_address=arc4.Address(client),
        freelancer_address=arc4.Address(freelancer),
        escrow_amount=arc4.UInt64(escrow_amount),
        job_title=arc4.String(job_title),
    )

    # Verify all state variables are set correctly
    assert contract.client_address.value == arc4.Address(client)
    assert contract.freelancer_address.value == arc4.Address(freelancer)
    assert contract.escrow_amount.value == escrow_amount
    assert contract.job_title.value == arc4.String(job_title)
    assert contract.job_status.value == 0  # Status: Created
    assert contract.created_at.value > 0  # Timestamp should be set
    assert contract.work_hash.value == arc4.String("")  # Empty initially

def test_initialize_with_empty_title(context: AlgopyTestContext, contract: AlgoFreelance, app_id: Application) -> None:
    """Test initialization with empty title (edge case, should work)"""
    client = context.any.account()
    freelancer = context.any.account()
    escrow_amount = 1_000_000
    job_title = ""

    contract.initialize(
        client_address=arc4.Address(client),
        freelancer_address=arc4.Address(freelancer),
        escrow_amount=arc4.UInt64(escrow_amount),
        job_title=arc4.String(job_title),
    )

    assert contract.job_title.value == arc4.String("")
    assert contract.job_status.value == 0

def test_initialize_with_same_client_freelancer(context: AlgopyTestContext, contract: AlgoFreelance, app_id: Application) -> None:
    """Test initialization where client and freelancer are the same (edge case)"""
    same_account = context.any.account()
    escrow_amount = 1_000_000
    job_title = "Self-assigned task"

    contract.initialize(
        client_address=arc4.Address(same_account),
        freelancer_address=arc4.Address(same_account),
        escrow_amount=arc4.UInt64(escrow_amount),
        job_title=arc4.String(job_title),
    )

    assert contract.client_address.value == arc4.Address(same_account)
    assert contract.freelancer_address.value == arc4.Address(same_account)
    assert contract.job_status.value == 0

def test_initialize_with_large_amount(context: AlgopyTestContext, contract: AlgoFreelance, app_id: Application) -> None:
    """Test initialization with very large escrow amount"""
    client = context.any.account()
    freelancer = context.any.account()
    escrow_amount = 1_000_000_000  # 1000 ALGO
    job_title = "High-value project"

    contract.initialize(
        client_address=arc4.Address(client),
        freelancer_address=arc4.Address(freelancer),
        escrow_amount=arc4.UInt64(escrow_amount),
        job_title=arc4.String(job_title),
    )

    assert contract.escrow_amount.value == escrow_amount

def test_initialize_timestamp_validation(context: AlgopyTestContext, contract: AlgoFreelance, app_id: Application) -> None:
    """Test that timestamp is correctly recorded"""
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

    # Timestamp should be set to a valid positive value
    assert contract.created_at.value > 0
    # Arc4.UInt64 should be a reasonable timestamp (> year 2000 in Unix time)
    assert contract.created_at.value >= 946684800  # Jan 1, 2000

# --- Validation Failures ---

def test_initialize_zero_amount_fails(context: AlgopyTestContext, contract: AlgoFreelance, app_id: Application) -> None:
    """Test that initialization fails with zero escrow amount - PRD §6.2"""
    client = context.any.account()
    freelancer = context.any.account()
    escrow_amount = 0
    job_title = "Invalid Job"

    with pytest.raises(AssertionError, match="Escrow amount must be greater than 0"):
        contract.initialize(
            client_address=arc4.Address(client),
            freelancer_address=arc4.Address(freelancer),
            escrow_amount=arc4.UInt64(escrow_amount),
            job_title=arc4.String(job_title),
        )

# Note: Unauthorized caller test is covered by the contract's authorization logic
# Testing this properly requires integration tests on actual network
# The contract checks: assert Txn.sender == Global.creator_address