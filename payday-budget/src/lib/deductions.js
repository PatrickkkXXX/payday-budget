// Salary deductions by country, using 2026 rates. Every amount is a monthly
// estimate in the salary's currency. Employees can override any line to
// match their payslip. Sources are listed in README.md.

export const r2 = (x) => Math.round((x + Number.EPSILON) * 100) / 100
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x))
const peso = (n, dp = 0) => `₱${n.toLocaleString('en', { minimumFractionDigits: dp, maximumFractionDigits: dp })}`

/** Tax with brackets given as [upper limit, rate]. */
export function progressive(income, brackets) {
  let tax = 0, prev = 0
  for (const [top, rate] of brackets) {
    if (income > prev) tax += (Math.min(income, top) - prev) * rate
    prev = top
  }
  return Math.max(0, tax)
}

const US_BRACKETS = [[12_400, 0.10], [50_400, 0.12], [105_700, 0.22], [201_775, 0.24], [256_225, 0.32], [640_600, 0.35], [Infinity, 0.37]]
const KR_BRACKETS = [[14e6, 0.06], [50e6, 0.15], [88e6, 0.24], [150e6, 0.35], [300e6, 0.38], [500e6, 0.40], [1e9, 0.42], [Infinity, 0.45]]
const TW_BRACKETS = [[610_000, 0.05], [1_380_000, 0.12], [2_770_000, 0.20], [5_190_000, 0.30], [Infinity, 0.40]]

// ---------------- Philippines ----------------

/** Employee share is 5% of the Monthly Salary Credit (₱5,000 to ₱35,000, in ₱500 steps). */
export function phSss(salary) {
  const msc = salary < 5250 ? 5000 : Math.min(35000, Math.floor((salary + 250) / 500) * 500)
  return { amount: msc * 0.05, msc }
}

/** 5% premium shared with the employer; salary floor ₱10,000, ceiling ₱100,000. */
export const phPhilHealth = (salary) => clamp(salary, 10_000, 100_000) * 0.025

/** 1% if ₱1,500 and below, else 2% of salary up to ₱10,000 (max ₱200). */
export const phPagibig = (salary) => (salary <= 1500 ? salary * 0.01 : Math.min(salary, 10_000) * 0.02)

/** BIR graduated income tax under the TRAIN law (2023 onwards), yearly. */
export function phIncomeTaxAnnual(t) {
  if (t <= 250_000) return 0
  if (t <= 400_000) return (t - 250_000) * 0.15
  if (t <= 800_000) return 22_500 + (t - 400_000) * 0.20
  if (t <= 2_000_000) return 102_500 + (t - 800_000) * 0.25
  if (t <= 8_000_000) return 402_500 + (t - 2_000_000) * 0.30
  return 2_202_500 + (t - 8_000_000) * 0.35
}

export function koreaIncomeTaxAnnual(annual, socialInsAnnual) {
  const ded = annual <= 5e6 ? annual * 0.7
    : annual <= 15e6 ? 3.5e6 + (annual - 5e6) * 0.4
      : annual <= 45e6 ? 7.5e6 + (annual - 15e6) * 0.15
        : annual <= 1e8 ? 12e6 + (annual - 45e6) * 0.05
          : 14.75e6 + (annual - 1e8) * 0.02
  const tax = progressive(Math.max(0, annual - ded - 1.5e6 - socialInsAnnual), KR_BRACKETS)
  const credit = tax <= 1.3e6 ? tax * 0.55 : 715_000 + (tax - 1.3e6) * 0.30
  const cap = annual <= 33e6 ? 740_000
    : annual <= 70e6 ? Math.max(660_000, 740_000 - (annual - 33e6) * 0.008)
      : annual <= 120e6 ? Math.max(500_000, 660_000 - (annual - 70e6) * 0.5)
        : Math.max(200_000, 500_000 - (annual - 120e6) * 0.5)
  return Math.max(0, tax - Math.min(credit, cap) - 130_000)
}

const line = (key, label, note, amount) => ({ key, label, note, amount: Math.max(0, amount), custom: false, overridden: false })

