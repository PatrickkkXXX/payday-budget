import { DAYS_FULL, greeting, shortDate, today } from '../lib/format'
import Icon from './Icon'

export default function Header({ status, warn, onSettings }) {
  const t = today()
  return (
    <header className="top">
      <div className="brand">
        <div className="logo"><Icon name="wallet" size={28} strokeWidth={1.9} /></div>
        <div>
          <div className="hello">{greeting()} · {DAYS_FULL[t.getDay()]}, {shortDate(t)}</div>
          <h1>Payday Budget</h1>
          {status && <span className={`status${warn ? ' warn' : ''}`}>{status}</span>}
        </div>
      </div>
      {onSettings && <button type="button" className="btn" onClick={onSettings}>My salary &amp; settings</button>}
    </header>
  )
}
