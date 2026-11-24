import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react'

const ToastContext = createContext(null)

export function useToast() {
  return useContext(ToastContext)
}

const icons = {
  success: CheckCircle,
  warning: AlertTriangle,
  danger:  AlertCircle,
  info:    Info,
}

const styles = {
  success: 'border-success bg-success/10 text-success',
  warning: 'border-warning bg-warning/10 text-warning',
  danger:  'border-danger bg-danger/10 text-danger',
  info:    'border-info bg-info/10 text-info',
}

function ToastItem({ toast, onDismiss }) {
  const Icon = icons[toast.variant] || icons.info
  const style = styles[toast.variant] || styles.info

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration || 4000)
    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onDismiss])

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-sm ${style}`}>
      <Icon size={18} className="shrink-0 mt-0.5" />
      <p className="text-sm font-medium flex-1 text-tx-primary">{toast.message}</p>
      <button onClick={() => onDismiss(toast.id)} className="shrink-0 p-0.5 hover:opacity-70 transition-opacity">
        <X size={14} />
      </button>
    </div>
  )
}

let nextId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const addToast = useCallback((variant, message, duration) => {
    if (!message) return
    const id = ++nextId
    setToasts(prev => [...prev, { id, variant, message, duration }])
  }, [])

  const toast = {
    success: (msg, dur) => addToast('success', msg, dur),
    danger:  (msg, dur) => addToast('danger', msg, dur),
    warning: (msg, dur) => addToast('warning', msg, dur),
    info:    (msg, dur) => addToast('info', msg, dur),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
