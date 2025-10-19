"""
Test Transaction Construction Endpoints

This test verifies:
- Fund transaction construction (grouped payment + app call)
- Submit work transaction construction
- Approve work transaction construction
- Transaction group structure validation
- Base64 encoding/decoding

Prerequisites:
1. LocalNet running: algokit localnet start
2. Accounts funded: ./fund_via_docker.sh
3. Run: python test_transaction_endpoints.py
"""
import asyncio
import os
import sys
import base64
from pathlib import Path

# Add app to path
sys.path.insert(0, str(Path(__file__).parent))

from app.services.algorand import (
    deploy_new_job_contract,
    construct_fund_transaction,
    construct_submit_work_transaction,
    construct_approve_work_transaction,
)
from app.models.job import JobCreateRequest
from algosdk import transaction


async def test_transaction_construction():
    """Test all transaction construction functions"""
    
    print("=" * 80)
    print("AlgoFreelance - Transaction Construction Test")
    print("=" * 80)
    
    # Setup test data
    client_address = "RPBPGTR47IY7GZXETWSUFB2GFSLJKOO46GA6Z3ZIFL45F32XUBZINLK54Q"
    freelancer_address = "YU7WSI2Y3MRHNHHUQUXHCZKHDJXS5665YUKVCXWS4NPWOBIKDBD2GSQD3A"
    test_ipfs_hash = "QmTest123456789012345678901234567890123456"  # Valid length
    
    app_id = None
    
    try:
        # Setup: Deploy a contract for testing
        print("\n📋 Setup: Deploy Test Contract")
        print("=" * 80)
        
        job_data = JobCreateRequest(
            client_address=client_address,
            freelancer_address=freelancer_address,
            escrow_amount=5_000_000,
            job_title="Transaction Test Job",
            job_description="Testing transaction construction"
        )
        
        deploy_result = await deploy_new_job_contract(job_data)
        app_id = deploy_result['app_id']
        
        print(f"✅ Test contract deployed: App ID {app_id}")
        
        # ============================================================
        # Test 1: Construct Fund Transactions
        # ============================================================
        print("\n💰 Test 1: Construct Fund Transactions")
        print("=" * 80)
        
        fund_result = await construct_fund_transaction(app_id, client_address)
        
        # Validate response structure
        assert 'transactions' in fund_result, "Missing 'transactions' field"
        assert 'group_id' in fund_result, "Missing 'group_id' field"
        assert 'signer_address' in fund_result, "Missing 'signer_address' field"
        
        print(f"✅ Fund transaction response valid")
        print(f"   Number of transactions: {len(fund_result['transactions'])}")
        print(f"   Group ID: {fund_result['group_id']}")
        print(f"   Signer: {fund_result['signer_address']}")
        
        # Validate we have 2 transactions (payment + app call)
        assert len(fund_result['transactions']) == 2, f"Expected 2 transactions, got {len(fund_result['transactions'])}"
        print(f"✅ Correct number of grouped transactions (2)")
        
        # Decode and validate transactions
        txn1_bytes = base64.b64decode(fund_result['transactions'][0])
        txn2_bytes = base64.b64decode(fund_result['transactions'][1])
        
        payment_txn = transaction.Transaction.undictify(
            transaction.encoding.msgpack.unpackb(txn1_bytes)
        )
        app_call_txn = transaction.Transaction.undictify(
            transaction.encoding.msgpack.unpackb(txn2_bytes)
        )
        
        print(f"✅ Transactions decoded successfully")
        print(f"   Transaction 1 Type: {payment_txn.type}")
        print(f"   Transaction 2 Type: {app_call_txn.type}")
        
        # Validate transaction types
        assert payment_txn.type == 'pay', f"First txn should be payment, got {payment_txn.type}"
        assert app_call_txn.type == 'appl', f"Second txn should be app call, got {app_call_txn.type}"
        print(f"✅ Transaction types correct (pay + appl)")
        
        # Validate they have the same group ID
        assert payment_txn.group is not None, "Payment transaction missing group ID"
        assert app_call_txn.group is not None, "App call transaction missing group ID"
        assert payment_txn.group == app_call_txn.group, "Transactions have different group IDs"
        print(f"✅ Both transactions have matching group ID")
        
        # Validate sender
        assert payment_txn.sender == client_address, f"Wrong sender on payment: {payment_txn.sender}"
        assert app_call_txn.sender == client_address, f"Wrong sender on app call: {app_call_txn.sender}"
        print(f"✅ Both transactions have correct sender")
        
        # Validate payment amount
        assert payment_txn.amt == 5_000_000, f"Wrong payment amount: {payment_txn.amt}"
        print(f"✅ Payment amount correct (5 ALGO)")
        
        # ============================================================
        # Test 2: Construct Submit Work Transaction
        # ============================================================
        print("\n📤 Test 2: Construct Submit Work Transaction")
        print("=" * 80)
        
        submit_result = await construct_submit_work_transaction(
            app_id,
            freelancer_address,
            test_ipfs_hash
        )
        
        # Validate response structure
        assert 'transaction' in submit_result, "Missing 'transaction' field"
        assert 'signer_address' in submit_result, "Missing 'signer_address' field"
        
        print(f"✅ Submit work response valid")
        print(f"   Signer: {submit_result['signer_address']}")
        
        # Decode transaction
        submit_txn_bytes = base64.b64decode(submit_result['transaction'])
        submit_txn = transaction.Transaction.undictify(
            transaction.encoding.msgpack.unpackb(submit_txn_bytes)
        )
        
        print(f"✅ Transaction decoded successfully")
        print(f"   Type: {submit_txn.type}")
        
        # Validate transaction
        assert submit_txn.type == 'appl', f"Should be app call, got {submit_txn.type}"
        assert submit_txn.sender == freelancer_address, f"Wrong sender: {submit_txn.sender}"
        assert submit_txn.index == app_id, f"Wrong app ID: {submit_txn.index}"
        print(f"✅ Transaction structure correct")
        
        # ============================================================
        # Test 3: Construct Approve Work Transaction
        # ============================================================
        print("\n✅ Test 3: Construct Approve Work Transaction")
        print("=" * 80)
        
        approve_result = await construct_approve_work_transaction(
            app_id,
            client_address
        )
        
        # Validate response structure
        assert 'transaction' in approve_result, "Missing 'transaction' field"
        assert 'signer_address' in approve_result, "Missing 'signer_address' field"
        assert 'expected_nft_name' in approve_result, "Missing 'expected_nft_name' field"
        assert 'expected_payment_amount' in approve_result, "Missing 'expected_payment_amount' field"
        
        print(f"✅ Approve work response valid")
        print(f"   Signer: {approve_result['signer_address']}")
        print(f"   Expected NFT: {approve_result['expected_nft_name']}")
        print(f"   Expected Payment: {approve_result['expected_payment_amount'] / 1_000_000} ALGO")
        
        # Decode transaction
        approve_txn_bytes = base64.b64decode(approve_result['transaction'])
        approve_txn = transaction.Transaction.undictify(
            transaction.encoding.msgpack.unpackb(approve_txn_bytes)
        )
        
        print(f"✅ Transaction decoded successfully")
        print(f"   Type: {approve_txn.type}")
        print(f"   Fee: {approve_txn.fee} microALGOs")
        
        # Validate transaction
        assert approve_txn.type == 'appl', f"Should be app call, got {approve_txn.type}"
        assert approve_txn.sender == client_address, f"Wrong sender: {approve_txn.sender}"
        assert approve_txn.index == app_id, f"Wrong app ID: {approve_txn.index}"
        print(f"✅ Transaction structure correct")
        
        # Validate fee (should be higher to cover inner transactions)
        assert approve_txn.fee >= 4000, f"Fee too low for inner txns: {approve_txn.fee}"
        print(f"✅ Fee sufficient for 3 inner transactions ({approve_txn.fee} microALGOs)")
        
        # Validate NFT name
        assert "Transaction Test Job" in approve_result['expected_nft_name'], "NFT name doesn't match job title"
        assert approve_result['expected_nft_name'].startswith("AlgoFreelance:"), "NFT name missing prefix"
        print(f"✅ NFT name format correct")
        
        # ============================================================
        # Test 4: IPFS Hash Validation
        # ============================================================
        print("\n🔍 Test 4: IPFS Hash Validation")
        print("=" * 80)
        
        # Valid hash
        valid_hash = "QmXyz123456789012345678901234567890123456"
        try:
            result = await construct_submit_work_transaction(app_id, freelancer_address, valid_hash)
            print(f"✅ Valid IPFS hash accepted (length {len(valid_hash)})")
        except Exception as e:
            print(f"❌ Valid hash rejected: {e}")
            raise
        
        # Too short hash
        print("\n   Testing invalid hash (too short)...")
        short_hash = "QmShort"
        try:
            result = await construct_submit_work_transaction(app_id, freelancer_address, short_hash)
            print(f"❌ Short hash should have been rejected")
            raise AssertionError("Short hash was accepted incorrectly")
        except ValueError as e:
            print(f"   ✅ Short hash correctly rejected: {e}")
        
        # Too long hash
        print("\n   Testing invalid hash (too long)...")
        long_hash = "Q" * 100
        try:
            result = await construct_submit_work_transaction(app_id, freelancer_address, long_hash)
            print(f"❌ Long hash should have been rejected")
            raise AssertionError("Long hash was accepted incorrectly")
        except ValueError as e:
            print(f"   ✅ Long hash correctly rejected: {e}")
        
        # ============================================================
        # Test 5: Base64 Encoding Verification
        # ============================================================
        print("\n🔐 Test 5: Base64 Encoding Verification")
        print("=" * 80)
        
        # Verify all transactions can be re-encoded
        for i, txn_b64 in enumerate(fund_result['transactions'], 1):
            decoded = base64.b64decode(txn_b64)
            re_encoded = base64.b64encode(decoded).decode('utf-8')
            assert re_encoded == txn_b64, f"Re-encoding mismatch for transaction {i}"
            print(f"✅ Transaction {i} encoding stable")
        
        # Summary
        print("\n" + "=" * 80)
        print("✅ ALL TRANSACTION CONSTRUCTION TESTS PASSED!")
        print("=" * 80)
        print(f"\n📌 Summary:")
        print(f"   • Fund transactions: 2 grouped, valid structure")
        print(f"   • Submit work transaction: valid, with IPFS validation")
        print(f"   • Approve work transaction: valid, with increased fee")
        print(f"   • All transactions properly base64 encoded")
        print(f"   • IPFS hash validation working correctly")
        print(f"\n📌 Test Contract: App ID {app_id}")
        print(f"\n🎉 Transaction construction verified successfully!")
        print("=" * 80)
        
        return True
        
    except Exception as e:
        print(f"\n❌ TEST FAILED!")
        print(f"   Error: {e}")
        import traceback
        traceback.print_exc()
        
        if app_id:
            print(f"\n📌 Test Contract App ID (for debugging): {app_id}")
        
        return False


if __name__ == "__main__":
    # Ensure we're using localnet
    os.environ['ALGORAND_NETWORK'] = 'localnet'
    
    print("\n⚠️  PREREQUISITES:")
    print("   1. AlgoKit LocalNet must be running")
    print("   2. Test accounts must be funded")
    print("\nStarting tests in 2 seconds...\n")
    
    import time
    time.sleep(2)
    
    success = asyncio.run(test_transaction_construction())
    
    if not success:
        sys.exit(1)
    
    print("\n🎉 All transaction construction tests passed!\n")

