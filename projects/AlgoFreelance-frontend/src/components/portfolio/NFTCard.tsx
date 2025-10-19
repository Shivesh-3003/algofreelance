import { Award, ExternalLink, User } from 'lucide-react'
import type { Certificate } from '../../types/job'
import { ipfs } from '../../services/ipfs'

interface NFTCardProps {
  certificate: Certificate
}

export default function NFTCard({ certificate }: NFTCardProps) {
  const shortAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const formatDate = (timestamp: number) => {
    if (timestamp === 0) return 'Completed'
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  const handleViewIPFS = () => {
    const gatewayUrl = ipfs.getGatewayUrl(certificate.ipfs_url)
    window.open(gatewayUrl, '_blank')
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 hover:border-purple-500/50 p-6 transition-all hover:shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
          <Award className="text-white" size={24} />
        </div>
        <a
          href={certificate.block_explorer}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300"
        >
          <ExternalLink size={18} />
        </a>
      </div>

      <h3 className="text-lg font-bold text-white mb-2 truncate">{certificate.job_title}</h3>

      <div className="space-y-2 text-sm text-gray-400 mb-4">
        <div className="flex items-center">
          <User size={14} className="mr-2 text-blue-400" />
          <span>Client: {shortAddress(certificate.client_address)}</span>
        </div>
        <div className="text-xs text-gray-500">
          Asset ID: {certificate.asset_id}
        </div>
        <div className="text-xs text-green-400">
          {formatDate(certificate.completed_at)}
        </div>
        {certificate.ipfs_url && (
          <div className="text-xs text-purple-400 font-mono bg-gray-900/50 p-2 rounded border border-purple-500/30">
            IPFS: {certificate.ipfs_url.replace('ipfs://', '').substring(0, 12)}...
          </div>
        )}
      </div>

      {certificate.ipfs_url && (
        <button
          onClick={handleViewIPFS}
          className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 py-2 rounded-lg text-sm font-medium transition border border-blue-500/50 flex items-center justify-center"
        >
          <ExternalLink size={14} className="mr-2" />
          View on Pinata IPFS
        </button>
      )}
    </div>
  )
}
