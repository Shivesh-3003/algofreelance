import Navbar from '../components/Layout/Navbar'
import CreateJobForm from '../components/jobs/CreateJobForm'

export default function CreateJobPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <CreateJobForm />
    </div>
  )
}