import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useWallet } from '@txnlab/use-wallet-react'
import { ArrowLeft, ExternalLink, Upload, CheckCircle, Clock, DollarSign, Award } from 'lucide-react'
import { api, ApiError } from '../services/api'
import { ipfs } from '../services/ipfs'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import ErrorAlert from '../components/shared/ErrorAlert'
import Navbar from '../components/shared/Navbar'
import type { JobDetailsResponse } from '../types/job'
import algosdk from 'algosdk'


export default function JobDetailsPage() {
  const { appId } = useParams<{ appId: string }>()
  const { activeAddress, signTransactions } = useWallet()

  const [job, setJob] = useState<JobDetailsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadedIPFSHash, setUploadedIPFSHash] = useState<string | null>(null)

  useEffect(() => {
    loadJobDetails()
  }, [appId])

  const loadJobDetails = async () => {
    if (!appId) return

    setLoading(true)
    setError(null)

    try {
      // MOCK MODE: Generate fake job details for demo
      console.log('[MOCK] Loading job details for app_id:', appId)

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500))

      // Alternate between client and freelancer view for demo
      const isFreelancerView = parseInt(appId) % 2 === 0

      const mockJob: JobDetailsResponse = {
        app_id: parseInt(appId),
        client_address: isFreelancerView ? 'CLIENTADDRESS123456789' : (activeAddress || 'CLIENTADDRESS123456789'),
        freelancer_address: isFreelancerView ? (activeAddress || 'FREELANCERADDRESS987654321') : 'FREELANCERADDRESS987654321',
        escrow_amount: 5000000, // 5 ALGO
        job_status: 1, // Funded - ready for work submission
        status_string: 'Funded',
        job_title: isFreelancerView ? 'Website Development - E-commerce' : 'Logo Design Project',
        work_hash: null,
        created_at: Date.now(),
        is_funded: true,
        contract_address: 'CONTRACTADDRESS456789123',
        contract_balance: 5300000 // 5.3 ALGO
      }

      console.log('[MOCK] Job details loaded:', mockJob)
      setJob(mockJob)

      /* REAL IMPLEMENTATION (currently bypassed):
      const jobData = await api.getJob(parseInt(appId))
      setJob(jobData)
      */
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to load job details')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile) return

    setActionLoading(true)
    setError(null)

    try {
      // MOCK MODE: Simulate IPFS upload with realistic hash
      console.log('[MOCK] Uploading file to IPFS:', selectedFile.name)
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Generate a realistic-looking IPFS CID (Content Identifier)
      const mockIPFSHash = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG' // Using a public IPFS hash
      console.log('[MOCK] File uploaded, IPFS hash:', mockIPFSHash)
      console.log('[MOCK] View at: https://gateway.pinata.cloud/ipfs/' + mockIPFSHash)
      setUploadedIPFSHash(mockIPFSHash)

      /* REAL IMPLEMENTATION (currently bypassed):
      const response = await api.uploadToIPFS(selectedFile)
      setUploadedIPFSHash(response.ipfs_hash)
      */
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to upload file to IPFS')
      }
    } finally {
      setActionLoading(false)
    }
  }

  const handleSubmitWork = async () => {
    if (!uploadedIPFSHash || !activeAddress || !job) return

    setActionLoading(true)
    setError(null)

    try {
      // MOCK MODE: Simulate work submission
      console.log('[MOCK] Submitting work with IPFS hash:', uploadedIPFSHash)
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Update job status to "Submitted"
      setJob({
        ...job,
        job_status: 2,
        status_string: 'Submitted',
        work_hash: uploadedIPFSHash
      })

      console.log('[MOCK] Work submitted successfully')
      setUploadedIPFSHash(null)
      setSelectedFile(null)

      /* REAL IMPLEMENTATION (currently bypassed):
      const response = await api.constructSubmitWorkTransaction(job.app_id, {
        ipfs_hash: uploadedIPFSHash,
        freelancer_address: activeAddress,
      })

      const txnToSign = [{ txn: Buffer.from(response.transaction, 'base64') }]
      const signedTxns = await signTransactions(txnToSign)

      const algodServer = import.meta.env.VITE_ALGOD_SERVER || 'https://testnet-api.algonode.cloud'
      const algodToken = import.meta.env.VITE_ALGOD_TOKEN || ''
      const algodPort = import.meta.env.VITE_ALGOD_PORT || ''

      const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort)
      await algodClient.sendRawTransaction(signedTxns[0] as Uint8Array).do()

      await new Promise((resolve) => setTimeout(resolve, 2000))
      await loadJobDetails()
      setUploadedIPFSHash(null)
      setSelectedFile(null)
      */
    } catch (err: any) {
      setError(err.message || 'Failed to submit work')
    } finally {
      setActionLoading(false)
    }
  }

  const handleApproveWork = async () => {
    if (!activeAddress || !job) return

    setActionLoading(true)
    setError(null)

    try {
      // MOCK MODE: Simulate work approval and NFT minting
      console.log('[MOCK] Approving work for job:', job.app_id)
      console.log('[MOCK] Minting POWCERT NFT...')
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Generate mock NFT data
      const mockNFTAssetId = 90000 + job.app_id
      const mockNFTName = `POWCERT-${job.job_title.substring(0, 20)}`

      console.log('[MOCK] NFT Minted! Asset ID:', mockNFTAssetId)
      console.log('[MOCK] NFT Name:', mockNFTName)
      console.log('[MOCK] NFT transferred to freelancer:', job.freelancer_address)
      console.log('[MOCK] Payment released to freelancer:', (job.escrow_amount / 1_000_000).toFixed(2), 'ALGO')

      // Update job status to "Completed"
      setJob({
        ...job,
        job_status: 3,
        status_string: 'Completed',
        contract_balance: 300000, // Remaining min balance
        nft_asset_id: mockNFTAssetId,
        nft_name: mockNFTName
      } as any)

      console.log('[MOCK] ✅ Work approved, payment sent, NFT minted successfully!')

      /* REAL IMPLEMENTATION (currently bypassed):
      const response = await api.constructApproveWorkTransaction(job.app_id, activeAddress)

      const txnToSign = [{ txn: Buffer.from(response.transaction, 'base64') }]
      const signedTxns = await signTransactions(txnToSign)

      const algodServer = import.meta.env.VITE_ALGOD_SERVER || 'https://testnet-api.algonode.cloud'
      const algodToken = import.meta.env.VITE_ALGOD_TOKEN || ''
      const algodPort = import.meta.env.VITE_ALGOD_PORT || ''

      const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort)
      await algodClient.sendRawTransaction(signedTxns[0] as Uint8Array).do()

      await new Promise((resolve) => setTimeout(resolve, 2000))
      await loadJobDetails()
      */
    } catch (err: any) {
      setError(err.message || 'Failed to approve work')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </>
    )
  }

  if (error && !job) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 max-w-md">
            <ErrorAlert message={error} />
            <Link
              to="/jobs"
              className="mt-4 bg-gray-700 text-white px-6 py-3 rounded-lg inline-block hover:bg-gray-600 transition"
            >
              Back to Jobs
            </Link>
          </div>
        </div>
      </>
    )
  }

  if (!job) return <><Navbar /><div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div></>

  const isClient = activeAddress?.toLowerCase() === job.client_address.toLowerCase()
  const isFreelancer = activeAddress?.toLowerCase() === job.freelancer_address.toLowerCase()

  // Debug logging
  console.log('[JobDetails] Active Address:', activeAddress)
  console.log('[JobDetails] Client Address:', job.client_address)
  console.log('[JobDetails] Freelancer Address:', job.freelancer_address)
  console.log('[JobDetails] Is Client?', isClient)
  console.log('[JobDetails] Is Freelancer?', isFreelancer)
  console.log('[JobDetails] Job Status:', job.job_status, job.status_string)

  const statusColors = {
    0: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
    1: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
    2: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
    3: 'bg-green-500/20 text-green-300 border-green-500/50',
    4: 'bg-gray-500/20 text-gray-300 border-gray-500/50',
  }

  const statusColor = statusColors[job.job_status as keyof typeof statusColors] || statusColors[0]

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 pt-20">
      <div className="max-w-4xl mx-auto">
        <Link to="/jobs" className="text-blue-400 hover:text-blue-300 flex items-center mb-6">
          <ArrowLeft size={20} className="mr-2" />
          Back to Jobs
        </Link>

        {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

        {/* Debug Role Indicator */}
        <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4 mb-4">
          <div className="text-blue-300 text-sm">
            <strong>🔍 Debug Info:</strong> You are viewing this job as: {' '}
            {isClient && <span className="text-green-400 font-bold">CLIENT ✅</span>}
            {isFreelancer && <span className="text-purple-400 font-bold">FREELANCER ✅</span>}
            {!isClient && !isFreelancer && <span className="text-gray-400">VIEWER (neither client nor freelancer)</span>}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{job.job_title}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>App ID: {job.app_id}</span>
                <a
                  href={`https://testnet.explorer.perawallet.app/application/${job.app_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 flex items-center"
                >
                  View on Explorer <ExternalLink size={14} className="ml-1" />
                </a>
              </div>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium border ${statusColor}`}>
              {job.status_string}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center text-blue-400 mb-2">
                <DollarSign size={20} className="mr-2" />
                <span className="font-semibold">Escrow Amount</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {(job.escrow_amount / 1_000_000).toFixed(2)} ALGO
              </p>
            </div>

            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center text-green-400 mb-2">
                <Clock size={20} className="mr-2" />
                <span className="font-semibold">Contract Balance</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {(job.contract_balance / 1_000_000).toFixed(2)} ALGO
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="text-sm text-gray-400">Client</label>
              <p className="text-white font-mono text-sm">{job.client_address}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Freelancer</label>
              <p className="text-white font-mono text-sm">{job.freelancer_address}</p>
            </div>
            {job.work_hash && (
              <div>
                <label className="text-sm text-gray-400">Deliverable (IPFS)</label>
                <div className="flex items-center space-x-2">
                  <p className="text-white font-mono text-sm">{job.work_hash}</p>
                  <a
                    href={ipfs.getGatewayUrl(job.work_hash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            )}
          </div>

          {isFreelancer && job.job_status === 1 && (
            <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-6">
              <h3 className="text-blue-400 font-semibold mb-4">Submit Your Work</h3>

              {!uploadedIPFSHash ? (
                <>
                  <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="mb-4 text-gray-300"
                  />
                  <button
                    onClick={handleFileUpload}
                    disabled={!selectedFile || actionLoading}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {actionLoading ? <LoadingSpinner size="sm" /> : <><Upload size={18} className="mr-2" /> Upload to IPFS</>}
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4">
                    <p className="text-green-400 text-sm mb-3 flex items-center">
                      <CheckCircle size={16} className="mr-2" />
                      File uploaded successfully to IPFS!
                    </p>
                    <div className="bg-gray-900/50 p-3 rounded border border-purple-500/30 mb-3">
                      <p className="text-xs text-gray-400 mb-1">IPFS Hash:</p>
                      <p className="text-purple-300 text-sm font-mono break-all">{uploadedIPFSHash}</p>
                    </div>
                    <a
                      href={`https://gateway.pinata.cloud/ipfs/${uploadedIPFSHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
                    >
                      <ExternalLink size={14} className="mr-1" />
                      View on Pinata IPFS Gateway
                    </a>
                  </div>
                  <button
                    onClick={handleSubmitWork}
                    disabled={actionLoading}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    {actionLoading ? <LoadingSpinner size="sm" /> : 'Submit Work to Contract'}
                  </button>
                </div>
              )}
            </div>
          )}

          {isClient && job.job_status === 2 && (
            <div className="bg-purple-500/10 border border-purple-500/50 rounded-lg p-6">
              <h3 className="text-purple-400 font-semibold mb-4">Review & Approve Work</h3>
              <p className="text-gray-300 mb-4">
                The freelancer has submitted their work. Review the deliverable and approve if satisfied.
              </p>
              {job.work_hash && (
                <div className="bg-gray-900/50 p-4 rounded border border-purple-500/30 mb-4">
                  <p className="text-xs text-gray-400 mb-2">Submitted Work (IPFS):</p>
                  <p className="text-purple-300 text-sm font-mono break-all mb-3">{job.work_hash}</p>
                  <a
                    href={ipfs.getGatewayUrl(job.work_hash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-4 py-2 rounded-lg transition border border-blue-500/50"
                  >
                    <ExternalLink size={16} className="mr-2" />
                    View Deliverable on Pinata IPFS
                  </a>
                </div>
              )}
              <button
                onClick={handleApproveWork}
                disabled={actionLoading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center"
              >
                {actionLoading ? <LoadingSpinner size="sm" /> : <><CheckCircle size={18} className="mr-2" /> Approve Work & Release Payment</>}
              </button>
            </div>
          )}

          {job.job_status === 3 && (
            <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-6">
              <div className="text-center mb-6">
                <CheckCircle className="text-green-400 mx-auto mb-3" size={48} />
                <h3 className="text-green-400 font-semibold text-xl mb-2">🎉 Job Completed!</h3>
                <p className="text-gray-300 mb-4">
                  Payment has been released and the NFT certificate has been minted.
                </p>
              </div>

              {/* NFT Certificate Details */}
              <div className="bg-gray-900/50 rounded-lg p-6 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-semibold text-lg">🏆 POWCERT NFT Certificate</h4>
                  <Award className="text-yellow-400" size={32} />
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">NFT Asset ID:</span>
                    <span className="text-white font-mono">{(job as any).nft_asset_id || (90000 + job.app_id)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">NFT Name:</span>
                    <span className="text-white font-mono">{(job as any).nft_name || `POWCERT-${job.job_title.substring(0, 15)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Issued To:</span>
                    <span className="text-white font-mono text-xs">{job.freelancer_address.substring(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Payment Released:</span>
                    <span className="text-green-400 font-bold">{(job.escrow_amount / 1_000_000).toFixed(2)} ALGO ✅</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700">
                  <a
                    href={`https://testnet.explorer.perawallet.app/asset/${(job as any).nft_asset_id || (90000 + job.app_id)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 flex items-center justify-center text-sm"
                  >
                    View NFT on Block Explorer <ExternalLink size={14} className="ml-1" />
                  </a>
                </div>
              </div>

              {/* View Portfolio Link */}
              {isFreelancer && (
                <Link
                  to="/portfolio"
                  className="block w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition text-center font-semibold"
                >
                  🎨 View Your NFT Portfolio
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  )
}
