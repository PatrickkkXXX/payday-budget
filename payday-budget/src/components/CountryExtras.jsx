import { useEffect, useState } from 'react'
import { MoneyInput, Toggle } from './ui'

/** Extra questions that depend on the country: Taiwan stay, HK helper, OFW contributions. */
export default function CountryExtras({ profile, catalog, onChange }) {
  const p = profile
  if (p.mode !== 'gross' || p.country === 'PH') return null

  return (
    <div className="step">
      {p.country === 'OT' && (
        <>
          <label htmlFor="ex-cur"><strong>Which money is your salary in?</strong></label>
          <select
            id="ex-cur"
            className="plain"
            value={p.currency}
            onChange={(e) => onChange({ currency: e.target.value, php_rate: catalog.php_rates[e.target.value] ?? p.php_rate })}
          >
            {catalog.currencies.map((c) => <option key={c.code} value={c.code}>{c.name} ({c.code})</option>)}
          </select>
        </>
      )}
      {p.country === 'TW' && (
        <Toggle
          id="ex-twres"
          checked={p.tw_resident}
          onChange={(v) => onChange({ tw_resident: v })}
          title="I have stayed in Taiwan 183 days or more this year"
          sub="This lowers your tax. Leave unticked if you're in your first 6 months this year."
        />
      )}
      {p.country === 'HK' && (
        <Toggle id="ex-hkh" checked={p.hk_helper} onChange={(v) => onChange({ hk_helper: v })} title="I'm a domestic helper" sub="Domestic helpers don't pay MPF." />
      )}
      <Toggle
        id="ex-ofw"
        checked={p.ofw}
        onChange={(v) => onChange({ ofw: v })}
        title="I still pay SSS and Pag-IBIG in the Philippines (OFW)"
        sub="Shows these payments in your salary card."
      />
      {p.ofw && (
        <div className="subq">
          <Toggle
            id="ex-ofwph"
            checked={p.ofw_philhealth}
            onChange={(v) => onChange({ ofw_philhealth: v })}
            title="I also pay PhilHealth"
            sub="5% of your income, at least ₱500 a month."
          />
          {p.currency !== 'PHP' && (
            <>
              <label htmlFor="ex-rate"><strong>How many pesos is 1 {p.currency} today?</strong></label>
              <RateInput value={p.php_rate} onSave={(v) => onChange({ php_rate: v })} />
              <p className="help">We filled in an approximate rate. Change it to today's rate from your remittance center.</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function RateInput({ value, onSave }) {
  const [draft, setDraft] = useState(String(value ?? ''))
  useEffect(() => setDraft(String(value ?? '')), [value])
  const commit = () => { if (+draft > 0 && +draft !== value) onSave(+draft) }
  return (
    <div onBlur={commit}>
      <MoneyInput id="ex-rate" small currency="PHP-fixed" value={draft} onChange={setDraft} onEnter={commit} label="Pesos per 1 unit" />
    </div>
  )
}
