# CI/CD Pipeline Documentation

## Overview

This project uses GitHub Actions for continuous integration (CI) and continuous deployment (CD) to automate testing and deployment of the AlgoFreelance smart contracts.

---

## Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

**Purpose:** Automated testing and linting on every push and pull request.

**Triggers:**
- Push to any branch
- Pull request to any branch

**What it does:**
1. Sets up Python 3.12 environment
2. Installs AlgoKit via pipx
3. Bootstraps project dependencies (`algokit project bootstrap all`)
4. Starts AlgoKit LocalNet (ephemeral Algorand network for testing)
5. Runs linting checks:
   - **Black** - Code formatting (line-length: 120)
   - **Ruff** - Code quality and style linting
   - **Mypy** - Static type checking
6. Runs test suite (`pytest`)
7. Generates code coverage report (XML + terminal output)
8. Uploads coverage artifact for analysis
9. Stops LocalNet and cleans up

**Expected Test Results:**
- **Environment tests:** 8 passed ✓
- **Contract tests:** 80 skipped ⏭️ (until Role 1 delivers contract implementation)
- **Total:** 88 tests discovered

**Coverage Target:**
- Target: 100% coverage (per PRD §11 risk mitigation)
- Current: Measured on `smart_contracts/` directory only
- Report format: XML (for future Codecov integration) + terminal

---

### 2. TestNet Deploy Workflow (`.github/workflows/deploy.yml`)

**Purpose:** Deploy smart contracts to Algorand TestNet.

**Triggers:**
- Push to `main` branch (automatic)
- Manual workflow dispatch (for testing)

**What it does:**
1. Sets up Python 3.12 and AlgoKit
2. Bootstraps project dependencies
3. Builds smart contracts:
   - Compiles Algorand Python to TEAL
   - Generates ARC56 app specification (for backend integration)
   - Creates typed client for contract interaction
4. Deploys to TestNet using `algokit project deploy testnet`
5. Extracts deployment info:
   - App ID (smart contract application ID)
   - Network (testnet)
   - Deployment timestamp
   - Explorer URLs
6. Creates deployment summary in GitHub Actions
7. Uploads deployment artifacts:
   - `deployment-info.json` - Structured deployment metadata
   - `deployment_output.txt` - Full deployment logs

**Deployment Strategy:**
- **Network:** Algorand TestNet only (per PRD requirement - no MainNet for hackathon)
- **Update policy:** `OnUpdate.AppendApp` (creates new app on schema changes)
- **Schema break policy:** `OnSchemaBreak.AppendApp` (creates new app if schema incompatible)
- **Funding:** Automatically funds deployed contract with 1 ALGO buffer

---

## GitHub Secrets Configuration

### Required Secrets

The TestNet deployment workflow requires the following secrets to be configured in your GitHub repository:

1. **`DEPLOYER_MNEMONIC`** (Required)
   - **Purpose:** Account that deploys the smart contract
   - **Format:** 25-word mnemonic phrase (space-separated)
   - **How to get:**
     - Use existing account from `.env.testnet` (line: `DEPLOYER_MNEMONIC`)
     - OR generate new account: `algokit goal account new deployer`
   - **Requirements:** Account must have at least 10 ALGO on TestNet

2. **`DISPENSER_MNEMONIC`** (Optional)
   - **Purpose:** Account for funding operations (can use deployer account)
   - **Format:** 25-word mnemonic phrase
   - **How to get:** Same as deployer (can be the same account)

### How to Add Secrets to GitHub

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. For `DEPLOYER_MNEMONIC`:
   - Name: `DEPLOYER_MNEMONIC`
   - Value: Paste your 25-word mnemonic (from `.env.testnet`)
   - Click **Add secret**
5. Repeat for `DISPENSER_MNEMONIC` if using separate account

⚠️ **Security Warning:**
- **NEVER commit mnemonics to the repository!**
- Mnemonics are stored securely in GitHub's encrypted secrets vault
- Only use TestNet accounts (never MainNet accounts for hackathon)

### Funding TestNet Accounts

Get free TestNet ALGO from the dispenser:
```bash
# Visit: https://bank.testnet.algorand.network/
# Enter your DEPLOYER account address
# Request 10 ALGO (sufficient for multiple deployments)
```

Or use AlgoKit:
```bash
algokit goal account import -m "your 25-word mnemonic here" deployer
algokit goal clerk send -a 10000000 -f DISPENSER -t DEPLOYER_ADDRESS
```

