import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import ProjectDetailPage from './components/ProjectDetailPage'

function App() {
  const [data, setData] = useState(null)
  const [selectedProjectId, setSelectedProjectId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/data.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load data')
        }
        return response.json()
      })
      .then(jsonData => {
        setData(jsonData)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading CFO AI Cockpit...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {selectedProjectId === null ? (
        <Dashboard
          data={data}
          onSelectProject={setSelectedProjectId}
        />
      ) : (
        <ProjectDetailPage
          project={data.projects.find(p => p.id === selectedProjectId)}
          onBack={() => setSelectedProjectId(null)}
        />
      )}
    </div>
  )
}

export default App
