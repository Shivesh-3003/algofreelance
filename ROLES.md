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

**Current Status:** ✅ **H0-2 COMPLETE**
**Progress:** Environment setup done | TestNet accounts funded (10 ALGO each) | All tests passing (8/8)

### **🎯 New Focus: Build All Test Infrastructure WITHOUT Waiting for Contract**

### **Hours 0-12: Test Infrastructure (ZERO DEPENDENCIES)**
- [x] **H0-2: Environment Setup** ✅ **COMPLETE**
  - ✅ AlgoKit LocalNet started and verified
  - ✅ `.env.localnet` configured with 2 test accounts
  - ✅ `.env.testnet` configured with 2 test accounts
  - ✅ TestNet accounts funded (10 ALGO each)
  - ✅ Test fixtures created in `conftest.py`
  - ✅ Environment verification tests passing (8/8)

- [ ] **H2-6: Write All Test Files (with stubs/mocks)**
  - `tests/test_initialize.py`:
    ```python
    def test_initialize_success(client_account, freelancer_account):
        # TODO: Replace with actual contract when Role 1 delivers
        # For now: Document expected behavior
        """
        Test that initialize method:
        - Sets client_address correctly
        - Sets freelancer_address correctly
        - Sets escrow_amount > 0
        - Sets job_status = 0
        - Records timestamp
        - Only callable by creator
        """
        pass

    def test_initialize_invalid_amount():
        """Test that amount <= 0 fails"""
        pass

    def test_initialize_unauthorized():
        """Test that non-creator cannot initialize"""
        pass
    ```

  - `tests/test_submit_work.py`:
    ```python
    def test_submit_work_success():
        """Test freelancer can submit valid IPFS hash"""
        pass

    def test_submit_work_wrong_status():
        """Test submission fails if not funded"""
        pass

    def test_submit_work_unauthorized():
        """Test non-freelancer cannot submit"""
        pass

    def test_submit_work_invalid_hash():
        """Test invalid IPFS hash format fails"""
        pass
    ```

  - `tests/test_approve_work.py` (CRITICAL):
    ```python
    def test_approve_work_inner_transactions():
        """Test grouped inner txns: payment + mint + transfer"""
        pass

    def test_approve_work_atomicity():
        """Test all 3 txns revert if one fails"""
        pass

    def test_nft_immutability():
        """Test NFT has no manager/freeze/clawback"""
        pass

    def test_approve_work_unauthorized():
        """Test non-client cannot approve"""
        pass
    ```

  - `tests/test_edge_cases.py`:
    ```python
    def test_double_approval():
        """Test cannot approve twice"""
        pass

    def test_state_transitions():
        """Test invalid state transitions fail"""
        pass
    ```

- [ ] **H6-10: CI/CD Pipeline** *(No contract needed)*
  - Create `.github/workflows/ci.yml`:
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

  - Create `.github/workflows/deploy.yml`:
    ```yaml
    name: Deploy to TestNet

    on:
      push:
        branches: [main]

    jobs:
      deploy:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v3
          - name: Deploy to TestNet
            run: algokit deploy testnet
          - name: Save App ID
            run: echo $APP_ID > testnet_app_id.txt
    ```

- [ ] **H10-12: Deployment Scripts** *(No contract needed)*
  - Create `scripts/deploy_testnet.py`:
    ```python
    """
    Automated TestNet deployment script
    - Deploys contract
    - Funds with 0.5 ALGO
    - Saves App ID to file
    - Generates block explorer link
    """
    ```

  - Create `scripts/fund_contract.py`:
    ```python
    """Helper to fund deployed contract"""
    ```

  - Create `scripts/verify_deployment.py`:
    ```python
    """Verify contract is deployed and funded correctly"""
    ```

### **Hours 12-18: Documentation & Monitoring**
- [ ] **H12-15: Write Testing Documentation**
  - Create `tests/README.md`:
    - How to run tests locally
    - How to run tests on TestNet
    - Test coverage requirements
    - How to add new tests

  - Create `DEPLOYMENT.md`:
    - Step-by-step deployment guide
    - TestNet vs MainNet differences
    - Troubleshooting common issues
    - Rollback procedures

