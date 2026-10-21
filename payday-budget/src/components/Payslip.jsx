import { useState } from 'react'
import { store } from '../lib/storage'
import { money } from '../lib/format'
import { useToast } from './Toast'

/** Salary card: deductions per cut-off and per month, with "Change amounts" to match a real payslip. */
export default function Payslip({ salary, currency, profile, onProfile, onChanged }) {
  const [editing, setEditing] = useState(false)
  const net = salary.mode === 'net'

  return (
    <section className="card slip-card" aria-labelledby="slip-title">
      <div className="card-head">
        <div>
          <div className="eyebrow">Payslip</div>
          <h2 id="slip-title">My salary &amp; deductions</h2>
        </div>
        {!net && (
          <button type="button" className="btn small" onClick={() => setEditing(!editing)}>
            {editing ? 'Close' : 'Change amounts'}
          </button>
        )}
      </div>
      <p className="help">
        {net
          ? 'You entered your take-home pay, so no deductions are shown. To see deductions, open settings and choose “Before deductions”.'
          : `Working in ${salary.country_name}${salary.country !== 'PH' && salary.ofw ? ', with OFW payments to the Philippines' : ''}. Amounts are estimates using 2026 rates.`}
      </p>

      {editing
        ? <SlipEditor salary={salary} currency={currency} profile={profile} onProfile={onProfile} onChanged={onChanged} onDone={() => setEditing(false)} />
        : <SlipTable salary={salary} currency={currency} />}

      {!net && (
        <p className="note">
          {salary.notes.join(' ')} Your actual payslip can differ because of allowances, overtime or company rules. Use “Change amounts” to match it.
        </p>
      )}
    </section>
  )
}

function SlipTable({ salary, currency }) {
  const m = (v) => money(v, currency)
  return (
    <div className="slip-wrap">
      <table className="slip">
        <thead><tr><th /><th>Per cut-off</th><th>Per month</th></tr></thead>
        <tbody>
          <tr>
            <td>{salary.mode === 'net' ? 'Take-home salary' : 'Salary before deductions'}{salary.pay_type === 'monthly' && <small>Paid once a month; cut-off column shows half</small>}</td>
            <td>{m(salary.gross / 2)}</td><td>{m(salary.gross)}</td>
          </tr>
          {salary.lines.map((l) => (
            <tr className="ded" key={l.key}>
              <td>
                {l.label}
                <small>
                  {l.overridden ? `Your amount (calculated: ${m(l.calculated)})` : l.note}
                  {l.php != null && currency !== 'PHP' && !l.overridden ? ` · ${money(l.php, 'PHP')} a month` : ''}
                </small>
              </td>
              <td>− {m(l.amount / 2)}</td><td>− {m(l.amount)}</td>
            </tr>
          ))}
          {salary.lines.length > 0 && (
            <tr className="sub"><td>Total deductions</td><td>− {m(salary.total / 2)}</td><td>− {m(salary.total)}</td></tr>
          )}
          <tr className="total"><td>Take-home pay</td><td>{m(salary.net / 2)}</td><td>{m(salary.net)}</td></tr>
        </tbody>
      </table>
    </div>
  )
}

function SlipEditor({ salary, currency, profile, onProfile, onChanged, onDone }) {
  const toast = useToast()
  const [newName, setNewName] = useState('')
  const [newAmount, setNewAmount] = useState('')

  async function saveOverride(key, raw) {
    const overrides = { ...(profile.overrides || {}) }
    if (raw === '') delete overrides[key]
    else overrides[key] = Math.max(0, +raw || 0)
    try {
      onProfile(await store.updateProfile({ overrides }))
      onChanged()
    } catch (e) { toast(e.message) }
  }

  async function saveExtra(line, raw) {
    try {
      await store.updateDeduction(line.id, { name: line.label, amount: Math.max(0, +raw || 0) })
      onChanged()
    } catch (e) { toast(e.message) }
  }

  async function removeExtra(line) {
    try { await store.deleteDeduction(line.id); onChanged(); toast('Deduction removed') } catch (e) { toast(e.message) }
  }

  async function addExtra() {
    if (!(+newAmount > 0)) { toast('Type the monthly amount first'); return }
    try {
      await store.addDeduction({ name: newName.trim() || 'Other deduction', amount: +newAmount })
      setNewName(''); setNewAmount('')
      onChanged()
      toast('Deduction added')
    } catch (e) { toast(e.message) }
  }

  async function resetAll() {
    try { onProfile(await store.updateProfile({ overrides: {} })); onChanged(); toast('Estimates restored') } catch (e) { toast(e.message) }
  }

  return (
    <div className="edit-ded">
      <p className="help">Type the monthly amount from your payslip. Leave a box empty to use our estimate.</p>
      {salary.lines.map((l) => (
        <div className="edit-row" key={l.key}>
          <div className="name">
            <strong>{l.label}</strong>
            {!l.custom && <small>Our estimate: {money(l.overridden ? l.calculated : l.amount, currency)} a month</small>}
            {l.custom && <button type="button" className="btn link" onClick={() => removeExtra(l)}>Remove</button>}
          </div>
          <input
            className="text num"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            aria-label={`${l.label} per month`}
            defaultValue={l.custom ? l.amount : (profile.overrides?.[l.key] ?? '')}
            placeholder={String(Math.round((l.overridden ? l.calculated : l.amount) * 100) / 100)}
            onBlur={(e) => (l.custom ? saveExtra(l, e.target.value) : saveOverride(l.key, e.target.value))}
          />
        </div>
      ))}
      <div className="edit-row">
        <input className="text" placeholder="Other deduction, like a loan or uniform" maxLength={60} value={newName} onChange={(e) => setNewName(e.target.value)} aria-label="Name of other deduction" />
        <input className="text num" type="number" inputMode="decimal" min="0" step="any" placeholder="Per month" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} aria-label="Amount per month" />
      </div>
      <div className="confirm">
        <button type="button" className="btn" onClick={addExtra}>Add this deduction</button>
        <button type="button" className="btn link" onClick={resetAll}>Use all our estimates again</button>
        <button type="button" className="btn primary" onClick={onDone}>Done</button>
      </div>
    </div>
  )
}
