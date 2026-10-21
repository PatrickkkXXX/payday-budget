import { useCallback, useEffect, useRef, useState } from 'react'
import { store } from '../lib/storage'
import { iso, MONTHS_FULL, parseISO, shiftAnchor, shortDate, today } from '../lib/format'
import CategoryBars from './CategoryBars'
import Icon from './Icon'
import ItemForm from './ItemForm'
import ItemList from './ItemList'
import MoneyCard from './MoneyCard'
import Payslip from './Payslip'
import { useToast } from './Toast'

/** Main screen: period switch, money left, payslip, add buttons, list and chart. */
export default function Dashboard({ catalog, profile, onProfile }) {
  const toast = useToast()
  const [view, setViewState] = useState(() => store.getUi('view', 'cutoff'))
  const setView = (v) => { setViewState(v); store.setUi('view', v) }
  const [anchor, setAnchor] = useState(iso(today()))
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState(null) // { kind, item }
  const formRef = useRef(null)
  const listRef = useRef(null)

  const load = useCallback(async () => {
    try {
      setSummary(await store.summary({ view, anchor }))
      setError('')
    } catch (e) {
      setError(e.message)
    }
  }, [view, anchor])

  useEffect(() => { load() }, [load, profile])

  useEffect(() => {
    if (form) formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [form])

  async function remove(item) {
    try {
      await store.deleteItem(item.id)
      toast(`Removed: ${item.name}`)
      load()
    } catch (e) { toast(e.message) }
  }

  function saved(label, edited) {
    setForm(null)
    toast(`${edited ? 'Saved' : 'Added'}: ${label}`)
    load().then(() => listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  if (!summary) {
    return error
      ? <section className="card"><p className="err">{error}</p><button className="btn" onClick={load}>Try again</button></section>
      : <section className="card"><p className="muted">Loading your budget…</p></section>
  }

  const p = summary.period
  const start = parseISO(p.start), end = parseISO(p.end)
  const when = view === 'month' ? `${MONTHS_FULL[start.getMonth()]} ${start.getFullYear()}` : `${shortDate(start)} – ${shortDate(end)}`
  const status = p.status === 'current' ? (view === 'month' ? 'This month' : 'Current cut-off') : p.status === 'upcoming' ? 'Coming up' : 'Already passed'

  return (
    <>
      <div className="tabs" role="group" aria-label="Show">
        <button type="button" aria-pressed={view === 'cutoff'} onClick={() => setView('cutoff')}>This cut-off</button>
        <button type="button" aria-pressed={view === 'month'} onClick={() => setView('month')}>Whole month</button>
      </div>
      <div className="pnav">
        <button type="button" className="btn" aria-label="Previous period" onClick={() => setAnchor(shiftAnchor(anchor, view, -1))}>‹ Before</button>
        <div className="when">{when}<small>{status}</small></div>
        <button type="button" className="btn" aria-label="Next period" onClick={() => setAnchor(shiftAnchor(anchor, view, 1))}>After ›</button>
      </div>

      <MoneyCard s={summary} />

      <div className="add-row">
        <button type="button" className="btn primary big" onClick={() => setForm({ kind: 'expense' })}><Icon name="plus" />Add an expense</button>
        <button type="button" className="btn big" onClick={() => setForm({ kind: 'income' })}><Icon name="plus" />Extra money</button>
      </div>

      {form && (
        <div ref={formRef}>
          <ItemForm
            key={`${form.kind}-${form.item?.id ?? 'new'}`}
            kind={form.kind}
            item={form.item}
            catalog={catalog}
            profile={profile}
            view={view}
            anchor={anchor}
            onSaved={saved}
            onCancel={() => setForm(null)}
          />
        </div>
      )}

      <Payslip salary={summary.salary} currency={summary.currency} profile={profile} onProfile={onProfile} onChanged={load} />

      <section className="card" aria-labelledby="list-title" ref={listRef}>
        <h2 id="list-title">{view === 'month' ? 'Your money this month' : 'Your money this cut-off'}</h2>
        <ItemList items={summary.items} currency={summary.currency} onEdit={(it) => setForm({ kind: it.kind, item: it })} onRemove={remove} />
      </section>

      <section className="card" aria-labelledby="bd-title">
        <h2 id="bd-title">Where your money goes</h2>
        <CategoryBars categories={summary.by_category} currency={summary.currency} />
      </section>

      <section className="card">
        <details className="howto">
          <summary>How does this work?</summary>
          <ol>
            <li>Your payslip card shows taxes and government deductions, for each cut-off and for the whole month.</li>
            <li>Tap <strong>Add an expense</strong> for things you pay for, like fare, food, rent or bills.</li>
            <li>Choose how often you pay it. “Every work day” is good for fare and lunch.</li>
            <li>The big number is the money you still have after expenses and savings. Everything saves on its own.</li>
          </ol>
        </details>
      </section>
    </>
  )
}
