"""
Submit Work Method Tests - PRD §6.2 lines 232-240
Tests for freelancer submitting work with IPFS hash validation

Note: Complete lifecycle tests with funding and submission are covered in
algo_freelance_test.py test_submit_work() which successfully tests the full flow.
"""

import pytest
from algopy import arc4, Account
from algopy_testing import AlgopyTestContext

from smart_contracts.algo_freelance.contract import AlgoFreelance

# Valid IPFS hash - PRD §6.2 specifies 46-59 bytes for CIDv0/v1
VALID_IPFS_HASH_CIDv0 = "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"  # 46 bytes

@pytest.fixture
def contract() -> AlgoFreelance:
    return AlgoFreelance()

def test_submit_work_before_funding_fails(context: AlgopyTestContext, contract: AlgoFreelance) -> None:
    """Test that work cannot be submitted before contract is funded - PRD §6.2"""
    client = context.any.account()
    freelancer = context.any.account()
    
    contract.initialize(
        client_address=arc4.Address(client),
        freelancer_address=arc4.Address(freelancer),
        escrow_amount=arc4.UInt64(1_000_000),
        job_title=arc4.String("Test Job"),
    )
    
    assert contract.job_status.value == 0  # Status: Created (not Funded)

    with pytest.raises(AssertionError, match="Job not in Funded status"):
        contract.submit_work(ipfs_hash=arc4.String(VALID_IPFS_HASH_CIDv0))
