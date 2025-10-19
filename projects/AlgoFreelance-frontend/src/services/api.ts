// API client for AlgoFreelance backend

import type {
  JobCreateRequest,
  JobCreateResponse,
  JobDetailsResponse,
  PortfolioResponse,
  FundJobResponse,
  SubmitWorkRequest,
  SubmitWorkResponse,
  ApproveWorkResponse,
  BroadcastTransactionRequest,
  BroadcastTransactionResponse,
  JobListResponse,
  IPFSUploadResponse,
} from '../types/job'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public errorCode?: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new ApiError(
      errorData.detail || `Request failed with status ${response.status}`,
      response.status,
      errorData.error,
    )
  }
  return response.json()
}

export const api = {
  // Create a new job contract
  async createJob(jobData: JobCreateRequest): Promise<JobCreateResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/jobs/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData),
    })
    return handleResponse<JobCreateResponse>(response)
  },

  // Get job details
  async getJob(appId: number): Promise<JobDetailsResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/jobs/${appId}`)
    return handleResponse<JobDetailsResponse>(response)
  },

  // List all jobs with optional filters
  async listJobs(params?: {
    status?: number
    client_address?: string
    freelancer_address?: string
    limit?: number
    offset?: number
  }): Promise<JobListResponse> {
    const queryParams = new URLSearchParams()
    if (params?.status !== undefined) queryParams.set('status', String(params.status))
    if (params?.client_address) queryParams.set('client_address', params.client_address)
    if (params?.freelancer_address) queryParams.set('freelancer_address', params.freelancer_address)
    if (params?.limit) queryParams.set('limit', String(params.limit))
    if (params?.offset) queryParams.set('offset', String(params.offset))

    const url = `${API_BASE_URL}/api/v1/jobs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    const response = await fetch(url)
    return handleResponse<JobListResponse>(response)
  },

  // Get freelancer's NFT portfolio
  async getFreelancerNFTs(address: string): Promise<PortfolioResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/freelancers/${address}/nfts`)
    return handleResponse<PortfolioResponse>(response)
  },

  // Construct fund transaction
  async constructFundTransaction(appId: number, clientAddress: string): Promise<FundJobResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/jobs/${appId}/fund`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_address: clientAddress }),
    })
    return handleResponse<FundJobResponse>(response)
  },

  // Construct submit work transaction
  async constructSubmitWorkTransaction(
    appId: number,
    submitData: SubmitWorkRequest,
  ): Promise<SubmitWorkResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/jobs/${appId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submitData),
    })
    return handleResponse<SubmitWorkResponse>(response)
  },

  // Construct approve work transaction
  async constructApproveWorkTransaction(
    appId: number,
    clientAddress: string,
  ): Promise<ApproveWorkResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/jobs/${appId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_address: clientAddress }),
    })
    return handleResponse<ApproveWorkResponse>(response)
  },

  // Broadcast signed transaction (optional helper)
  async broadcastTransaction(signedTxn: string): Promise<BroadcastTransactionResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signed_transaction: signedTxn } as BroadcastTransactionRequest),
    })
    return handleResponse<BroadcastTransactionResponse>(response)
  },

  // Upload file to IPFS
  async uploadToIPFS(file: File): Promise<IPFSUploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('filename', file.name)

    const response = await fetch(`${API_BASE_URL}/api/v1/ipfs/upload`, {
      method: 'POST',
      body: formData,
    })
    return handleResponse<IPFSUploadResponse>(response)
  },
}

export { ApiError }
