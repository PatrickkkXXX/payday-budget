import { money } from '../lib/format'
import { catColor } from './Icon'
import { EmptyBox } from './ItemList'

/** "Where your money goes": one colored bar per category. */
export default function CategoryBars({ categories, currency }) {
  if (!categories.length) return <EmptyBox>Once you add expenses, you'll see which ones take the most money.</EmptyBox>
  const max = categories[0].amount
  return (
    <div className="bars">
      {categories.map((c) => (
        <div className="bar" key={c.label} style={{ '--cat': catColor(c.color) }}>
          <div className="bar-top">
            <span className="lbl"><i />{c.short}</span>
            <span className="num">{money(c.amount, currency)}{c.pct != null ? ` (${c.pct}%)` : ''}</span>
          </div>
          <div className="bar-track"><div className="bar-fill" style={{ width: `${(c.amount / max) * 100}%` }} /></div>
        </div>
      ))}
    </div>
  )
}
