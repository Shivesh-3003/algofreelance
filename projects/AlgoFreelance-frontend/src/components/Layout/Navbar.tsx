import { ConnectWallet } from '../ConnectWallet'

export function Navbar() {
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <h1 className="text-2xl font-light tracking-tight">AlgoFreelance</h1>
          <div className="flex items-center space-x-8">
            <a href="#" className="text-gray-600 hover:text-gray-900">Find Work</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">Post Gig</a>
            <ConnectWallet />
          </div>
        </div>
      </div>
    </nav>
  )
}