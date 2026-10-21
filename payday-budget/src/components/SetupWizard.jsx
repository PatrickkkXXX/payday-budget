import { useState } from 'react'
import { money } from '../lib/format'
import CountryExtras from './CountryExtras'
import Icon from './Icon'
import { Choice, ErrorText, MoneyInput } from './ui'

const SAVE_OPTIONS = [[0, 'No savings', 'Maybe later'], [5, '5%', 'of my take-home pay'], [10, '10%', 'of my take-home pay'], [20, '20%', 'of my take-home pay']]
const STEP_ICON = { country: 'globe', pay: 'calendar', salary: 'cash', extras: 'plane', save: 'piggy' }

/** First-time setup: a few big-button questions. */
export default function SetupWizard({ catalog, profile, onFinish }) {
  const [draft, setDraft] = useState({ ...profile, salary: profile.salary || '' })
  const [index, setIndex] = useState(0)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const change = (patch) => setDraft((d) => ({ ...d, ...patch }))
  const steps = ['country', 'pay', 'salary', ...(draft.mode === 'gross' && draft.country !== 'PH' ? ['extras'] : []), 'save']
  const step = steps[Math.min(index, steps.length - 1)]
  const last = index >= steps.length - 1

  function pickCountry(c) {
    const cur = c.currency || draft.currency
    change({ country: c.code, currency: cur, php_rate: catalog.php_rates[cur] ?? 1, ofw: c.code === 'PH' ? false : draft.ofw })
  }

  async function next() {
    setError('')
    if (step === 'salary' && !(+draft.salary > 0)) {
      setError('Please type your monthly salary. Numbers only, like 25000.')
      return
    }
    if (!last) { setIndex(index + 1); return }
    setBusy(true)
    try {
      await onFinish({
        country: draft.country, currency: draft.currency, pay_type: draft.pay_type, salary: +draft.salary,
        mode: draft.mode, save_type: draft.save_type, save_val: draft.save_val, ofw: draft.ofw,
        ofw_philhealth: draft.ofw_philhealth, php_rate: draft.php_rate, tw_resident: draft.tw_resident,
        hk_helper: draft.hk_helper, setup_done: true,
      })
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  const salaryHelp = (() => {
    let h = ''
    if (+draft.salary > 0 && draft.pay_type === 'cutoff') h = `That's ${money(draft.salary / 2, draft.currency)} each cut-off, before anything is taken out.`
    if (draft.mode === 'gross' && draft.country === 'PH') h += `${h ? ' ' : ''}We'll compute SSS, PhilHealth, Pag-IBIG and tax.`
    return h || "Type the amount for the whole month, even if you're paid twice a month."
  })()

  return (
    <section className="card" aria-label="Setup">
      <div className="progress" aria-hidden="true"><span style={{ width: `${((index + 1) / steps.length) * 100}%` }} /></div>
      <p className="muted">
        {index === 0
          ? `Welcome! ${steps.length} quick questions and you're ready. (Step 1 of ${steps.length})`
          : `Step ${index + 1} of ${steps.length}`}
      </p>
      <div className="step-art"><Icon name={STEP_ICON[step]} size={40} strokeWidth={1.7} /></div>

      {step === 'country' && (
        <div className="step">
          <h2 className="question">Where do you work?</h2>
          <div className="choices three">
            {catalog.countries.map((c) => (
              <Choice
                key={c.code}
                selected={draft.country === c.code}
                onClick={() => pickCountry(c)}
                badge={c.code === 'OT' ? '…' : c.code}
                title={c.name}
                sub={c.code === 'PH' ? 'Working at home' : c.currency || 'Choose money'}
              />
            ))}
          </div>
          <p className="help">Working abroad (OFW)? Pick the country where you work now.</p>
        </div>
      )}

      {step === 'pay' && (
        <div className="step">
          <h2 className="question">How often do you get your salary?</h2>
          <div className="choices">
            <Choice selected={draft.pay_type === 'cutoff'} onClick={() => change({ pay_type: 'cutoff' })} title="Twice a month" sub="Every 15th and end of the month (cut-off)" />
            <Choice selected={draft.pay_type === 'monthly'} onClick={() => change({ pay_type: 'monthly' })} title="Once a month" sub="One payday every month" />
          </div>
        </div>
      )}

      {step === 'salary' && (
        <div className="step">
          <h2 className="question" id="salary-q">How much is your salary for one month?</h2>
          <MoneyInput id="setup-salary" autoFocus currency={draft.currency} value={draft.salary} onChange={(v) => change({ salary: v })} onEnter={next} label="Monthly salary" />
          <div className="choices two" role="group" aria-label="Type of amount">
            <Choice selected={draft.mode === 'gross'} onClick={() => change({ mode: 'gross' })} title="Before deductions" sub="The salary in my contract. We'll compute the taxes and deductions for you." />
            <Choice selected={draft.mode === 'net'} onClick={() => change({ mode: 'net' })} title="Take-home" sub="What I actually receive. Skip the deductions." />
          </div>
          <p className="help">{salaryHelp}</p>
        </div>
      )}

      {step === 'extras' && (
        <div className="step">
          <h2 className="question">A few more questions</h2>
          <CountryExtras profile={draft} catalog={catalog} onChange={change} />
        </div>
      )}

      {step === 'save' && (
        <div className="step">
          <h2 className="question">Do you want to save some money each payday?</h2>
          <div className="choices two">
            {SAVE_OPTIONS.map(([v, title, sub]) => (
              <Choice
                key={v}
                center
                selected={(draft.save_type === 'none' ? 0 : +draft.save_val) === v}
                onClick={() => change({ save_type: v ? 'pct' : 'none', save_val: v })}
                title={title}
                sub={sub}
              />
            ))}
          </div>
          <p className="help">We set this aside first, so you know what's really free to spend.</p>
        </div>
      )}

      <ErrorText>{error}</ErrorText>
      <div className="nav-row">
        {index > 0 && <button type="button" className="btn" onClick={() => { setError(''); setIndex(index - 1) }}>Back</button>}
        <button type="button" className="btn primary big grow" onClick={next} disabled={busy}>
          {busy ? 'Saving…' : last ? 'Finish' : 'Next'}
        </button>
      </div>
    </section>
  )
}
