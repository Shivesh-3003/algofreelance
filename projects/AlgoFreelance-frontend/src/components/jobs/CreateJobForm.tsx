import { useState } from 'react'

interface FormData {
  title: string
  description: string
  category: string
  freelancerAddress: string
  amount: string
  deadline: string
  requirements: string
}

export default function CreateJobForm() {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: 'development',
    freelancerAddress: '',
    amount: '',
    deadline: '',
    requirements: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mockResult, setMockResult] = useState<any>(null)

  const categories = [
    'Development',
    'Design',
    'Writing',
    'Marketing',
    'Consulting',
    'Other'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setMockResult({
      appId: Math.floor(Math.random() * 100000000),
      appAddress: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF4',
      txId: 'MOCKQYLJAD7LKCSE2LBCWAP4GIT6AHBNPQ6NDMR7URQVGZ3VU3DQ',
      fundingAmount: parseFloat(formData.amount) + 0.3
    })
    
    setIsSubmitting(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (mockResult) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-xl font-bold text-green-900 mb-2">
                Contract Deployed Successfully!
              </h3>
              <p className="text-green-700 mb-6">
                Your job escrow contract has been deployed to the Algorand blockchain.
              </p>
              
              <div className="bg-white rounded-lg p-4 space-y-3 mb-6">
                <div>
                  <span className="text-sm text-gray-600">Application ID:</span>
                  <p className="font-mono text-sm font-medium">{mockResult.appId}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Application Address:</span>
                  <p className="font-mono text-xs break-all">{mockResult.appAddress}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Transaction ID:</span>
                  <p className="font-mono text-xs break-all">{mockResult.txId}</p>
                </div>
                <div className="pt-2 border-t">
                  <span className="text-sm text-gray-600">Required Funding:</span>
                  <p className="text-lg font-bold text-gray-900">{mockResult.fundingAmount} ALGO</p>
                  <p className="text-xs text-gray-500 mt-1">
                    ({formData.amount} ALGO payment + 0.3 ALGO contract minimum balance)
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    // In real app, this would open wallet to fund
                    alert('Wallet connection would open here to fund the contract')
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Fund Contract Now
                </button>
                <button 
                  onClick={() => {
                    setMockResult(null)
                    setFormData({
                      title: '',
                      description: '',
                      category: 'development',
                      freelancerAddress: '',
                      amount: '',
                      deadline: '',
                      requirements: ''
                    })
                  }}
                  className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition"
                >
                  Create Another
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Job</h1>
        <p className="text-gray-600 mt-2">Post a job with escrow protection on Algorand</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="space-y-6">
          {/* Job Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Job Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="e.g., Logo Design for SaaS Startup"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              {categories.map(cat => (
                <option key={cat} value={cat.toLowerCase()}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              placeholder="Describe the work you need done..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Requirements */}
          <div>
            <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
              Requirements
            </label>
            <textarea
              id="requirements"
              name="requirements"
              value={formData.requirements}
              onChange={handleInputChange}
              rows={3}
              placeholder="Any specific skills or requirements..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Two columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Payment Amount (ALGO) *
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                required
                step="0.001"
                min="1"
                placeholder="5.0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Deadline */}
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
                Deadline *
              </label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Freelancer Address */}
          <div>
            <label htmlFor="freelancerAddress" className="block text-sm font-medium text-gray-700 mb-2">
              Freelancer Address (Optional)
            </label>
            <input
              type="text"
              id="freelancerAddress"
              name="freelancerAddress"
              value={formData.freelancerAddress}
              onChange={handleInputChange}
              placeholder="Leave empty to allow any freelancer to apply"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Specify a freelancer's Algorand address to assign the job directly to them
            </p>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Cost Breakdown</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Job Payment:</span>
                <span className="font-medium">{formData.amount || '0'} ALGO</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Contract Min Balance:</span>
                <span className="font-medium">0.3 ALGO</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 font-medium">
                <span>Total Required:</span>
                <span>{formData.amount ? (parseFloat(formData.amount) + 0.3).toFixed(3) : '0.3'} ALGO</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-6 rounded-lg font-medium transition ${
              isSubmitting
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Deploying Contract...
              </span>
            ) : (
              'Create Job & Deploy Contract'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}