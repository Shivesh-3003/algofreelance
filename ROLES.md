# **AlgoFreelance 36-Hour Hackathon Team Plan (Parallelized)**

## **Team Structure & Branch Strategy**

```
main (protected)
├── feature/smart-contract (Role 1)
├── feature/testing-infrastructure (Role 2)
├── feature/backend-api (Role 3)
├── feature/ui-components (Role 4)
└── feature/docs-demo (Role 5)
```

---

## **🎯 New Philosophy: Maximum Parallelization**

**Roles 1-3: Heavy Lifting (Independent Work)**
- Can work for 12-18 hours with ZERO dependencies
- Integration happens at Hour 18-24

**Roles 4-5: Supporting Tasks (Independent Work)**
- Build important pieces that don't block core functionality
- Can work completely independently until integration phase

---

## **🔷 Role 1: Smart Contract Developer** ✅ INDEPENDENT
**Branch:** `feature/smart-contract`
**Dependencies:** None
**Key Files:** `projects/AlgoFreelance-contracts/smart_contracts/algo_freelance/contract.py`

### **Hours 0-12: Core Contract Implementation**
- [ ] **H0-2: Setup & Global State** *(PRD §6.1)*
  - Replace `contract.py` with PyTeal/Algopy implementation
  - Define global state schema:
    ```python
    client_address: Bytes
    freelancer_address: Bytes
    escrow_amount: UInt64
    job_status: UInt64 (0=Created, 1=Funded, 2=Submitted, 3=Completed)
    work_hash: Bytes
    job_title: Bytes
    created_at: UInt64
    ```
  - Set `GlobalInts = 4`, `GlobalBytes = 4`

- [ ] **H2-5: Initialize Method** *(PRD §6.2)*
  - Implement `initialize(client: Bytes, freelancer: Bytes, amount: UInt64, title: Bytes)`
  - Validation: `sender == creator`, `amount > 0`
  - Set initial state, `job_status = 0`, record timestamp

- [ ] **H5-8: Submit Work Method** *(PRD §6.2)*
  - Implement `submit_work(ipfs_hash: Bytes)`
  - Validation: `sender == freelancer_address`, `job_status == 1`, IPFS hash length 46-59 bytes
  - Update `work_hash`, set `job_status = 2`

- [ ] **H8-12: Approve Work Method (CRITICAL)** *(PRD §6.2)*
  - Implement grouped inner transactions:
    1. **Payment:** Transfer `escrow_amount` to freelancer
    2. **Mint NFT:** Create ASA with `total=1`, `decimals=0`, name=`"AlgoFreelance: " + job_title`, `unit_name="POWCERT"`, `url=work_hash`, no manager/freeze/clawback
    3. **Transfer NFT:** Send created asset to freelancer
  - Validation: `sender == client_address`, `job_status == 2`
  - Update `job_status = 3`
  - **Reference PRD §6.2 lines 242-289 for exact implementation**

### **Hours 12-18: Refinement & Documentation**
- [ ] **H12-15: Min Balance Handling** *(PRD §6.3)*
  - Add logic to ensure contract has 0.3 ALGO buffer
  - Document funding requirements in comments

- [ ] **H15-18: Code Review & Contract Documentation**
  - Add inline comments explaining inner transactions
  - Create `SMART_CONTRACT.md` documenting:
    - All methods and their parameters
    - Global state variables
    - Inner transaction flow
    - Minimum balance requirements
  - Generate ABI JSON for backend integration
  - Push to branch, open PR

**Deliverable:** Fully functional smart contract with ABI + documentation

---

## **🔷 Role 2: Testing & Infrastructure Engineer** ✅ INDEPENDENT
**Branch:** `feature/testing-infrastructure`
**Dependencies:** None (Role 1 needed later for actual testing)
**Key Files:** `projects/AlgoFreelance-contracts/tests/`, `.github/workflows/`

**Current Status:** ✅ **H0-2, H2-6 & H6-10 COMPLETE**
**Progress:** Environment setup done | TestNet accounts funded (10 ALGO each) | **80 test stubs created** | CI/CD pipelines ready | All tests passing/skipped (8 passed, 80 skipped)

### **🎯 New Focus: Build All Test Infrastructure WITHOUT Waiting for Contract**

### **Hours 0-12: Test Infrastructure (ZERO DEPENDENCIES)**
- [x] **H0-2: Environment Setup** ✅ **COMPLETE**
  - ✅ AlgoKit LocalNet started and verified
  - ✅ `.env.localnet` configured with 2 test accounts
  - ✅ `.env.testnet` configured with 2 test accounts
  - ✅ TestNet accounts funded (10 ALGO each)
  - ✅ Test fixtures created in `conftest.py`
  - ✅ Environment verification tests passing (8/8)