---

## Viewing Workflow Results

### GitHub Actions Tab

1. Go to your repository on GitHub
2. Click the **Actions** tab
3. You'll see:
   - **CI workflow:** Runs on every push/PR (green ✓ = passed, red ✗ = failed)
   - **Deploy workflow:** Runs on main branch merges

### Viewing Test Results

1. Click on a workflow run
2. Click on the **Run Tests and Linting** job
3. Expand steps to see:
   - Linting output (Black, Ruff, Mypy results)
   - Test execution output (pytest results)
   - Coverage report (percentage of code covered by tests)

### Downloading Deployment Artifacts

1. Go to a successful Deploy workflow run
2. Scroll to **Artifacts** section at bottom
3. Download `deployment-info` artifact
4. Extract `deployment-info.json`:
   ```json
   {
     "app_id": "123456789",
     "network": "testnet",
     "deployed_at": "2024-10-18T20:30:00Z",
     "explorer_url": "https://testnet.explorer.perawallet.app/application/123456789",
     "commit_sha": "abc123..."
   }
   ```

### Verifying Deployment on TestNet Explorer

After successful deployment:
1. Check the workflow summary for the App ID
2. Visit TestNet Explorer:
   - **Pera Explorer:** https://testnet.explorer.perawallet.app/application/{APP_ID}
   - **AlgoNode Explorer:** https://testnet.algoexplorer.io/application/{APP_ID}
3. Verify:
   - Contract is deployed ✓
   - Global state is initialized (if applicable)
   - Contract balance shows funding (1 ALGO)

---

## Troubleshooting

### CI Workflow Issues

#### Issue: LocalNet fails to start or times out
```
Error: Timeout waiting for LocalNet
```

**Solution:**
- LocalNet requires Docker to be running
- GitHub Actions has Docker pre-installed (should work automatically)
- If testing locally, ensure Docker Desktop is running:
  ```bash
  docker ps  # Should list containers, not error
  algokit localnet reset  # Reset if corrupted
  ```

#### Issue: Tests fail with "Could not connect to algod"
```
ConnectionError: Cannot connect to algod server
```

**Solution:**
- LocalNet may not be ready yet
- Increase wait time in workflow (currently 10 seconds)
- Check LocalNet status:
  ```bash
  algokit localnet status
  algokit localnet logs  # View logs for errors
  ```

#### Issue: Linting fails
```
Black would reformat X files
Ruff found Y violations
```

**Solution:**
- Fix formatting issues:
  ```bash
  poetry run black .
  poetry run ruff check . --fix
  ```
- Commit the fixes and push again

#### Issue: Coverage report fails to generate
```
No coverage data collected
```

**Solution:**
- Ensure tests ran successfully first
- Check that `smart_contracts/` directory exists and has Python files
- Verify pytest-cov is installed:
  ```bash
  poetry show pytest-cov
  ```

### Deploy Workflow Issues

#### Issue: "Secret DEPLOYER_MNEMONIC not found"
```
Error: Secret DEPLOYER_MNEMONIC is required but not provided
```

**Solution:**
- Verify secret name is exactly `DEPLOYER_MNEMONIC` (case-sensitive)
- Check that secret is added to repository (Settings → Secrets → Actions)
- If recently added, may need to re-trigger workflow

#### Issue: Deployment fails with "insufficient balance"
```
Error: Account has insufficient balance for transaction fee
```

**Solution:**
- DEPLOYER account needs at least 10 ALGO on TestNet
- Fund account from TestNet dispenser:
  - https://bank.testnet.algorand.network/
- Verify balance:
  ```bash
  algokit goal account balance -a DEPLOYER_ADDRESS
  ```

#### Issue: "Failed to deploy: contract compilation error"
```
Error: Could not compile contract
```

**Solution:**
- Check that contract syntax is valid:
  ```bash
  algokit compile python smart_contracts/algo_freelance/contract.py
  ```
- Ensure `algorand-python` is installed:
  ```bash
  poetry run python -c "import algopy"
  ```
- Review contract code for syntax errors

#### Issue: Cannot extract App ID from deployment output
```
app_id=unknown
```

**Solution:**
- Check `deployment_output.txt` artifact for actual output format
- Update regex in workflow's "Extract deployment info" step
- Common patterns:
  - `app_id: 123456789`
  - `application-id: 123456789`
  - `Created app with ID: 123456789`

---

## Local Testing (Before Pushing)

