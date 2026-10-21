# Payday Budget

A salary and budget tracker website for employees and OFWs, built with **React + Vite**. It's designed so people who aren't comfortable with technology can use it easily.

- **No login and no database.** Everything is saved in the person's own browser (localStorage).
- **Remembers your last inputs.** When someone opens the site again on the same phone or computer, their salary, expenses and settings are still there.
- **Private by default.** Nothing is sent to a server, and each device keeps its own data.

## Features

- **Guided setup:** a few questions with big buttons: where you work, how often you're paid (cut-off or monthly), your salary, and a savings goal.
- **Salary deductions per cut-off and per month (2026 rates):**
  - **Philippines:** SSS, PhilHealth, Pag-IBIG and BIR withholding tax (TRAIN law)
  - **USA:** Social Security, Medicare and federal tax
  - **South Korea:** pension, health insurance, long-term care, employment insurance, income tax and local income tax
  - **Taiwan:** labor insurance, health insurance (NHI), and 6%/18% or resident income tax
  - **Japan, Hong Kong (MPF, domestic-helper exemption), Singapore, UAE, Saudi Arabia, Qatar, Kuwait, or any other country**
  - **OFW option:** adds SSS, Pag-IBIG and optional PhilHealth paid in pesos, converted with an exchange rate you set
  - **Change amounts:** type the exact amounts from your payslip, or add other deductions such as loans
- **Expenses that repeat:** one time, every work day (fare, lunch), every day, every week, every payday or every month, each with an optional end date
- **Money left to spend** for this cut-off or month, with a daily allowance and a color-coded breakdown by category
- **Extra money:** overtime, bonus or 13th month, allowances, side income
- **Save a copy as a CSV file**
- **Light and dark mode** that follows the phone or computer setting

## Project structure

```
payday-budget/
├── index.html
├── package.json
├── vite.config.js
├── public/favicon.svg
└── src/
    ├── main.jsx                 Starts the app
    ├── App.jsx                  Screens: setup, main, settings
    ├── styles.css               Design (light and dark mode)
    ├── components/              Dashboard, MoneyCard, Payslip, ItemForm, ItemList,
    │                            CategoryBars, SetupWizard, SettingsScreen, Header…
    └── lib/
        ├── deductions.js        Taxes and contributions by country
        ├── budget.js            Pay periods, repeating expenses, summary
        ├── catalog.js           Categories, countries, currencies
        ├── storage.js           Saves and loads data in the browser
        ├── format.js            Money and date helpers
        └── *.test.js            Automatic tests for the calculations
```

## Run it on your computer

You need **Node.js 18 or newer** (download the LTS version from nodejs.org).

```bash
npm install        # one time only
npm run dev        # then open http://localhost:5173
```

Other commands:

```bash
npm test           # check the calculations (13 tests)
npm run build      # make the finished website in the dist folder
npm run preview    # look at the finished website before publishing it
```

## Put it online (free)

`npm run build` creates a `dist` folder containing the whole website. You can host it anywhere that serves plain files:

- **Netlify:** go to app.netlify.com/drop and drag the `dist` folder onto the page.
- **Vercel:** import the GitHub repository. Vercel detects Vite automatically.
- **GitHub Pages:** works with public repositories on free GitHub accounts.

## Good to know

- Data is stored per browser and per device. If someone clears their browser data or uses a different phone, they start fresh. The **Save a copy (CSV file)** button in settings lets them keep a backup.
- In private or incognito windows, data is erased when the window closes. The app shows a warning when it can't save.

## About the numbers

Deduction amounts are **estimates** based on 2026 rates from public sources:

- **Philippines:** SSS 15% (employee 5%, MSC ₱5,000–₱35,000), PhilHealth 5% (floor ₱10,000, ceiling ₱100,000), Pag-IBIG 2% up to ₱10,000, and the TRAIN law tax table
- **USA:** 2026 federal brackets for a single filer, $16,100 standard deduction, $184,500 Social Security wage base
- **South Korea:** 2026 rates for pension (4.75%), health insurance (3.595%), long-term care and employment insurance (0.9%)
- **Taiwan:** 2026 minimum wage NT$29,500, the 6%/18% non-resident threshold of NT$44,250, and resident brackets

Actual payslips can differ because of allowances, overtime, company rules or tax status, so every line can be changed in the app. Confirm figures with HR or the agency concerned.
