const getInsightStyle = (type) => {
  switch (type) {
    case 'positive':
      return {
        container: 'bg-green-50 border-green-500',
        icon: '✨',
        iconBg: 'bg-green-100',
        titleColor: 'text-green-900',
        textColor: 'text-green-800'
      }
    case 'negative':
      return {
        container: 'bg-red-50 border-red-500',
        icon: '⚠️',
        iconBg: 'bg-red-100',
        titleColor: 'text-red-900',
        textColor: 'text-red-800'
      }
    case 'neutral':
      return {
        container: 'bg-blue-50 border-blue-500',
        icon: 'ℹ️',
        iconBg: 'bg-blue-100',
        titleColor: 'text-blue-900',
        textColor: 'text-blue-800'
      }
    default:
      return {
        container: 'bg-gray-50 border-gray-500',
        icon: 'ℹ️',
        iconBg: 'bg-gray-100',
        titleColor: 'text-gray-900',
        textColor: 'text-gray-800'
      }
  }
}

function AIInsight({ insight }) {
  const { type, title, reason, recommendation } = insight
  const style = getInsightStyle(type)

  return (
    <div className={`rounded-lg border-l-4 p-6 ${style.container} shadow-lg`}>
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${style.iconBg} rounded-full p-3 mr-4`}>
          <span className="text-2xl">{style.icon}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center mb-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 mr-2">
              AI INSIGHT
            </span>
            <span className="text-xs text-gray-500">Powered by Claude</span>
          </div>
          <h3 className={`text-xl font-bold mb-3 ${style.titleColor}`}>
            {title}
          </h3>
          <div className="space-y-3">
            <div>
              <p className={`text-sm font-semibold ${style.textColor} mb-1`}>
                Analysis:
              </p>
              <p className={`text-sm ${style.textColor}`}>
                {reason}
              </p>
            </div>
            <div>
              <p className={`text-sm font-semibold ${style.textColor} mb-1`}>
                Recommendation:
              </p>
              <p className={`text-sm ${style.textColor} font-medium`}>
                {recommendation}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIInsight
