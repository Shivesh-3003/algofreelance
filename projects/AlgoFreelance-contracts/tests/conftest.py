import pytest
from algokit_utils import AlgorandClient
from algokit_utils.config import config
from pathlib import Path
from dotenv import load_dotenv
import os


@pytest.fixture(autouse=True, scope="session")
def environment_fixture() -> None:
    """Load environment variables from network-specific .env file"""
    # Load .env.localnet by default, or .env.testnet if NETWORK env var is set
    network = os.getenv("NETWORK", "localnet")
    env_path = Path(__file__).parent.parent / f".env.{network}"
    
    if env_path.exists():
        load_dotenv(env_path)
        print(f"\n✓ Loaded environment from: {env_path}")
    else:
        print(f"\n⚠ Warning: Environment file not found: {env_path}")

config.configure(
    debug=True,
    # trace_all=True, # uncomment to trace all transactions
)


@pytest.fixture(scope="session")
def algorand_client() -> AlgorandClient:
    """Initialize Algorand client from environment variables"""
    # Uses ALGOD_SERVER, ALGOD_PORT, ALGOD_TOKEN from loaded .env file
    return AlgorandClient.from_environment()


@pytest.fixture(scope="session")
def client_account() -> dict:
    """Get client test account from environment"""
    return {
        "address": os.getenv("CLIENT_ADDRESS"),
        "mnemonic": os.getenv("CLIENT_MNEMONIC"),
    }


@pytest.fixture(scope="session")
def freelancer_account() -> dict:
    """Get freelancer test account from environment"""
    return {
        "address": os.getenv("FREELANCER_ADDRESS"),
        "mnemonic": os.getenv("FREELANCER_MNEMONIC"),
    }