- [ ] **H15-18: Create Monitoring/Debugging Tools**
  - Create `scripts/monitor_contract.py`:
    ```python
    """
    Real-time contract state monitoring
    - Polls global state every 5 seconds
    - Logs all state changes
    - Alerts on errors
    """
    ```

  - Create `scripts/debug_transaction.py`:
    ```python
    """
    Transaction debugger
    - Input: transaction ID
    - Output: Detailed failure reason
    """
    ```

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

## **🔷 Role 3: Backend API Developer** ✅ INDEPENDENT
**Branch:** `feature/backend-api`
**Dependencies:** None (Role 1 needed later for real contract integration)
**Key Files:** `projects/AlgoFreelance-backend/`

### **🎯 New Focus: Build Entire API with Mocks, Integrate Contract Later**

### **Hours 0-6: Backend Foundation (ZERO DEPENDENCIES)**
- [ ] **H0-2: FastAPI Project Setup**
  - Create `projects/AlgoFreelance-backend/` directory
  - Initialize with Poetry:
    ```bash
    cd projects
    mkdir AlgoFreelance-backend
    cd AlgoFreelance-backend
    poetry init
    poetry add fastapi uvicorn py-algorand-sdk httpx python-multipart pydantic
    ```

  - Create structure:
    ```
    backend/
    ├── app/
    │   ├── __init__.py
    │   ├── main.py
    │   ├── routes/
    │   │   ├── __init__.py
    │   │   ├── jobs.py
    │   │   └── ipfs.py
    │   ├── services/
    │   │   ├── __init__.py
    │   │   ├── algorand.py          # Will have mock + real modes
    │   │   └── pinata.py
    │   └── models/
    │       ├── __init__.py
    │       └── job.py
    ├── tests/
    ├── .env.example
    ├── .env
    └── pyproject.toml
    ```

- [ ] **H2-4: Data Models** *(PRD §8)*
  - `models/job.py`:
    ```python
    from pydantic import BaseModel, Field
    from typing import Optional

    class CreateJobRequest(BaseModel):
        client_address: str = Field(..., min_length=58, max_length=58)
        freelancer_address: str = Field(..., min_length=58, max_length=58)
        escrow_amount: int = Field(..., gt=0)
        job_title: str = Field(..., max_length=64)
        job_description: str

    class JobResponse(BaseModel):
        app_id: int
        app_address: str
        client_address: str
        freelancer_address: str
        escrow_amount: int
        job_status: int  # 0=Created, 1=Funded, 2=Submitted, 3=Completed
        job_title: str
        work_hash: Optional[str] = None
        created_at: int
        is_funded: bool

    class SubmitWorkRequest(BaseModel):
        ipfs_hash: str = Field(..., min_length=46, max_length=59)

    class ApproveWorkResponse(BaseModel):
        success: bool
        payment_txn: str
        nft_creation_txn: str
        nft_transfer_txn: str
        nft_asset_id: int
        group_id: str
        explorer_url: str

    class NFTCertificate(BaseModel):
        asset_id: int
        asset_name: str
        job_title: str
        ipfs_url: str
        client_address: str
        completed_at: int
        block_explorer: str

    class PortfolioResponse(BaseModel):
        freelancer_address: str
        total_jobs: int
        certificates: list[NFTCertificate]
    ```

