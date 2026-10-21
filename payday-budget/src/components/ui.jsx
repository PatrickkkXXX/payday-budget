// Small building blocks shared by the screens.
import { currencySymbol } from '../lib/format'

export function Choice({ selected, onClick, title, sub, badge, center, children }) {
  return (
    <button type="button" className={`choice${center ? ' center' : ''}`} aria-pressed={!!selected} onClick={onClick}>
      {badge && <span className="cc">{badge}</span>}
      <strong>{title}</strong>
      {sub && <span>{sub}</span>}
      {children}
    </button>
  )
}

export function MoneyInput({ id, value, onChange, currency, small, label, placeholder = '0', onEnter, autoFocus }) {
  return (
    <div className={`money-input${small ? ' sm' : ''}`}>
      <span className="sym">{currency === 'PHP-fixed' ? '₱' : currencySymbol(currency)}</span>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min="0"
        step="any"
        placeholder={placeholder}
        aria-label={label}
        value={value ?? ''}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && onEnter) onEnter() }}
      />
    </div>
  )
}

export function Toggle({ id, checked, onChange, title, sub }) {
  return (
    <label className="toggle" htmlFor={id}>
      <input id={id} type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
      <div>
        <strong>{title}</strong>
        {sub && <span>{sub}</span>}
      </div>
    </label>
  )
}

export function ErrorText({ children }) {
  if (!children) return null
  return <p className="err" role="alert">{children}</p>
}