- [x] **H2-6: Write All Test Files (with stubs/mocks)** ✅ **COMPLETE**
  - ✅ **`tests/test_initialize.py` (13 tests)**
    - Success cases: parameter storage, state initialization, timestamp recording
    - Validation cases: invalid amount, unauthorized caller
    - Edge cases: empty title, Unicode, max length, same client/freelancer
    - All tests documented with PRD references (§6.1, §6.2 lines 222-230)
    - Fixtures: `valid_init_params`, `current_timestamp`

  - ✅ **`tests/test_submit_work.py` (17 tests)**
    - Success cases: hash storage, status updates (1→2), CIDv0/CIDv1 support
    - Authorization cases: only freelancer can submit
    - Status validation: must be in Funded state
    - IPFS hash validation: format, length (46-59 bytes), base58/base32
    - Edge cases: hash boundaries, state preservation, multi-contract isolation
    - All tests documented with PRD references (§6.2 lines 232-240)
    - Fixtures: `valid_ipfs_hash_cidv0`, `valid_ipfs_hash_cidv1`, `funded_contract_state`

  - ✅ **`tests/test_approve_work.py` (25 tests) ⭐ CRITICAL**
    - **Inner transaction tests (5 tests):**
      - Verify 3 atomic transactions: Payment + Mint + Transfer
      - Test each transaction independently
      - Verify grouped execution with same group ID
    - **Atomicity tests (2 tests):**
      - All revert if freelancer not opted in
      - All revert if insufficient contract balance
    - **NFT immutability tests (4 tests):**
      - No manager/freeze/clawback/reserve addresses
      - Guarantees permanent, immutable certificate
    - **NFT metadata tests (5 tests):**
      - Name: "AlgoFreelance: {job_title}"
      - Unit name: "POWCERT"
      - URL: IPFS hash
      - Total: 1, Decimals: 0
    - **Authorization & state tests (9 tests):**
      - Only client can approve
      - Status must be 2 (Submitted)
      - Updates status to 3 (Completed)
      - Preserves other state variables
      - Full lifecycle integration test
    - All tests documented with PRD references (§6.2 lines 242-289 - CORE INNOVATION)
    - Fixtures: `submitted_work_state`, `expected_nft_metadata`

  - ✅ **`tests/test_edge_cases.py` (25 tests)**
    - Double operations: prevent double approval, submission, initialization
    - Invalid state transitions: enforce state machine (0→1→2→3)
    - Minimum balance: verify 0.3 ALGO buffer requirement (PRD §6.3)
    - Boundary values: zero amount, max length, very large amounts
    - Unicode/special chars: emoji in titles, special characters, non-ASCII validation
    - Multi-contract: isolation, same freelancer/client across jobs
    - Security: re-entrancy protection, integer overflow, concurrent approvals
    - All tests documented with PRD references (§6.3, §11 Risk Mitigation)

  - ✅ **Test Infrastructure Summary:**
    - **Total: 80 test stubs created**
    - All syntactically valid (`pytest --collect-only` succeeds)
    - Comprehensive PRD coverage (every requirement mapped to tests)
    - Clear integration path documented (TODO comments)
    - Design decisions flagged for Role 1 (re-submission, same account, etc.)
    - Ready for contract integration when Role 1 delivers
    - **See:** `role 2 (mehmet) updates/h2-6-test-files-creation.plan.md`

- [x] **H6-10: CI/CD Pipeline** ✅ **COMPLETE** *(No contract needed)*
  - ✅ Created `.github/workflows/ci.yml`:
    ```yaml
    name: AlgoFreelance CI

    on: [push, pull_request]

    jobs:
      test:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v3
          - name: Set up Python
            uses: actions/setup-python@v4
            with:
              python-version: '3.12'
          - name: Install AlgoKit
            run: pipx install algokit
          - name: Bootstrap project
            run: algokit project bootstrap all
          - name: Start LocalNet
            run: algokit localnet start
          - name: Run tests
            run: poetry run pytest tests/ -v
          - name: Code coverage
            run: poetry run pytest --cov=smart_contracts --cov-report=xml
    ```

  - ✅ Created `.github/workflows/deploy.yml`:
    - Automatic deployment on push to main branch
    - Manual workflow dispatch for testing
    - Extracts and saves App ID from deployment output
    - Creates deployment artifacts (deployment-info.json)
    - Links to TestNet Explorer in GitHub Actions summary
    - Requires GitHub secrets: DEPLOYER_MNEMONIC, DISPENSER_MNEMONIC

  - ✅ **Created comprehensive CI_CD.md documentation:**
    - Workflow overview and triggers
    - Expected test results (8 passed, 80 skipped)
    - GitHub secrets configuration guide
    - Troubleshooting section (LocalNet, deployment, linting issues)
    - Integration with H2-6 test infrastructure
    - Local testing instructions
    - TestNet account funding guide

  - ✅ **Fixed linting configuration:**
    - Updated pyproject.toml to ignore type annotations (ANN) in test files
    - All linting passes: black ✓, ruff ✓, mypy ✓
    - Tests run successfully: 8 passed, 80 skipped
    - Coverage report generates correctly (49% current, 100% target when contract ready)

  - ✅ **Verified local CI workflow:**
    - AlgoKit LocalNet starts successfully
    - Project bootstrap works (`algokit project bootstrap all`)
    - Linting passes without errors
    - All 88 tests discovered and categorized correctly
    - Coverage.xml generated successfully

  - **See:** `role 2 (mehmet) updates/h6-10-ci-cd-pipeline.plan.md`

