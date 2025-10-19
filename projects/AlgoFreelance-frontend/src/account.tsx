import { Briefcase, Shield, Award, Zap, ArrowRight, CheckCircle, Bell, Search, Plus, X, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    freelancerAddress: '',
    amount: '',
    deadline: ''
  });
  
  // Mock pending jobs data - now includes created jobs that haven't been accepted
  const [pendingJobs, setPendingJobs] = useState([
    {
      id: 1,
      title: "Logo Design for SaaS Startup",
      client: "CLIENT1ABC...XYZ",
      amount: "5.0 ALGO",
      status: "In Progress",
      deadline: "Oct 25, 2025",
      progress: 60,
      type: "accepted" // accepted by freelancer
    },
    {
      id: 2,
      title: "Smart Contract Audit",
      client: "CLIENT2DEF...ABC",
      amount: "15.0 ALGO",
      status: "Awaiting Approval",
      deadline: "Oct 22, 2025",
      progress: 100,
      type: "accepted" // accepted by freelancer
    },
    {
      id: 3,
      title: "Website Landing Page",
      client: "CLIENT3GHI...DEF",
      amount: "8.5 ALGO",
      status: "Not Started",
      deadline: "Nov 1, 2025",
      progress: 0,
      type: "accepted" // accepted by freelancer
    }
  ]);

  // Mock created jobs that haven't been accepted yet
  const [createdJobs, setCreatedJobs] = useState([
    {
      id: 4,
      title: "Mobile App UI/UX Design",
      amount: "12.0 ALGO",
      status: "Waiting for Freelancer",
      deadline: "Nov 5, 2025",
      progress: 0,
      type: "created", // created but not accepted
      createdAt: "2025-10-20"
    },
    {
      id: 5,
      title: "Smart Contract Development",
      amount: "25.0 ALGO",
      status: "Open for Applications",
      deadline: "Nov 10, 2025",
      progress: 0,
      type: "created", // created but not accepted
      createdAt: "2025-10-19"
    }
  ]);

  const handleCreateJob = (e) => {
    e.preventDefault();
    
    // Create new job object
    const newJob = {
      id: Date.now(), // Simple ID generation
      title: formData.title,
      amount: `${formData.amount} ALGO`,
      status: "Open for Applications",
      deadline: formData.deadline || "Not set",
      progress: 0,
      type: "created",
      createdAt: new Date().toISOString().split('T')[0]
    };

    // Add to created jobs
    setCreatedJobs(prev => [newJob, ...prev]);
    
    // Reset form and close modal
    setFormData({
      title: '',
      description: '',
      freelancerAddress: '',
      amount: '',
      deadline: ''
    });
    setShowCreateJobModal(false);
  };

  const handleCancelJob = (jobId) => {
    // Remove job from created jobs
    setCreatedJobs(prev => prev.filter(job => job.id !== jobId));
    
    // Here you would typically also call a smart contract function to cancel the job
    // and refund any escrowed funds
    console.log(`Canceling job ${jobId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="bg-gray-900/80 backdrop-blur-md border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                AlgoFreelance
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <button className="text-gray-300 hover:text-blue-400 font-medium transition">
                Dashboard
              </button>
              <button className="text-gray-300 hover:text-blue-400 font-medium transition">
                My Jobs
              </button>
              <button className="text-gray-300 hover:text-blue-400 font-medium transition">
                Portfolio
              </button>
              <button className="text-gray-300 hover:text-blue-400 font-medium transition">
                Browse
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-400 hover:text-blue-400 transition">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-purple-600/20 px-4 py-2 rounded-lg border border-blue-500/30">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  J
                </div>
                <div className="hidden md:flex items-center gap-2">
                  <span className="font-medium text-gray-300">Jamie</span>
                  <span className="text-gray-600">|</span>
                  <Link to="/">
                    <button className="font-medium text-gray-300 hover:text-blue-400 transition">
                        Sign Out
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-white">
            Welcome back, <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Jamie</span>! 👋
          </h1>
          <p className="text-gray-400 text-lg">Here's what's happening with your freelance projects today</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 hover:shadow-xl transition-all hover:-translate-y-1 hover:border-blue-500/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 font-medium">Active Jobs</span>
              <Briefcase className="text-blue-400" size={24} />
            </div>
            <p className="text-4xl font-bold text-white">{pendingJobs.length}</p>
            <p className="text-sm text-gray-500 mt-1">In progress</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 hover:shadow-xl transition-all hover:-translate-y-1 hover:border-purple-500/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 font-medium">Open Jobs</span>
              <Award className="text-purple-400" size={24} />
            </div>
            <p className="text-4xl font-bold text-white">{createdJobs.length}</p>
            <p className="text-sm text-gray-500 mt-1">Waiting for freelancers</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 hover:shadow-xl transition-all hover:-translate-y-1 hover:border-green-500/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 font-medium">Completed</span>
              <CheckCircle className="text-green-400" size={24} />
            </div>
            <p className="text-4xl font-bold text-white">12</p>
            <p className="text-sm text-gray-500 mt-1">All time</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 hover:shadow-xl transition-all hover:-translate-y-1 hover:border-yellow-500/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 font-medium">Success Rate</span>
              <Zap className="text-yellow-400" size={24} />
            </div>
            <p className="text-4xl font-bold text-white">100%</p>
            <p className="text-sm text-gray-500 mt-1">Perfect record</p>
          </div>
        </div>

        {/* Create New Job Button */}
        <div className="mb-8">
          <button 
            onClick={() => setShowCreateJobModal(true)}
            className="group bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl hover:shadow-2xl transition-all hover:scale-105 font-semibold flex items-center gap-3 border border-blue-400/20"
          >
            <Plus size={24} />
            Create New Job
            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
          </button>
        </div>

        {/* Created Jobs (Waiting for Acceptance) */}
        {createdJobs.length > 0 && (
          <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-yellow-600 to-orange-600 px-6 py-5 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Open Jobs</h2>
                <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-1 rounded-full text-sm font-medium">
                  {createdJobs.length} Waiting
                </span>
              </div>
              <p className="text-yellow-100 text-sm mt-2">These jobs are open for freelancers to accept</p>
            </div>
            <div className="divide-y divide-gray-700">
              {createdJobs.map(job => (
                <div key={job.id} className="p-6 hover:bg-gradient-to-r hover:from-gray-700/50 hover:to-gray-700/30 transition">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-white">{job.title}</h3>
                        <span className="ml-4 px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap bg-yellow-900/30 text-yellow-300 border border-yellow-700">
                          {job.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-400 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-300">Payment:</span>
                          <span className="font-bold text-yellow-400">{job.amount}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-300">Deadline:</span>
                          <span>{job.deadline}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-300">Created:</span>
                          <span>{job.createdAt}</span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-300">Progress</span>
                          <span className="text-sm font-bold text-white">{job.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all duration-500 shadow-sm"
                            style={{ width: `${job.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex lg:flex-col gap-2 lg:min-w-[160px]">
                      <button className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all hover:scale-105 font-medium border border-yellow-400/20">
                        View Details
                      </button>
                      <button 
                        onClick={() => handleCancelJob(job.id)}
                        className="flex-1 bg-gray-800 border-2 border-red-500 text-red-400 px-6 py-3 rounded-lg hover:bg-red-500/10 transition-all font-medium flex items-center justify-center gap-2"
                      >
                        <Trash2 size={16} />
                        Cancel Job
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Jobs (Accepted by Freelancers) */}
        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Active Work</h2>
              <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-1 rounded-full text-sm font-medium">
                {pendingJobs.length} In Progress
              </span>
            </div>
            <p className="text-blue-100 text-sm mt-2">These jobs have been accepted by freelancers</p>
          </div>
          <div className="divide-y divide-gray-700">
            {pendingJobs.map(job => (
              <div key={job.id} className="p-6 hover:bg-gradient-to-r hover:from-gray-700/50 hover:to-gray-700/30 transition">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-white">{job.title}</h3>
                      <span className={`ml-4 px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap border ${
                        job.status === 'In Progress' ? 'bg-blue-900/30 text-blue-300 border-blue-700' :
                        job.status === 'Awaiting Approval' ? 'bg-yellow-900/30 text-yellow-300 border-yellow-700' :
                        'bg-gray-700 text-gray-300 border-gray-600'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-400 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-300">Client:</span>
                        <span className="font-mono">{job.client}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-300">Payment:</span>
                        <span className="font-bold text-blue-400">{job.amount}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-300">Deadline:</span>
                        <span>{job.deadline}</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-300">Progress</span>
                        <span className="text-sm font-bold text-white">{job.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                          style={{ width: `${job.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex lg:flex-col gap-2 lg:min-w-[160px]">
                    <button className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all hover:scale-105 font-medium border border-blue-400/20">
                      View Details
                    </button>
                    {job.status === 'In Progress' && (
                      <button className="flex-1 bg-gray-800 border-2 border-blue-500 text-blue-400 px-6 py-3 rounded-lg hover:bg-blue-500/10 transition-all font-medium">
                        Submit Work
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 hover:shadow-xl transition-all hover:-translate-y-1 group cursor-pointer hover:border-blue-500/50">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Shield className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">View Portfolio</h3>
            <p className="text-gray-400 mb-4">Browse your NFT certificates and completed work history</p>
            <button className="text-blue-400 hover:text-purple-400 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
              Go to Portfolio <ArrowRight size={16} />
            </button>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 hover:shadow-xl transition-all hover:-translate-y-1 group cursor-pointer hover:border-purple-500/50">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Search className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Browse Jobs</h3>
            <p className="text-gray-400 mb-4">Discover new opportunities from clients worldwide</p>
            <button className="text-blue-400 hover:text-purple-400 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
              Explore Jobs <ArrowRight size={16} />
            </button>
          </div>
          <Link to="/wallet">
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 hover:shadow-xl transition-all hover:-translate-y-1 group cursor-pointer hover:border-yellow-500/50">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">Wallet</h3>
                <p className="text-gray-400 mb-4">Manage your ALGO balance and transaction history</p>
                <button className="text-blue-400 hover:text-purple-400 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                Open Wallet <ArrowRight size={16} />
                </button>
            </div>
           </Link>
        </div>
      </div>

      {/* Create Job Modal */}
      {showCreateJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowCreateJobModal(false)}
          ></div>
          
          {/* Modal */}
          <div className="relative bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full my-8 max-h-[85vh] flex flex-col border border-gray-700">
            {/* Header - Fixed */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5 flex items-center justify-between rounded-t-2xl flex-shrink-0 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">Create New Escrow Job</h2>
              <button 
                onClick={() => setShowCreateJobModal(false)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Form - Scrollable */}
            <div className="overflow-y-auto flex-1">
              <form onSubmit={handleCreateJob} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none transition text-white placeholder-gray-400"
                    placeholder="e.g., Logo Design for SaaS Startup"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none transition text-white placeholder-gray-400"
                    rows={5}
                    placeholder="Describe the project requirements, deliverables, and any specific guidelines..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Freelancer Address (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.freelancerAddress}
                    onChange={e => setFormData({...formData, freelancerAddress: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none transition font-mono text-sm text-white placeholder-gray-400"
                    placeholder="FREELANCERADDRESS... (leave empty for open applications)"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty to allow any freelancer to apply</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Payment Amount (ALGO) *
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={formData.amount}
                      onChange={e => setFormData({...formData, amount: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none transition text-white placeholder-gray-400"
                      placeholder="5.0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Deadline
                    </label>
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={e => setFormData({...formData, deadline: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none transition text-white"
                    />
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-300 mb-2 flex items-center gap-2">
                    <Shield size={18} />
                    How it works
                  </h3>
                  <ul className="text-sm text-blue-200 space-y-1">
                    <li>• Smart contract will be deployed to escrow the funds</li>
                    <li>• You'll need to fund the contract with the payment amount</li>
                    <li>• Freelancer submits work via IPFS when complete</li>
                    <li>• You approve the work to release payment</li>
                    <li>• You can cancel the job anytime before a freelancer accepts it</li>
                  </ul>
                </div>

                {/* Buttons - Fixed at bottom */}
                <div className="flex gap-3 pt-4 sticky bottom-0 bg-gray-800 pb-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateJobModal(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all hover:scale-105 font-semibold border border-blue-400/20"
                  >
                    Create & Deploy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}