import { useState } from 'react'
import { Dumbbell, Eye, EyeOff } from 'lucide-react'
import { Input, InputField } from '../components/Input'
import Button from '../components/Button'
import Alert from '../components/Alert'

export default function Login({ onLogin }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao fazer login.')
      onLogin?.(data.account)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-base flex flex-col">
      {/* Header */}
      <header className="px-4 sm:px-10 py-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dumbbell size={20} className="text-evolution" />
          <span className="font-bold text-tx-primary tracking-tight">GymDesk</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-sm text-tx-muted">
          <span>Muscle Power</span>
          <span className="text-border">·</span>
          <span>Muscle Evolution</span>
        </div>
      </header>

      {/* Conteúdo centralizado */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          {/* Card de login */}
          <div className="bg-card border border-border rounded-xl p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-tx-primary mb-1">Entrar no GymDesk</h1>
            <p className="text-sm text-tx-muted mb-7">
              Acesse sua conta de administrador ou aluno.
            </p>

            {error && (
              <Alert variant="danger" title="Não foi possível entrar" className="mb-6">
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <InputField label="E-mail">
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </InputField>

              <InputField label="Senha">
                <div className="relative">
                  <Input
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-tx-muted hover:text-tx-secondary transition-colors"
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </InputField>

              <Button type="submit" size="lg" className="mt-1 w-full" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <div className="mt-7 pt-6 border-t border-border">
              <p className="text-xs text-tx-muted">
                Esqueceu a senha? Procure a recepção da sua unidade para redefinir o acesso.
              </p>
            </div>
          </div>

          {/* Rodapé do card */}
          <p className="text-center text-xs text-tx-muted mt-5">
            Precisa de acesso? Procure a recepção da sua unidade.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-tx-muted border-t border-border">
        GymDesk · Gestão da academia
      </footer>
    </div>
  )
}