- [x] **H10-12: Deployment Scripts** ✅ **COMPLETE** *(No contract needed)*
  - ✅ Created `scripts/deploy_testnet.py` to automate contract deployment and funding.
  - ✅ Created `scripts/fund_contract.py` as a utility for manual funding.
  - ✅ Created `scripts/verify_deployment.py` to check deployment status and balance.
  - ✅ All scripts are robust, including error handling and user-friendly output.
  - ✅ **See:** `role 2 (mehmet) updates/h10-12-deployment-scripts.plan.md`

### **Hours 12-18: Documentation & Monitoring**
- [x] **H12-15: Write Testing Documentation** ✅ **COMPLETE**
  - ✅ Created `tests/README.md` with comprehensive instructions on running tests, checking coverage, and adding new test cases.
  - ✅ Created `DEPLOYMENT.md` with a full step-by-step guide for TestNet deployment, environment setup, troubleshooting, and rollback procedures.
  - ✅ **See:** `role 2 (mehmet) updates/h12-15-testing-documentation.plan.md`

- [x] **H15-18: Create Monitoring/Debugging Tools** ✅ **COMPLETE**
  - ✅ Created `scripts/monitor_contract.py` for real-time polling and logging of on-chain contract state changes.
  - ✅ Created `scripts/debug_transaction.py` to fetch and display a detailed breakdown of any transaction from the indexer, aiding in debugging.

### **Hours 18-24: Integration with Actual Contract**
- [ ] **H18-20: Replace Test Stubs**
  - Import actual contract from Role 1
  - Replace all `pass` statements with real test logic
  - Run full test suite

- [ ] **H20-22: Deploy to TestNet**
  - Run deployment script
  - Verify on block explorer
  - Document App ID and address
  - Share with Role 3 for backend integration

- [ ] **H22-24: Performance Testing**
  - Measure transaction confirmation times
  - Test concurrent transactions
  - Document gas costs

**Deliverable:** Complete testing infrastructure + CI/CD + deployed contract

---

## **🔷 Role 3: Backend API Developer** 🤝 COLLABORATING WITH ROLE 1
**Branch:** `feature/backend-api` (later in timeline)
**Dependencies:** Working closely with Role 1
**Key Files:** `projects/AlgoFreelance-backend/`

### **🎯 New Focus: Help Role 1 Complete Smart Contracts Faster, Then Build Backend**

### **Hours 0-12: Backend Core Implementation** ✅ COMPLETE
- [x] **H0-2: Project Setup & Environment Configuration**
  - Created FastAPI backend project structure (`AlgoFreelance-backend/`)
  - Installed dependencies (algokit-utils, FastAPI, uvicorn, pydantic)
  - Created `.env.localnet` with deployer account configuration
  - Created `.env.testnet` with deployer account configuration
  - Created `fund_via_docker.sh` script for LocalNet account funding
  - **Files:** `requirements.txt`, `.env.localnet`, `.env.testnet`, `fund_via_docker.sh`

- [x] **H3-6: Core Services & Models**
  - Created Pydantic data models in `app/models/job.py`:
    - `JobCreateRequest` - Request model for creating jobs
    - `JobDetailsResponse` - Response model for job details
    - `JobListResponse` - Response model for listing jobs
  - Implemented `app/services/algorand.py` with:
    - Auto-generated `AlgoFreelanceClient` integration (from Algopy)
    - `deploy_new_job_contract()` - Uses `AlgoFreelanceFactory` for deployment
    - `get_job_details_from_state()` - Retrieves job details via ABI method
    - `get_freelancer_nfts()` - Skeleton for NFT retrieval via Indexer
  - Proper handling of ABI return types (typed `JobDetails` objects)
  - Multi-environment support (localnet/testnet)

- [x] **H7-9: API Endpoints Implementation**
  - Implemented `app/routers/jobs.py`:
    - `POST /api/jobs` - Deploy new job contract
    - `GET /api/jobs/{app_id}` - Get job details from contract state
    - `GET /api/jobs` - List all jobs (skeleton for future implementation)
  - Implemented `app/routers/nfts.py`:
    - `GET /api/nfts/freelancer/{address}` - Get freelancer POWCERTs (skeleton)
  - Created `app/main.py` with:
    - FastAPI app initialization
    - CORS middleware for frontend integration
    - Health check endpoint at `/health`
    - Router registration
    - Auto-generated API docs at `/docs`

- [x] **H10-12: Integration Testing & Verification**
  - Created `test_integration.py` with end-to-end tests:
    - Contract deployment and initialization
    - Job details retrieval
    - All tests passing ✅
  - Verified LocalNet connectivity and account funding
  - Tested API endpoints via integration test
  - Confirmed proper contract interaction using AlgoFreelanceClient
  - **Status:** Backend core fully functional and tested
  - **Test Results:** 4/4 tests passing (100%)
  
