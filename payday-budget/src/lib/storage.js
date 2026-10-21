// Saves everything in the browser (localStorage), so each person's last
// inputs are there when they open the site again. No account, no server.
import { catalog, countryInfo, PHP_RATE } from './catalog'
import { preview as previewItem, summary as buildSummary } from './budget'
import { salaryBreakdown } from './deductions'
import { iso, parseISO, today } from './format'

const KEY = 'payday-budget:v1'

export const DEFAULT_PROFILE = {
  country: 'PH', currency: 'PHP', pay_type: 'cutoff', salary: 0, mode: 'gross',
  workdays: [1, 2, 3, 4, 5], save_type: 'pct', save_val: 10, setup_done: false,
  ofw: false, ofw_philhealth: false, php_rate: 1, tw_resident: false, hk_helper: false, overrides: {},
}

const empty = () => ({ profile: { ...DEFAULT_PROFILE }, items: [], extraDeductions: [], nextId: 1, ui: {} })

let memory = null // used when the browser blocks storage (e.g. some private windows)

export function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const data = JSON.parse(raw)
      return { ...empty(), ...data, profile: { ...DEFAULT_PROFILE, ...data.profile } }
    }
  } catch { /* storage blocked or corrupted */ }
  return memory || empty()
}

function save(data) {
  memory = data
  try { localStorage.setItem(KEY, JSON.stringify(data)) } catch { /* storage full or blocked */ }
  return data
}

function update(fn) {
  const data = load()
  fn(data)
  return save(data)
}

export function storageWorks() {
  try { localStorage.setItem(`${KEY}:test`, '1'); localStorage.removeItem(`${KEY}:test`); return true } catch { return false }
}

const clean = (item) => ({
  kind: item.kind === 'income' ? 'income' : 'expense',
  name: String(item.name || '').trim().slice(0, 80),
  category: item.category,
  amount: Math.max(0, +item.amount || 0),
  freq: item.freq,
  start_date: item.start_date,
  end_date: item.freq === 'once' ? null : item.end_date || null,
})

/**
 * Same shape as a small API, so screens stay simple. Every method returns a
 * Promise, which also makes it easy to add a server later if you want one.
 */
export const store = {
  catalog: async () => catalog,

  profile: async () => load().profile,

  updateProfile: async (patch) => {
    const data = update((d) => {
      const p = d.profile
      const next = { ...patch }
      // Picking a country also picks its money and clears payslip overrides.
      if (next.country && next.country !== p.country) {
        const cur = countryInfo(next.country).currency
        if (cur && !next.currency) next.currency = cur
        next.overrides ??= {}
        if (next.country === 'PH') next.ofw = false
      }
      if (next.currency && next.php_rate == null) next.php_rate = PHP_RATE[next.currency] ?? p.php_rate
      if (next.workdays) next.workdays = [...new Set(next.workdays.map(Number))].sort()
      d.profile = { ...p, ...next }
    })
    return data.profile
  },

  eraseEverything: async () => { save(empty()) },

  summary: async ({ view, anchor }) => buildSummary(load(), view, parseISO(anchor), today()),

  preview: async (body) => previewItem(body, load().profile.workdays),

  addItem: async (item) => {
    let created
    update((d) => { created = { id: d.nextId++, ...clean(item) }; d.items.push(created) })
    return created
  },
  updateItem: async (id, item) => {
    update((d) => { d.items = d.items.map((x) => (x.id === id ? { id, ...clean(item) } : x)) })
  },
  deleteItem: async (id) => { update((d) => { d.items = d.items.filter((x) => x.id !== id) }) },

  addDeduction: async ({ name, amount }) => {
    update((d) => { d.extraDeductions.push({ id: d.nextId++, name: name || 'Other deduction', amount: Math.max(0, +amount || 0) }) })
  },
  updateDeduction: async (id, { name, amount }) => {
    update((d) => { d.extraDeductions = d.extraDeductions.map((x) => (x.id === id ? { id, name, amount: Math.max(0, +amount || 0) } : x)) })
  },
  deleteDeduction: async (id) => { update((d) => { d.extraDeductions = d.extraDeductions.filter((x) => x.id !== id) }) },

  /** Remembers small screen choices (like "This cut-off" vs "Whole month"). */
  getUi: (key, fallback) => load().ui?.[key] ?? fallback,
  setUi: (key, value) => { update((d) => { d.ui = { ...d.ui, [key]: value } }) },

  async exportCsv() {
    const data = load(), cur = data.profile.currency
    const slip = salaryBreakdown(data.profile, data.extraDeductions)
    const rows = [['Section', 'Name', 'Category', 'Amount', 'How often', 'Start date', 'Stop date', 'Currency']]
    rows.push(['Salary', 'Salary before deductions', '', slip.gross, 'monthly', '', '', cur])
    for (const l of slip.lines) rows.push(['Deduction', l.label, '', l.amount, 'monthly', '', '', cur])
    rows.push(['Salary', 'Take-home pay', '', slip.net, 'monthly', '', '', cur])
    for (const it of data.items) {
      rows.push([it.kind === 'income' ? 'Extra money' : 'Expense', it.name, it.category, it.amount, it.freq, it.start_date, it.end_date || '', cur])
    }
    const csv = rows.map((r) => r.map((v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : v)).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `my-budget-${iso(today())}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  },
}
