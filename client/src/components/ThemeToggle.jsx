import { useState } from 'react'
import { Sun, Moon } from 'lucide-react'

function getTheme() {
  return document.documentElement.classList.contains('light') ? 'light' : 'dark'
}

function applyTheme(theme) {
  document.documentElement.classList.toggle('light', theme === 'light')
  localStorage.setItem('gymdesk-theme', theme)
}

export default function ThemeToggle({ className = '' }) {
  const [theme, setTheme] = useState(getTheme)

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    setTheme(next)
  }

  const isLight = theme === 'light'

  return (
    <button
      onClick={toggle}
      className={`
        relative w-12 h-7 rounded-full transition-colors duration-200
        ${isLight ? 'bg-evolution/10' : 'bg-active'}
        ${className}
      `}
      title={isLight ? 'Tema escuro' : 'Tema claro'}
    >
      <span className={`
        absolute top-[2px] w-[24px] h-[24px] rounded-full
        bg-card shadow-sm border border-border
        flex items-center justify-center
        transition-all duration-200
        ${isLight ? 'left-[22px]' : 'left-[2px]'}
      `}>
        {isLight
          ? <Sun size={14} className="text-evolution" />
          : <Moon size={14} className="text-tx-muted" />
        }
      </span>
    </button>
  )
}
