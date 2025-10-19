import { SupportedWallet, WalletId, WalletManager, WalletProvider } from '@txnlab/use-wallet-react'
import { SnackbarProvider } from 'notistack'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './Home'
import Account from './account'
import Wallet from './wallet'
import CreateJobPage from './pages/CreateJobPage'
import JobListPage from './pages/JobListPage'
import JobDetailsPage from './pages/JobDetailsPage'
import PortfolioPage from './pages/PortfolioPage'
import { getAlgodConfigFromViteEnvironment, getKmdConfigFromViteEnvironment } from './utils/network/getAlgoClientConfigs'

let supportedWallets: SupportedWallet[]
if (import.meta.env.VITE_ALGOD_NETWORK === 'localnet') {
  const kmdConfig = getKmdConfigFromViteEnvironment()
  supportedWallets = [
    {
      id: WalletId.KMD,
      options: {
        baseServer: kmdConfig.server,
        token: String(kmdConfig.token),
        port: String(kmdConfig.port),
      },
    },
  ]
} else {
  supportedWallets = [
    { id: WalletId.DEFLY },
    { id: WalletId.PERA },
    { id: WalletId.EXODUS },
    // If you are interested in WalletConnect v2 provider
    // refer to https://github.com/TxnLab/use-wallet for detailed integration instructions
  ]
}

export default function App() {
  const algodConfig = getAlgodConfigFromViteEnvironment()

  const walletManager = new WalletManager({
    wallets: supportedWallets,
    defaultNetwork: algodConfig.network,
    networks: {
      [algodConfig.network]: {
        algod: {
          baseServer: algodConfig.server,
          port: algodConfig.port,
          token: String(algodConfig.token),
        },
      },
    },
    options: {
      resetNetwork: true,
    },
  })

  return (
    <SnackbarProvider maxSnack={3}>
      <WalletProvider manager={walletManager}>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/account" element={<Account />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/create-job" element={<CreateJobPage />} />
            <Route path="/jobs" element={<JobListPage />} />
            <Route path="/job/:appId" element={<JobDetailsPage />} />
            <Route path="/portfolio/:address?" element={<PortfolioPage />} />
          </Routes>
        </Router>
      </WalletProvider>
    </SnackbarProvider>
  )
}