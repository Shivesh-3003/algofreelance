import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const formatROI = (value) => {
  if (value === 0) return '0%'
  return `${(value * 100).toFixed(0)}%`
}

const getStatusColor = (status) => {
  switch (status) {
    case 'Scaling':
      return 'bg-green-100 text-green-800 border-green-300'
    case 'In-Pilot':
      return 'bg-blue-100 text-blue-800 border-blue-300'
    case 'At Risk':
      return 'bg-red-100 text-red-800 border-red-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

const getStatusIcon = (status) => {
  switch (status) {
    case 'Scaling':
      return '🟢'
    case 'In-Pilot':
      return '🟡'
    case 'At Risk':
      return '🔴'
    default:
      return '⚪'
  }
}

function Dashboard({ data, onSelectProject }) {
  const { kpis, projects } = data

  // Calculate status distribution for pie chart
  const statusCounts = projects.reduce((acc, project) => {
    acc[project.status] = (acc[project.status] || 0) + 1
    return acc
  }, {})

  const pieData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status,
    value: count
  }))

  const COLORS = {
    'Scaling': '#059669',
    'In-Pilot': '#3b82f6',
    'At Risk': '#dc2626'
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">CFO AI Cockpit</h1>
        <p className="text-gray-600">Your control tower for AI investment ROI</p>
      </div>

      {/* KPI Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <p className="text-sm font-medium text-gray-600 mb-1">Total AI Value (YTD)</p>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(kpis.totalValue)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <p className="text-sm font-medium text-gray-600 mb-1">Total AI Spend (YTD)</p>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(kpis.totalSpend)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <p className="text-sm font-medium text-gray-600 mb-1">Net AI ROI</p>
          <p className="text-3xl font-bold text-green-600">{(kpis.netROI * 100).toFixed(0)}%</p>
          <p className="text-xs text-gray-500 mt-1">Return on Investment</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Portfolio Status Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Portfolio Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">{projects.length} Active Projects</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Portfolio Insights</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-700">Projects Scaling</p>
                <p className="text-2xl font-bold text-green-600">
                  {projects.filter(p => p.status === 'Scaling').length}
                </p>
              </div>
              <div className="text-4xl">🚀</div>
            </div>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-700">Projects At Risk</p>
                <p className="text-2xl font-bold text-red-600">
                  {projects.filter(p => p.status === 'At Risk').length}
                </p>
              </div>
              <div className="text-4xl">⚠️</div>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-700">Pilots Running</p>
                <p className="text-2xl font-bold text-blue-600">
                  {projects.filter(p => p.status === 'In-Pilot').length}
                </p>
              </div>
              <div className="text-4xl">🧪</div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Portfolio Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">AI Project Portfolio</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Spend (YTD)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value (YTD)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ROI
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projects.map((project) => (
                <tr
                  key={project.id}
                  onClick={() => onSelectProject(project.id)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{project.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                      <span className="mr-1">{getStatusIcon(project.status)}</span>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {formatCurrency(project.spend)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {formatCurrency(project.value)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <span className={`font-semibold ${project.roi > 1 ? 'text-green-600' : project.roi > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      {formatROI(project.roi)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer hint */}
      <div className="mt-6 text-center text-sm text-gray-500">
        Click on any project to view detailed analysis
      </div>
    </div>
  )
}

export default Dashboard
