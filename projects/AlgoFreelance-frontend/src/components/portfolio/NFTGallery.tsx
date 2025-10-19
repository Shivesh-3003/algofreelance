const mockCertificates = [
  {
    assetId: 87654321,
    jobTitle: "Logo Design for Tech Startup",
    clientAddress: "7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF4",
    amount: "5",
    completedAt: "2024-10-18",
    ipfsUrl: "ipfs://QmXyz123abc",
    rating: 5,
    review: "Excellent work! Very professional and creative."
  },
  {
    assetId: 87654322,
    jobTitle: "E-commerce Website Development",
    clientAddress: "UBX4ZDHHBF5YXUZ5W4HV3FGXRXMXBKL3JUKGQEJR5NHFQFMS6JHESKMKMY",
    amount: "15",
    completedAt: "2024-10-15",
    ipfsUrl: "ipfs://QmXyz124def",
    rating: 5,
    review: "Delivered on time, great communication throughout."
  },
  {
    assetId: 87654323,
    jobTitle: "Smart Contract Security Audit",
    clientAddress: "ALGORAND7XJLVMM4CN7R3M3FP2U2SJ3K5D5KRWIVAQ2X7M5F4JHQZOFNDI",
    amount: "20",
    completedAt: "2024-10-10",
    ipfsUrl: "ipfs://QmXyz125ghi",
    rating: 5,
    review: "Thorough audit with detailed report. Highly recommended!"
  }
]

export default function NFTGallery() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Work Certificates</h1>
        <p className="text-gray-600 mt-2">Proof of completed work on the blockchain</p>
        <div className="mt-4 flex items-center gap-6">
          <div>
            <span className="text-2xl font-bold text-blue-600">{mockCertificates.length}</span>
            <span className="text-gray-600 ml-2">Total Jobs</span>
          </div>
          <div>
            <span className="text-2xl font-bold text-green-600">
              {mockCertificates.reduce((sum, cert) => sum + parseInt(cert.amount), 0)} ALGO
            </span>
            <span className="text-gray-600 ml-2">Total Earned</span>
          </div>
        </div>
      </div>

      {/* NFT Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCertificates.map((cert) => (
          <div
            key={cert.assetId}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            {/* NFT Visual */}
            <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <div className="text-white text-center">
                <p className="text-xs uppercase tracking-wider mb-1">Certificate NFT</p>
                <p className="text-3xl font-bold">#{cert.assetId}</p>
                <div className="mt-2 flex justify-center">
                  {[...Array(cert.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-300 text-xl">★</span>
                  ))}
                </div>
              </div>
              <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm rounded px-2 py-1">
                <span className="text-white text-xs font-medium">ASA {cert.assetId}</span>
              </div>
            </div>

            {/* Certificate Details */}
            <div className="p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{cert.jobTitle}</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment:</span>
                  <span className="font-medium text-gray-900">{cert.amount} ALGO</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500">Completed:</span>
                  <span className="text-gray-900">
                    {new Date(cert.completedAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div>
                  <span className="text-gray-500">Client:</span>
                  <p className="font-mono text-xs text-gray-700 mt-1">
                    {cert.clientAddress.slice(0, 8)}...{cert.clientAddress.slice(-8)}
                  </p>
                </div>
              </div>

              {/* Review */}
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600 italic">"{cert.review}"</p>
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2">
                <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
                  View on Explorer
                </button>
                <button className="flex-1 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition">
                  Share
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State (hidden when certificates exist) */}
      {mockCertificates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No certificates yet</h3>
          <p className="text-gray-600 mb-6">Complete your first job to earn an NFT certificate</p>
          <a href="/jobs" className="inline-flex items-center text-blue-600 hover:text-blue-700">
            Browse available jobs
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      )}
    </div>
  )
}