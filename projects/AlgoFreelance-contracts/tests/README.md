# AlgoFreelance Contract Testing

This document outlines the testing strategy, setup, and procedures for the AlgoFreelance smart contracts. Our goal is to maintain 100% test coverage to ensure contract robustness and security.

## 1. Testing Frameworks & Tools

-   **Testing Framework:** `pytest` is used for writing and running tests.
-   **Algorand Framework:** `algokit` provides the LocalNet environment, client management, and utility functions for testing.
-   **Test Environment:** Tests are primarily run against an `algokit` LocalNet for speed and isolation.

## 2. How to Run Tests

All tests are located in the `tests/` directory. Ensure you have bootstrapped the project environment before running tests.

### Prerequisites

From the `projects/AlgoFreelance-contracts` directory, run:
```bash
# Install all dependencies defined in pyproject.toml
algokit project bootstrap all

# Start the local Algorand network
algokit localnet start
```

### Running All Tests

To run the entire test suite (unit, integration, and edge cases), execute the following command:

```bash
poetry run pytest -v
```

### Running Specific Test Files

You can run a specific file by providing its path:

```bash
# Run only the initialization tests
poetry run pytest -v tests/test_initialize.py
```

### Checking Test Coverage

We aim for 100% test coverage. To generate a coverage report, run:

```bash
poetry run pytest --cov=smart_contracts --cov-report=term-missing
```

This will show a line-by-line report of which statements are not covered by the tests. An XML report is also generated for CI/CD integration.

## 3. Test Structure

The test suite is organized by contract functionality:

-   `tests/test_initialize.py`: Tests for the contract's creation and initial state.
-   `tests/test_submit_work.py`: Tests for the `submit_work` method, including authorization and state transitions.
-   `tests/test_approve_work.py`: Critical tests for the `approve_work` method, focusing on the atomicity of inner transactions (payment, NFT mint, NFT transfer).
-   `tests/test_edge_cases.py`: Tests for invalid state transitions, security vulnerabilities, and boundary conditions.
-   `tests/conftest.py`: Contains shared `pytest` fixtures, such as initialized clients and test accounts, which are available to all test files.

## 4. Adding New Tests

When adding new features or modifying existing logic in the smart contract, corresponding tests **must** be added.

### Procedure

1.  **Identify the correct file:** If you are modifying an existing method, add your test case to the relevant `test_*.py` file. For a new method, create a new `test_new_method.py` file.
2.  **Write the test case:**
    -   Follow the `Arrange, Act, Assert` pattern.
    -   Use descriptive function names, like `test_approve_work_fails_if_caller_is_not_client`.
    -   Leverage existing fixtures from `conftest.py` where possible (e.g., `algod_client`, `funded_contract_state`).
    -   If you need a new, reusable setup, add a new fixture in `conftest.py`.
3.  **Run the tests:** Execute `pytest` to ensure your new test passes and that you haven't broken any existing functionality.
4.  **Check coverage:** Run the coverage report to confirm your new code is fully tested.

## 5. Debugging Failed Tests

When a test fails due to a transaction error, you can use the debugging utility to inspect what went wrong. This is especially helpful for understanding failures in complex operations like the grouped inner transactions in `approve_work`.

### Using the Transaction Debugger

1.  **Get the transaction ID** from the test error output or pytest logs.
2.  **Run the debug script:**
    ```bash
    python scripts/debug_transaction.py --txid <transaction_id>
    ```

This will display:
-   Transaction details (type, sender, fee, confirmed round)
-   Application call information (App ID, on-completion, decoded arguments)
-   Execution logs (helpful for understanding contract flow)
-   **Inner transactions** (critical for debugging the payment + NFT mint + NFT transfer group)
-   Error messages if the transaction failed

### Example Workflow

```bash
# Run a test that fails
poetry run pytest -v tests/test_approve_work.py::test_approve_creates_grouped_inner_transactions

# Copy the transaction ID from the error output
# Example: XYZ123ABC...

# Debug the transaction
python scripts/debug_transaction.py --txid XYZ123ABC...
```

The debug output will show all three inner transactions and help identify which one failed (e.g., the freelancer wasn't opted into the asset, or the contract didn't have enough balance).

---
