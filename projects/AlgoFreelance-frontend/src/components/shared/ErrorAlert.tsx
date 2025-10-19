import { AlertCircle, X } from 'lucide-react'

interface ErrorAlertProps {
  title?: string
  message: string
  onClose?: () => void
}

export default function ErrorAlert({ title = 'Error', message, onClose }: ErrorAlertProps) {
  return (
    <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <AlertCircle className="text-red-500 mt-0.5 mr-3" size={20} />
        <div className="flex-1">
          <h3 className="text-red-400 font-semibold mb-1">{title}</h3>
          <p className="text-red-300 text-sm">{message}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-red-400 hover:text-red-300">
            <X size={20} />
          </button>
        )}
      </div>
    </div>
  )
}