- [ ] **H4-6: Mock Algorand Service** *(Can work without contract!)*
  - `services/algorand.py`:
    ```python
    from algosdk.v2client import algod, indexer
    from algosdk import transaction
    import os

    class AlgorandService:
        def __init__(self, mock_mode=True):
            self.mock_mode = mock_mode

            if not mock_mode:
                self.algod = algod.AlgodClient(
                    os.getenv("ALGOD_TOKEN", ""),
                    os.getenv("ALGOD_SERVER", "https://testnet-api.algonode.cloud")
                )
                self.indexer = indexer.IndexerClient(
                    "",
                    "https://testnet-idx.algonode.cloud"
                )

        def create_job(self, request: CreateJobRequest) -> dict:
            """Deploy new escrow contract"""
            if self.mock_mode:
                return {
                    "app_id": 99999999,
                    "app_address": "MOCKAPPADDRESS" + "A" * 44,
                    "txn_id": "MOCKTXN" + "A" * 45
                }
            else:
                # TODO: Replace with actual contract deployment when Role 1 delivers
                pass

        def get_job(self, app_id: int) -> dict:
            """Get job details from contract global state"""
            if self.mock_mode:
                return {
                    "app_id": app_id,
                    "client_address": "CLIENT" + "A" * 52,
                    "freelancer_address": "FREELANCER" + "A" * 48,
                    "escrow_amount": 5000000,
                    "job_status": 1,
                    "job_title": "Logo Design",
                    "work_hash": None,
                    "created_at": 1729270800,
                    "is_funded": True
                }
            else:
                # TODO: Query indexer for global state
                pass

        def submit_work(self, app_id: int, ipfs_hash: str) -> dict:
            """Call submit_work on contract"""
            if self.mock_mode:
                return {"txn_id": "SUBMITTXN" + "A" * 45}
            else:
                # TODO: Build and send app call transaction
                pass

        def approve_work(self, app_id: int) -> dict:
            """Call approve_work (triggers inner txns)"""
            if self.mock_mode:
                return {
                    "payment_txn": "PAYTXN" + "A" * 46,
                    "nft_creation_txn": "NFTTXN" + "A" * 46,
                    "nft_transfer_txn": "XFERTXN" + "A" * 45,
                    "nft_asset_id": 87654321,
                    "group_id": "GROUP" + "A" * 47
                }
            else:
                # TODO: Build app call with increased fee
                pass

        def get_freelancer_nfts(self, address: str) -> list:
            """Get all POWCERT NFTs owned by address"""
            if self.mock_mode:
                return [
                    {
                        "asset_id": 87654321,
                        "asset_name": "AlgoFreelance: Logo Design",
                        "job_title": "Logo Design",
                        "ipfs_url": "ipfs://QmXyz123",
                        "client_address": "CLIENT" + "A" * 52,
                        "completed_at": 1729270800
                    }
                ]
            else:
                # TODO: Query indexer for assets
                pass
    ```

### **Hours 6-14: API Endpoints with Mocks (ZERO DEPENDENCIES)**
- [ ] **H6-8: Job Creation Endpoint** *(PRD §8 lines 354-383)*
  - `routes/jobs.py`:
    ```python
    from fastapi import APIRouter, HTTPException
    from app.models.job import CreateJobRequest, JobResponse
    from app.services.algorand import AlgorandService

    router = APIRouter(prefix="/api/v1/jobs", tags=["jobs"])
    algo_service = AlgorandService(mock_mode=True)  # Switch to False when contract ready

    @router.post("/create", response_model=dict)
    async def create_job(request: CreateJobRequest):
        """Deploy new escrow contract"""
        try:
            result = algo_service.create_job(request)
            return {
                "success": True,
                "app_id": result["app_id"],
                "app_address": result["app_address"],
                "funding_amount": request.escrow_amount + 300000,  # + 0.3 ALGO buffer
                "txn_id": result["txn_id"],
                "explorer_url": f"https://testnet.explorer.perawallet.app/application/{result['app_id']}"
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    ```

- [ ] **H8-10: Job Status Endpoint** *(PRD §8 lines 386-403)*
  - Add to `routes/jobs.py`:
    ```python
    @router.get("/{app_id}", response_model=JobResponse)
    async def get_job(app_id: int):
        """Get job details and current status"""
        try:
            return algo_service.get_job(app_id)
        except Exception as e:
            raise HTTPException(status_code=404, detail="Job not found")
    ```

- [ ] **H10-12: Submit Work Endpoint** *(PRD §8 lines 406-424)*
  - Add to `routes/jobs.py`:
    ```python
    @router.post("/{app_id}/submit", response_model=dict)
    async def submit_work(app_id: int, request: SubmitWorkRequest):
        """Submit work (freelancer calls this)"""
        try:
            result = algo_service.submit_work(app_id, request.ipfs_hash)
            return {
                "success": True,
                "txn_id": result["txn_id"],
                "message": "Work submitted. Awaiting client approval."
            }
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    ```

