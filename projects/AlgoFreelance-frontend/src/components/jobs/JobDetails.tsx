import { useParams } from 'react-router-dom'

export default function JobDetails() {
  const { id } = useParams()
  
  // Mock job data
  const mockJob = {
    appId: id || '99999999',
    title: 'Logo Design for SaaS Startup',
    description: 'Need a modern, minimalist logo for our new SaaS product. Should convey trust and innovation.',
    clientAddress: 'CLIENT789XYZ...',
    freelancerAddress: 'FREELANCER123ABC...',
    amount: '5 ALGO',
    status: 'in_progress',
    createdAt: 'Oct 18, 2024',
    deadline: 'Oct 25, 2024'
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold">{mockJob.title}</h1>
          <span className={`px-3 py-1 rounded-full text-sm ${
            mockJob.status === 'in_progress' 
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
          }`}>
            {mockJob.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <h3 className="font-semibold text-gray-700">Description</h3>
            <p className="text-gray-600 mt-1">{mockJob.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-700">Client</h3>
              <p className="text-gray-600 font-mono text-sm mt-1">{mockJob.clientAddress}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Freelancer</h3>
              <p className="text-gray-600 font-mono text-sm mt-1">{mockJob.freelancerAddress}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <h3 className="font-semibold text-gray-700">Payment</h3>
              <p className="text-gray-600 mt-1">{mockJob.amount}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Created</h3>
              <p className="text-gray-600 mt-1">{mockJob.createdAt}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Deadline</h3>
              <p className="text-gray-600 mt-1">{mockJob.deadline}</p>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-700 mb-4">Actions</h3>
          <div className="flex gap-4">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Submit Work
            </button>
            <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
              Approve & Release Payment
            </button>
            <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700">
              Cancel Job
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}