import { IS_DEMO } from '../demo/index.js'
import { demoApiFetch } from '../demo/api.js'

export async function apiFetch(path, options = {}) {
  if (IS_DEMO) {
    return demoApiFetch(path, options)
  }

  const res = await fetch(`/api${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Erro na requisição.')
  return data
}
