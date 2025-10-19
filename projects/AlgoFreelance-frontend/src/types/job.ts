// TypeScript types matching backend Pydantic models

export interface JobCreateRequest {
  client_address: string
  freelancer_address: string
  escrow_amount: number // in microALGOs
  job_title: string
  job_description: string
}

export interface JobCreateResponse {
  success: boolean
  app_id: number
  app_address: string
  funding_amount: number
  txn_id: string
  explorer_url: string
}

export interface JobDetailsResponse {
  app_id: number
  client_address: string
  freelancer_address: string
  escrow_amount: number
  job_status: number
  status_string: string
  job_title: string
  work_hash: string | null
  created_at: number
  is_funded: boolean
  contract_address: string
  contract_balance: number
}

export interface Certificate {
  asset_id: number
  asset_name: string
  job_title: string
  ipfs_url: string
  client_address: string
  completed_at: number
  block_explorer: string
}

export interface PortfolioResponse {
  freelancer_address: string
  total_jobs: number
  certificates: Certificate[]
}

export interface IPFSUploadResponse {
  success: boolean
  ipfs_hash: string
  ipfs_url: string
  gateway_url: string
  size?: number
}

export interface FundJobResponse {
  success: boolean
  transactions: string[] // Base64-encoded unsigned transactions
  group_id: string
  signer_address: string
  message: string
}

export interface SubmitWorkRequest {
  ipfs_hash: string
  freelancer_address: string
}

export interface SubmitWorkResponse {
  success: boolean
  transaction: string // Base64-encoded unsigned transaction
  signer_address: string
  message: string
}

export interface ApproveWorkResponse {
  success: boolean
  transaction: string
  signer_address: string
  expected_nft_name: string
  expected_payment_amount: number
  message: string
}

export interface BroadcastTransactionRequest {
  signed_transaction: string
}

export interface BroadcastTransactionResponse {
  success: boolean
  txn_id: string
  explorer_url: string
}

export interface JobSummary {
  app_id: number
  job_title: string
  job_status: number
  status_string: string
  escrow_amount: number
  client_address: string
  freelancer_address: string
  created_at: number
  contract_address: string
}

export interface JobListResponse {
  success: boolean
  jobs: JobSummary[]
  total_count: number
  limit: number
  offset: number
  has_more: boolean
}

// Job status enum
export enum JobStatus {
  Created = 0,
  Funded = 1,
  Submitted = 2,
  Completed = 3,
  Canceled = 4,
}

export const JOB_STATUS_NAMES: Record<JobStatus, string> = {
  [JobStatus.Created]: 'Created',
  [JobStatus.Funded]: 'Funded',
  [JobStatus.Submitted]: 'Work Submitted',
  [JobStatus.Completed]: 'Completed',
  [JobStatus.Canceled]: 'Canceled',
}