**Documentation:** See `role 3 updates/h0-h12-backend-core-implementation.md` for detailed implementation guide

### **Hours 12-18: Additional Endpoints & IPFS Integration** ✅ COMPLETE
- [x] **H12-14: Transaction Endpoints** ✅
  - Implemented `POST /api/v1/jobs/{app_id}/fund` - Constructs unsigned grouped transactions (payment + app call)
  - Implemented `POST /api/v1/jobs/{app_id}/submit` - Constructs unsigned submit work transaction with IPFS validation
  - Implemented `POST /api/v1/jobs/{app_id}/approve` - Constructs unsigned approve transaction (triggers 3 inner txns)
  - Implemented `POST /api/v1/broadcast` - Optional transaction broadcasting helper
  - All endpoints use secure dApp pattern (backend constructs, frontend signs)
  - Comprehensive error handling and validation

- [x] **H14-16: Pinata Integration** ✅ *(PRD §8 lines 477-495)*
  - Pinata API credentials configured (API Key: e2fa7892b3dd298feb06)
  - Implemented complete `services/pinata.py` with upload, pin, and list functions
  - Created `POST /api/v1/ipfs/upload` endpoint with multipart/form-data support
  - Created `GET /api/v1/ipfs/health` for connection monitoring
  - File size validation (max 10MB), CID validation, error handling
  - Tested with multiple file types and edge cases

- [x] **H16-18: Testing & Documentation** ✅
  - Created `test_full_flow.py` - Complete lifecycle test (10 tests covering deployment to NFT minting)
  - Created `test_transaction_endpoints.py` - Transaction construction validation
  - Created `test_ipfs.py` - IPFS integration tests with edge cases
  - Created `test_api_manual.sh` - Bash script with curl commands for all endpoints
  - Created comprehensive `README.md` with all endpoints, examples, and troubleshooting
  - Enhanced `get_job_details_from_state` with contract balance and status strings
  - All test files compile successfully, 0 linter errors

**Deliverable:** ✅ Fully functional API with transaction construction, IPFS upload, and comprehensive testing
**Documentation:** See `role 3 updates/h12-18-backend-transaction-endpoints-ipfs.md` for detailed implementation guide

### **Hours 18-24: Enhanced Features & Documentation**
- [ ] **H18-20: Job Listing & Search**
  - Complete `GET /api/jobs` endpoint with Indexer queries
  - Implement filtering by status, client, freelancer
  - Add pagination support
  - Cache results for performance
  - Test with multiple deployed contracts

- [ ] **H20-22: Error Handling & Validation**
  - Add comprehensive error handling for all endpoints
  - Custom exception classes for blockchain errors
  - Proper HTTP status codes (400, 404, 500, etc.)
  - Transaction failure recovery logic
  - Input validation for all requests

- [ ] **H22-24: Backend Documentation & Polish**
  - Write comprehensive `README.md`
  - Document all API endpoints with examples
  - Add curl/httpie examples for each endpoint
  - Create Postman collection for easy testing
  - Write deployment guide for production
  - Performance optimization and caching strategies

**Deliverable:** Fully functional API with real contract integration + IPFS upload

---

## **🔷 Role 4: Frontend UI Developer** 🎨 SMALL INDEPENDENT TASK
**Branch:** `feature/ui-components`
**Dependencies:** None (will integrate with backend later)
**Key Files:** `projects/AlgoFreelance-frontend/src/`

### **🎯 Focus: Build Beautiful UI with Mock Data, Connect Later**

### **Hours 0-12: Component Library (ZERO DEPENDENCIES)**
- [ ] **H0-2: Project Setup**
  - Already have React + Vite project
  - Install additional dependencies:
    ```bash
    cd projects/AlgoFreelance-frontend
    npm install react-router-dom axios @tanstack/react-query
    ```

- [ ] **H2-4: Routing & Pages**
  - Create page files:
    ```
    src/pages/
    ├── HomePage.tsx          // Landing page
    ├── CreateJobPage.tsx     // Client creates job
    ├── JobDetailsPage.tsx    // View/manage job
    └── PortfolioPage.tsx     // Freelancer certificates
    ```

  - Update `App.tsx`:
    ```tsx
    import { BrowserRouter, Routes, Route } from 'react-router-dom'
    import HomePage from './pages/HomePage'
    import CreateJobPage from './pages/CreateJobPage'
    import JobDetailsPage from './pages/JobDetailsPage'
    import PortfolioPage from './pages/PortfolioPage'

    function App() {
      return (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create" element={<CreateJobPage />} />
            <Route path="/jobs/:id" element={<JobDetailsPage />} />
            <Route path="/portfolio/:address" element={<PortfolioPage />} />
          </Routes>
        </BrowserRouter>
      )
    }
    ```

