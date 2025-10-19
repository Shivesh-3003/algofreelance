import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import CreateJobPage from './pages/CreateJobPage'
import JobDetailsPage from './pages/JobDetailsPage'
import PortfolioPage from './pages/PortfolioPage'
import { WalletProvider } from '@txnlab/use-wallet'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create" element={<CreateJobPage />} />
            <Route path="/jobs/:id" element={<JobDetailsPage />} />
            <Route path="/portfolio/:address" element={<PortfolioPage />} />
          </Routes>
        </BrowserRouter>
      </WalletProvider>
    </QueryClientProvider>
  )
}

export default App