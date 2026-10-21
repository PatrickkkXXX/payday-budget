import { useState } from 'react'
import { money } from '../lib/format'
import Icon, { catColor } from './Icon'

export function EmptyBox({ children }) {
  return (
    <div className="empty">
      <Icon name="basket" size={40} strokeWidth={1.5} />
      <p>{children}</p>
    </div>
  )
}

/** Expenses and extra money that fall in the period on screen. */
export default function ItemList({ items, currency, onEdit, onRemove }) {
  if (!items.length) return <EmptyBox>Nothing here yet. Tap “Add an expense” to put in your fare, food, rent and other costs.</EmptyBox>
  return (
    <div className="items">
      {items.map((it) => <Row key={it.id} it={it} currency={currency} onEdit={onEdit} onRemove={onRemove} />)}
    </div>
  )
}

function Row({ it, currency, onEdit, onRemove }) {
  const [confirm, setConfirm] = useState(false)
  const income = it.kind === 'income'
  const how = `${money(it.amount, currency)} ${it.schedule}${it.count_text ? ` · ${it.count_text} here` : ''}`

  return (
    <div className={`item${income ? ' inc' : ''}`} style={income ? undefined : { '--cat': catColor(it.color) }}>
      <div className="icbox"><Icon name={it.icon} /></div>
      <div>
        <div className="nm">{it.name}</div>
        <div className="how">{how}</div>
      </div>
      <div className="tot">{income ? '+ ' : '− '}{money(it.total, currency)}</div>
      <div className="acts">
        {confirm ? (
          <>
            <span>Remove this?</span>
            <button type="button" className="btn small danger" autoFocus onClick={() => onRemove(it)}>Yes, remove</button>
            <button type="button" className="btn small" onClick={() => setConfirm(false)}>No</button>
          </>
        ) : (
          <>
            <button type="button" className="btn small" aria-label={`Change ${it.name}`} onClick={() => onEdit(it)}>Change</button>
            <button type="button" className="btn small danger" aria-label={`Remove ${it.name}`} onClick={() => setConfirm(true)}>Remove</button>
          </>
        )}
      </div>
    </div>
  )
}
