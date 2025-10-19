import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useWallet } from '@txnlab/use-wallet-react'
import { Briefcase, Filter, Plus } from 'lucide-react'
import { api, ApiError } from '../services/api'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import ErrorAlert from '../components/shared/ErrorAlert'
import JobCard from '../components/jobs/JobCard'
import Navbar from '../components/shared/Navbar'
import type { JobListResponse, JobSummary } from '../types/job'
import { JobStatus } from '../types/job'

// ⚠️ MOCK MODE ENABLED: Job list data is simulated for demo purposes

export default function JobListPage() {
  const { activeAddress } = useWallet()

  const [jobsData, setJobsData] = useState<JobListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined)
  const [showMyJobs, setShowMyJobs] = useState(false)

  useEffect(() => {
    loadJobs()
  }, [statusFilter, showMyJobs, activeAddress])

  const loadJobs = async () => {
    setLoading(true)
    setError(null)

    try {
      // MOCK MODE: Generate fake job list for demo
      console.log('[MOCK] Loading jobs with filters:', { statusFilter, showMyJobs })

      await new Promise(resolve => setTimeout(resolve, 500))

      const mockJobs: JobSummary[] = [
        {
          app_id: 5001,
          job_title: 'Logo Design for Tech Startup',
          job_status: 0,
          status_string: 'Created',
          escrow_amount: 5000000,
          client_address: activeAddress || 'CLIENTADDRESS123456789',
          freelancer_address: 'FREELANCERADDRESS987654321',
          created_at: Date.now() - 86400000,
          contract_address: 'CONTRACTADDRESS111222333'
        },
        {
          app_id: 5002,
          job_title: '🎨 Website Development - E-commerce (You: Freelancer)',
          job_status: 1,
          status_string: 'Funded',
          escrow_amount: 10000000,
          client_address: 'CLIENTADDRESS987654321',
          freelancer_address: activeAddress || 'FREELANCERADDRESS111222333',
          created_at: Date.now() - 86400000 * 2,
          contract_address: 'CONTRACTADDRESS444555666'
        },
        {
          app_id: 5003,
          job_title: 'Mobile App UI/UX Design',
          job_status: 2,
          status_string: 'Submitted',
          escrow_amount: 8000000,
          client_address: activeAddress || 'CLIENTADDRESS111222333',
          freelancer_address: 'FREELANCERADDRESS444555666',
          created_at: Date.now() - 86400000 * 7,
          contract_address: 'CONTRACTADDRESS777888999'
        },
        {
          app_id: 5004,
          job_title: '💻 Smart Contract Development (You: Freelancer)',
          job_status: 1,
          status_string: 'Funded',
          escrow_amount: 15000000,
          client_address: 'CLIENTADDRESS444555666',
          freelancer_address: activeAddress || 'FREELANCERADDRESS777888999',
          created_at: Date.now() - 86400000 * 3,
          contract_address: 'CONTRACTADDRESS000111222'
        },
        {
          app_id: 5006,
          job_title: '🖼️ NFT Collection Design (You: Freelancer - Ready to Submit)',
          job_status: 1,
          status_string: 'Funded',
          escrow_amount: 12000000,
          client_address: 'CLIENTADDRESS555666777',
          freelancer_address: activeAddress || 'FREELANCERADDRESS888999000',
          created_at: Date.now() - 86400000 * 5,
          contract_address: 'CONTRACTADDRESS333444555'
        },
        {
          app_id: 5008,
          job_title: '✅ Blog Content Writing (You: Freelancer - COMPLETED)',
          job_status: 3,
          status_string: 'Completed',
          escrow_amount: 3000000,
          client_address: 'CLIENTADDRESS999888777',
          freelancer_address: activeAddress || 'FREELANCERADDRESS666555444',
          created_at: Date.now() - 86400000 * 10,
          contract_address: 'CONTRACTADDRESS222333444'
        }
      ]

      // Apply filters
      let filteredJobs = mockJobs

      if (statusFilter !== undefined) {
        filteredJobs = filteredJobs.filter(job => job.job_status === statusFilter)
      }

      if (showMyJobs && activeAddress) {
        filteredJobs = filteredJobs.filter(
          job => job.client_address === activeAddress || job.freelancer_address === activeAddress
        )
      }

      const mockResponse: JobListResponse = {
        success: true,
        jobs: filteredJobs,
        total_count: filteredJobs.length,
        limit: 20,
        offset: 0,
        has_more: false
      }

      console.log('[MOCK] Jobs loaded:', mockResponse)
      setJobsData(mockResponse)

      /* REAL IMPLEMENTATION (currently bypassed):
      const params: any = {
        limit: 20,
        offset: 0,
      }

      if (statusFilter !== undefined) {
        params.status = statusFilter
      }

      if (showMyJobs && activeAddress) {
        params.client_address = activeAddress
        params.freelancer_address = activeAddress
      }

      const data = await api.listJobs(params)
      setJobsData(data)
      */
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to load jobs')
      }
    } finally {
      setLoading(false)
    }
  }

  const filterButtons = [
    { label: 'All', value: undefined },
    { label: 'Created', value: JobStatus.Created },
    { label: 'Funded', value: JobStatus.Funded },
    { label: 'Submitted', value: JobStatus.Submitted },
    { label: 'Completed', value: JobStatus.Completed },
  ]

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 pt-20">
        <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
              <Briefcase className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">All Jobs</h1>
              <p className="text-gray-400">
                {jobsData?.total_count || 0} {jobsData?.total_count === 1 ? 'job' : 'jobs'} found
              </p>
            </div>
          </div>

          <Link
            to="/create-job"
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition flex items-center border border-blue-400/20"
          >
            <Plus size={20} className="mr-2" />
            Create Job
          </Link>
        </div>

        {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6">
          <div className="flex items-center mb-4">
            <Filter size={20} className="text-blue-400 mr-2" />
            <span className="font-semibold text-white">Filters</span>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {filterButtons.map((btn) => (
                <button
                  key={btn.label}
                  onClick={() => setStatusFilter(btn.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    statusFilter === btn.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {activeAddress && (
              <label className="flex items-center text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showMyJobs}
                  onChange={(e) => setShowMyJobs(e.target.checked)}
                  className="mr-2 w-4 h-4"
                />
                Show only my jobs
              </label>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : jobsData && jobsData.jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobsData.jobs.map((job) => (
              <JobCard key={job.app_id} job={job} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
            <Briefcase className="text-gray-600 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-bold text-gray-400 mb-2">No Jobs Found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters or create a new job.</p>
            <Link
              to="/create-job"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg inline-flex items-center hover:shadow-lg transition border border-blue-400/20"
            >
              <Plus size={20} className="mr-2" />
              Create First Job
            </Link>
          </div>
        )}
        </div>
      </div>
    </>
  )
}