- [ ] **H4-6: Shared Components** *(PRD §9 lines 517-521)*
  - `components/shared/LoadingSpinner.tsx`:
    ```tsx
    export default function LoadingSpinner() {
      return (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )
    }
    ```

  - `components/shared/ErrorAlert.tsx`:
    ```tsx
    interface Props {
      message: string
      onClose?: () => void
    }

    export default function ErrorAlert({ message, onClose }: Props) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{message}</span>
          {onClose && (
            <button onClick={onClose} className="absolute top-0 right-0 px-4 py-3">
              ×
            </button>
          )}
        </div>
      )
    }
    ```

  - `components/shared/BlockExplorerLink.tsx`:
    ```tsx
    interface Props {
      txnId?: string
      appId?: number
      assetId?: number
      address?: string
      children: React.ReactNode
    }

    export default function BlockExplorerLink({ txnId, appId, assetId, address, children }: Props) {
      const baseUrl = "https://testnet.explorer.perawallet.app"

      let url = baseUrl
      if (txnId) url += `/tx/${txnId}`
      if (appId) url += `/application/${appId}`
      if (assetId) url += `/asset/${assetId}`
      if (address) url += `/address/${address}`

      return (
        <a href={url} target="_blank" rel="noopener noreferrer"
           className="text-blue-600 hover:underline">
          {children}
        </a>
      )
    }
    ```

- [ ] **H6-8: Layout Components**
  - `components/layout/Navbar.tsx`:
    ```tsx
    import { Link } from 'react-router-dom'

    export default function Navbar() {
      return (
        <nav className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="text-xl font-bold text-blue-600">
                  AlgoFreelance
                </Link>
                <div className="ml-10 space-x-4">
                  <Link to="/create" className="text-gray-700 hover:text-blue-600">
                    Create Job
                  </Link>
                  <Link to="/portfolio/mock" className="text-gray-700 hover:text-blue-600">
                    Portfolio
                  </Link>
                </div>
              </div>
              <div className="flex items-center">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Connect Wallet
                </button>
              </div>
            </div>
          </div>
        </nav>
      )
    }
    ```

- [ ] **H8-10: Create Job Form** *(PRD §9 lines 547-561)*
  - `components/jobs/CreateJobForm.tsx`:
    ```tsx
    import { useState } from 'react'

    export default function CreateJobForm() {
      const [formData, setFormData] = useState({
        title: '',
        description: '',
        freelancerAddress: '',
        amount: ''
      })

      const [mockResult, setMockResult] = useState<any>(null)

      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Mock response - will replace with API call later
        setMockResult({
          appId: 99999999,
          appAddress: 'MOCK' + 'A'.repeat(54),
          fundingAmount: 5.3
        })
      }

      return (
        <div className="max-w-2xl mx-auto p-6">
          <h2 className="text-2xl font-bold mb-6">Create New Escrow Job</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Logo Design for SaaS Startup"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={4}
                placeholder="Modern, minimalist logo..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Freelancer Address
              </label>
              <input
                type="text"
                value={formData.freelancerAddress}
                onChange={e => setFormData({...formData, freelancerAddress: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                placeholder="FREELANCERADDRESS..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Amount (ALGO)
              </label>
              <input
                type="number"
                step="0.001"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="5.0"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              Create & Deploy Contract
            </button>
          </form>

          {mockResult && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-bold text-green-800 mb-2">Contract Deployed!</h3>
              <p className="text-sm text-gray-600">App ID: {mockResult.appId}</p>
              <p className="text-sm text-gray-600">Address: {mockResult.appAddress}</p>
              <p className="text-sm text-gray-600">Fund with: {mockResult.fundingAmount} ALGO</p>
              <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg">
                Fund Contract Now
              </button>
            </div>
          )}
        </div>
      )
    }
    ```

- [ ] **H10-12: Job Details View** *(PRD §9 lines 564-581)*
  - Create `components/jobs/JobDetails.tsx` with mock data
  - Show job info, status badges, IPFS preview section
  - Add conditional buttons (Submit Work, Approve Work)

### **Hours 12-16: Portfolio & Polish**
- [ ] **H12-14: NFT Portfolio** *(PRD §9 lines 584-596)*
  - `components/portfolio/NFTGallery.tsx`:
    ```tsx
    const mockCertificates = [
      {
        assetId: 87654321,
        jobTitle: "Logo Design",
        clientAddress: "CLIENT...",
        amount: "5 ALGO",
        completedAt: "Oct 18, 2024",
        ipfsUrl: "ipfs://QmXyz123"
      },
      // Add 2-3 more mock certificates
    ]

    export default function NFTGallery() {
      return (
        <div className="max-w-6xl mx-auto p-6">
          <h2 className="text-2xl font-bold mb-6">My Work Certificates (3)</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockCertificates.map(cert => (
              <div key={cert.assetId} className="border rounded-lg p-4 hover:shadow-lg transition">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32 rounded mb-4 flex items-center justify-center text-white font-bold">
                  #{cert.assetId}
                </div>
                <h3 className="font-bold text-lg mb-2">{cert.jobTitle}</h3>
                <p className="text-sm text-gray-600">Payment: {cert.amount}</p>
                <p className="text-sm text-gray-600">Date: {cert.completedAt}</p>
                <p className="text-sm text-gray-600 truncate">Client: {cert.clientAddress}</p>
                <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      )
    }
    ```

