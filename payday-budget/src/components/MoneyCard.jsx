import { money, plural } from '../lib/format'

/** The big green "money left" card, styled like a banknote. */
export default function MoneyCard({ s }) {
  const cur = s.currency
  const negative = s.net < 0
  const left = s.period.days_left
  const base = Math.max(s.income, s.expenses + s.savings, 1)
  const pct = (v) => `${(v / base) * 100}%`

  return (
    <section className={`card hero${negative ? ' neg' : ''}`} aria-label="Money left">
      <p className="lead">{negative ? 'You are short by' : 'Money left to spend'}</p>
      <div className="big">{money(Math.abs(s.net), cur)}</div>
      <p className="say">
        {negative
          ? 'Your expenses and savings are more than your pay for this period. Try to remove or lower some expenses.'
          : left > 0
            ? <>That's about <strong className="num">{money(s.per_day, cur)}</strong> a day for the next {plural(left, 'day')}.</>
            : 'This period is over. This is what was left.'}
      </p>
      <div className="meter" aria-hidden="true">
        <span className="m-exp" style={{ width: pct(Math.min(s.expenses, base)) }} />
        <span className="m-save" style={{ width: pct(Math.min(s.savings, Math.max(base - s.expenses, 0))) }} />
        <span className="m-left" style={{ width: pct(Math.max(s.net, 0)) }} />
      </div>
      <div className="legend" aria-hidden="true">
        <span><i className="m-exp" />Expenses</span><span><i className="m-save" />Savings</span><span><i className="m-left" />Left</span>
      </div>
      <div className="lines">
        <div className="line"><span>{s.period.kind === 'month' ? 'Take-home pay (month)' : 'Take-home pay (half month)'}</span><span className="num">+ {money(s.take_home, cur)}</span></div>
        {s.extra > 0 && <div className="line"><span>Extra money</span><span className="num">+ {money(s.extra, cur)}</span></div>}
        <div className="line"><span>Expenses</span><span className="num">− {money(s.expenses, cur)}</span></div>
        <div className="line"><span>Savings</span><span className="num">− {money(s.savings, cur)}</span></div>
      </div>
    </section>
  )
}
