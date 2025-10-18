import { Navbar } from './Layout/Navbar'
import { GigCard } from './Gigs/GigCard'

export function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-light text-center mb-4">
            Freelance on Algorand
          </h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto">
            Connect with clients and freelancers using the power of blockchain
          </p>
        </div>
      </div>

      {/* Gigs Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h3 className="text-2xl font-light mb-8">Featured Gigs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* This will be dynamic later */}
          <GigCard 
            title="Smart Contract Development"
            description="Need help building DeFi protocols on Algorand"
            price={500}
            creator="ALGO...XYZ"
          />
        </div>
      </div>
    </div>
  )
}