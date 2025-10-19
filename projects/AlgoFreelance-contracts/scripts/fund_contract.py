"""
Utility script to fund a deployed AlgoFreelance contract account.

This script sends a specified amount of ALGO to the contract's address.
It is useful for topping up the contract's balance for testing or operational needs.

Usage:
    python fund_contract.py --app-id <application_id> --amount <algos>
"""

import argparse
import os

from algosdk.atomic_transaction_composer import AtomicTransactionComposer, TransactionWithSigner
from algosdk.logic import get_application_address
from algosdk.transaction import PaymentTxn
from dotenv import load_dotenv

from algokit_utils import get_account_from_mnemonic, get_algod_client

# -- Configuration --
# Load environment variables from .env.testnet
load_dotenv(".env.testnet")

# Get Algorand client from environment variables
algod_client = get_algod_client()

# Get funder account from environment variable (can be the same as deployer)
FUNDER_MNEMONIC = os.getenv("DEPLOYER_MNEMONIC")
if not FUNDER_MNEMONIC:
    raise ValueError("DEPLOYER_MNEMONIC environment variable not set for funding.")
funder_account = get_account_from_mnemonic(FUNDER_MNEMONIC)


def main() -> None:
    """Parses arguments and sends the funding transaction."""
    parser = argparse.ArgumentParser(description="Fund a deployed contract account.")
    parser.add_argument("--app-id", type=int, required=True, help="The App ID of the contract to fund.")
    parser.add_argument("--amount", type=float, required=True, help="The amount of ALGO to send.")
    args = parser.parse_args()

    app_id = args.app_id
    amount_microalgo = int(args.amount * 1_000_000)
    contract_address = get_application_address(app_id)

    print(f"🚀 Funding contract for App ID: {app_id}")
    print(f"   Contract Address: {contract_address}")
    print(f"   Funder Address: {funder_account.get_address()}")
    print(f"   Amount: {args.amount} ALGO ({amount_microalgo} microALGO)")

    try:
        sp = algod_client.suggested_params()
        funding_txn = PaymentTxn(
            sender=funder_account.get_address(),
            sp=sp,
            receiver=contract_address,
            amt=amount_microalgo,
        )

        atc = AtomicTransactionComposer()
        atc.add_transaction(TransactionWithSigner(funding_txn, funder_account.signer))

        result = atc.execute(algod_client, 4)
        txn_id = result.tx_ids[0]

        explorer_url = f"https://testnet.explorer.perawallet.app/tx/{txn_id}"
        print("\n" + "=" * 50)
        print("🎉 Funding successful! 🎉")
        print(f"Transaction ID: {txn_id}")
        print(f"Explorer Link: {explorer_url}")
        print("=" * 50)

    except Exception as e:
        print(f"❌ Funding failed: {e}")


if __name__ == "__main__":
    main()
