# AlgoFreelance Contract Deployment Guide

This document provides a comprehensive guide to deploying the AlgoFreelance smart contract to the Algorand TestNet. For MainNet deployment, additional steps and security considerations are required.

## 1. Prerequisites

Before deploying, ensure you have completed the following:

-   **AlgoKit:** Make sure `algokit` is installed and your local environment is bootstrapped. See the main [README.md](../README.md) for setup instructions.
-   **Environment Variables:** The deployment scripts rely on environment variables defined in `.env.testnet`.

### Environment Setup

1.  Navigate to the `projects/AlgoFreelance-contracts` directory.
2.  Create a copy of `.env.localnet` and name it `.env.testnet`.
3.  Populate `.env.testnet` with the following:

    ```dotenv
    # Mnemonic for the account that will deploy and fund the contract
    DEPLOYER_MNEMONIC="your 25-word mnemonic phrase here"

    # Algorand TestNet API details (from AlgoNode or similar provider)
    ALGOD_SERVER="https://testnet-api.algonode.cloud"
    ALGOD_PORT="443"
    ALGOD_TOKEN=""

    INDEXER_SERVER="https://testnet-idx.algonode.cloud"
    INDEXER_PORT="443"
    INDEXER_TOKEN=""
    ```

4.  **Fund the Deployer Account:** Your deployer account must have sufficient ALGO to pay for transaction fees. Use the official [TestNet Dispenser](https://bank.testnet.algorand.network/) to fund the address associated with your `DEPLOYER_MNEMONIC`.

## 2. TestNet Deployment

The deployment process is automated with the scripts located in the `scripts/` directory.

### Step 1: Run the Deployment Script

This script compiles, deploys, and funds the contract.

```bash
python scripts/deploy_testnet.py
```

On success, the script will output:
-   The **App ID** and **App Address** of the new contract.
-   A link to view the application on the Pera Wallet Explorer.
-   A `deployment-info.json` file containing the deployment details.

### Step 2: Verify the Deployment

This script checks that the contract was deployed and funded correctly.

```bash
python scripts/verify_deployment.py
```

If successful, it will confirm that the application exists on-chain and has a sufficient balance (>= 0.5 ALGO).

## 3. Manual Funding

If you need to add more funds to the contract account after deployment, you can use the `fund_contract.py` script.

```bash
# Example: Send 2.5 ALGO to the contract
python scripts/fund_contract.py --app-id <your_app_id> --amount 2.5
```

Replace `<your_app_id>` with the ID from the `deployment-info.json` file.

## 4. MainNet vs. TestNet Deployment

While the scripts are designed for TestNet, they can be adapted for MainNet with critical changes:

-   **Environment:** You would need a `.env.mainnet` file pointing to MainNet API endpoints.
-   **Funding:** The `DEPLOYER_MNEMONIC` must correspond to a MainNet account with **real ALGO**.
-   **Costs:** Deployment and transaction fees will cost real ALGO.
-   **Security:** **DO NOT** deploy to MainNet without a comprehensive security audit of the smart contract.

## 5. Troubleshooting

-   **`ValueError: DEPLOYER_MNEMONIC environment variable not set`**
    -   Ensure your `.env.testnet` file is correctly named and located in the `projects/AlgoFreelance-contracts` directory.

-   **`AlgodHTTPError: ... overspend`**
    -   The deployer account does not have enough ALGO. Fund it using the TestNet Dispenser.

-   **`Funding failed: ...`**
    -   This can happen if the network is congested or the transaction times out. The deployment script will attempt to automatically delete the created app to allow for a clean re-run.

## 6. Rollback Procedure

A "rollback" in this context means deleting the deployed application to recover the minimum balance locked in its account. This is only possible if no irreversible actions have occurred.

If a deployment fails, the `deploy_testnet.py` script attempts to clean up automatically. For manual deletion, you can use `algokit`:

```bash
# Example of deleting an app
algokit client application delete --app-id <your_app_id> --from <deployer_address>
```

**Note:** This action is irreversible and should only be done on TestNet for failed deployments.

## 7. Monitoring Deployed Contracts

After deployment, you can monitor the contract's state in real-time to observe how it changes as transactions are executed:

```bash
python scripts/monitor_contract.py --app-id <your_app_id>
```

This will display state changes as they occur on-chain, showing updates to global state variables like `job_status`, `work_hash`, and others. The monitoring tool polls the contract every 4 seconds and prints changes with timestamps.

**Example:**
```bash
python scripts/monitor_contract.py --app-id 98765432
```

Press `Ctrl+C` to stop monitoring.

This tool is particularly useful during integration testing to verify that state transitions happen at the expected points in the job lifecycle (Created → Funded → Submitted → Completed).
