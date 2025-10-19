# **H15-18: Monitoring & Debugging Tools - Plan & Outcome**

## **Objective**
Create real-time monitoring and debugging utilities to observe contract state changes and troubleshoot transaction failures during development and testing. These tools support the PRD's emphasis on comprehensive testing and development infrastructure (PRD §11, §12).

---

## **PRD Alignment Review**

-   **[V] Development Workflow:** These tools enable rapid iteration during contract development, supporting the hackathon timeline (PRD §12).
-   **[V] Debugging Support:** The transaction debugger helps identify and resolve issues with inner transactions, which are critical to the core innovation (PRD §6.2 lines 242-289).
-   **[V] Testing Infrastructure:** Real-time monitoring complements the test suite by allowing observation of actual on-chain state changes during integration testing.
-   **[V] Risk Mitigation:** These tools help identify contract bugs early, addressing the "critical bug" risk outlined in the risk table (PRD §11).

---

## **Implementation & Artifacts**

Two utility scripts were created in the `projects/AlgoFreelance-contracts/scripts/` directory:

### **1. `monitor_contract.py`**
-   **Status:** ✅ **COMPLETE**
-   **Function:** Real-time polling and logging of on-chain contract state changes.
-   **Key Features:**
    -   Polls application global state every 4 seconds
    -   Decodes raw state values into human-readable format
    -   Automatically detects and displays state changes with timestamps
    -   Converts byte arrays to addresses when appropriate (32-byte values)
    -   Handles both UTF-8 strings and raw hex values
    -   Graceful error handling for non-existent apps
    -   Clean exit on Ctrl+C

-   **Usage:**
    ```bash
    python scripts/monitor_contract.py --app-id <application_id>
    ```

-   **Example Output:**
    ```
    ============================================================
    👀 Starting real-time monitoring for App ID: 98765432
       Polling every 4 seconds. Press Ctrl+C to stop.
    ============================================================
    [14:23:15] Initial state:
    {
      "client_address": "CLIENT7XYZ...",
      "freelancer_address": "FREELANCER123...",
      "escrow_amount": 5000000,
      "job_status": 0,
      "job_title": "Logo Design",
      "created_at": 1729270800
    }
    ---
    [14:23:42] State changed!
    {
      "client_address": "CLIENT7XYZ...",
      "freelancer_address": "FREELANCER123...",
      "escrow_amount": 5000000,
      "job_status": 1,
      "job_title": "Logo Design",
      "created_at": 1729270800
    }
    ---
    ```

-   **Technical Implementation:**
    -   Uses `algod_client.application_info()` for state queries
    -   Custom `decode_state()` function handles base64 decoding
    -   Type detection for bytes vs. uint values
    -   Special handling for Algorand addresses (32-byte values)
    -   JSON pretty-printing for readability
    -   Configurable polling interval via `POLL_INTERVAL_SECONDS`

### **2. `debug_transaction.py`**
-   **Status:** ✅ **COMPLETE**
-   **Function:** Fetches and displays detailed breakdown of any transaction from the Algorand Indexer.
-   **Key Features:**
    -   Displays basic transaction info (type, sender, fee, confirmed round)
    -   Shows application call details (App ID, on-completion, arguments)
    -   Decodes and displays execution logs
    -   **Critical for debugging inner transactions:**
        -   Lists all inner transactions in a grouped transaction
        -   Shows payment details (receiver, amount)
        -   Shows asset transfer details (asset ID, receiver, amount)
        -   Shows asset config details (NFT name, total supply)
    -   Displays transaction failure messages
    -   Handles indexer errors gracefully

-   **Usage:**
    ```bash
    python scripts/debug_transaction.py --txid <transaction_id>
    ```

-   **Example Output:**
    ```
    🐞 Debugging Transaction ID: XYZ123ABC...

    ---------- Transaction Details ----------
    Type: appl
    Sender: CLIENT7XYZ...
    Fee: 1000 microALGOs
    Confirmed Round: 25467890

    ---------- Application Call ----------
    App ID: 98765432
    On Completion: noop
    Args: ['approve_work']

    ---------- Execution Logs ----------
      [0]: 151f7c75
      [1]: 000000000000000a

    ---------- Inner Transactions ----------
      --- Inner Txn 1 ---
        Type: pay
        Receiver: FREELANCER123...
        Amount: 5000000 microALGOs
      --- Inner Txn 2 ---
        Type: acfg
        Asset Name: AlgoFreelance: Logo Design
        Total: 1
      --- Inner Txn 3 ---
        Type: axfer
        Asset ID: 87654321
        Receiver: FREELANCER123...
        Amount: 1
    ```