- [ ] **H14-16: Styling & Responsive Design**
  - Apply Tailwind CSS consistently
  - Test on mobile/tablet/desktop
  - Add loading states with `LoadingSpinner`
  - Add error states with `ErrorAlert`

### **Hours 16-20: Screenshots & Documentation**
- [ ] **H16-18: Take Screenshots** *(For demo)*
  - Screenshot of create job form
  - Screenshot of job details page
  - Screenshot of portfolio view
  - Screenshot of wallet connection
  - Screenshot of approval flow

- [ ] **H18-20: Component Documentation**
  - Document all props for each component
  - Create `frontend/COMPONENTS.md` explaining structure

**Deliverable:** Complete, beautiful UI with mock data (no backend needed yet)

---

## **🔷 Role 5: Documentation & Demo Prep** 📝 SMALL INDEPENDENT TASK
**Branch:** `feature/docs-demo`
**Dependencies:** None (will integrate demos later)
**Key Files:** Various docs

### **🎯 Focus: Documentation, Wallet Utils, Demo Materials**

### **Hours 0-8: Wallet Integration Utilities**
- [ ] **H0-3: Wallet Setup** *(Can do independently)*
  - Install in frontend:
    ```bash
    npm install @txnlab/use-wallet @perawallet/connect @walletconnect/web3-wallet
    ```

  - Create `frontend/src/utils/wallet.ts`:
    ```ts
    import { NetworkId, WalletId, WalletManager } from '@txnlab/use-wallet'

    export const walletManager = new WalletManager({
      wallets: [
        WalletId.PERA,
        WalletId.DEFLY,
        WalletId.EXODUS
      ],
      network: NetworkId.TESTNET
    })

    export async function connectWallet(walletId: WalletId) {
      const wallet = walletManager.getWallet(walletId)
      await wallet.connect()
      return wallet.activeAddress
    }

    export async function signTransaction(txn: any) {
      const wallet = walletManager.activeWallet
      if (!wallet) throw new Error("No active wallet")
      return await wallet.signTransactions([txn])
    }
    ```

- [ ] **H3-6: Algorand Helper Functions**
  - Create `frontend/src/utils/algorand.ts`:
    ```ts
    import algosdk from 'algosdk'

    export const TESTNET_ALGOD_URL = 'https://testnet-api.algonode.cloud'
    export const TESTNET_INDEXER_URL = 'https://testnet-idx.algonode.cloud'

    export function formatAlgoAmount(microAlgos: number): string {
      return (microAlgos / 1_000_000).toFixed(3) + ' ALGO'
    }

    export function formatAddress(address: string): string {
      return `${address.slice(0, 6)}...${address.slice(-4)}`
    }

    export function isValidAlgorandAddress(address: string): boolean {
      return algosdk.isValidAddress(address)
    }

    export function getExplorerUrl(type: 'tx' | 'app' | 'asset' | 'address', value: string | number): string {
      const baseUrl = 'https://testnet.explorer.perawallet.app'
      return `${baseUrl}/${type}/${value}`
    }
    ```

- [ ] **H6-8: Test Account Setup**
  - Document the 2 TestNet accounts already funded by Role 2
  - Create `TEST_ACCOUNTS.md`:
    ```markdown
    # Test Accounts for Demo

    ## Client Account
    - Address: [from .env.testnet]
    - Mnemonic: [KEEP SECRET]
    - Balance: 10 ALGO
    - Role: Creates jobs, approves work

    ## Freelancer Account
    - Address: [from .env.testnet]
    - Mnemonic: [KEEP SECRET]
    - Balance: 10 ALGO
    - Role: Submits work, receives NFTs

    ## How to Import to Pera Wallet
    1. Open Pera Wallet
    2. Add Account → Import with Passphrase
    3. Paste mnemonic
    4. Name account "AlgoFreelance Client" or "AlgoFreelance Freelancer"
    ```

### **Hours 8-16: Documentation (ZERO DEPENDENCIES)**
- [ ] **H8-12: Write Main README**
  - Update `/algofreelance/README.md` with:
    ```markdown
    # AlgoFreelance

    Trustless freelance escrow on Algorand that auto-mints Proof-of-Work NFTs

    ## Problem
    [Copy from PRD §1]

    ## Solution
    [Copy from PRD §2]

    ## Architecture
    [Create diagram showing: Frontend → Backend → Smart Contract → NFT]

    ## Tech Stack
    - Smart Contract: PyTeal/Algopy
    - Backend: FastAPI + py-algorand-sdk
    - Frontend: React + Vite + TailwindCSS
    - IPFS: Pinata

    ## Setup Instructions
    ### Prerequisites
    - Python 3.12+
    - Node.js 18+
    - AlgoKit 2.0+

    ### Smart Contract
    \`\`\`bash
    cd projects/AlgoFreelance-contracts
    algokit project bootstrap all
    algokit localnet start
    poetry run pytest tests/
    \`\`\`

    ### Backend
    \`\`\`bash
    cd projects/AlgoFreelance-backend
    poetry install
    poetry run uvicorn app.main:app --reload
    \`\`\`

    ### Frontend
    \`\`\`bash
    cd projects/AlgoFreelance-frontend
    npm install
    npm run dev
    \`\`\`

    ## Demo
    [Video embed - add later]

    ## Screenshots
    [Add screenshots from Role 4]

    ## Smart Contract Explanation
    [Link to SMART_CONTRACT.md from Role 1]

    ## Deployed Contract
    - TestNet App ID: [Add from Role 2]
    - Explorer: [Link]

    ## Team
    [Your names/roles]

    ## License
    MIT
    ```

