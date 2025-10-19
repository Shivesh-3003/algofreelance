import { Clock, User, DollarSign, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { JobSummary } from '../../types/job'
import { JOB_STATUS_NAMES } from '../../types/job'

interface JobCardProps {
  job: JobSummary
}

export default function JobCard({ job }: JobCardProps) {
  const statusColors = {
    0: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50', // Created
    1: 'bg-blue-500/20 text-blue-300 border-blue-500/50', // Funded
    2: 'bg-purple-500/20 text-purple-300 border-purple-500/50', // Submitted
    3: 'bg-green-500/20 text-green-300 border-green-500/50', // Completed
    4: 'bg-gray-500/20 text-gray-300 border-gray-500/50', // Canceled
  }

  const statusColor = statusColors[job.job_status as keyof typeof statusColors] || statusColors[0]

  const formatDate = (timestamp: number) => {
    if (timestamp === 0) return 'N/A'
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  const formatAlgo = (microAlgos: number) => {
    return (microAlgos / 1_000_000).toFixed(2)
  }

  const shortAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <Link
      to={`/job/${job.app_id}`}
      className="block bg-gray-800 rounded-xl border border-gray-700 hover:border-blue-500/50 p-6 transition-all hover:shadow-xl hover:-translate-y-1"
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex-1">{job.job_title}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
          {JOB_STATUS_NAMES[job.job_status]}
        </span>
      </div>

      <div className="space-y-2 text-sm text-gray-400">
        <div className="flex items-center">
          <DollarSign size={16} className="mr-2 text-blue-400" />
          <span className="text-white font-semibold">{formatAlgo(job.escrow_amount)} ALGO</span>
        </div>

        <div className="flex items-center">
          <User size={16} className="mr-2 text-purple-400" />
          <span>Client: {shortAddress(job.client_address)}</span>
        </div>

        <div className="flex items-center">
          <Clock size={16} className="mr-2 text-green-400" />
          <span>Created: {formatDate(job.created_at)}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between">
        <span className="text-xs text-gray-500">App ID: {job.app_id}</span>
        <ExternalLink size={16} className="text-gray-500" />
      </div>
    </Link>
  )
}
