"""
Utility script to verify the deployment of the AlgoFreelance contract.

This script checks if the contract specified in 'deployment-info.json' is correctly
deployed and funded on the Algorand TestNet.

It performs the following checks:
- Reads the 'deployment-info.json' file for the App ID.
- Queries the Algod client for the application's information.
- Verifies that the application exists.
- Checks if the application account's balance is sufficient (>= 0.5 ALGO).
"""

import json
from pathlib import Path

from algosdk.error import AlgodHTTPError

from algokit_utils import get_algod_client

# -- Configuration --
# Get Algorand client
algod_client = get_algod_client()

# Define paths
INFO_FILE = Path(__file__).parent / "deployment-info.json"
MIN_BALANCE_ALGO = 0.5
MIN_BALANCE_MICROALGO = int(MIN_BALANCE_ALGO * 1_000_000)


def main() -> None:
    """Reads deployment info and verifies the deployment on-chain."""
    print("🔍 Starting deployment verification...")

    # 1. Read deployment-info.json
    print(f"1. Reading deployment info from {INFO_FILE}...")
    if not INFO_FILE.exists():
        print(f"❌ Error: {INFO_FILE} not found.")
        print("Please run the deployment script first.")
        return

    try:
        with open(INFO_FILE, "r") as f:
            deployment_info = json.load(f)
        app_id = deployment_info["app_id"]
        app_address = deployment_info["app_address"]
        print(f"✅ Found App ID: {app_id}")
    except (json.JSONDecodeError, KeyError) as e:
        print(f"❌ Error reading or parsing {INFO_FILE}: {e}")
        return

    # 2. Verify application existence
    print(f"2. Verifying existence of App ID {app_id} on TestNet...")
    try:
        app_info = algod_client.application_info(app_id)
        print(f"✅ Application found on-chain.")
        print(f"   Creator: {app_info['params']['creator']}")
    except AlgodHTTPError as e:
        if "application does not exist" in str(e):
            print(f"❌ Verification Failed: Application with App ID {app_id} does not exist on-chain.")
        else:
            print(f"❌ An error occurred while fetching application info: {e}")
        return

    # 3. Verify contract account balance
    print(f"3. Verifying balance of contract account: {app_address}...")
    try:
        account_info = algod_client.account_info(app_address)
        balance_microalgo = account_info["amount"]
        balance_algo = balance_microalgo / 1_000_000

        print(f"   Current balance: {balance_algo} ALGO")

        if balance_microalgo >= MIN_BALANCE_MICROALGO:
            print(f"✅ Balance is sufficient (>= {MIN_BALANCE_ALGO} ALGO).")
        else:
            print(f"❌ Verification Failed: Insufficient balance.")
            print(f"   Expected at least {MIN_BALANCE_ALGO} ALGO, but found {balance_algo} ALGO.")
            return

    except AlgodHTTPError as e:
        print(f"❌ An error occurred while fetching account info: {e}")
        return

    # All checks passed
    explorer_url = f"https://testnet.explorer.perawallet.app/application/{app_id}"
    print("\n" + "=" * 50)
    print("🎉 Verification Successful! 🎉")
    print("The contract is correctly deployed and funded on TestNet.")
    print(f"Explorer Link: {explorer_url}")
    print("=" * 50)


if __name__ == "__main__":
    main()