- [ ] **H12-14: Create Architecture Docs**
  - `docs/ARCHITECTURE.md`:
    ```markdown
    # AlgoFreelance Architecture

    ## System Overview
    [Diagram of all components]

    ## Smart Contract Design
    [Explain global state, methods, inner transactions]

    ## Backend API Design
    [Explain all endpoints]

    ## Frontend Component Hierarchy
    [Explain React structure]

    ## Data Flow
    1. Client creates job → Backend deploys contract
    2. Client funds contract → Contract becomes active
    3. Freelancer uploads to IPFS → Submits hash to contract
    4. Client approves → Inner transactions execute
    5. Freelancer receives ALGO + NFT

    ## Security Considerations
    [Discuss atomicity, minimum balances, opt-in requirements]
    ```

- [ ] **H14-16: API Documentation**
  - `docs/API_SPEC.md`:
    - Copy all endpoint specs from PRD §8
    - Add curl examples for each endpoint
    - Document error codes

### **Hours 16-24: Demo Preparation**
- [ ] **H16-20: Demo Script** *(PRD §13)*
  - Create `docs/DEMO_SCRIPT.md`:
    ```markdown
    # 3-Minute Demo Script

    ## Setup (Before Recording)
    - [ ] 2 wallets (Pera) connected to test accounts
    - [ ] AlgoExplorer TestNet tab open
    - [ ] Frontend running on localhost
    - [ ] Sample logo file ready

    ## Recording Script

    ### [0:00-0:30] Hook & Problem
    > "Freelance platforms take 20% of your earnings and hold your reputation hostage. Watch me replace Upwork with 30 lines of PyTeal."

    *Show slide with $78B in fees statistic*

    ### [0:30-1:00] Job Creation
    > "Alice wants to hire Bob for logo design. She connects her wallet..."

    *Actions:*
    - Fill form: "Logo Design", Bob's address, 5 ALGO
    - Click "Create & Deploy Contract"
    - Show contract deployed popup
    - Sign funding transaction
    - Show AlgoExplorer with funded contract

    ### [1:00-1:30] Work Submission
    > "Bob uploads his final logo to IPFS and submits it."

    *Actions:*
    - Switch to Freelancer view
    - Upload logo_final.png
    - Show IPFS hash generated
    - Click "Submit Work"
    - Sign transaction
    - Show status change to "Submitted"

    ### [1:30-2:30] Atomic Payment + NFT Mint
    > "Here's the magic. When Alice approves, THREE actions happen atomically."

    *Actions:*
    - Switch to Client view
    - Click "Approve Work"
    - Sign transaction
    - Show AlgoExplorer group transaction with 3 inner txns
    - Highlight: Payment → Mint → Transfer
    - Show Bob's wallet with +5 ALGO and NFT

    ### [2:30-3:00] Impact
    > "Bob now has portable, immutable proof of his work."

    *Show portfolio page with certificate*

    > "Trustless freelancing: zero fees, instant payment, verifiable reputation on Algorand."

    *Final slide with GitHub QR code*
    ```

- [ ] **H20-24: Presentation Slides**
  - Create Google Slides or Canva presentation:
    - Slide 1: Title + Team
    - Slide 2: Problem ($78B in fees)
    - Slide 3: Solution overview
    - Slide 4: Technical architecture
    - Slide 5: Smart contract diagram
    - Slide 6: Grouped inner transactions (KEY INNOVATION)
    - Slide 7: Demo walkthrough
    - Slide 8: Impact metrics
    - Slide 9: Future roadmap
    - Slide 10: GitHub repo QR code

### **Hours 24-28: Final Documentation**
- [ ] **H24-26: FAQ & Troubleshooting**
  - Create `docs/FAQ.md` (copy from PRD §20)
  - Create `docs/TROUBLESHOOTING.md`:
    - Common deployment issues
    - Wallet connection issues
    - Transaction failures

- [ ] **H26-28: License & Contributing**
  - Add MIT `LICENSE` file
  - Create `CONTRIBUTING.md` (for post-hackathon)

**Deliverable:** Complete documentation, wallet utils, demo script, presentation

---

## **⏰ NEW Critical Path Timeline (Roles 1 & 3 Paired)**

