import { Link } from 'react-router-dom'
import { ConnectWallet } from '../ConnectWallet'

export default function Navbar() {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-blue-600">
              AlgoFreelance
            </Link>
            <div className="ml-10 space-x-4">
              <Link to="/create" className="text-gray-700 hover:text-blue-600">
                Create Job
              </Link>
              <Link to="/portfolio/demo" className="text-gray-700 hover:text-blue-600">
                Portfolio
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <ConnectWallet />
          </div>
        </div>
      </div>
    </nav>
  )
}