import Navbar from '../components/Layout/Navbar'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to AlgoFreelance
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Decentralized freelancing powered by Algorand
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-2">For Clients</h3>
              <p className="text-gray-600 mb-4">Post jobs and hire talented freelancers</p>
              <a href="/create" className="text-blue-600 hover:underline">Post a Job →</a>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-2">For Freelancers</h3>
              <p className="text-gray-600 mb-4">Find work and build your portfolio</p>
              <a href="/jobs" className="text-blue-600 hover:underline">Browse Jobs →</a>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-2">NFT Certificates</h3>
              <p className="text-gray-600 mb-4">Earn verifiable work certificates</p>
              <a href="/portfolio/demo" className="text-blue-600 hover:underline">View Portfolio →</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}