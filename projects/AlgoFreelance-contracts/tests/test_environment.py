"""
Environment Setup Verification Tests (H0-2)

These tests verify that the environment is correctly configured:
- LocalNet/TestNet connectivity
- Test account fixtures
- AlgorandClient initialization
"""

import os
import pytest


def test_environment_loaded():
    """Verify environment variables are loaded from .env files"""
    network = os.getenv("NETWORK", "localnet")
    assert network in ["localnet", "testnet"], f"Invalid network: {network}"

    # Verify required environment variables exist
    assert os.getenv("ALGOD_SERVER") is not None, "ALGOD_SERVER not set"
    assert os.getenv("CLIENT_ADDRESS") is not None, "CLIENT_ADDRESS not set"
    assert os.getenv("FREELANCER_ADDRESS") is not None, "FREELANCER_ADDRESS not set"


def test_algorand_client(algorand_client):
    """Verify AlgorandClient can connect to the network"""
    # Get network status
    status = algorand_client.client.algod.status()

    assert "last-round" in status, "Failed to get network status"
    assert status["last-round"] >= 0, "Invalid last round"

    print(f"\n✅ Connected to Algorand network")
    print(f"   Last round: {status['last-round']}")
    print(f"   Genesis ID: {status.get('genesis-id', 'N/A')}")


def test_client_account(client_account, algorand_client):
    """Verify client account fixture works"""
    address = client_account["address"]
    assert address is not None, "Client address is None"
    assert len(address) == 58, f"Invalid address length: {len(address)}"

    # Try to get account info (will fail if account doesn't exist or network is unreachable)
    try:
        account_info = algorand_client.client.algod.account_info(address)
        balance_algo = account_info["amount"] / 1_000_000

        print(f"\n✅ Client account: {address}")
        print(f"   Balance: {balance_algo:.6f} ALGO")

        # Note: Account might have 0 balance until funded
        if balance_algo == 0:
            print(f"   ⚠️  Account needs funding!")
    except Exception as e:
        pytest.fail(f"Failed to get client account info: {e}")


def test_freelancer_account(freelancer_account, algorand_client):
    """Verify freelancer account fixture works"""
    address = freelancer_account["address"]
    assert address is not None, "Freelancer address is None"
    assert len(address) == 58, f"Invalid address length: {len(address)}"

    # Try to get account info
    try:
        account_info = algorand_client.client.algod.account_info(address)
        balance_algo = account_info["amount"] / 1_000_000

        print(f"\n✅ Freelancer account: {address}")
        print(f"   Balance: {balance_algo:.6f} ALGO")

        # Note: Account might have 0 balance until funded
        if balance_algo == 0:
            print(f"   ⚠️  Account needs funding!")
    except Exception as e:
        pytest.fail(f"Failed to get freelancer account info: {e}")


def test_accounts_are_different(client_account, freelancer_account):
    """Verify client and freelancer are different accounts"""
    assert client_account["address"] != freelancer_account["address"], \
        "Client and freelancer must be different accounts"
    print(f"\n✅ Client and freelancer are different accounts")


def test_mock_ipfs_hash():
    """Verify mock IPFS hash format for testing"""
    mock_hash = "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"

    # IPFS CIDv0 hashes start with "Qm" and are 46 characters
    assert mock_hash.startswith("Qm"), "Invalid IPFS hash prefix"
    assert len(mock_hash) == 46, f"Invalid IPFS hash length: {len(mock_hash)}"

    print(f"\n✅ Mock IPFS hash: {mock_hash}")
