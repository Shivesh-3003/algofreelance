"""
Transaction debugging tool.

This script fetches and displays detailed information about a specific transaction ID
from the Algorand Indexer. It is designed to help debug failed transactions by
showing execution logs and failure messages.

Usage:
    python debug_transaction.py --txid <transaction_id>
"""

import argparse
import base64
import json

from algosdk.error import IndexerHTTPError

from algokit_utils import get_indexer_client

# -- Configuration --
# Get Algorand Indexer client
indexer_client = get_indexer_client()


def print_section(title: str) -> None:
    """Prints a formatted section header."""
    print("\n" + "-" * 10 + f" {title} " + "-" * 10)


def main() -> None:
    """Parses arguments and fetches transaction details."""
    parser = argparse.ArgumentParser(description="Debug a transaction by its ID.")
    parser.add_argument("--txid", type=str, required=True, help="The ID of the transaction to debug.")
    args = parser.parse_args()
    txid = args.txid

    print(f"🐞 Debugging Transaction ID: {txid}")

    try:
        # Fetch transaction details from the indexer
        txn_data = indexer_client.transaction(txid)
        print(json.dumps(txn_data, indent=2, default=str))

        # --- Basic Info ---
        print_section("Transaction Details")
        txn = txn_data.get("transaction", {})
        print(f"Type: {txn.get('tx-type')}")
        print(f"Sender: {txn.get('sender')}")
        print(f"Fee: {txn.get('fee')} microALGOs")
        print(f"Confirmed Round: {txn_data.get('confirmed-round')}")

        # --- Application Call Details ---
        if txn.get("tx-type") == "appl":
            print_section("Application Call")
            app_call = txn.get("application-transaction", {})
            print(f"App ID: {app_call.get('application-id')}")
            print(f"On Completion: {app_call.get('on-completion')}")
            
            # Decode application arguments
            app_args = app_call.get("application-args", [])
            decoded_args = [base64.b64decode(arg).decode('utf-8', 'ignore') for arg in app_args]
            print(f"Args: {decoded_args}")

        # --- Logs ---
        logs = txn_data.get("logs", [])
        if logs:
            print_section("Execution Logs")
            decoded_logs = [base64.b64decode(log).hex() for log in logs]
            for i, log in enumerate(decoded_logs):
                print(f"  [{i}]: {log}")

        # --- Inner Transactions ---
        inner_txns = txn_data.get("inner-txns", [])
        if inner_txns:
            print_section("Inner Transactions")
            for i, inner_txn in enumerate(inner_txns):
                print(f"  --- Inner Txn {i+1} ---")
                itxn = inner_txn.get("transaction", {})
                print(f"    Type: {itxn.get('tx-type')}")
                if itxn.get('tx-type') == 'pay':
                    pay = itxn.get('payment-transaction', {})
                    print(f"    Receiver: {pay.get('receiver')}")
                    print(f"    Amount: {pay.get('amount')} microALGOs")
                elif itxn.get('tx-type') == 'axfer':
                    axfer = itxn.get('asset-transfer-transaction', {})
                    print(f"    Asset ID: {axfer.get('asset-id')}")
                    print(f"    Receiver: {axfer.get('receiver')}")
                    print(f"    Amount: {axfer.get('amount')}")
                elif itxn.get('tx-type') == 'acfg':
                    acfg = itxn.get('asset-config-transaction', {})
                    print(f"    Asset Name: {acfg.get('params', {}).get('name')}")
                    print(f"    Total: {acfg.get('params', {}).get('total')}")

        # --- Failure Message ---
        if txn_data.get("confirmed-round") is None or txn.get("application-transaction", {}).get("on-completion") == "noop":
            # Check for failure message in a slightly different location for recent indexer versions
            if txn_data.get('pool-error'):
                 print_section("❌ Transaction Failed")
                 print(f"Error: {txn_data.get('pool-error')}")

    except IndexerHTTPError as e:
        print(f"\n❌ Error: Could not find transaction with ID {txid}.")
        print(f"   Please ensure the transaction ID is correct and the indexer is synced.")
        print(f"   Details: {e}")
    except Exception as e:
        print(f"\nAn unexpected error occurred: {e}")


if __name__ == "__main__":
    main()
