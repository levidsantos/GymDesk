/**
 * Modal — overlay com card centralizado
 * ⚠️  Cores vêm de tailwind.config.js
 *
 * Uso:
 *   <Modal open={open} onClose={() => setOpen(false)} title="Título">
 *     conteúdo
 *   </Modal>
 */
import { X } from 'lucide-react'
import { useEffect } from 'react'

export default function Modal({ open, onClose, title, children, className = '' }) {
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}
    >
      <div className={`
        bg-card border border-border rounded-lg shadow-2xl
        w-full max-w-lg max-h-[90vh] overflow-y-auto
        ${className}
      `}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-tx-primary">{title}</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-tx-muted hover:text-tx-primary transition-colors p-1 rounded"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <div className="px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  )
}
