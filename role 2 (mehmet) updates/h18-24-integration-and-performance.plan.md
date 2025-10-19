# **Plan: H18-24 - Integration, Deployment, and Performance**

This plan outlines the tasks for Role 2, focusing on integrating the actual smart contract with the existing test suite, deploying it to TestNet, and conducting performance analysis.

---

### **Task 1: H18-20: Replace Test Stubs & Integration Testing**

**Commit Message:** `feat(tests): implement contract integration tests`

**Goal:** Replace all skipped test stubs with actual test logic that calls the smart contract, ensuring 100% test coverage.

**TODO List:**
1.  **Analyze `contract.py`:** Review the final `AlgoFreelance` smart contract implementation in `projects/AlgoFreelance-contracts/smart_contracts/algo_freelance/contract.py` to understand its methods, state, and logic.
2.  **Update Test Fixtures:** In `tests/conftest.py`, ensure fixtures correctly deploy and initialize the contract for testing. The existing fixtures may need adjustments to match the final contract's deployment and initialization patterns.
3.  **Implement `tests/test_initialize.py`:** Fill in the 13 skipped tests with logic that asserts the contract's state after the `initialize` method is called.
4.  **Implement `tests/test_fund.py`:** Implement tests for the `fund` method, including success cases and failure cases (e.g., funding from a non-client account).
5.  **Implement `tests/test_submit_work.py`:** Fill in the 17 skipped tests, verifying state changes and validation on the `submit_work` method.
6.  **Implement `tests/test_approve_work.py`:** Fill in the 25 skipped tests. This is the most critical part.
    -   Verify the successful execution of the 3 inner transactions (Payment, Mint, Transfer).
    -   Test atomicity: ensure the group fails if the freelancer has not opted into the NFT.
    -   Confirm the minted NFT's properties (name, unit name, URL, immutability).
    -   Check for correct state changes and authorization.
7.  **Implement `tests/test_edge_cases.py`:** Fill in the 25 skipped tests covering invalid state transitions, security checks, and boundary conditions.
8.  **Run Full Test Suite:** Execute `poetry run pytest` from within the `projects/AlgoFreelance-contracts` directory and ensure all tests pass.
9.  **Check Test Coverage:** Run `poetry run pytest --cov=smart_contracts` to confirm 100% coverage of the contract logic.

---

### **Task 2: H20-22: TestNet Deployment & Verification**

**Commit Message:** `chore(deploy): deploy contract to testnet and document`

**Goal:** Deploy the finalized and tested contract to the Algorand TestNet and document the result.

**TODO List:**
1.  **Activate Environment:** Ensure the `pyenv activate env3.12.11` environment is active.
2.  **Run Build Script:** Execute `python -m smart_contracts build` from `projects/AlgoFreelance-contracts` to ensure the artifacts are up-to-date.
3.  **Run Deployment Script:** Execute `python -m smart_contracts deploy` to deploy the contract to TestNet using the logic in `deploy_config.py`.
4.  **Capture Deployment Output:**
    -   Note the `App ID` and `App Address` from the script's output.
5.  **Verify on Explorer:**
    -   Use the App ID to locate the contract on a TestNet explorer (e.g., Pera Explorer).
    -   Confirm the contract's global state and approval program are correct.
6.  **Document Deployment:**
    -   Update the main `README.md` in the root of the `algofreelance` project with the TestNet App ID and a direct explorer link.
    -   Share this information with the team, especially Role 3 (Backend).

---

### **Task 3: H22-24: Performance Testing & Documentation**

**Commit Message:** `test(performance): measure and document contract performance`

**Goal:** Analyze the performance characteristics (speed, cost) of the contract on TestNet.

**TODO List:**
1.  **Create Performance Test Script:**
    -   Create a new script: `projects/AlgoFreelance-contracts/scripts/performance_test.py`.
    -   This script will use the deployed App ID to interact with the TestNet contract.
2.  **Measure Transaction Times:**
    -   In the script, implement functions to call `initialize`, `fund`, `submit_work`, and `approve_work`.
    -   For each function, measure the time from transaction submission to confirmation.
    -   Run each test multiple times to get an average confirmation time.
3.  **Document Gas Costs:**
    -   For each contract call, inspect the transaction details and record the exact fee paid in a `PERFORMANCE.md` file.
    -   Note the fee for the outer transaction and any fees consumed by the inner transactions during the `approve_work` call.
4.  **Create Performance Report:**
    -   Create the file `projects/AlgoFreelance-contracts/PERFORMANCE.md`.
    -   Document the findings:
        -   A table of average confirmation times for each contract method.
        -   A detailed breakdown of gas costs for a full job lifecycle.
    -   This documentation will be crucial for setting backend timeouts and understanding operational costs.

---

### **Final Verification**

After completing all tasks, a final end-to-end check will be performed:
1.  Run the entire `pytest` suite one last time.
2.  Manually execute the `performance_test.py` script to interact with the deployed TestNet contract and verify the full lifecycle.
3.  Review all created and updated documentation (`README.md`, `PERFORMANCE.md`) for clarity and accuracy.