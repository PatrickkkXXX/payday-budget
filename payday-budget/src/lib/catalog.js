// Fixed lists the app uses: categories, countries, currencies.

const cat = ([icon, label, short, color]) => ({ icon, label, short, color })

export const EXPENSE_CATEGORIES = [
  ['fare', 'Transportation / Fare', 'Fare', 1],
  ['food', 'Food & Meals', 'Food', 2],
  ['groceries', 'Groceries', 'Groceries', 3],
  ['rent', 'Rent & Housing', 'Rent', 4],
  ['bills', 'Bills & Utilities', 'Bills', 5],
  ['phone', 'Phone & Internet', 'Load / Internet', 6],
  ['family', 'Family Support', 'Family / Padala', 7],
  ['loans', 'Loans & Debt', 'Loans', 8],
  ['health', 'Health & Medicine', 'Medicine', 7],
  ['school', 'Education', 'School', 1],
  ['shopping', 'Shopping', 'Shopping', 4],
  ['fun', 'Entertainment', 'Fun', 2],
  ['other', 'Other', 'Other', 6],
].map(cat)

export const INCOME_CATEGORIES = [
  ['work', 'Overtime', 'Overtime', 3],
  ['gift', 'Bonus / 13th month', 'Bonus', 2],
  ['coin', 'Allowance', 'Allowance', 5],
  ['work', 'Side income', 'Side job', 3],
  ['gift', 'Gift', 'Gift', 2],
  ['other', 'Other income', 'Other', 6],
].map(cat)

export function categoryInfo(label) {
  return [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].find((c) => c.label === label)
    || { icon: 'other', label, short: label, color: 6 }
}

export const COUNTRIES = [
  { code: 'PH', name: 'Philippines', currency: 'PHP' },
  { code: 'US', name: 'USA', currency: 'USD' },
  { code: 'KR', name: 'South Korea', currency: 'KRW' },
  { code: 'TW', name: 'Taiwan', currency: 'TWD' },
  { code: 'JP', name: 'Japan', currency: 'JPY' },
  { code: 'HK', name: 'Hong Kong', currency: 'HKD' },
  { code: 'SG', name: 'Singapore', currency: 'SGD' },
  { code: 'AE', name: 'UAE', currency: 'AED' },
  { code: 'SA', name: 'Saudi Arabia', currency: 'SAR' },
  { code: 'QA', name: 'Qatar', currency: 'QAR' },
  { code: 'KW', name: 'Kuwait', currency: 'KWD' },
  { code: 'OT', name: 'Other country', currency: null },
]

export const countryInfo = (code) => COUNTRIES.find((c) => c.code === code) || COUNTRIES[COUNTRIES.length - 1]

export const CURRENCIES = [
  ['PHP', 'Philippine peso'], ['USD', 'US dollar'], ['KRW', 'Korean won'], ['TWD', 'Taiwan dollar'],
  ['JPY', 'Japanese yen'], ['HKD', 'Hong Kong dollar'], ['SGD', 'Singapore dollar'], ['AED', 'UAE dirham'],
  ['SAR', 'Saudi riyal'], ['QAR', 'Qatari riyal'], ['KWD', 'Kuwaiti dinar'], ['EUR', 'Euro'],
  ['GBP', 'British pound'], ['CAD', 'Canadian dollar'], ['AUD', 'Australian dollar'], ['NZD', 'New Zealand dollar'],
  ['MYR', 'Malaysian ringgit'], ['CNY', 'Chinese yuan'], ['THB', 'Thai baht'], ['BHD', 'Bahraini dinar'],
  ['OMR', 'Omani rial'], ['ILS', 'Israeli shekel'], ['CHF', 'Swiss franc'], ['INR', 'Indian rupee'],
  ['IDR', 'Indonesian rupiah'],
].map(([code, name]) => ({ code, name }))

// Approximate pesos per 1 unit. Only a starting value for OFW peso
// contributions; the employee types today's rate.
export const PHP_RATE = {
  PHP: 1, USD: 58, KRW: 0.041, TWD: 1.8, JPY: 0.38, HKD: 7.4, SGD: 44, AED: 15.8, SAR: 15.5, QAR: 15.9,
  KWD: 190, EUR: 66, GBP: 77, CAD: 42, AUD: 38, NZD: 34, MYR: 13, CNY: 8, THB: 1.7, BHD: 154, OMR: 151,
  ILS: 15.5, CHF: 72, INR: 0.68, IDR: 0.0036,
}

export const catalog = {
  countries: COUNTRIES,
  currencies: CURRENCIES,
  expense_categories: EXPENSE_CATEGORIES,
  income_categories: INCOME_CATEGORIES,
  php_rates: PHP_RATE,
}
