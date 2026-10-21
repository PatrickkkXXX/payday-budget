import { describe, expect, it } from 'vitest'
import { occurrences, period, summary } from './budget'
import { iso, parseISO as d } from './format'

describe('periods', () => {
  it('splits months into cut-offs', () => {
    const a = period('cutoff', d('2026-10-03')), b = period('cutoff', d('2026-10-21')), m = period('month', d('2026-02-10'))
    expect([iso(a.start), iso(a.end)]).toEqual(['2026-10-01', '2026-10-15'])
    expect([iso(b.start), iso(b.end)]).toEqual(['2026-10-16', '2026-10-31'])
    expect(iso(m.end)).toBe('2026-02-28')
  })
})

describe('repeating items', () => {
  it('counts work days', () => {
    expect(occurrences('workday', d('2026-10-01'), null, d('2026-10-16'), d('2026-10-31'), [1, 2, 3, 4, 5]).n).toBe(11)
  })
  it('moves a 31st monthly bill to the last day of a short month', () => {
    expect(occurrences('monthly', d('2026-01-31'), null, d('2026-02-16'), d('2026-02-28')).n).toBe(1)
  })
  it('stops at the end date', () => {
    expect(occurrences('daily', d('2026-10-01'), d('2026-10-05'), d('2026-10-01'), d('2026-10-15')).n).toBe(5)
  })
})

describe('summary', () => {
  it('works out money left for the cut-off', () => {
    const data = {
      profile: { country: 'PH', salary: 32000, mode: 'gross', currency: 'PHP', workdays: [1, 2, 3, 4, 5], save_type: 'pct', save_val: 10, overrides: {} },
      items: [
        { id: 1, kind: 'expense', name: 'Fare', category: 'Transportation / Fare', amount: 96, freq: 'workday', start_date: '2026-10-01', end_date: null },
        { id: 2, kind: 'income', name: 'OT', category: 'Overtime', amount: 1800, freq: 'once', start_date: '2026-10-19', end_date: null },
      ],
      extraDeductions: [],
    }
    const s = summary(data, 'cutoff', d('2026-10-21'), d('2026-10-21'))
    expect(s.take_home).toBe(14057.5)
    expect(s.expenses).toBe(1056)
    expect(s.savings).toBe(1585.75)
    expect(s.net).toBe(13215.75)
    expect(s.period.days_left).toBe(11)
    expect(s.items[0].kind).toBe('income')
    expect(s.items[1].count_text).toBe('11 work days')
  })
})
