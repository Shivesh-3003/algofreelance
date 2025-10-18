interface GigCardProps {
  title: string
  description: string
  price: number
  creator: string
}

export function GigCard({ title, description, price, creator }: GigCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>
      <div className="flex justify-between items-center">
        <span className="text-2xl font-light">{price} ALGO</span>
        <span className="text-sm text-gray-500">by {creator.slice(0, 6)}...</span>
      </div>
    </div>
  )
}