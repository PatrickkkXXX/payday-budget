import { useEffect, useState } from 'react'
import { store } from '../lib/storage'
import { DAYS } from '../lib/format'
import CountryExtras from './CountryExtras'
import { useToast } from './Toast'
import { Choice, MoneyInput } from './ui'

const SAVE_OPTIONS = [[0, 'No savings'], [5, '5%'], [10, '10%'], [20, '20%']]

/** Change salary and preferences. Each change saves right away. */
export default function SettingsScreen({ catalog, profile, onProfile, onDone, onErased }) {
  const toast = useToast()
  const [salary, setSalary] = useState(String(profile.salary || ''))
  const [confirmErase, setConfirmErase] = useState(false)

  useEffect(() => setSalary(String(profile.salary || '')), [profile.salary])

  async function save(patch) {
    try {
      onProfile(await store.updateProfile(patch))
    } catch (e) {
      toast(e.message)
    }
  }

  function toggleDay(d) {
    const days = profile.workdays.includes(d) ? profile.workdays.filter((x) => x !== d) : [...profile.workdays, d]
    save({ workdays: days })
  }

  async function exportCsv() {
    try { await store.exportCsv(); toast('Copy saved') } catch (e) { toast(e.message) }
  }

  async function erase() {
    try {
      await store.eraseEverything()
      toast('Everything erased')
      onErased()
    } catch (e) { toast(e.message) }
  }

  const currentSave = profile.save_type === 'none' ? 0 : profile.save_type === 'pct' ? profile.save_val : -1

  return (
    <section className="card" aria-labelledby="set-title">
      <div className="nav-row">
        <h2 id="set-title">My salary &amp; settings</h2>
        <button type="button" className="btn primary" onClick={onDone}>Done</button>
      </div>
      <div className="settings-list">
        <div className="step">
          <strong>Where do you work?</strong>
          <div className="choices three">
            {catalog.countries.map((c) => (
              <Choice key={c.code} selected={profile.country === c.code} onClick={() => save({ country: c.code })}
                badge={c.code === 'OT' ? '…' : c.code} title={c.name} sub={c.code === 'PH' ? 'Working at home' : c.currency || 'Choose money'} />
            ))}
          </div>
        </div>

        <div className="step">
          <strong>How often do you get your salary?</strong>
          <div className="choices two">
            <Choice selected={profile.pay_type === 'cutoff'} onClick={() => save({ pay_type: 'cutoff' })} title="Twice a month" sub="15th and end of month" />
            <Choice selected={profile.pay_type === 'monthly'} onClick={() => save({ pay_type: 'monthly' })} title="Once a month" sub="One payday" />
          </div>
        </div>

        <div className="step">
          <label htmlFor="st-salary"><strong>Salary for one month</strong></label>
          <div onBlur={() => +salary !== profile.salary && +salary >= 0 && save({ salary: +salary || 0 })}>
            <MoneyInput id="st-salary" currency={profile.currency} value={salary} onChange={setSalary} label="Monthly salary"
              onEnter={() => save({ salary: +salary || 0 })} />
          </div>
          <div className="choices two">
            <Choice selected={profile.mode === 'gross'} onClick={() => save({ mode: 'gross' })} title="Before deductions" sub="Compute my deductions" />
            <Choice selected={profile.mode === 'net'} onClick={() => save({ mode: 'net' })} title="Take-home" sub="No deductions" />
          </div>
        </div>

        {profile.mode === 'gross' && profile.country !== 'PH' && (
          <CountryExtras profile={profile} catalog={catalog} onChange={save} />
        )}

        <div className="step">
          <label htmlFor="st-currency"><strong>Money</strong></label>
          <select id="st-currency" className="plain" value={profile.currency} onChange={(e) => save({ currency: e.target.value })}>
            {catalog.currencies.map((c) => <option key={c.code} value={c.code}>{c.name} ({c.code})</option>)}
          </select>
        </div>

        <div className="step">
          <strong>Savings each payday</strong>
          <div className="choices four">
            {SAVE_OPTIONS.map(([v, t]) => (
              <Choice key={v} center selected={currentSave === v} title={t} onClick={() => save({ save_type: v ? 'pct' : 'none', save_val: v })} />
            ))}
          </div>
        </div>

        <div className="step">
          <strong>Which days do you go to work?</strong>
          <p className="help">Used for “every work day” items like fare and lunch.</p>
          <div className="days">
            {[1, 2, 3, 4, 5, 6, 0].map((d) => (
              <label key={d} htmlFor={`wd-${d}`}>
                <input id={`wd-${d}`} type="checkbox" checked={profile.workdays.includes(d)} onChange={() => toggleDay(d)} />
                {DAYS[d]}
              </label>
            ))}
          </div>
        </div>

        <div className="step">
          <strong>Other</strong>
          <div className="confirm">
            <button type="button" className="btn" onClick={exportCsv}>Save a copy (CSV file)</button>
            <button type="button" className="btn danger" onClick={() => setConfirmErase(true)}>Erase everything</button>
          </div>
          {confirmErase && (
            <div className="confirm">
              <span>Erase all your entries on this device and start over?</span>
              <button type="button" className="btn danger" onClick={erase}>Yes, erase</button>
              <button type="button" className="btn" onClick={() => setConfirmErase(false)}>No, keep</button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
