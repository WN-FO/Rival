import React from 'react'
import { CheckIcon, XCircleIcon, XIcon } from './icons'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastProps {
  type: ToastType
  message: string
  onClose: () => void
}

export const Toast = ({ type, message, onClose }: ToastProps) => {
  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-500',
          text: 'text-green-800',
          icon: <CheckIcon className="h-5 w-5 text-green-500" />
        }
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-500',
          text: 'text-red-800',
          icon: <XCircleIcon className="h-5 w-5 text-red-500" />
        }
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-500',
          text: 'text-yellow-800',
          icon: <XCircleIcon className="h-5 w-5 text-yellow-500" />
        }
      case 'info':
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-500',
          text: 'text-blue-800',
          icon: <CheckIcon className="h-5 w-5 text-blue-500" />
        }
    }
  }

  const styles = getToastStyles()

  return (
    <div 
      className={`${styles.bg} ${styles.text} border-l-4 ${styles.border} p-4 rounded-md shadow-md max-w-md animate-fade-in`}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-0.5">
          {styles.icon}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <div className="ml-2 flex-shrink-0 flex">
          <button
            className="rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
            onClick={onClose}
            aria-label="Close"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
} 