import Navbar from '../components/Layout/Navbar'
import NFTGallery from '../components/portfolio/NFTGallery'

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <NFTGallery />
    </div>
  )
}