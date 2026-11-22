/**
 * Table, Thead, Tbody, Tr, Th, Td
 * ⚠️  Cores vêm de tailwind.config.js
 */

export function Table({ children, className = '' }) {
  return (
    <div className={`w-full overflow-x-auto rounded-lg border border-border ${className}`}>
      <table className="w-full text-sm border-collapse">
        {children}
      </table>
    </div>
  )
}

export function Thead({ children }) {
  return <thead className="bg-card-alt">{children}</thead>
}

export function Tbody({ children }) {
  return <tbody className="bg-card">{children}</tbody>
}

export function Tr({ children, className = '', onClick }) {
  return (
    <tr
      onClick={onClick}
      className={`
        border-t border-active transition-colors duration-100
        ${onClick ? 'cursor-pointer hover:bg-card-alt' : ''}
        ${className}
      `}
    >
      {children}
    </tr>
  )
}

export function Th({ children, className = '' }) {
  return (
    <th className={`
      px-4 py-3 text-left text-xs font-medium
      text-tx-secondary uppercase tracking-wide whitespace-nowrap
      ${className}
    `}>
      {children}
    </th>
  )
}

export function Td({ children, className = '' }) {
  return (
    <td className={`px-4 py-3 text-tx-primary ${className}`}>
      {children}
    </td>
  )
}