Test the complete CI workflow locally to avoid CI failures:

```bash
# 1. Start LocalNet
algokit localnet start
algokit localnet status  # Verify running

# 2. Bootstrap project (fresh install)
algokit project bootstrap all

# 3. Run linting
algokit project run lint
# Should pass with no errors

# 4. Build contracts
algokit project run build
# Generates smart_contracts/artifacts/

# 5. Run tests
algokit project run test
# Expected: 8 passed, 80 skipped

# 6. Generate coverage
poetry run pytest --cov=smart_contracts --cov-report=xml --cov-report=term
# Creates coverage.xml

# 7. Verify coverage file
ls -lh coverage.xml

# 8. Stop LocalNet
algokit localnet stop
```

**Expected Results:**
- All linting passes ✓
- Build generates `artifacts/` directory ✓
- Tests: 8 passed, 80 skipped ✓
- Coverage report generated ✓
- No hanging processes ✓

---

## Integration with Test Infrastructure (H2-6)

This CI/CD pipeline integrates seamlessly with the test infrastructure created in H2-6:

### Test File Structure
```
tests/
├── conftest.py                    # Test fixtures (algorand_client, accounts)
├── test_environment.py            # Environment verification (2 tests)
├── algo_freelance_client_test.py  # Contract client tests (6 tests)
├── test_initialize.py             # Initialize method tests (13 tests)
├── test_submit_work.py            # Submit work tests (17 tests)
├── test_approve_work.py           # Approve work tests (25 tests) ⭐ CRITICAL
└── test_edge_cases.py             # Edge case tests (25 tests)
```

### Test Categorization (88 Total Tests)
- **8 Passed:** Environment verification + boilerplate hello world tests
- **80 Skipped:** Contract tests waiting for Role 1 implementation
  - All use `pytest.skip("Waiting for contract from Role 1")`
  - Comprehensive documentation in docstrings (PRD references)
  - Ready to activate when contract.py is delivered

### Environment Loading
- **LocalNet:** Uses `.env.localnet` (loaded in conftest.py:14)
- **TestNet:** Uses `.env.testnet` (when NETWORK=testnet)
- Fixtures provide test accounts:
  - `client_account` - Job creator
  - `freelancer_account` - Work submitter

### Coverage Tracking
- Focuses on `smart_contracts/` directory only
- Excludes test files (tests/ directory)
- Target: 100% when contract is complete (per PRD §11)

---

## Adding CI/CD Badge to README (Optional)

Add build status badge to your README.md:

```markdown
![CI](https://github.com/{your-org}/{your-repo}/actions/workflows/ci.yml/badge.svg)
![Deploy](https://github.com/{your-org}/{your-repo}/actions/workflows/deploy.yml/badge.svg)
```

Replace `{your-org}` and `{your-repo}` with your actual GitHub organization and repository names.

---

## Next Steps After Contract Delivery (Role 1)

When Role 1 delivers the contract implementation:

1. **Update Tests:**
   - Replace `pytest.skip()` calls with actual test logic
   - Implement contract interaction using AlgoKit typed clients
   - Verify all 88 tests pass (not just skip)

2. **Update Coverage:**
   - Verify 100% coverage of contract code
   - Add coverage threshold to workflow:
     ```yaml
     - name: Check coverage threshold
       run: poetry run pytest --cov=smart_contracts --cov-fail-under=100
     ```

3. **Deploy to TestNet:**
   - Ensure GitHub secrets are configured
   - Merge to main branch (triggers automatic deployment)
   - Share App ID with Role 3 (backend integration)

4. **Update Documentation:**
   - Add deployed App ID to README
   - Link to TestNet Explorer
   - Document contract methods and ABI for backend team

---

## References

- **PRD:** `/Users/mehmet/Documents/algorand hack/algofreelance/PRD.md`
- **ROLES.md:** H6-10 CI/CD Pipeline section
- **AlgoKit Docs:** https://github.com/algorandfoundation/algokit-cli
- **GitHub Actions:** https://docs.github.com/actions
- **TestNet Explorer:** https://testnet.explorer.perawallet.app/
- **TestNet Dispenser:** https://bank.testnet.algorand.network/

---

## Support

For issues or questions:
1. Check this documentation first
2. Review workflow run logs in GitHub Actions tab
3. Check AlgoKit logs: `algokit localnet logs`
4. Consult Algorand docs: `/Users/mehmet/Documents/algorand hack/algofreelance/docs/`