/** Deduction lines and notes for one country. */
export function countryLines(country, S, { twResident = false, hkHelper = false } = {}) {
  const L = [], N = []
  const add = (...a) => L.push(line(...a))

  switch (country) {
    case 'PH': {
      const sss = phSss(S), ph = phPhilHealth(S), pi = phPagibig(S)
      add('sss', 'SSS', `5% of ${peso(sss.msc)} salary credit`, sss.amount)
      add('philhealth', 'PhilHealth', '2.5% of salary (your half of 5%)', ph)
      add('pagibig', 'Pag-IBIG', '2% of salary, up to ₱200', pi)
      const taxable = Math.max(0, S - sss.amount - ph - pi)
      add('wtax', 'Withholding tax (BIR)', `Taxable pay ${peso(taxable, 2)} a month`, phIncomeTaxAnnual(taxable * 12) / 12)
      N.push('Tax is zero if your yearly taxable pay is ₱250,000 or less, or if you earn minimum wage. Your 13th month pay up to ₱90,000 is not taxed.')
      break
    }
    case 'US': {
      const A = S * 12
      add('ss', 'Social Security', '6.2%, up to $184,500 a year', Math.min(A, 184_500) * 0.062 / 12)
      add('medicare', 'Medicare', '1.45%', (A * 0.0145 + Math.max(0, A - 200_000) * 0.009) / 12)
      add('fed', 'Federal income tax', 'Single, standard deduction $16,100', progressive(Math.max(0, A - 16_100), US_BRACKETS) / 12)
      add('state', 'State & local tax', 'Depends on your state. Type yours with “Change amounts”.', 0)
      N.push('Federal tax assumes you file as single. Married or with children, you may pay less.')
      break
    }
    case 'KR': {
      const pen = clamp(S, 400_000, 6_370_000) * 0.0475, hi = S * 0.03595, ltc = hi * (0.9448 / 7.19)
      add('pension', 'National Pension', '4.75%', pen)
      add('health', 'Health insurance', '3.595%', hi)
      add('ltc', 'Long-term care', '13.14% of health insurance', ltc)
      add('employ', 'Employment insurance', '0.9%', S * 0.009)
      const tax = koreaIncomeTaxAnnual(S * 12, (pen + hi + ltc) * 12)
      add('ktax', 'Income tax', 'Estimate for a single person', tax / 12)
      add('local', 'Local income tax', '10% of income tax', tax * 0.1 / 12)
      N.push('Income tax is an estimate. Your company may use the simplified tax table or the 19% flat rate for foreign workers.')
      break
    }
    case 'TW': {
      add('labor', 'Labor insurance', 'Your 20% share of 11.5%, salary up to NT$45,800', Math.min(S, 45_800) * 0.023)
      add('nhi', 'National Health Insurance', 'Your 30% share of 5.17%', Math.min(S, 313_000) * 0.01551)
      if (twResident) {
        const taxable = Math.max(0, S * 12 - 101_000 - 136_000 - 227_000)
        add('twtax', 'Income tax', 'Resident (183+ days), yearly estimate ÷ 12', progressive(taxable, TW_BRACKETS) / 12)
      } else {
        const rate = S <= 44_250 ? 0.06 : 0.18
        add('twtax', 'Income tax', `${rate * 100}% (first 183 days in Taiwan this year)`, S * rate)
        N.push('In your first 183 days in Taiwan each year, tax is 6% if your salary is NT$44,250 or less, and 18% if higher. After 183 days, change it in settings. You may get a refund when you file in May.')
      }
      break
    }
    case 'JP':
      add('jhealth', 'Health insurance', 'About 5% (your half)', S * 0.05)
      add('jpension', "Employees' pension", '9.15% (your half)', Math.min(S, 650_000) * 0.0915)
      add('jemploy', 'Employment insurance', 'About 0.55%', S * 0.0055)
      add('jtax', 'Income tax', 'Type yours from your payslip', 0)
      add('jres', 'Resident tax', 'Starts in your 2nd year. Type yours from your payslip', 0)
      N.push('Health insurance depends on your prefecture. Use “Change amounts” to type the exact amounts on your payslip.')
      break
    case 'HK':
      if (hkHelper) add('mpf', 'MPF', "Domestic helpers don't pay MPF", 0)
      else add('mpf', 'MPF', '5%, none below HK$7,100, max HK$1,500', S < 7100 ? 0 : Math.min(S * 0.05, 1500))
      N.push('Hong Kong salaries tax is paid once a year, not taken from each payday.')
      break
    case 'SG':
      N.push("Foreign workers don't pay CPF. Income tax is paid once a year, not taken from each payday.")
      break
    case 'AE': case 'SA': case 'QA': case 'KW':
      N.push('There is no income tax on your salary here, and social insurance is only for citizens. Add any company deductions with “Change amounts”.')
      break
    default:
      N.push('Type the deductions on your payslip using “Change amounts”.')
  }
  return { lines: L, notes: N }
}

/** Philippine contributions an OFW pays in pesos, converted to the salary currency. */
export function ofwLines(salary, phpRate, withPhilHealth) {
  const rate = phpRate > 0 ? phpRate : 1
  const out = []
  const add = (key, label, note, php) => out.push({ ...line(key, label, note, php / rate), php })
  add('ofw_sss', 'SSS (OFW)', '15% of ₱8,000 minimum salary credit', 1200)
  add('ofw_pagibig', 'Pag-IBIG (OFW)', '2% of ₱10,000 fund salary', 200)
  if (withPhilHealth) add('ofw_philhealth', 'PhilHealth (OFW)', '5% of income, ₱500 to ₱5,000', clamp(salary * rate, 10_000, 100_000) * 0.05)
  return out
}

/**
 * Gross to take-home for one month.
 * @param profile salary settings
 * @param extra   deductions the employee added: [{ id, name, amount }]
 */
export function salaryBreakdown(profile, extra = []) {
  const S = +profile.salary || 0
  if (profile.mode === 'net') return { gross: r2(S), net: r2(S), total: 0, lines: [], notes: [] }

  const { lines, notes } = countryLines(profile.country, S, { twResident: profile.tw_resident, hkHelper: profile.hk_helper })
  if (profile.country !== 'PH' && profile.ofw) lines.push(...ofwLines(S, +profile.php_rate, profile.ofw_philhealth))
  for (const d of extra) lines.push({ ...line(`x${d.id}`, d.name || 'Other deduction', 'Added by you', +d.amount || 0), custom: true, id: d.id })

  const overrides = profile.overrides || {}
  for (const l of lines) {
    if (!l.custom && overrides[l.key] != null) {
      l.calculated = l.amount
      l.amount = Math.max(0, +overrides[l.key])
      l.overridden = true
    }
  }
  const total = lines.reduce((sum, l) => sum + l.amount, 0)
  for (const l of lines) {
    l.amount = r2(l.amount)
    if (l.calculated != null) l.calculated = r2(l.calculated)
  }
  return { gross: r2(S), net: r2(S - total), total: r2(total), lines, notes }
}
