import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useWallet } from '@txnlab/use-wallet-react'
import { ArrowLeft, Award } from 'lucide-react'
import { api, ApiError } from '../services/api'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import ErrorAlert from '../components/shared/ErrorAlert'
import NFTCard from '../components/portfolio/NFTCard'
import Navbar from '../components/shared/Navbar'
import type { PortfolioResponse } from '../types/job'

// ⚠️ MOCK MODE ENABLED: Portfolio data is simulated for demo purposes

export default function PortfolioPage() {
  const { address } = useParams<{ address?: string }>()
  const { activeAddress } = useWallet()

  const targetAddress = address || activeAddress

  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPortfolio()
  }, [targetAddress])

  const loadPortfolio = async () => {
    if (!targetAddress) return

    setLoading(true)
    setError(null)

    try {
      // MOCK MODE: Generate fake portfolio data for demo
      console.log('[MOCK] Loading portfolio for address:', targetAddress)

      await new Promise(resolve => setTimeout(resolve, 500))

      // Using publicly available IPFS hashes for demo purposes
      const mockPortfolio: PortfolioResponse = {
        freelancer_address: targetAddress,
        total_jobs: 3,
        certificates: [
          {
            asset_id: 12345,
            asset_name: 'POWCERT-Logo Design',
            job_title: 'Logo Design for Startup',
            ipfs_url: 'ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco', // Public IPFS Wiki logo
            client_address: 'CLIENTADDRESS123456789',
            completed_at: Date.now() - 86400000 * 7, // 7 days ago
            block_explorer: 'https://testnet.explorer.perawallet.app/asset/12345'
          },
          {
            asset_id: 12346,
            asset_name: 'POWCERT-Website Development',
            job_title: 'E-commerce Website',
            ipfs_url: 'ipfs://QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB', // Public IPFS example
            client_address: 'CLIENTADDRESS987654321',
            completed_at: Date.now() - 86400000 * 14, // 14 days ago
            block_explorer: 'https://testnet.explorer.perawallet.app/asset/12346'
          },
          {
            asset_id: 12347,
            asset_name: 'POWCERT-Mobile App UI',
            job_title: 'iOS App UI Design',
            ipfs_url: 'ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG', // Public IPFS directory
            client_address: 'CLIENTADDRESS111222333',
            completed_at: Date.now() - 86400000 * 21, // 21 days ago
            block_explorer: 'https://testnet.explorer.perawallet.app/asset/12347'
          }
        ]
      }

      console.log('[MOCK] Portfolio loaded:', mockPortfolio)
      setPortfolio(mockPortfolio)

      /* REAL IMPLEMENTATION (currently bypassed):
      const data = await api.getFreelancerNFTs(targetAddress)
      setPortfolio(data)
      */
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to load portfolio')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!targetAddress) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 max-w-md text-center">
            <h2 className="text-2xl font-bold text-white mb-4">No Address Provided</h2>
            <p className="text-gray-400 mb-6">Please connect your wallet or provide an address.</p>
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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 pt-20">
        <div className="max-w-7xl mx-auto">
        <Link to="/jobs" className="text-blue-400 hover:text-blue-300 flex items-center mb-6">
          <ArrowLeft size={20} className="mr-2" />
          Back to Jobs
        </Link>

        {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-4">
              <Award className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Work Certificates</h1>
              <p className="text-gray-400">
                {portfolio?.total_jobs || 0} completed {portfolio?.total_jobs === 1 ? 'job' : 'jobs'}
              </p>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <label className="text-sm text-gray-400">Freelancer Address</label>
            <p className="text-white font-mono text-sm break-all">{targetAddress}</p>
          </div>
        </div>

        {portfolio && portfolio.certificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolio.certificates.map((cert) => (
              <NFTCard key={cert.asset_id} certificate={cert} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
            <Award className="text-gray-600 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-bold text-gray-400 mb-2">No Certificates Yet</h3>
            <p className="text-gray-500">Complete jobs to earn your first NFT certificate!</p>
          </div>
        )}
        </div>
      </div>
    </>
  )
}
