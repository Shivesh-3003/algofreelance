import { Briefcase, Shield, Award, Zap, ArrowRight, CheckCircle, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom'
import ConnectWallet from './components/ConnectWallet';

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openConnectWalletModal, setOpenConnectWalletModal] = useState(false);

  const features = [
    {
      icon: Shield,
      title: "Escrow Protection",
      description: "Smart contracts hold funds securely until work is approved"
    },
    {
      icon: Award,
      title: "NFT Certificates",
      description: "Build an on-chain portfolio with proof of completed work"
    },
    {
      icon: Zap,
      title: "Instant Payments",
      description: "Get paid immediately after approval—no waiting periods"
    },
    {
      icon: Briefcase,
      title: "Transparent Process",
      description: "All transactions visible on Algorand blockchain"
    }
  ];

  const steps = [
    { num: "1", text: "Client creates job and deposits funds into escrow" },
    { num: "2", text: "Freelancer completes work and submits via IPFS" },
    { num: "3", text: "Client approves and releases payment" },
    { num: "4", text: "Freelancer receives certificate NFT for portfolio" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="bg-gray-900/80 backdrop-blur-md border-b border-gray-700 fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                AlgoFreelance
              </span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-300 hover:text-blue-400 transition">Features</a>
              <a href="#how-it-works" className="text-gray-300 hover:text-blue-400 transition">How It Works</a>
              <a href="#portfolio" className="text-gray-300 hover:text-blue-400 transition">Portfolio</a>
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-gray-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <button 
              onClick={() => setOpenConnectWalletModal(true)}
              className="hidden md:block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all hover:scale-105 border border-blue-400/20"
            >
              Sign In
            </button>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              <a href="#features" className="block text-gray-300 hover:text-blue-400 py-2">Features</a>
              <a href="#how-it-works" className="block text-gray-300 hover:text-blue-400 py-2">How It Works</a>
              <a href="#portfolio" className="block text-gray-300 hover:text-blue-400 py-2">Portfolio</a>
              <button 
                onClick={() => setOpenConnectWalletModal(true)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg mt-2 border border-blue-400/20"
              >
                Connect Wallet
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium border border-blue-500/30">
            Powered by Algorand Blockchain
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Secure Freelancing
            </span>
            <br />
            <span className="text-white">Without the Risk</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Smart contract escrow ensures freelancers get paid and clients get quality work. 
            Build an immutable portfolio with NFT certificates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="group bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl hover:shadow-2xl transition-all hover:scale-105 font-semibold flex items-center justify-center border border-blue-400/20">
              Create Your First Job
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
            </button>
            <button className="bg-gray-800 text-white px-8 py-4 rounded-xl border-2 border-gray-600 hover:border-blue-500 transition-all hover:shadow-lg font-semibold">
              View Demo Portfolio
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-800/50 backdrop-blur-sm border-y border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "$0", label: "Platform Fees" },
              { value: "100%", label: "On-Chain Security" },
              { value: "<1s", label: "Transaction Speed" },
              { value: "∞", label: "Portfolio Proof" }
            ].map((stat, i) => (
              <div key={i} className="p-6">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm md:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-white">Why AlgoFreelance?</h2>
            <p className="text-xl text-gray-400">Built on trust, powered by blockchain</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <div 
                key={i}
                className="bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border border-gray-700 hover:border-blue-500/50"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-blue-100">Simple, secure, and transparent</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition">
                  <div className="w-12 h-12 bg-white text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                    {step.num}
                  </div>
                  <p className="text-white/90">{step.text}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="text-white/50" size={32} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="portfolio" className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-white">Ready to Start?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Join the future of trustless freelancing on Algorand
          </p>
          <div className="bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="text-left">
                <h3 className="text-xl font-bold mb-3 flex items-center text-white">
                  <CheckCircle className="text-green-400 mr-2" size={20} />
                  For Clients
                </h3>
                <ul className="space-y-2 text-gray-400">
                  <li>• Only pay for approved work</li>
                  <li>• Funds secured in escrow</li>
                  <li>• Full refund if work not delivered</li>
                </ul>
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold mb-3 flex items-center text-white">
                  <CheckCircle className="text-green-400 mr-2" size={20} />
                  For Freelancers
                </h3>
                <ul className="space-y-2 text-gray-400">
                  <li>• Guaranteed payment on approval</li>
                  <li>• Build verifiable portfolio</li>
                  <li>• Instant fund release</li>
                </ul>
              </div>
            </div>
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-10 py-4 rounded-xl hover:shadow-2xl transition-all hover:scale-105 font-semibold border border-blue-400/20">
              Create Your First Job Now
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
            <span className="text-xl font-bold">AlgoFreelance</span>
          </div>
          <p className="text-gray-400 mb-4">Decentralized freelancing on Algorand</p>
          <div className="text-sm text-gray-500">
            Built with ❤️ using React, Vite & Algorand
          </div>
        </div>
      </footer>
      <ConnectWallet openModal={openConnectWalletModal} closeModal={() => setOpenConnectWalletModal(false)} />
    </div>
  );
}