-   **Technical Implementation:**
    -   Uses `indexer_client.transaction()` for fetching details
    -   Comprehensive parsing of transaction structure
    -   Base64 decoding for application arguments and logs
    -   Special handling for different inner transaction types (payment, asset transfer, asset config)
    -   Formatted output with section headers for readability
    -   Error detection and reporting for failed transactions

---

## **Use Cases**

### **Development Workflow**
1.  **During contract development:**
    -   Use `monitor_contract.py` to observe state changes in real-time as you test methods via CLI or frontend.
    -   Immediately see if `job_status` transitions occur as expected.

2.  **When debugging failed transactions:**
    -   Copy the transaction ID from the error message.
    -   Run `debug_transaction.py --txid <txid>` to see exactly what happened.
    -   Check inner transactions to identify which step failed (payment, mint, or transfer).

3.  **During integration testing:**
    -   Start monitoring before running end-to-end tests.
    -   Observe the full lifecycle: Created → Funded → Submitted → Completed.
    -   Verify all state changes happen at the correct points.

### **Troubleshooting Scenarios**

| **Issue** | **Tool** | **How It Helps** |
|-----------|---------|------------------|
| "Why didn't the status update?" | `monitor_contract.py` | Shows current state; confirms if transaction succeeded but state didn't change as expected |
| "approve_work failed, but why?" | `debug_transaction.py` | Lists all 3 inner transactions; identifies which one failed (e.g., freelancer not opted-in) |
| "Is the contract funded?" | `monitor_contract.py` | Can add account balance polling (future enhancement) |
| "Did the NFT mint correctly?" | `debug_transaction.py` | Shows asset config details including name, total, and immutability settings |

---

## **Integration with Other H-Tasks**

-   **H2-6 (Test Files):** These tools complement the test suite by allowing manual verification of contract behavior on TestNet.
-   **H6-10 (CI/CD):** The debugging tool can be integrated into CI/CD logs to provide detailed failure analysis.
-   **H10-12 (Deployment Scripts):** Use `monitor_contract.py` immediately after deployment to verify initial state.
-   **Role 3 (Backend):** Backend developers can use these tools when integrating API endpoints with the smart contract.

---

## **Future Enhancements**

While the current implementation is complete and functional, the following enhancements could be added post-hackathon:

1.  **Monitor Contract Balance:** Add account balance polling to `monitor_contract.py` to track funding status.
2.  **Log to File:** Add option to save monitoring output to a timestamped log file for later analysis.
3.  **Pretty-Print Diff:** Show only changed fields when state updates, rather than full state dump.
4.  **Transaction Explorer Link:** Automatically generate and display Pera Explorer links in debug output.
5.  **GraphQL Integration:** Use Algorand's GraphQL API for richer transaction queries.
6.  **Alert System:** Add webhook or notification support when specific state transitions occur.

---

## **Documentation for Users**

Usage instructions for both tools should be added to the main project documentation. Suggested sections:

### **In `DEPLOYMENT.md`**
Add a new section:
```markdown
## 7. Monitoring Deployed Contracts

After deployment, you can monitor the contract's state in real-time:

\`\`\`bash
python scripts/monitor_contract.py --app-id <your_app_id>
\`\`\`

This will display state changes as they occur on-chain.
```

### **In `tests/README.md`**
Add a new section:
```markdown
## 5. Debugging Failed Tests

If a test fails due to a transaction error, you can inspect the transaction details:

\`\`\`bash
# Get the transaction ID from the test error output
python scripts/debug_transaction.py --txid <transaction_id>
\`\`\`

This will show inner transactions, execution logs, and failure messages.
```

### **Create New `DEBUGGING.md`**
A dedicated debugging guide could be created with common failure patterns and how to use these tools to diagnose them.

---

## **Conclusion**

Task H15-18 is complete. The monitoring and debugging tools provide essential infrastructure for contract development, testing, and troubleshooting. They directly support the PRD's emphasis on rigorous testing and rapid iteration during the hackathon timeline. These utilities will significantly accelerate debugging of the complex grouped inner transactions that form the core innovation of AlgoFreelance.

**Next Steps:**
-   Integrate usage instructions into existing documentation (`DEPLOYMENT.md`, `tests/README.md`).
-   Share tools with Role 1 (Smart Contract Dev) and Role 3 (Backend Dev) for their workflows.
-   Use `monitor_contract.py` during end-to-end testing to verify the full job lifecycle.
