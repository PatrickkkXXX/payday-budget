// Simple line icons drawn with SVG paths.
const PATHS = {
  fare: '<rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 10h14M8 20l1-3M16 20l-1-3"/><circle cx="8.5" cy="13.5" r=".6"/><circle cx="15.5" cy="13.5" r=".6"/>',
  food: '<path d="M4 11h16a8 8 0 0 1-16 0zM8 4c0 2 1 2 1 4M12 3c0 2 1 2 1 4M16 4c0 2 1 2 1 4"/>',
  groceries: '<path d="M3 4h2l2.4 10.5a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 8H6.2"/><circle cx="9" cy="19" r="1.3"/><circle cx="17" cy="19" r="1.3"/>',
  rent: '<path d="M4 11 12 4l8 7M6 9.5V20h12V9.5M10 20v-5h4v5"/>',
  bills: '<path d="M13 3 5 14h6l-1 7 8-11h-6z"/>',
  phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
  family: '<circle cx="8" cy="7" r="2.6"/><circle cx="16.5" cy="8.5" r="2"/><path d="M3.5 19c0-3 2-5 4.5-5s4.5 2 4.5 5M13 19c0-2.4 1.5-4 3.5-4s3.5 1.6 3.5 4"/>',
  loans: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18M7 14.5h4"/>',
  health: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/><path d="M12 9v5M9.5 11.5h5"/>',
  school: '<path d="M2.5 9 12 5l9.5 4L12 13z"/><path d="M6.5 11v4.5c0 1.5 2.5 2.5 5.5 2.5s5.5-1 5.5-2.5V11"/>',
  shopping: '<path d="M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2"/>',
  fun: '<path d="m12 3 2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.4l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8z"/>',
  other: '<circle cx="6" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18" cy="12" r="1.3"/>',
  work: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5h6v2M3 12h18"/>',
  gift: '<rect x="4" y="9" width="16" height="11" rx="1"/><path d="M3 9h18M12 9v11M12 9c-1-3-5-4-5-1.5S12 9 12 9zm0 0c1-3 5-4 5-1.5S12 9 12 9z"/>',
  coin: '<circle cx="12" cy="12" r="8"/><path d="M12 7.5v9M14.5 9.5c-.5-.8-1.4-1.2-2.5-1.2-1.4 0-2.5.8-2.5 1.8 0 2.4 5 1.3 5 3.8 0 1-1.1 1.8-2.5 1.8-1.1 0-2-.4-2.5-1.2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  wallet: '<path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3"/><path d="M4 7.5v10A2.5 2.5 0 0 0 6.5 20H20V8H6.5A2.5 2.5 0 0 1 4 5.5"/><circle cx="16" cy="14" r="1.4"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4M8 14h2M14 14h2M8 17h2"/>',
  cash: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.8"/><path d="M6 9.5v5M18 9.5v5"/>',
  plane: '<path d="M2.5 13.5 21 6l-4.5 13-4-5.5z"/><path d="m12.5 13.5 8.5-7.5"/>',
  piggy: '<path d="M5 11a7 6 0 0 1 13.2-2.6L21 8v4l-2 .6A7 6 0 0 1 16 16v3h-3v-2h-3v2H7v-3.3A6 6 0 0 1 5 11z"/><circle cx="15.5" cy="10" r=".7"/><path d="M10 7.5h3"/>',
  basket: '<path d="M4 7h16l-1.5 12h-13z"/><path d="M8 7V5h8v2M9.5 12h5"/>',
  lock: '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
}

export default function Icon({ name, size = 26, className = 'ic', strokeWidth = 1.8 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: PATHS[name] || PATHS.other }}
    />
  )
}

export const catColor = (slot) => `var(--c${slot || 6})`
