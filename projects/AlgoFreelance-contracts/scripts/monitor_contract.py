"""
Real-time contract state monitoring tool.

This script polls the global state of a specified application every few seconds
and logs any changes to the console. It's useful for observing how the contract
state evolves as users interact with it.

Usage:
    python monitor_contract.py --app-id <application_id>
"""

import argparse
import base64
import json
import time
from typing import Any, Dict, Optional

from algosdk.error import AlgodHTTPError

from algokit_utils import get_algod_client

# -- Configuration --
POLL_INTERVAL_SECONDS = 4

# Get Algorand client
algod_client = get_algod_client()


def decode_state(state: list[dict]) -> Dict[str, Any]:
    """Decodes the raw global state into a human-readable dictionary."""
    decoded: Dict[str, Any] = {}
    for item in state:
        key = base64.b64decode(item["key"]).decode("utf-8")
        value = item["value"]
        
        value_type = value["type"]
        if value_type == 1:  # bytes
            try:
                # Attempt to decode as a UTF-8 string
                decoded_value = base64.b64decode(value["bytes"]).decode("utf-8")
                # Also check for address-like strings
                if len(base64.b64decode(value["bytes"])) == 32:
                    from algosdk.encoding import encode_address
                    decoded_value = encode_address(base64.b64decode(value["bytes"]))
                decoded[key] = decoded_value
            except UnicodeDecodeError:
                # If not a valid string, show as raw bytes
                decoded[key] = f"0x{base64.b64decode(value['bytes']).hex()}"
        elif value_type == 2:  # uint
            decoded[key] = value["uint"]
        else:
            decoded[key] = value
            
    return decoded


def main() -> None:
    """Parses arguments and starts the monitoring loop."""
    parser = argparse.ArgumentParser(description="Monitor the global state of a contract.")
    parser.add_argument("--app-id", type=int, required=True, help="The App ID of the contract to monitor.")
    args = parser.parse_args()
    app_id = args.app_id

    print("=" * 60)
    print(f"👀 Starting real-time monitoring for App ID: {app_id}")
    print(f"   Polling every {POLL_INTERVAL_SECONDS} seconds. Press Ctrl+C to stop.")
    print("=" * 60)

    last_state: Optional[Dict[str, Any]] = None

    try:
        while True:
            try:
                app_info = algod_client.application_info(app_id)
                current_state_raw = app_info.get("params", {}).get("global-state", [])
                current_state = decode_state(current_state_raw)

                if not last_state:
                    print(f"[{time.strftime('%H:%M:%S')}] Initial state:")
                    print(json.dumps(current_state, indent=2))
                    print("---")
                elif current_state != last_state:
                    print(f"[{time.strftime('%H:%M:%S')}] State changed!")
                    print(json.dumps(current_state, indent=2))
                    print("---")
                
                last_state = current_state

            except AlgodHTTPError as e:
                if "application does not exist" in str(e):
                    print(f"\n❌ Error: Application with App ID {app_id} does not exist.")
                    break
                else:
                    print(f"\n⚠️ Warning: Could not fetch application info. Retrying... ({e})")
            except Exception as e:
                print(f"\nAn unexpected error occurred: {e}")
                break

            time.sleep(POLL_INTERVAL_SECONDS)

    except KeyboardInterrupt:
        print("\n🛑 Monitoring stopped by user.")


if __name__ == "__main__":
    main()
