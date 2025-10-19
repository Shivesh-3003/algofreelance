"""
Integration test for backend services with LocalNet

Prerequisites:
1. Start LocalNet: algokit localnet start
2. Activate environment: pyenv activate env3.12.11
3. Run: python test_integration.py

This test verifies:
- Backend can deploy contracts
- Contract initialization works
- Job details can be retrieved
"""
import asyncio
import os
import sys
from pathlib import Path

# Add app to path
sys.path.insert(0, str(Path(__file__).parent))

from app.services.algorand import deploy_new_job_contract, get_job_details_from_state
from app.models.job import JobCreateRequest


async def test_full_flow():
    """Test complete deployment and retrieval flow"""
    
    print("=" * 60)
    print("AlgoFreelance Backend Integration Test")
    print("=" * 60)
    
    # Get test accounts from environment
    test_client = os.getenv("TEST_CLIENT_ADDRESS")
    test_freelancer = os.getenv("TEST_FREELANCER_ADDRESS")
    
    if not test_client or not test_freelancer:
        print("\n❌ ERROR: Test accounts not found in environment!")
        print("   Make sure .env.localnet has TEST_CLIENT_ADDRESS and TEST_FREELANCER_ADDRESS")
        return False
    
    print(f"\n📋 Test Configuration:")
    print(f"   Network: {os.getenv('ALGORAND_NETWORK', 'localnet')}")
    print(f"   Client: {test_client}")
    print(f"   Freelancer: {test_freelancer}")
    
    try:
        # Test 1: Deploy contract
        print("\n🚀 Test 1: Deploying contract...")
        job_data = JobCreateRequest(
            client_address=test_client,
            freelancer_address=test_freelancer,
            escrow_amount=5_000_000,  # 5 ALGO
            job_title="Logo Design",
            job_description="Modern minimalist logo for SaaS startup"
        )
        
        deploy_result = await deploy_new_job_contract(job_data)
        
        print(f"   ✅ Contract deployed successfully!")
        print(f"      App ID: {deploy_result['app_id']}")
        print(f"      Address: {deploy_result['app_address']}")
        print(f"      Txn ID: {deploy_result['txn_id']}")
        print(f"      Funding required: {deploy_result['funding_amount'] / 1_000_000} ALGO")
        
        app_id = deploy_result['app_id']
        
        # Test 2: Get job details
        print(f"\n📖 Test 2: Getting job details...")
        details = await get_job_details_from_state(app_id)
        
        print(f"   ✅ Details retrieved successfully!")
        print(f"      Status: {details['job_status']} (0 = Created)")
        print(f"      Title: {details['job_title']}")
        print(f"      Client: {details['client_address']}")
        print(f"      Freelancer: {details['freelancer_address']}")
        print(f"      Escrow: {details['escrow_amount'] / 1_000_000} ALGO")
        print(f"      Created: {details['created_at']}")
        
        # Validate results
        assert details['job_status'] == 0, f"Expected status 0, got {details['job_status']}"
        assert details['job_title'] == "Logo Design", f"Title mismatch"
        assert details['client_address'] == test_client, f"Client address mismatch"
        assert details['freelancer_address'] == test_freelancer, f"Freelancer address mismatch"
        assert details['escrow_amount'] == 5_000_000, f"Escrow amount mismatch"
        assert details['is_funded'] == False, f"Should not be funded yet"
        
        print("\n" + "=" * 60)
        print("✅ ALL TESTS PASSED!")
        print("=" * 60)
        print(f"\n📌 Contract App ID: {app_id}")
        print(f"📌 You can now test this contract with:")
        print(f"   - Fund it using the fund() method")
        print(f"   - Submit work as freelancer")
        print(f"   - Approve work as client")
        print("=" * 60)
        
        return True
        
    except Exception as e:
        print(f"\n❌ TEST FAILED!")
        print(f"   Error: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    # Ensure we're using localnet
    os.environ['ALGORAND_NETWORK'] = 'localnet'
    
    success = asyncio.run(test_full_flow())
    
    if not success:
        sys.exit(1)

