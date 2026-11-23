import { useState } from 'react'
import { Dumbbell, Eye, EyeOff } from 'lucide-react'
import { Input, InputField } from '../components/Input'
import Button from '../components/Button'
import Alert from '../components/Alert'
import ThemeToggle from '../components/ThemeToggle'

export default function ChangePassword({ onSuccess, onLogout, isForced = true }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword]         = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew]                 = useState(false)
  const [error, setError]                     = useState('')
  const [loading, setLoading]                 = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)
    try {
      const body = { new_password: newPassword }
      if (!isForced) body.current_password = currentPassword

      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao alterar senha.')
      onSuccess?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-base flex flex-col">
      <header className="px-4 sm:px-10 py-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dumbbell size={20} className="text-evolution" />
          <span className="font-bold text-tx-primary tracking-tight">GymDesk</span>
        </div>
        <ThemeToggle />
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="bg-card border border-border rounded-xl p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-tx-primary mb-1">
              {isForced ? 'Alterar senha' : 'Nova senha'}
            </h1>
            <p className="text-sm text-tx-muted mb-7">
              {isForced
                ? 'É necessário criar uma nova senha antes de continuar.'
                : 'Digite sua senha atual e defina a nova.'
              }
            </p>

            {error && (
              <Alert variant="danger" className="mb-6">{error}</Alert>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {!isForced && (
                <InputField label="Senha atual">
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </InputField>
              )}

              <InputField label="Nova senha">
                <div className="relative">
                  <Input
                    type={showNew ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowNew(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-tx-muted hover:text-tx-secondary transition-colors"
                  >
                    {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </InputField>

              <InputField label="Confirmar nova senha">
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </InputField>

              <Button type="submit" size="lg" className="mt-1 w-full" disabled={loading}>
                {loading ? 'Salvando...' : 'Alterar senha'}
              </Button>
            </form>

            {isForced && (
              <div className="mt-5 pt-5 border-t border-border">
                <button
                  onClick={onLogout}
                  className="text-sm text-tx-muted hover:text-tx-primary transition-colors"
                >
                  Sair da conta
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="py-4 text-center text-xs text-tx-muted border-t border-border">
        GymDesk · Gestão da academia
      </footer>
    </div>
  )
}
