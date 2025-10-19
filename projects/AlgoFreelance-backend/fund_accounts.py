"""
Simple script to fund test accounts on LocalNet.
Run this before running integration tests.
"""
from algosdk.v2client import algod
from algosdk import account, mnemonic, transaction

# LocalNet connection
algod_client = algod.AlgodClient(
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "http://localhost:4001"
)

# Default LocalNet accounts (from sandbox)
# These are well-known accounts that come pre-funded in LocalNet
DISPENSER_MNEMONIC = "awful daughter estate motor sting series nation quiz scan derive wrestle ocean hill fossil barely bubble spider climb key focus bus silent boy absent nest"
DISPENSER_ADDRESS = "GOZUKXOWVRMKEMLWVQXG72XMQT6EH44TJYXW7MFIPQAHOCNXZLKYDXJYFE"

# Accounts to fund
DEPLOYER_ADDRESS = "RPBPGTR47IY7GZXETWSUFB2GFSLJKOO46GA6Z3ZIFL45F32XUBZINLK54Q"
FREELANCER_ADDRESS = "YU7WSI2Y3MRHNHHUQUXHCZKHDJXS5665YUKVCXWS4NPWOBIKDBD2GSQD3A"

def fund_account(from_mnemonic: str, to_address: str, amount_algos: int):
    """Fund an account from a dispenser account."""
    # Get private key from mnemonic
    private_key = mnemonic.to_private_key(from_mnemonic)
    from_address = account.address_from_private_key(private_key)
    
    # Get suggested params
    params = algod_client.suggested_params()
    
    # Create payment transaction
    unsigned_txn = transaction.PaymentTxn(
        sender=from_address,
        sp=params,
        receiver=to_address,
        amt=amount_algos * 1_000_000,  # Convert to microAlgos
    )
    
    # Sign transaction
    signed_txn = unsigned_txn.sign(private_key)
    
    # Send transaction
    txid = algod_client.send_transaction(signed_txn)
    
    # Wait for confirmation
    result = transaction.wait_for_confirmation(algod_client, txid, 4)
    
    print(f"✅ Funded {to_address[:10]}... with {amount_algos} ALGO")
    print(f"   Txn ID: {txid}")
    
    return txid

if __name__ == "__main__":
    print("=" * 60)
    print("Funding LocalNet Accounts")
    print("=" * 60)
    
    # Check dispenser balance
    try:
        dispenser_info = algod_client.account_info(DISPENSER_ADDRESS)
        dispenser_balance = dispenser_info['amount'] / 1_000_000
        print(f"\nDispenser balance: {dispenser_balance} ALGO")
        
        if dispenser_balance < 200:
            print("⚠️  Warning: Dispenser balance is low!")
            print("   You may need to reset your LocalNet: algokit localnet reset")
    except Exception as e:
        print(f"❌ Error checking dispenser: {e}")
        print("   Make sure LocalNet is running: algokit localnet start")
        exit(1)
    
    # Fund deployer account
    try:
        fund_account(DISPENSER_MNEMONIC, DEPLOYER_ADDRESS, 100)
    except Exception as e:
        print(f"❌ Failed to fund deployer: {e}")
    
    # Fund freelancer account
    try:
        fund_account(DISPENSER_MNEMONIC, FREELANCER_ADDRESS, 10)
    except Exception as e:
        print(f"❌ Failed to fund freelancer: {e}")
    
    print("\n" + "=" * 60)
    print("Funding Complete! You can now run the integration tests.")
    print("=" * 60)

