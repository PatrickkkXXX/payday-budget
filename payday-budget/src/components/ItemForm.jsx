import { useEffect, useState } from 'react'
import { store } from '../lib/storage'
import { DAYS_FULL, iso, money, ordinal, parseISO, shortDate, today } from '../lib/format'
import Icon, { catColor } from './Icon'
import { Choice, ErrorText, MoneyInput } from './ui'

const FREQS = [
  ['once', 'Just once', 'One time only'],
  ['workday', 'Every work day', 'Like fare or lunch'],
  ['daily', 'Every day', 'Including weekends'],
  ['weekly', 'Every week', 'Like groceries'],
  ['cutoff', 'Every payday', 'Twice a month'],
  ['monthly', 'Every month', 'Like rent or bills'],
]

/** Add or change an expense / extra money, in 3 numbered steps. */
export default function ItemForm({ kind, item, catalog, profile, view, anchor, onSaved, onCancel }) {
  const categories = kind === 'income' ? catalog.income_categories : catalog.expense_categories
  const [cat, setCat] = useState(item?.category || null)
  const [amount, setAmount] = useState(item ? String(item.amount) : '')
  const [freq, setFreq] = useState(item?.freq || (kind === 'income' ? 'once' : null))
  const [name, setName] = useState(item?.note || '')
  const [start, setStart] = useState(item?.start_date || iso(today()))
  const [end, setEnd] = useState(item?.end_date || '')
  const [more, setMore] = useState(!!(item && (item.note || item.end_date)))
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const cur = profile.currency
  const once = freq === 'once'
  const freqs = FREQS.filter(([f]) => f !== 'cutoff' || profile.pay_type === 'cutoff')

  // Live "that's X this cut-off" message, asked from the API.
  useEffect(() => {
    if (!(+amount > 0) || !freq || !parseISO(start)) { setResult(''); return }
    const t = setTimeout(async () => {
      try {
        const r = await store.preview({ amount: +amount, freq, start_date: start, end_date: once ? null : end || null, view, anchor })
        const where = view === 'month' ? 'this month' : 'this cut-off'
        setResult(once
          ? (r.times ? `This adds ${money(+amount, cur)} to ${where}.` : "This date is outside the period you're looking at, so it will show in another period.")
          : `That's ${money(r.total, cur)} ${where} (${money(+amount, cur)} × ${r.count_text || '0 times'}).`)
      } catch { setResult('') }
    }, 250)
    return () => clearTimeout(t)
  }, [amount, freq, start, end, view, anchor, once, cur])

  const d = parseISO(start) || today()
  const isToday = start === iso(today())
  const dateText = once
    ? `Date: ${isToday ? 'today' : `${shortDate(d)}, ${d.getFullYear()}`}`
    : freq === 'weekly' ? `Repeats every ${DAYS_FULL[d.getDay()]}, starting ${shortDate(d)}`
      : freq === 'monthly' ? `Repeats on the ${ordinal(d.getDate())} of each month`
        : `Starting ${isToday ? 'today' : shortDate(d)}`

  async function save() {
    setError('')
    if (!cat) return setError(kind === 'income' ? 'Please choose where the money is from (step 1).' : 'Please choose what the expense is for (step 1).')
    if (!(+amount > 0)) return setError('Please type the amount (step 2). Numbers only, like 120.')
    if (!freq) return setError('Please choose how often (step 3).')
    if (!once && end && end < start) return setError('The stop date is before the start date.')
    const data = { kind, name: name.trim(), category: cat, amount: +amount, freq, start_date: start, end_date: once ? null : end || null }
    setBusy(true)
    try {
      if (item) await store.updateItem(item.id, data)
      else await store.addItem(data)
      onSaved(name.trim() || categories.find((c) => c.label === cat)?.short || cat, !!item)
    } catch (e) {
      setError(e.message)
      setBusy(false)
    }
  }

  return (
    <section className="card" aria-labelledby="add-title">
      <h2 id="add-title">{item ? 'Change this entry' : kind === 'income' ? 'Add extra money' : 'Add an expense'}</h2>

      <div className="step">
        <div className="step-title"><b>1</b><span>{kind === 'income' ? 'Where is it from?' : 'What is it for?'}</span></div>
        <div className="tiles">
          {categories.map((c) => (
            <button key={c.label} type="button" className="tile" style={{ '--cat': catColor(c.color) }} aria-pressed={cat === c.label} onClick={() => setCat(c.label)}>
              <span className="chip"><Icon name={c.icon} /></span>
              <span>{c.short}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="step">
        <div className="step-title"><b>2</b><span>How much each time?</span></div>
        <MoneyInput id="f-amt" currency={cur} value={amount} onChange={setAmount} onEnter={save} label="Amount each time" />
      </div>

      <div className="step">
        <div className="step-title"><b>3</b><span>How often?</span></div>
        <div className="choices two">
          {freqs.map(([f, title, sub]) => <Choice key={f} selected={freq === f} onClick={() => setFreq(f)} title={title} sub={sub} />)}
        </div>
      </div>

      {result && <div className="result" aria-live="polite">{result}</div>}

      <div className="datebox">
        <span>{dateText}</span>
        <button type="button" className="btn link" aria-expanded={more} onClick={() => setMore(!more)}>Change date or add a note</button>
      </div>
      {more && (
        <div className="more">
          <label htmlFor="f-name">Note (optional), like “Jeep to office”</label>
          <input id="f-name" className="text" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
          <label htmlFor="f-date">{once ? 'Date' : 'Start date'}</label>
          <input id="f-date" className="text" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          {!once && freq && (
            <>
              <label htmlFor="f-end">Stop on (optional, leave empty if it keeps going)</label>
              <input id="f-end" className="text" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            </>
          )}
        </div>
      )}

      <ErrorText>{error}</ErrorText>
      <div className="nav-row">
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
        <button type="button" className="btn primary grow" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
      </div>
    </section>
  )
}
