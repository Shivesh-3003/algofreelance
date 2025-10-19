import { Link, useLocation } from 'react-router-dom'
import { useWallet } from '@txnlab/use-wallet-react'
import { Home, Plus, Award, User, Briefcase } from 'lucide-react'

export default function Navbar() {
  const location = useLocation()
  const { activeAddress } = useWallet()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/jobs', label: 'Jobs', icon: Briefcase },
    { path: '/create-job', label: 'Create Job', icon: Plus },
    { path: '/portfolio', label: 'Portfolio', icon: Award },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/logo.jpeg"
              alt="AlgoFreelance Logo"
              className="w-10 h-10 rounded-lg object-cover"
            />
            <span className="text-white font-bold text-xl hidden sm:block">AlgoFreelance</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1 sm:space-x-4">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition ${
                  isActive(path)
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span className="hidden sm:inline text-sm font-medium">{label}</span>
              </Link>
            ))}
          </div>

          {/* Wallet Address Display */}
          <div className="flex items-center">
            {activeAddress ? (
              <div className="flex items-center space-x-2 bg-gray-800 px-3 py-2 rounded-lg">
                <User size={16} className="text-green-400" />
                <span className="text-white text-sm font-mono hidden md:block">
                  {activeAddress.substring(0, 6)}...{activeAddress.substring(activeAddress.length - 4)}
                </span>
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              </div>
            ) : (
              <div className="text-gray-400 text-sm">
                No wallet connected
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
