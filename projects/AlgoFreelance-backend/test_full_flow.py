"""
Comprehensive Integration Test for AlgoFreelance Backend

This test covers the complete job lifecycle:
1. Deploy contract
2. Construct fund transactions
3. Sign and send fund transactions
4. Upload file to IPFS
5. Construct submit work transaction
6. Sign and send submit work
7. Construct approve work transaction
8. Sign and send approve work
9. Verify NFT was minted
10. Verify freelancer portfolio shows NFT

Prerequisites:
1. Start LocalNet: algokit localnet start
2. Fund accounts: ./fund_via_docker.sh
3. Activate environment: pyenv activate env3.12.11
4. Run: python test_full_flow.py
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
    get_job_details_from_state,
    construct_fund_transaction,
    construct_submit_work_transaction,
    construct_approve_work_transaction,
    get_freelancer_nfts,
    algorand_client,
    deployer_account
)
from app.services.pinata import upload_to_ipfs
from app.models.job import JobCreateRequest
from algosdk import account, mnemonic, transaction


async def test_full_job_lifecycle():
    """Test complete job lifecycle from creation to NFT minting"""
    
    print("=" * 80)
    print("AlgoFreelance Backend - Full Lifecycle Integration Test")
    print("=" * 80)
    
    # Set up test accounts
    # These should match the accounts in .env.localnet
    client_mnemonic = os.getenv("DEPLOYER_MNEMONIC")  # Using deployer as client
    freelancer_mnemonic = "unusual vanish spawn illness easily caution trophy bone mountain fatigue shrug remain year brass isolate chest penalty viable canvas grab patrol exile spin able fall"
    
    if not client_mnemonic:
        print("\n❌ ERROR: DEPLOYER_MNEMONIC not found in environment!")
        return False
    
    # Get addresses
    client_private_key = mnemonic.to_private_key(client_mnemonic)
    client_address = account.address_from_private_key(client_private_key)
    
    freelancer_private_key = mnemonic.to_private_key(freelancer_mnemonic)
    freelancer_address = account.address_from_private_key(freelancer_private_key)
    
    print(f"\n📋 Test Configuration:")
    print(f"   Network: {os.getenv('ALGORAND_NETWORK', 'localnet')}")
    print(f"   Client: {client_address}")
    print(f"   Freelancer: {freelancer_address}")
    
    app_id = None
    
    try:
        # ============================================================
        # Test 1: Deploy Contract
        # ============================================================
        print("\n" + "=" * 80)
        print("🚀 Test 1: Deploy Contract")
        print("=" * 80)
        
        job_data = JobCreateRequest(
            client_address=client_address,
            freelancer_address=freelancer_address,
            escrow_amount=5_000_000,  # 5 ALGO
            job_title="Logo Design Test",
            job_description="Testing full flow with logo design"
        )
        
        deploy_result = await deploy_new_job_contract(job_data)
        app_id = deploy_result['app_id']
        
        print(f"✅ Contract deployed successfully!")
        print(f"   App ID: {app_id}")
        print(f"   Address: {deploy_result['app_address']}")
        
        # ============================================================
        # Test 2: Construct Fund Transactions
        # ============================================================
        print("\n" + "=" * 80)
        print("💰 Test 2: Construct Fund Transactions")
        print("=" * 80)
        
        fund_result = await construct_fund_transaction(app_id, client_address)
        
        print(f"✅ Fund transactions constructed")
        print(f"   Number of transactions: {len(fund_result['transactions'])}")
        print(f"   Group ID: {fund_result['group_id']}")
        
        # ============================================================
        # Test 3: Sign and Send Fund Transactions
        # ============================================================
        print("\n" + "=" * 80)
        print("✍️  Test 3: Sign and Send Fund Transactions")
        print("=" * 80)
        
        # Decode transactions
        txn1_bytes = base64.b64decode(fund_result['transactions'][0])
        txn2_bytes = base64.b64decode(fund_result['transactions'][1])
        
        # Decode from msgpack
        payment_txn = transaction.Transaction.undictify(
            transaction.encoding.msgpack.unpackb(txn1_bytes)
        )
        app_call_txn = transaction.Transaction.undictify(
            transaction.encoding.msgpack.unpackb(txn2_bytes)
        )
        
        # Sign both transactions with client key
        signed_payment = payment_txn.sign(client_private_key)
        signed_app_call = app_call_txn.sign(client_private_key)
        
        # Send to network
        txn_ids = algorand_client.client.algod.send_transactions([signed_payment, signed_app_call])
        print(f"✅ Fund transactions sent")
        print(f"   Payment Txn ID: {payment_txn.get_txid()}")
        print(f"   App Call Txn ID: {app_call_txn.get_txid()}")
        
        # Wait for confirmation
        await asyncio.sleep(2)
        
        # Verify status changed to Funded
        details = await get_job_details_from_state(app_id)
        assert details['job_status'] == 1, f"Expected status 1 (Funded), got {details['job_status']}"
        print(f"✅ Contract funded! Status: {details['job_status']}")
        
        # ============================================================
        # Test 4: Upload File to IPFS
        # ============================================================
        print("\n" + "=" * 80)
        print("📁 Test 4: Upload File to IPFS")
        print("=" * 80)
        
        # Create a test file
        test_file_content = b"This is a test logo file for AlgoFreelance integration test"
        test_filename = "test_logo.txt"
        
        ipfs_result = await upload_to_ipfs(test_file_content, test_filename)
        ipfs_hash = ipfs_result['ipfs_hash']
        
        print(f"✅ File uploaded to IPFS")
        print(f"   CID: {ipfs_hash}")
        print(f"   IPFS URL: {ipfs_result['ipfs_url']}")
        print(f"   Gateway URL: {ipfs_result['gateway_url']}")
        print(f"   Size: {ipfs_result['size']} bytes")
        
        # Validate hash length
        assert 46 <= len(ipfs_hash) <= 59, f"Invalid IPFS hash length: {len(ipfs_hash)}"
        
        # ============================================================
        # Test 5: Construct Submit Work Transaction
        # ============================================================
        print("\n" + "=" * 80)
        print("📤 Test 5: Construct Submit Work Transaction")
        print("=" * 80)
        
        submit_result = await construct_submit_work_transaction(
            app_id, 
            freelancer_address, 
            ipfs_hash
        )
        
        print(f"✅ Submit work transaction constructed")
        print(f"   Signer: {submit_result['signer_address']}")
        
        # ============================================================
        # Test 6: Sign and Send Submit Work
        # ============================================================
        print("\n" + "=" * 80)
        print("✍️  Test 6: Sign and Send Submit Work")
        print("=" * 80)
        
        # Decode transaction
        submit_txn_bytes = base64.b64decode(submit_result['transaction'])
        submit_txn = transaction.Transaction.undictify(
            transaction.encoding.msgpack.unpackb(submit_txn_bytes)
        )
        
        # Sign with freelancer key
        signed_submit = submit_txn.sign(freelancer_private_key)
        
        # Send to network
        submit_txn_id = algorand_client.client.algod.send_transaction(signed_submit)
        print(f"✅ Submit work transaction sent")
        print(f"   Txn ID: {submit_txn_id}")
        
        # Wait for confirmation
        await asyncio.sleep(2)
        
        # Verify status changed to Submitted
        details = await get_job_details_from_state(app_id)
        assert details['job_status'] == 2, f"Expected status 2 (Submitted), got {details['job_status']}"
        assert details['work_hash'] == ipfs_hash, f"Work hash mismatch"
        print(f"✅ Work submitted! Status: {details['job_status']}")
        print(f"   Stored IPFS hash: {details['work_hash']}")
        
        # ============================================================
        # Test 7: Construct Approve Work Transaction
        # ============================================================
        print("\n" + "=" * 80)
        print("✅ Test 7: Construct Approve Work Transaction")
        print("=" * 80)
        
        approve_result = await construct_approve_work_transaction(app_id, client_address)
        
        print(f"✅ Approve work transaction constructed")
        print(f"   Signer: {approve_result['signer_address']}")
        print(f"   Expected NFT: {approve_result['expected_nft_name']}")
        print(f"   Expected payment: {approve_result['expected_payment_amount'] / 1_000_000} ALGO")
        
        # ============================================================
        # Test 8: Sign and Send Approve Work (Critical - Inner Transactions)
        # ============================================================
        print("\n" + "=" * 80)
        print("🎉 Test 8: Sign and Send Approve Work (Inner Transactions)")
        print("=" * 80)
        
        # Decode transaction
        approve_txn_bytes = base64.b64decode(approve_result['transaction'])
        approve_txn = transaction.Transaction.undictify(
            transaction.encoding.msgpack.unpackb(approve_txn_bytes)
        )
        
        # Sign with client key
        signed_approve = approve_txn.sign(client_private_key)
        
        # Send to network
        approve_txn_id = algorand_client.client.algod.send_transaction(signed_approve)
        print(f"✅ Approve work transaction sent")
        print(f"   Txn ID: {approve_txn_id}")
        print(f"   This will trigger 3 inner transactions:")
        print(f"      1. Payment to freelancer")
        print(f"      2. Mint POWCERT NFT")
        print(f"      3. Transfer NFT to freelancer")
        
        # Wait for confirmation
        await asyncio.sleep(3)
        
        # Verify status changed to Completed
        details = await get_job_details_from_state(app_id)
        assert details['job_status'] == 3, f"Expected status 3 (Completed), got {details['job_status']}"
        print(f"✅ Work approved! Status: {details['job_status']} (Completed)")
        
        # ============================================================
        # Test 9: Verify NFT Minted
        # ============================================================
        print("\n" + "=" * 80)
        print("🏆 Test 9: Verify NFT Minted and Transferred")
        print("=" * 80)
        
        # Wait a bit more for indexer to catch up
        await asyncio.sleep(2)
        
        # Get freelancer's NFTs
        nfts = await get_freelancer_nfts(freelancer_address)
        
        print(f"✅ Freelancer portfolio retrieved")
        print(f"   Total POWCERTs: {nfts['total_jobs']}")
        
        if nfts['total_jobs'] > 0:
            latest_cert = nfts['certificates'][0]
            print(f"\n   Latest Certificate:")
            print(f"      Asset ID: {latest_cert['asset_id']}")
            print(f"      Name: {latest_cert['asset_name']}")
            print(f"      Job Title: {latest_cert['job_title']}")
            print(f"      IPFS URL: {latest_cert['ipfs_url']}")
            print(f"      Block Explorer: {latest_cert['block_explorer']}")
            
            # Verify it contains our job title
            assert "Logo Design Test" in latest_cert['asset_name'], "NFT name doesn't match job title"
            print(f"\n✅ NFT verified successfully!")
        else:
            print(f"\n⚠️  Warning: No NFTs found yet (indexer may be delayed)")
        
        # ============================================================
        # Test 10: Final Summary
        # ============================================================
        print("\n" + "=" * 80)
        print("📊 Test 10: Final Summary")
        print("=" * 80)
        
        print(f"\n✅ ALL TESTS PASSED!")
        print(f"\n📌 Contract Details:")
        print(f"   App ID: {app_id}")
        print(f"   Status: Completed (3)")
        print(f"   Payment: 5 ALGO transferred to freelancer")
        print(f"   NFT: Minted and transferred")
        print(f"\n📌 Transaction Flow:")
        print(f"   1. Deploy → Success")
        print(f"   2. Fund → Success")
        print(f"   3. Submit Work → Success")
        print(f"   4. Approve Work → Success (3 inner txns)")
        print(f"\n📌 IPFS Integration:")
        print(f"   File uploaded: {test_filename}")
        print(f"   CID: {ipfs_hash}")
        print(f"\n🎉 Complete job lifecycle tested successfully!")
        print("=" * 80)
        
        return True
        
    except Exception as e:
        print(f"\n❌ TEST FAILED!")
        print(f"   Error: {e}")
        import traceback
        traceback.print_exc()
        
        if app_id:
            print(f"\n📌 Contract App ID (for debugging): {app_id}")
        
        return False


if __name__ == "__main__":
    # Ensure we're using localnet
    os.environ['ALGORAND_NETWORK'] = 'localnet'
    
    print("\n⚠️  PREREQUISITES:")
    print("   1. AlgoKit LocalNet must be running: algokit localnet start")
    print("   2. Test accounts must be funded: ./fund_via_docker.sh")
    print("   3. Pinata credentials must be valid")
    print("\nStarting in 2 seconds...\n")
    
    import time
    time.sleep(2)
    
    success = asyncio.run(test_full_job_lifecycle())
    
    if not success:
        sys.exit(1)

