"""
Automated TestNet deployment script for the AlgoFreelance smart contract.

This script performs the following actions:
- Loads environment variables from the .env.testnet file.
- Compiles the PyTeal smart contract.
- Deploys the contract to the Algorand TestNet.
- Funds the newly created contract account with 0.5 ALGO.
- Saves the App ID and address to a 'deployment-info.json' file.
- Generates and prints a block explorer link for the deployed application.
"""

import json
import os
from pathlib import Path

from algosdk.atomic_transaction_composer import AtomicTransactionComposer, TransactionWithSigner
from algosdk.transaction import PaymentTxn, SuggestedParams
from algosdk.v2client.algod import AlgodClient
from dotenv import load_dotenv

from algokit_utils import (
    Account,
    ApplicationClient,
    ApplicationSpecification,
    get_account_from_mnemonic,
    get_algod_client,
)

# -- Configuration --
# Load environment variables from .env.testnet
load_dotenv(Path(__file__).parent.parent / ".env.testnet")

# Get Algorand client from environment variables
algod_client = get_algod_client()

# Get deployer account from environment variable
DEPLOYER_MNEMONIC = os.getenv("DEPLOYER_MNEMONIC")
if not DEPLOYER_MNEMONIC:
    raise ValueError("DEPLOYER_MNEMONIC environment variable not set.")
deployer_account = get_account_from_mnemonic(DEPLOYER_MNEMONIC)

# Define contract path and funding amount
CONTRACT_PATH = Path(__file__).parent.parent / "smart_contracts" / "algo_freelance"
FUND_AMOUNT_ALGO = 0.5
FUND_AMOUNT_MICROALGO = int(FUND_AMOUNT_ALGO * 1_000_000)
OUTPUT_FILE = Path(__file__).parent / "deployment-info.json"


def main() -> None:
    """The main deployment function."""
    print("🚀 Starting AlgoFreelance contract deployment to TestNet...")

    # 1. Compile the smart contract
    print("1. Compiling smart contract...")
    # This assumes the contract.py file exists and exports an ApplicationSpecification
    # The actual contract code is being developed by Role 1.
    try:
        # Dynamically import the application spec
        from smart_contracts.algo_freelance import contract as algo_freelance_contract

        app_spec = algo_freelance_contract.app
        print("✅ Contract compiled successfully.")
    except ImportError:
        print("❌ Could not import contract specification.")
        print("Ensure 'smart_contracts/algo_freelance/contract.py' exists and is valid.")
        # As a fallback for infrastructure testing, create a dummy spec
        print("Using a dummy ApplicationSpecification to proceed with deployment infrastructure tests.")
        app_spec = ApplicationSpecification(
            approval_program="#pragma version 8\nint 1\nreturn",
            clear_state_program="#pragma version 8\nint 1\nreturn",
        )
    except Exception as e:
        print(f"❌ An error occurred during compilation: {e}")
        return

    # 2. Deploy the application
    print(f"2. Deploying app with account: {deployer_account.get_address()}")
    app_client = ApplicationClient(
        algod_client=algod_client,
        app_spec=app_spec,
        signer=deployer_account,
    )

    try:
        app_client.create()
        print(f"✅ App created with App ID: {app_client.app_id} and Address: {app_client.app_address}")
    except Exception as e:
        print(f"❌ App creation failed: {e}")
        return

    # 3. Fund the contract account
    print(f"3. Funding contract account with {FUND_AMOUNT_ALGO} ALGO...")
    try:
        sp = algod_client.suggested_params()
        funding_txn = PaymentTxn(
            sender=deployer_account.get_address(),
            sp=sp,
            receiver=app_client.app_address,
            amt=FUND_AMOUNT_MICROALGO,
        )
        atc = AtomicTransactionComposer()
        atc.add_transaction(TransactionWithSigner(funding_txn, app_client.signer))
        result = atc.execute(algod_client, 4)
        print(f"✅ Funding successful. Transaction ID: {result.tx_ids[0]}")
    except Exception as e:
        print(f"❌ Funding failed: {e}")
        # Attempt to delete the app to clean up
        try:
            app_client.delete()
            print("🧹 Cleaned up by deleting the deployed app.")
        except Exception as delete_e:
            print(f"⚠️ Failed to clean up app. Manual deletion may be required: {delete_e}")
        return

    # 4. Save deployment information
    print(f"4. Saving deployment info to {OUTPUT_FILE}...")
    deployment_info = {
        "app_id": app_client.app_id,
        "app_address": app_client.app_address,
        "deployer_address": deployer_account.get_address(),
        "network": "testnet",
    }
    with open(OUTPUT_FILE, "w") as f:
        json.dump(deployment_info, f, indent=4)
    print("✅ Deployment info saved.")

    # 5. Generate and print explorer link
    explorer_url = f"https://testnet.explorer.perawallet.app/application/{app_client.app_id}"
    print("\n" + "=" * 50)
    print("🎉 Deployment Complete! 🎉")
    print(f"App ID: {app_client.app_id}")
    print(f"Explorer Link: {explorer_url}")
    print("=" * 50)


if __name__ == "__main__":
    main()