```
Hours 0-12:  ROLES 1 & 3 COLLABORATE ON SMART CONTRACT
  ↓
  Roles 1 & 3: Building contract + tests + utilities TOGETHER
  Role 2: Building test infrastructure, CI/CD independently
  Role 4: Building UI components with mock data independently
  Role 5: Writing docs, wallet utils, demo script independently

Hour 12:     SMART CONTRACT COMPLETE (Roles 1 & 3)
             Role 3 starts backend API setup + IPFS
             Role 2 can run full tests with real contract
  ↓
Hour 16:     Role 2 deploys to TestNet, shares App ID
             Role 3 has backend foundation + IPFS ready
  ↓
Hour 20:     Role 3 completes all API endpoints (using real contract)
             Backend API fully functional
  ↓
Hour 22:     Role 4 connects frontend to real API
             Full integration testing begins
  ↓
Hour 24:     ALL CORE FEATURES COMPLETE
             Begin end-to-end testing
  ↓
Hour 28:     All bugs fixed
             Role 5 records demo video
  ↓
Hour 32:     Final documentation complete
             Presentation slides finalized
  ↓
Hour 36:     SUBMIT! 🚀
```

---

## **🔀 NEW Branch Merge Strategy**

**Phase 1: Collaborative Contract Work (H0-12)**
- Roles 1 & 3 work on `feature/smart-contract` branch together
- Other roles work independently on their branches

**Phase 2: Backend Development (H12-20)**
- Role 3 creates `feature/backend-api` branch at Hour 12
- Continues building on contract work from Phase 1

**Phase 3: Integration (H16-24)**
1. **Hour 12:** `feature/smart-contract` → `main` (completed by Roles 1 & 3)
2. **Hour 16:** Role 2 merges `feature/testing-infrastructure` → `main` (includes deployed contract)
3. **Hour 20:** `feature/backend-api` → `main` (fully functional API)
4. **Hour 22:** `feature/ui-components` → `main`
5. **Hour 24:** `feature/docs-demo` → `main`

**Phase 4: Final Polish (H24-36)**
- All final changes go directly to `main` via small PRs

---

## **📊 Role Comparison: Old vs New**

| Role | Old Approach | New Approach | Key Change |
|------|-------------|--------------|------------|
| Role 1 | Works solo on contract (18h) | **Pairs with Role 3** (12h) | Contract done 6h faster ✅ |
| Role 2 | Waits for Role 1 at H8 | Independent until H12 | Can test real contract earlier ✅ |
| Role 3 | Builds mocks, integrates later | **Helps Role 1, then builds backend** | No wasted mock code ✅ |
| Role 4 | Waits for Role 3 | Independent with mock data | Unchanged |
| Role 5 | Independent docs | Independent docs | Unchanged |

**Result:**
- Smart contract complete by Hour 12 (instead of Hour 18) - **6 hours faster!**
- No time wasted building mocks that get thrown away
- Better code quality through pair programming on critical contract logic
- Backend API can use real contract from the start

---

## **✅ Success Criteria**

- [ ] Smart contract deployed to TestNet with verified transactions
- [ ] 100% test coverage with passing CI/CD
- [ ] Working API integrated with real contract (no mocks)
- [ ] Beautiful, responsive UI that works without backend (mock data)
- [ ] Full user flow works end-to-end (create → fund → submit → approve)
- [ ] NFT mints successfully and appears in freelancer wallet
- [ ] Grouped inner transactions (payment + mint + transfer) work atomically
- [ ] Complete documentation (README, Architecture, API, FAQ)
- [ ] 3-minute demo video shows all features
- [ ] Presentation slides ready (10 slides)
- [ ] Zero critical bugs during final testing

---

## **🚨 Risk Mitigation**

| **Risk** | **Owner** | **Mitigation** |
|---------|----------|----------------|
| Contract bugs lock funds | Roles 1 & 3 | Pair programming, extensive testing, 100% coverage, emergency cancel method |
| NFT opt-in breaks flow | Role 5 | Document opt-in requirement clearly, add frontend guardrails later |
| IPFS upload fails | Role 3 | Use Pinata's reliable API, add retries, test early |
| Role 1 & 3 coordination issues | Roles 1 & 3 | Use shared branch, pair programming, frequent commits, clear task division |
| Frontend doesn't match backend | Role 4 | Use PRD data models, coordinate on Slack, wait for API completion |
| Merge conflicts at integration | Everyone | Small commits, clear file ownership, communicate often |

---

## **💡 Pro Tips for Maximum Efficiency**

1. **Roles 1 & 3: Pair effectively** - One codes, one reviews; switch every 2 hours; commit frequently
2. **Use the PRD as source of truth** - All data models, endpoints, UI specs are there
3. **Roles 2, 4, 5: Work independently** - Build complete features without blocking on others
4. **Test in isolation** - Each piece should work standalone before integration
5. **Communicate async** - Use Slack/Discord for updates, don't block on sync meetings
6. **Commit frequently** - Push every 1-2 hours minimum
7. **Document as you code** - Don't wait until Hour 32
8. **Role 3: Reuse contract utilities in backend** - The contract client built in H3-6 becomes the core of your Algorand service

---

