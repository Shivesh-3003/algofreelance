import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '@txnlab/use-wallet-react'
import { ArrowLeft, Briefcase, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api, ApiError } from '../services/api'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import ErrorAlert from '../components/shared/ErrorAlert'
import Navbar from '../components/shared/Navbar'
import type { JobCreateRequest } from '../types/job'
import algosdk from 'algosdk'

// ⚠️ MOCK MODE ENABLED: Job creation and funding are simulated for demo purposes
// Real blockchain transactions are currently bypassed

export default function CreateJobPage() {
  const navigate = useNavigate()
  const { activeAddress, signTransactions } = useWallet()

  const [formData, setFormData] = useState<JobCreateRequest>({
    client_address: activeAddress || '',
    freelancer_address: '',
    escrow_amount: 0,
    job_title: '',
    job_description: '',
  })

  const [amountAlgo, setAmountAlgo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'create' | 'fund' | 'success'>('create')
  const [createdJobData, setCreatedJobData] = useState<any>(null)

  const handleAmountChange = (value: string) => {
    setAmountAlgo(value)
    const microAlgos = parseFloat(value || '0') * 1_000_000
    setFormData({ ...formData, escrow_amount: Math.floor(microAlgos) })
  }

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!activeAddress) {
      setError('Please connect your wallet first')
      return
    }

    if (formData.escrow_amount <= 0) {
      setError('Escrow amount must be greater than 0')
      return
    }

    setLoading(true)

    try {
      // MOCK MODE: Simulate successful job creation for demo purposes
      console.log('[MOCK] Simulating job creation...')

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      const mockResponse = {
        success: true,
        app_id: Math.floor(Math.random() * 10000) + 1000,
        app_address: 'MOCK' + Math.random().toString(36).substring(2, 15).toUpperCase(),
        funding_amount: formData.escrow_amount + 300000,
        txn_id: 'MOCK' + Math.random().toString(36).substring(2, 15).toUpperCase(),
        explorer_url: 'https://testnet.explorer.perawallet.app/application/1234'
      }

      console.log('[MOCK] Job created:', mockResponse)
      setCreatedJobData(mockResponse)
      setStep('fund')

      /* REAL IMPLEMENTATION (currently bypassed):
      const jobData = { ...formData, client_address: activeAddress }
      const response = await api.createJob(jobData)
      setCreatedJobData(response)
      setStep('fund')
      */
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to create job. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFundContract = async () => {
    if (!createdJobData || !activeAddress) return

    setLoading(true)
    setError(null)

    try {
      // MOCK MODE: Simulate successful funding for demo purposes
      console.log('[MOCK] Simulating fund transaction for app_id:', createdJobData.app_id)

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Simulate success
      console.log('[MOCK] Funding successful!')
      setStep('success')

      /* REAL IMPLEMENTATION (currently bypassed):
      const fundResponse = await api.constructFundTransaction(createdJobData.app_id, activeAddress)

      // Convert base64 strings to Uint8Array using browser-compatible method
      const txnsToSign = fundResponse.transactions.map((txnB64) => {
        // Use algosdk's encoding to decode the base64-encoded msgpack transaction
        const txnBytes = Uint8Array.from(atob(txnB64), c => c.charCodeAt(0))
        return { txn: txnBytes }
      })

      const signedTxns = await signTransactions(txnsToSign)

      const algodServer = import.meta.env.VITE_ALGOD_SERVER || 'https://testnet-api.algonode.cloud'
      const algodToken = import.meta.env.VITE_ALGOD_TOKEN || ''
      const algodPort = import.meta.env.VITE_ALGOD_PORT || ''

      const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort)

      const signedTxnBlobs = signedTxns.map((txn) => (txn ? txn : new Uint8Array()))
      await algodClient.sendRawTransaction(signedTxnBlobs).do()

      setStep('success')
      */
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fund contract. Please try again.'
      setError(errorMessage)
      if (errorMessage.includes('transaction already in ledger')) {
        setStep('success')
      } else {
        setLoading(false)
      }
    }
  }

  if (!activeAddress) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 max-w-md text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Wallet Not Connected</h2>
            <p className="text-gray-400 mb-6">Please connect your wallet to create a job.</p>
            <Link
              to="/"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg inline-block hover:shadow-lg transition"
            >
              Go Home
            </Link>
          </div>
        </div>
      </>
    )
  }

  if (step === 'success') {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl border border-green-500/50 p-8 max-w-md text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-400" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Job Created Successfully!</h2>
            <p className="text-gray-400 mb-6">
              Your job contract has been deployed and funded. The freelancer can now start working.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/job/${createdJobData.app_id}`)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition"
              >
                View Job Details
              </button>
              <button
                onClick={() => navigate('/jobs')}
                className="w-full bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition"
              >
                Browse All Jobs
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (step === 'fund') {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 pt-20">
          <div className="max-w-2xl mx-auto">
            <Link to="/jobs" className="text-blue-400 hover:text-blue-300 flex items-center mb-6">
              <ArrowLeft size={20} className="mr-2" />
              Back to Jobs
            </Link>

            <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
              <h2 className="text-3xl font-bold text-white mb-6">Fund Your Contract</h2>

              {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

              <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-6 mb-6">
                <h3 className="text-blue-400 font-semibold mb-3">Contract Details</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex justify-between">
                    <span>App ID:</span>
                    <span className="font-mono">{createdJobData.app_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Escrow Amount:</span>
                    <span className="font-semibold">{(formData.escrow_amount / 1_000_000).toFixed(2)} ALGO</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Funding Amount (+ fees):</span>
                    <span className="font-semibold text-blue-400">
                      {(createdJobData.funding_amount / 1_000_000).toFixed(2)} ALGO
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-gray-400 mb-6">
                Click the button below to sign and send the funding transaction. This will deposit the escrow
                amount into the smart contract.
              </p>

              <button
                onClick={() => {
                  setLoading(true)
                  handleFundContract()
                }}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4 rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Sign & Fund Contract'}
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 pt-20">
        <div className="max-w-2xl mx-auto">
        <Link to="/" className="text-blue-400 hover:text-blue-300 flex items-center mb-6">
          <ArrowLeft size={20} className="mr-2" />
          Back to Home
        </Link>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
              <Briefcase className="text-white" size={24} />
            </div>
            <h2 className="text-3xl font-bold text-white">Create New Job</h2>
          </div>

          {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

          <form onSubmit={handleCreateJob} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Job Title</label>
              <input
                type="text"
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g., Logo Design for SaaS Startup"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Job Description</label>
              <textarea
                value={formData.job_description}
                onChange={(e) => setFormData({ ...formData, job_description: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 h-32"
                placeholder="Describe the work you need done..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Freelancer Address
              </label>
              <input
                type="text"
                value={formData.freelancer_address}
                onChange={(e) => setFormData({ ...formData, freelancer_address: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                placeholder="FREELANCERADDR..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Payment Amount (ALGO)
              </label>
              <input
                type="number"
                step="0.000001"
                value={amountAlgo}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                placeholder="5.0"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.escrow_amount > 0 && `= ${formData.escrow_amount.toLocaleString()} microALGOs`}
              </p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4">
              <p className="text-yellow-300 text-sm">
                <strong>Note:</strong> You will need to fund the contract with approximately{' '}
                {(formData.escrow_amount / 1_000_000 + 0.3).toFixed(2)} ALGO (escrow + 0.3 ALGO for fees and
                minimum balance).
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4 rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              onClick={(e) => {
                if (loading) {
                  e.preventDefault()
                }
              }}
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Create Job Contract'}
            </button>
          </form>
        </div>
        </div>
      </div>
    </>
  )
}
