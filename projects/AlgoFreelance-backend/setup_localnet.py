#!/usr/bin/env python3
"""
Setup script for LocalNet testing.
Creates fresh accounts and funds them from the default LocalNet dispenser.
"""
import os
from algokit_utils import AlgorandClient
from algosdk import account, mnemonic

def main():
    print("=" * 60)
    print("Setting up LocalNet for AlgoFreelance Backend Testing")
    print("=" * 60)
    
    # Connect to LocalNet
    os.environ['ALGORAND_NETWORK'] = 'localnet'
    os.environ['ALGOD_SERVER'] = 'http://localhost:4001'
    os.environ['ALGOD_TOKEN'] = 'a' * 64
    
    algorand = AlgorandClient.from_environment()
    
    print("\n1. Getting LocalNet dispenser account...")
    try:
        # Try to get dispenser using KMD (works after localnet reset)
        dispenser = algorand.account.from_kmd(
            'unencrypted-default-wallet',
            lambda a: a['status'] != 'Offline' and a['amount'] > 1_000_000_000
        )
        print(f"   ✓ Dispenser: {dispenser.address}")
        print(f"   Balance: {algorand.client.algod.account_info(dispenser.address)['amount'] / 1_000_000} ALGO")
    except Exception as e:
        print(f"   ✗ Could not get dispenser from KMD: {e}")
        print("   Trying to use accounts from .env.localnet...")
        
        # Fallback: use the client account as dispenser (assuming user funded it)
        client_mnemonic = "usual vanish spawn illness easily caution trophy bone mountain fatigue shrug remain year brass isolate chest penalty viable canvas grab patrol exile spin able fall"
        dispenser_private_key = mnemonic.to_private_key(client_mnemonic)
        dispenser_address = account.address_from_private_key(dispenser_private_key)
        
        from algokit_utils import Account
        from algosdk.atomic_transaction_composer import AccountTransactionSigner
        
        dispenser = Account(
            private_key=dispenser_private_key,
            address=dispenser_address,
            signer=AccountTransactionSigner(dispenser_private_key)
        )
        print(f"   Using fallback dispenser: {dispenser.address}")
    
    # Target accounts (from .env.localnet)
    deployer_address = "RPBPGTR47IY7GZXETWSUFB2GFSLJKOO46GA6Z3ZIFL45F32XUBZINLK54Q"
    freelancer_address = "YU7WSI2Y3MRHNHHUQUXHCZKHDJXS5665YUKVCXWS4NPWOBIKDBD2GSQD3A"
    
    print("\n2. Funding deployer account...")
    try:
        result = algorand.send.payment({
            "sender": dispenser.address,
            "receiver": deployer_address,
            "amount": 100_000_000,  # 100 ALGO
            "signer": dispenser.signer,
        })
        print(f"   ✓ Funded {deployer_address}")
        print(f"   Txn ID: {result.tx_id}")
        
        balance = algorand.client.algod.account_info(deployer_address)['amount'] / 1_000_000
        print(f"   Balance: {balance} ALGO")
    except Exception as e:
        print(f"   ✗ Error: {e}")
    
    print("\n3. Funding freelancer account...")
    try:
        result = algorand.send.payment({
            "sender": dispenser.address,
            "receiver": freelancer_address,
            "amount": 10_000_000,  # 10 ALGO
            "signer": dispenser.signer,
        })
        print(f"   ✓ Funded {freelancer_address}")
        print(f"   Txn ID: {result.tx_id}")
        
        balance = algorand.client.algod.account_info(freelancer_address)['amount'] / 1_000_000
        print(f"   Balance: {balance} ALGO")
    except Exception as e:
        print(f"   ✗ Error: {e}")
    
    print("\n" + "=" * 60)
    print("Setup Complete!")
    print("You can now run: ALGORAND_NETWORK=localnet python test_integration.py")
    print("=" * 60)

if __name__ == "__main__":
    main()

