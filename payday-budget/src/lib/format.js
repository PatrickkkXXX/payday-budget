// Money and date helpers.

export function money(n, currency = 'PHP') {
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency, currencyDisplay: 'narrowSymbol' }).format(n || 0)
  } catch {
    return `${currency} ${(Math.round((n || 0) * 100) / 100).toLocaleString('en')}`
  }
}

export function currencySymbol(currency = 'PHP') {
  try {
    const parts = new Intl.NumberFormat('en', { style: 'currency', currency, currencyDisplay: 'narrowSymbol' }).formatToParts(0)
    return parts.find((p) => p.type === 'currency')?.value || currency
  } catch {
    return currency
  }
}

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const pad = (n) => String(n).padStart(2, '0')
export const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export function parseISO(s) {
  const [y, m, d] = String(s || '').split('-').map(Number)
  return y ? new Date(y, m - 1, d) : null
}
export function today() {
  const t = new Date()
  return new Date(t.getFullYear(), t.getMonth(), t.getDate())
}
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }
export const shortDate = (d) => `${MONTHS[d.getMonth()]} ${d.getDate()}`
export function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}
export const plural = (n, unit) => `${n} ${unit}${n === 1 ? '' : 's'}`

/** Move the anchor date to the previous/next cut-off or month. */
export function shiftAnchor(anchorISO, view, dir) {
  const a = parseISO(anchorISO)
  if (view === 'month') return iso(new Date(a.getFullYear(), a.getMonth() + dir, 1))
  const first = a.getDate() <= 15
  if (dir > 0) return first ? iso(new Date(a.getFullYear(), a.getMonth(), 16)) : iso(new Date(a.getFullYear(), a.getMonth() + 1, 1))
  return first ? iso(new Date(a.getFullYear(), a.getMonth() - 1, 16)) : iso(new Date(a.getFullYear(), a.getMonth(), 1))
}

export function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}
