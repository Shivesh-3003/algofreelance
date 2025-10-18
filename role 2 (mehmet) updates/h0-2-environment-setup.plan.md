# H0-2: Environment Setup Plan

## Overview

Configure both LocalNet (for rapid development/testing) and TestNet (for deployment) environments with funded test accounts.

## Prerequisites Check

1. Verify AlgoKit is installed: `algokit --version` (should be 2.0+)
2. Verify Docker is running (required for LocalNet)
3. Navigate to: `/Users/mehmet/Documents/algorand hack/algofreelance/projects/AlgoFreelance-contracts/`

## Step 1: Start AlgoKit LocalNet

**Action:** Start the local Algorand development network

```bash
algokit localnet start
```

**Expected output:** LocalNet containers running (algod, indexer, postgres)

**Verify:** Run `algokit localnet status` - should show all services healthy

## Step 2: Generate LocalNet Test Accounts

**Action:** Use AlgoKit to generate 2 funded test accounts for LocalNet

```bash
# Generate client account
algokit task account generate --name client_test

# Generate freelancer account  
algokit task account generate --name freelancer_test
```

**Save outputs:** Copy the addresses and mnemonics for both accounts

**Alternative (if command not available):** Use Python script to generate accounts and fund them from the default LocalNet dispenser account

## Step 3: Create LocalNet Environment File

**File:** `/Users/mehmet/Documents/algorand hack/algofreelance/projects/AlgoFreelance-contracts/.env.localnet`

**Content:**

```bash
# LocalNet Configuration
ALGOD_SERVER=http://localhost
ALGOD_PORT=4001
ALGOD_TOKEN=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
INDEXER_SERVER=http://localhost
INDEXER_PORT=8980
INDEXER_TOKEN=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa

# Test Accounts (Replace with actual generated values)
CLIENT_ADDRESS=<client_address_from_step2>
CLIENT_MNEMONIC="<25_word_mnemonic_from_step2>"
FREELANCER_ADDRESS=<freelancer_address_from_step2>
FREELANCER_MNEMONIC="<25_word_mnemonic_from_step2>"

# Network
NETWORK=localnet
```

## Step 4: Generate TestNet Accounts

**Action:** Generate 2 new accounts for TestNet (do NOT reuse LocalNet accounts)

```bash
# These will be unfunded initially
algokit task account generate --name client_testnet
algokit task account generate --name freelancer_testnet
```

**Save outputs:** Copy addresses and mnemonics to a secure temporary location

## Step 5: Fund TestNet Accounts

**Action:** Get free TestNet ALGO from the dispenser

1. Visit: `https://bank.testnet.algorand.network/`
2. Enter client TestNet address → Click "Dispense" (receive 10 ALGO)
3. Enter freelancer TestNet address → Click "Dispense" (receive 10 ALGO)
4. Verify receipt on TestNet explorer: `https://testnet.explorer.perawallet.app/address/<address>`

**Expected result:** Each account has ~10 ALGO balance on TestNet

## Step 6: Create TestNet Environment File

**File:** `/Users/mehmet/Documents/algorand hack/algofreelance/projects/AlgoFreelance-contracts/.env.testnet`

**Content:**

```bash
# TestNet Configuration (AlgoNode free endpoints)
ALGOD_SERVER=https://testnet-api.algonode.cloud
ALGOD_PORT=443
ALGOD_TOKEN=
INDEXER_SERVER=https://testnet-idx.algonode.cloud
INDEXER_PORT=443
INDEXER_TOKEN=

# Test Accounts (Replace with actual generated values)
CLIENT_ADDRESS=<client_testnet_address_from_step4>
CLIENT_MNEMONIC="<25_word_mnemonic_from_step4>"
FREELANCER_ADDRESS=<freelancer_testnet_address_from_step4>
FREELANCER_MNEMONIC="<25_word_mnemonic_from_step4>"

# Network
NETWORK=testnet
```

## Step 7: Update conftest.py

**File:** `tests/conftest.py`

**Action:** Uncomment and update the environment fixture to load the appropriate .env file

**Add after imports:**

```python
from pathlib import Path
from dotenv import load_dotenv
import os
```

**Uncomment and modify the fixture:**

```python
@pytest.fixture(autouse=True, scope="session")
def environment_fixture() -> None:
    # Load .env.localnet by default, or .env.testnet if specified
    network = os.getenv("NETWORK", "localnet")
    env_path = Path(__file__).parent.parent / f".env.{network}"
    load_dotenv(env_path)
```

**Update algorand_client fixture:**

```python
@pytest.fixture(scope="session")
def algorand_client() -> AlgorandClient:
    # Will use environment variables loaded from .env file
    return AlgorandClient.from_environment()
```

## Step 8: Verify Setup

**Action:** Test that the environment is correctly configured

```bash
# Verify LocalNet connectivity
algokit localnet status

# Test Python environment
cd /Users/mehmet/Documents/algorand hack/algofreelance/projects/AlgoFreelance-contracts
poetry install
poetry run pytest tests/ --collect-only  # Should collect tests without errors
```

## Step 9: Document Account Information

**Action:** Create a secure reference file (DO NOT commit to git)

**File:** `/Users/mehmet/Documents/algorand hack/algofreelance/projects/AlgoFreelance-contracts/.accounts.private` (add to .gitignore)

**Content:**

```
=== LOCALNET ACCOUNTS ===
Client: <address>
Mnemonic: <mnemonic>

Freelancer: <address>
Mnemonic: <mnemonic>

=== TESTNET ACCOUNTS ===
Client: <address>
Mnemonic: <mnemonic>
Explorer: https://testnet.explorer.perawallet.app/address/<address>

Freelancer: <address>
Mnemonic: <mnemonic>
Explorer: https://testnet.explorer.perawallet.app/address/<address>
```

## Verification Checklist

- [ ] LocalNet is running and healthy
- [ ] 2 test accounts generated and funded on LocalNet
- [ ] 2 test accounts generated and funded on TestNet (10 ALGO each)
- [ ] `.env.localnet` file created with correct values
- [ ] `.env.testnet` file created with correct values
- [ ] `conftest.py` updated to load environment variables
- [ ] `poetry install` completes successfully
- [ ] Account information documented securely

## Notes

- LocalNet accounts reset when you run `algokit localnet reset` - this is useful for clean test runs
- TestNet ALGO is limited - use wisely during testing
- Always test on LocalNet first before deploying to TestNet
- The default LocalNet provides dispenser accounts that are automatically funded