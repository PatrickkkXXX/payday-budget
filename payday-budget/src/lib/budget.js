// Pay periods, repeating expenses and the budget summary.
import { categoryInfo, countryInfo } from './catalog'
import { r2, salaryBreakdown } from './deductions'
import { addDays, DAYS_FULL, iso, MONTHS, ordinal, parseISO, plural } from './format'

const lastDay = (y, m) => new Date(y, m + 1, 0).getDate()
const dayDiff = (a, b) => Math.round((b - a) / 86_400_000)

/** The cut-off (1–15 or 16–end) or month that contains the anchor date. */
export function period(view, anchor) {
  const y = anchor.getFullYear(), m = anchor.getMonth(), ld = lastDay(y, m)
  if (view === 'month') return { start: new Date(y, m, 1), end: new Date(y, m, ld), kind: 'month' }
  if (anchor.getDate() <= 15) return { start: new Date(y, m, 1), end: new Date(y, m, 15), kind: 'cutoff' }
  return { start: new Date(y, m, 16), end: new Date(y, m, ld), kind: 'cutoff' }
}

/**
 * How many times an item happens between ps and pe (inclusive).
 * workdays: 0=Sunday … 6=Saturday
 */
export function occurrences(freq, start, end, ps, pe, workdays = []) {
  if (freq === 'once') return { n: start >= ps && start <= pe ? 1 : 0, unit: 'time' }
  const a = start > ps ? start : ps
  const b = end && end < pe ? end : pe
  if (a > b) return { n: 0, unit: '' }
  let n = 0
  for (let d = new Date(a); d <= b; d = addDays(d, 1)) {
    const day = d.getDate(), ld = lastDay(d.getFullYear(), d.getMonth())
    if (freq === 'daily') n++
    else if (freq === 'workday') n += workdays.includes(d.getDay()) ? 1 : 0
    else if (freq === 'weekly') n += d.getDay() === start.getDay() ? 1 : 0
    else if (freq === 'cutoff') n += day === 15 || day === ld ? 1 : 0 // paid on the 15th and last day
    else if (freq === 'monthly') n += day === Math.min(start.getDate(), ld) ? 1 : 0
  }
  const unit = { daily: 'day', workday: 'work day', weekly: 'week', cutoff: 'payday', monthly: 'month' }[freq] || ''
  return { n, unit }
}

export function scheduleText(freq, start) {
  return {
    once: `on ${MONTHS[start.getMonth()]} ${start.getDate()}`,
    workday: 'every work day',
    daily: 'every day',
    weekly: `every ${DAYS_FULL[start.getDay()]}`,
    cutoff: 'every payday',
    monthly: `every month, on the ${ordinal(start.getDate())}`,
  }[freq] || ''
}

/** Everything the main screen shows for one cut-off or month. */
export function summary({ profile, items, extraDeductions }, view, anchor, today) {
  const p = period(view, anchor)
  const slip = salaryBreakdown(profile, extraDeductions)
  const takeHome = p.kind === 'month' ? slip.net : slip.net / 2

  const lines = []
  const byCat = {}
  let extra = 0, expenses = 0
  for (const it of items) {
    const start = parseISO(it.start_date), end = it.end_date ? parseISO(it.end_date) : null
    const { n, unit } = occurrences(it.freq, start, end, p.start, p.end, profile.workdays || [])
    if (!n) continue
    const total = n * +it.amount
    const info = categoryInfo(it.category)
    lines.push({
      ...it, name: it.name || info.short, note: it.name || '', icon: info.icon, color: info.color,
      times: n, unit, total: r2(total), schedule: scheduleText(it.freq, start),
      count_text: it.freq === 'once' ? '' : plural(n, unit),
    })
    if (it.kind === 'income') extra += total
    else { expenses += total; byCat[it.category] = (byCat[it.category] || 0) + total }
  }

  const income = takeHome + extra
  const savings = profile.save_type === 'pct' ? Math.max(0, income) * (+profile.save_val || 0) / 100
    : profile.save_type === 'fixed' ? (+profile.save_val || 0) * (p.kind === 'month' ? 1 : 0.5) : 0
  const net = income - expenses - savings

  const days = dayDiff(p.start, p.end) + 1
  const [daysLeft, status] = today < p.start ? [days, 'upcoming'] : today > p.end ? [0, 'past'] : [dayDiff(today, p.end) + 1, 'current']

  lines.sort((a, b) => (a.kind === 'income' ? 0 : 1) - (b.kind === 'income' ? 0 : 1) || b.total - a.total)
  const by_category = Object.entries(byCat)
    .sort((a, b) => b[1] - a[1])
    .map(([c, v]) => ({ ...categoryInfo(c), amount: r2(v), pct: income > 0 ? Math.round((v / income) * 100) : null }))

  return {
    currency: profile.currency,
    period: { start: iso(p.start), end: iso(p.end), kind: p.kind, status, days_left: daysLeft },
    salary: {
      ...slip, country: profile.country, country_name: countryInfo(profile.country).name,
      mode: profile.mode, pay_type: profile.pay_type, ofw: !!profile.ofw,
    },
    take_home: r2(takeHome),
    extra: r2(extra),
    income: r2(income),
    expenses: r2(expenses),
    savings: r2(savings),
    net: r2(net),
    per_day: daysLeft > 0 && net > 0 ? r2(net / daysLeft) : 0,
    items: lines,
    by_category,
  }
}

/** How much a new entry adds up to in the period on screen. */
export function preview({ amount, freq, start_date, end_date, view, anchor }, workdays) {
  const p = period(view, parseISO(anchor))
  const { n, unit } = occurrences(freq, parseISO(start_date), end_date ? parseISO(end_date) : null, p.start, p.end, workdays)
  return { times: n, unit, total: r2(n * amount), count_text: n ? plural(n, unit) : '' }
}