- [ ] **H12-14: Approve Work Endpoint** *(PRD §8 lines 428-449)*
  - Add to `routes/jobs.py`:
    ```python
    from app.models.job import ApproveWorkResponse

    @router.post("/{app_id}/approve", response_model=ApproveWorkResponse)
    async def approve_work(app_id: int):
        """Approve work and trigger payment + NFT mint"""
        try:
            result = algo_service.approve_work(app_id)
            return ApproveWorkResponse(
                success=True,
                payment_txn=result["payment_txn"],
                nft_creation_txn=result["nft_creation_txn"],
                nft_transfer_txn=result["nft_transfer_txn"],
                nft_asset_id=result["nft_asset_id"],
                group_id=result["group_id"],
                explorer_url=f"https://testnet.explorer.perawallet.app/tx-group/{result['group_id']}"
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    ```

### **Hours 14-18: IPFS & Portfolio (100% INDEPENDENT)**
- [ ] **H14-16: Pinata Integration** *(PRD §8 lines 477-495)*
  - Get Pinata API key from https://pinata.cloud (free tier)
  - `services/pinata.py`:
    ```python
    import httpx
    import os

    class PinataService:
        def __init__(self):
            self.api_key = os.getenv("PINATA_API_KEY")
            self.api_secret = os.getenv("PINATA_API_SECRET")
            self.base_url = "https://api.pinata.cloud"

        async def upload_file(self, file) -> dict:
            """Upload file to IPFS via Pinata"""
            headers = {
                "pinata_api_key": self.api_key,
                "pinata_secret_api_key": self.api_secret
            }

            files = {"file": file}

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/pinning/pinFileToIPFS",
                    headers=headers,
                    files=files,
                    timeout=30.0
                )

            if response.status_code != 200:
                raise Exception(f"Pinata upload failed: {response.text}")

            data = response.json()
            ipfs_hash = data["IpfsHash"]

            return {
                "ipfs_hash": ipfs_hash,
                "ipfs_url": f"ipfs://{ipfs_hash}",
                "gateway_url": f"https://gateway.pinata.cloud/ipfs/{ipfs_hash}",
                "size": data["PinSize"]
            }
    ```

  - `routes/ipfs.py`:
    ```python
    from fastapi import APIRouter, UploadFile, HTTPException
    from app.services.pinata import PinataService

    router = APIRouter(prefix="/api/v1/ipfs", tags=["ipfs"])
    pinata_service = PinataService()

    @router.post("/upload", response_model=dict)
    async def upload_file(file: UploadFile):
        """Upload file to IPFS via Pinata"""
        try:
            result = await pinata_service.upload_file(file.file)
            return {"success": True, **result}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    ```

- [ ] **H16-18: Portfolio Endpoint** *(PRD §8 lines 453-473)*
  - Add to `routes/jobs.py`:
    ```python
    from app.models.job import PortfolioResponse

    @router.get("/freelancers/{address}/nfts", response_model=PortfolioResponse)
    async def get_freelancer_nfts(address: str):
        """Get all POW NFTs for a freelancer"""
        try:
            certificates = algo_service.get_freelancer_nfts(address)
            return PortfolioResponse(
                freelancer_address=address,
                total_jobs=len(certificates),
                certificates=[
                    {
                        **cert,
                        "block_explorer": f"https://testnet.explorer.perawallet.app/asset/{cert['asset_id']}"
                    }
                    for cert in certificates
                ]
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    ```

- [ ] **H18: Create main.py & Test with Swagger**
  - `app/main.py`:
    ```python
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from app.routes import jobs, ipfs

    app = FastAPI(
        title="AlgoFreelance API",
        description="Decentralized freelance escrow with NFT certificates",
        version="1.0.0"
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(jobs.router)
    app.include_router(ipfs.router)

    @app.get("/")
    def root():
        return {"message": "AlgoFreelance API - Visit /docs for Swagger UI"}
    ```

  - Run: `poetry run uvicorn app.main:app --reload`
  - Test all endpoints with Swagger UI at http://localhost:8000/docs

### **Hours 18-24: Integrate Real Contract**
- [ ] **H18-22: Replace Mocks with Real Contract**
  - Get contract ABI from Role 1
  - Update `AlgorandService` to use actual contract calls
  - Switch `mock_mode=False`
  - Test against deployed TestNet contract

