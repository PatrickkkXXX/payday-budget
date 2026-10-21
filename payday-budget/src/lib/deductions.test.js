import { describe, expect, it } from 'vitest'
import { phPhilHealth, phSss, salaryBreakdown } from './deductions'

const amounts = (b) => Object.fromEntries(b.lines.map((l) => [l.key, l.amount]))
const base = { mode: 'gross', overrides: {} }

describe('Philippines', () => {
  it('computes SSS, PhilHealth, Pag-IBIG and tax for ₱32,000', () => {
    const b = salaryBreakdown({ ...base, country: 'PH', salary: 32000 })
    expect(amounts(b)).toEqual({ sss: 1600, philhealth: 800, pagibig: 200, wtax: 1285 })
    expect(b.net).toBe(28115)
  })

  it('uses SSS salary credit brackets', () => {
    expect(phSss(4000)).toEqual({ amount: 250, msc: 5000 })
    expect(phSss(24300).msc).toBe(24500)
    expect(phSss(90000).msc).toBe(35000)
  })

  it('applies PhilHealth floor and ceiling', () => {
    expect(phPhilHealth(5000)).toBe(250)
    expect(phPhilHealth(150000)).toBe(2500)
  })

  it('has no income tax for a ₱20,000 salary', () => {
    expect(amounts(salaryBreakdown({ ...base, country: 'PH', salary: 20000 })).wtax).toBe(0)
  })
})

describe('other countries and options', () => {
  it('skips deductions for take-home pay', () => {
    const b = salaryBreakdown({ ...base, country: 'PH', salary: 25000, mode: 'net' })
    expect(b.lines).toEqual([])
    expect(b.net).toBe(25000)
  })

  it('uses Taiwan 6% / 18% rate in the first 183 days', () => {
    expect(amounts(salaryBreakdown({ ...base, country: 'TW', salary: 30000 })).twtax).toBe(1800)
    expect(amounts(salaryBreakdown({ ...base, country: 'TW', salary: 50000 })).twtax).toBe(9000)
  })

  it('converts OFW peso contributions', () => {
    const a = amounts(salaryBreakdown({ ...base, country: 'AE', salary: 5000, ofw: true, php_rate: 15 }))
    expect(a.ofw_sss).toBe(80)
    expect(a.ofw_pagibig).toBeCloseTo(13.33, 2)
    expect(a.ofw_philhealth).toBeUndefined()
  })

  it('applies overrides and added deductions', () => {
    const b = salaryBreakdown({ ...base, country: 'PH', salary: 32000, overrides: { wtax: 1000 } }, [{ id: 7, name: 'Salary loan', amount: 500 }])
    const a = amounts(b)
    expect(a.wtax).toBe(1000)
    expect(a.x7).toBe(500)
    expect(b.net).toBe(32000 - 1600 - 800 - 200 - 1000 - 500)
  })
})
