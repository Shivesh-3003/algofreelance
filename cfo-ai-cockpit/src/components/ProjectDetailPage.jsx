import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import AIInsight from './AIInsight'

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const formatCurrencyShort = (value) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`
  }
  return `$${value}`
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

function ProjectDetailPage({ project, onBack }) {
  const { name, status, spend, value, roi, details } = project
  const { description, chartData, metrics, aiInsight } = details

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium mb-4 transition-colors"
          >
            <span className="mr-2">←</span>
            Back to Dashboard
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{name}</h1>
              <p className="text-gray-600">{description}</p>
            </div>
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(status)}`}>
              <span className="mr-2">{getStatusIcon(status)}</span>
              {status}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
            <p className="text-sm font-medium text-gray-600 mb-1">Total Spend (YTD)</p>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(spend)}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <p className="text-sm font-medium text-gray-600 mb-1">Total Value (YTD)</p>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(value)}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <p className="text-sm font-medium text-gray-600 mb-1">ROI</p>
            <p className={`text-3xl font-bold ${roi > 1 ? 'text-green-600' : roi > 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {roi === 0 ? '0%' : `${(roi * 100).toFixed(0)}%`}
            </p>
          </div>
        </div>

        {/* Cost vs Value Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Cost vs. Value Over Time</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                stroke="#6b7280"
                style={{ fontSize: '14px' }}
              />
              <YAxis
                stroke="#6b7280"
                style={{ fontSize: '14px' }}
                tickFormatter={formatCurrencyShort}
              />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}
              />
              <Line
                type="monotone"
                dataKey="spend"
                stroke="#f59e0b"
                strokeWidth={3}
                name="Spend"
                dot={{ fill: '#f59e0b', r: 6 }}
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#059669"
                strokeWidth={3}
                name="Value"
                dot={{ fill: '#059669', r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Live Metrics Block */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Business Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(metrics).map(([key, value]) => (
              <div key={key} className="border-l-4 border-blue-500 pl-4">
                <p className="text-sm font-medium text-gray-600">{key}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI-Generated Insight Component - The "WOW" Factor */}
        <AIInsight insight={aiInsight} />
      </div>
    </div>
  )
}

export default ProjectDetailPage