- [ ] **H22-24: API Documentation & Deployment**
  - Write `backend/README.md`
  - Deploy to Render.com (free tier)
  - Update frontend with production API URL

**Deliverable:** Fully functional API (mocked first, real later) + IPFS upload

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

## **⏰ NEW Critical Path Timeline**

```
Hours 0-12:  EVERYONE works 100% independently
  ↓
  Role 1: Building contract
  Role 2: Building test infrastructure, CI/CD
  Role 3: Building API with mocks + Pinata integration
  Role 4: Building UI components with mock data
  Role 5: Writing docs, wallet utils, demo script

Hour 12:     Role 3 has working mocked API
  ↓
Hour 18:     Role 1 delivers contract
             Role 2 can run tests + deploy to TestNet
             Role 3 can replace mocks with real contract
  ↓
Hour 20:     Role 2 deploys to TestNet, shares App ID
  ↓
Hour 22:     Role 3 completes real API integration
             Role 4 connects frontend to real API
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

**Phase 1: Independent Work (H0-18)**
- No merges - everyone works on their branch

**Phase 2: Integration (H18-24)**
1. **Hour 18:** `feature/smart-contract` → `main`
2. **Hour 20:** `feature/testing-infrastructure` → `main` (includes deployed contract)
3. **Hour 22:** `feature/backend-api` → `main` (with real contract integration)
4. **Hour 24:** `feature/ui-components` → `main`
5. **Hour 26:** `feature/docs-demo` → `main`

**Phase 3: Final Polish (H24-36)**
- All final changes go directly to `main` via small PRs

---

## **📊 Role Comparison: Old vs New**

| Role | Old Dependencies | New Dependencies | Hours Independent |
|------|-----------------|------------------|-------------------|
| Role 1 | None | None | 18 hours ✅ |
| Role 2 | Role 1 at H8 | None (tests later) | **18 hours** ✅ |
| Role 3 | Role 1 at H18 | None (mocks first) | **18 hours** ✅ |
| Role 4 | Role 3 at H12 | None (mock data) | **16 hours** ✅ |
| Role 5 | Everyone | None (docs) | **24 hours** ✅ |

**Result:** First 12 hours are 100% parallelized with ZERO blocking!

---

## **✅ Success Criteria**

- [ ] Smart contract deployed to TestNet with verified transactions
- [ ] 100% test coverage with passing CI/CD
- [ ] Working API with both mock mode (for dev) and real mode (for production)
- [ ] Beautiful, responsive UI that works without backend (mock data)
- [ ] Full user flow works end-to-end (create → fund → submit → approve)
- [ ] NFT mints successfully and appears in freelancer wallet
- [ ] Complete documentation (README, Architecture, API, FAQ)
- [ ] 3-minute demo video shows all features
- [ ] Presentation slides ready (10 slides)
- [ ] Zero critical bugs during final testing

---

## **🚨 Risk Mitigation**

| **Risk** | **Owner** | **Mitigation** |
|---------|----------|----------------|
| Contract bugs lock funds | Role 1 & 2 | Add emergency cancel method, extensive testing, 100% coverage |
| NFT opt-in breaks flow | Role 5 | Document opt-in requirement clearly, add frontend guardrails later |
| IPFS upload fails | Role 3 | Use Pinata's reliable API, add retries, test early |
| API mocks don't match real contract | Role 3 | Design mocks based on PRD spec, update when contract ready |
| Frontend doesn't match backend | Role 4 | Use PRD data models, coordinate on Slack |
| Merge conflicts at integration | Everyone | Small commits, clear file ownership, communicate often |

---

## **💡 Pro Tips for Maximum Efficiency**

1. **Don't wait for anyone** - Build your piece independently first
2. **Use the PRD as source of truth** - All data models, endpoints, UI specs are there
3. **Mock everything** - Roles 2, 3, 4 should build complete features with mocks
4. **Test in isolation** - Each piece should work standalone before integration
5. **Communicate async** - Use Slack/Discord, don't block on sync meetings
6. **Commit frequently** - Push every 1-2 hours minimum
7. **Document as you code** - Don't wait until Hour 32

---

