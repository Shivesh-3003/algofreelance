import { useParams } from 'react-router-dom'
import { useState } from 'react'

interface Job {
  appId: string
  title: string
  description: string
  requirements: string
  category: string
  clientAddress: string
  freelancerAddress: string
  amount: string
  status: 'open' | 'in_progress' | 'submitted' | 'completed' | 'cancelled'
  createdAt: string
  deadline: string
  submittedWork?: {
    ipfsHash: string
    submittedAt: string
    description: string
  }
}

export default function JobDetails() {
  const { id } = useParams()
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [workDescription, setWorkDescription] = useState('')
  const [ipfsHash, setIpfsHash] = useState('')

  // Mock job data
  const job: Job = {
    appId: id || '99999999',
    title: 'Modern Logo Design for Tech Startup',
    description:
      'We need a modern, minimalist logo for our new SaaS product. The logo should convey trust, innovation, and simplicity. We prefer blue and white colors but are open to creative suggestions.',
    requirements:
      'Experience with tech company branding, portfolio of minimalist designs, ability to provide multiple concepts and revisions',
    category: 'Design',
    clientAddress: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF4',
    freelancerAddress: 'UBX4ZDHHBF5YXUZ5W4HV3FGXRXMXBKL3JUKGQEJR5NHFQFMS6JHESKMKMY',
    amount: '5',
    status: 'in_progress',
    createdAt: '2024-10-18T10:00:00Z',
    deadline: '2024-10-25T23:59:59Z',
  }

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'submitted':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handleSubmitWork = () => {
    // Mock submission
    console.log('Submitting work:', { workDescription, ipfsHash })
    setShowSubmitModal(false)
    alert('Work submitted successfully! (This is a mock submission)')
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                App ID: {job.appId}
              </span>
              <span className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                {job.category}
              </span>
            </div>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}
          >
            {job.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        {/* Payment Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Payment Amount</span>
            <span className="text-2xl font-bold text-gray-900">{job.amount} ALGO</span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
          <p className="text-gray-700 leading-relaxed">{job.description}</p>
        </div>

        {/* Requirements */}
        {job.requirements && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Requirements</h3>
            <p className="text-gray-700 leading-relaxed">{job.requirements}</p>
          </div>
        )}

        {/* Participants */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-1">Client</h4>
            <p className="font-mono text-sm bg-gray-100 p-2 rounded break-all">
              {job.clientAddress}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-1">Freelancer</h4>
            <p className="font-mono text-sm bg-gray-100 p-2 rounded break-all">
              {job.freelancerAddress}
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex gap-8 text-sm">
          <div>
            <span className="text-gray-600">Created:</span>
            <span className="ml-2 text-gray-900">{formatDate(job.createdAt)}</span>
          </div>
          <div>
            <span className="text-gray-600">Deadline:</span>
            <span className="ml-2 text-gray-900">{formatDate(job.deadline)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>

        <div className="flex flex-wrap gap-3">
          {job.status === 'in_progress' && (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Submit Work
            </button>
          )}

          {job.status === 'submitted' && (
            <>
              <button className="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition font-medium">
                Approve & Release Payment
              </button>
              <button className="bg-yellow-600 text-white px-6 py-2.5 rounded-lg hover:bg-yellow-700 transition font-medium">
                Request Revision
              </button>
            </>
          )}

          {(job.status === 'open' || job.status === 'in_progress') && (
            <button className="bg-red-600 text-white px-6 py-2.5 rounded-lg hover:bg-red-700 transition font-medium">
              Cancel Job
            </button>
          )}

          <button className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-50 transition font-medium">
            View on Explorer
          </button>
        </div>
      </div>

      {/* Submit Work Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Submit Work</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Description
                </label>
                <textarea
                  value={workDescription}
                  onChange={(e) => setWorkDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the work you've completed..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IPFS Hash (optional)
                </label>
                <input
                  type="text"
                  value={ipfsHash}
                  onChange={(e) => setIpfsHash(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="QmXyz..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload your work files to IPFS and provide the hash
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmitWork}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Submit Work
              </button>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
