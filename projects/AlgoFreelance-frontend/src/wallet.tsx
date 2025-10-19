import { Wallet, Copy, ExternalLink, TrendingUp, Clock, ArrowUpRight, ArrowDownLeft, Send, Download, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '@txnlab/use-wallet-react'
import { useState, useEffect } from 'react'
import ConnectWallet from './components/ConnectWallet'

export default function WalletPage() {
  const navigate = useNavigate()
  const { activeAddress, wallets } = useWallet()
  const [openConnectWalletModal, setOpenConnectWalletModal] = useState(false)
  const [walletBalance, setWalletBalance] = useState('0.00') // Initialize with 0 or fetch from API

  const transactions = [
    {
      id: 1,
      type: 'received',
      amount: '15.0',
      from: 'CLIENT2DEF...ABC',
      description: 'Payment for Smart Contract Audit',
      date: 'Oct 18, 2025',
      time: '2:45 PM',
      txId: 'TXN123ABCDEFGHIJKLMNOP',
      status: 'completed',
    },
    {
      id: 2,
      type: 'sent',
      amount: '2.5',
      to: 'PLATFORM...XYZ',
      description: 'Contract deployment fee',
      date: 'Oct 15, 2025',
      time: '10:30 AM',
      txId: 'TXN456DEFGHIJKLMNOPQRS',
      status: 'completed',
    },
    {
      id: 3,
      type: 'received',
      amount: '8.5',
      from: 'CLIENT3GHI...DEF',
      description: 'Payment for Website Landing Page',
      date: 'Oct 12, 2025',
      time: '4:15 PM',
      txId: 'TXN789GHIJKLMNOPQRSTUV',
      status: 'completed',
    },
    {
      id: 4,
      type: 'received',
      amount: '5.0',
      from: 'CLIENT1ABC...XYZ',
      description: 'Payment for Logo Design',
      date: 'Oct 8, 2025',
      time: '11:20 AM',
      txId: 'TXN012JKLMNOPQRSTUVWXY',
      status: 'completed',
    },
    {
      id: 5,
      type: 'sent',
      amount: '1.0',
      to: 'ESCROW...ABC',
      description: 'Gas fee for contract execution',
      date: 'Oct 5, 2025',
      time: '9:00 AM',
      txId: 'TXN345MNOPQRSTUVWXYZAB',
      status: 'completed',
    },
  ]

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleLogout = async () => {
    if (wallets) {
      const activeWallet = wallets.find((w) => w.isActive)
      if (activeWallet) {
        await activeWallet.disconnect()
      } else {
        localStorage.removeItem('@txnlab/use-wallet:v3')
        window.location.reload()
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-gray-300 hover:text-blue-400 mb-6 transition">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Dashboard</span>
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Wallet</span>
          </h1>
          <p className="text-gray-400 text-lg">Manage your ALGO balance and transactions</p>
        </div>

        {!activeAddress ? (
          <div className="bg-gray-800 rounded-2xl p-8 text-white shadow-2xl mb-8 border border-gray-700 text-center">
            <p className="text-xl mb-4">Connect your wallet to view your balance and transactions.</p>
            <button
              onClick={() => setOpenConnectWalletModal(true)}
              className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all hover:scale-105 font-semibold flex items-center justify-center gap-2 mx-auto"
            >
              <Wallet size={20} />
              Connect Wallet
            </button>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl mb-8 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                  <Wallet size={24} />
                </div>
                <div>
                  <p className="text-blue-200 text-sm font-medium">Total Balance</p>
                  <p className="text-xs text-blue-300">Available to spend</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(activeAddress)}
                  className="p-3 hover:bg-white/20 rounded-lg transition backdrop-blur-sm border border-white/20"
                  title="Copy address"
                >
                  <Copy size={20} />
                </button>
                <a
                  href={`https://testnet.explorer.perawallet.app/address/${activeAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 hover:bg-white/20 rounded-lg transition backdrop-blur-sm border border-white/20"
                  title="View on explorer"
                >
                  <ExternalLink size={20} />
                </a>
              </div>
            </div>

            <div className="mb-4">
              <span className="text-6xl md:text-7xl font-bold">{walletBalance}</span>
              <span className="text-3xl ml-3 text-blue-200">ALGO</span>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6 border border-white/20">
              <p className="text-blue-200 text-xs mb-1">Wallet Address</p>
              <p className="font-mono text-sm break-all text-white">{activeAddress}</p>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 bg-white text-blue-700 px-6 py-4 rounded-xl hover:bg-blue-100 transition-all hover:scale-105 font-semibold flex items-center justify-center gap-2 border border-blue-300">
                <Send size={20} />
                Send ALGO
              </button>
              <button className="flex-1 bg-white/20 backdrop-blur-sm text-white px-6 py-4 rounded-xl hover:bg-white/30 transition-all font-semibold flex items-center justify-center gap-2 border border-white/30">
                <Download size={20} />
                Receive
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-600 text-white px-6 py-4 rounded-xl hover:bg-red-700 transition-all hover:scale-105 font-semibold flex items-center justify-center gap-2 border border-red-300"
              >
                Logout
              </button>
            </div>
          </div>
        )}

        {activeAddress && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 hover:border-green-500/50 transition">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-900/50 rounded-xl flex items-center justify-center border border-green-800">
                    <ArrowDownLeft className="text-green-400" size={24} />
                  </div>
                  <TrendingUp className="text-green-400" size={20} />
                </div>
                <p className="text-gray-400 text-sm font-medium mb-1">Total Received</p>
                <p className="text-3xl font-bold text-white">28.5</p>
                <p className="text-sm text-gray-500 mt-1">ALGO • 4 transactions</p>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 hover:border-red-500/50 transition">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-red-900/50 rounded-xl flex items-center justify-center border border-red-800">
                    <ArrowUpRight className="text-red-400" size={24} />
                  </div>
                </div>
                <p className="text-gray-400 text-sm font-medium mb-1">Total Sent</p>
                <p className="text-3xl font-bold text-white">3.5</p>
                <p className="text-sm text-gray-500 mt-1">ALGO • 2 transactions</p>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 hover:border-orange-500/50 transition">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-900/50 rounded-xl flex items-center justify-center border border-orange-800">
                    <Clock className="text-orange-400" size={24} />
                  </div>
                </div>
                <p className="text-gray-400 text-sm font-medium mb-1">In Escrow</p>
                <p className="text-3xl font-bold text-white">28.5</p>
                <p className="text-sm text-gray-500 mt-1">ALGO • 3 active jobs</p>
              </div>
            </div>

            {/* Transaction History */}
            <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Transaction History</h2>
                  <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-1 rounded-full text-sm font-medium">
                    {transactions.length} Total
                  </span>
                </div>
              </div>

              <div className="divide-y divide-gray-700">
                {transactions.map((tx) => (
                  <div key={tx.id} className="p-6 hover:bg-gradient-to-r hover:from-gray-700/50 hover:to-gray-700/30 transition">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Icon */}
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                            tx.type === 'received' ? 'bg-green-900/30 border-green-800' : 'bg-red-900/30 border-red-800'
                          }`}
                        >
                          {tx.type === 'received' ? (
                            <ArrowDownLeft className="text-green-400" size={24} />
                          ) : (
                            <ArrowUpRight className="text-red-400" size={24} />
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                tx.type === 'received'
                                  ? 'bg-green-900/50 text-green-300 border-green-800'
                                  : 'bg-red-900/50 text-red-300 border-red-800'
                              }`}
                            >
                              {tx.type === 'received' ? 'Received' : 'Sent'}
                            </span>
                            <span className="text-sm text-gray-400">
                              {tx.date} • {tx.time}
                            </span>
                          </div>
                          <p className="font-semibold text-white mb-2 text-lg">{tx.description}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-300 mb-3">
                            <span className="font-medium">{tx.type === 'received' ? 'From:' : 'To:'}</span>
                            <span className="font-mono">{tx.from || tx.to}</span>
                          </div>

                          {/* Transaction ID */}
                          <div className="flex items-center gap-2 bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                            <span className="text-xs text-gray-400 font-medium">Tx ID:</span>
                            <span className="text-xs font-mono text-gray-300 flex-1 truncate">{tx.txId}</span>
                            <button
                              onClick={() => copyToClipboard(tx.txId)}
                              className="p-1.5 hover:bg-gray-600 rounded transition"
                              title="Copy transaction ID"
                            >
                              <Copy size={14} className="text-gray-400" />
                            </button>
                            <a
                              href={`https://testnet.explorer.perawallet.app/tx/${tx.txId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 hover:bg-gray-600 rounded transition"
                              title="View on explorer"
                            >
                              <ExternalLink size={14} className="text-gray-400" />
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-right lg:min-w-[120px]">
                        <p className={`text-3xl font-bold ${tx.type === 'received' ? 'text-green-400' : 'text-red-400'}`}>
                          {tx.type === 'received' ? '+' : '-'}
                          {tx.amount}
                        </p>
                        <p className="text-sm text-gray-400 font-medium">ALGO</p>
                        <span className="inline-block mt-2 px-2 py-1 bg-green-900/50 text-green-300 text-xs font-medium rounded border border-green-800">
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      <ConnectWallet openModal={openConnectWalletModal} closeModal={() => setOpenConnectWalletModal(false)} />
    </div>
  )
}
