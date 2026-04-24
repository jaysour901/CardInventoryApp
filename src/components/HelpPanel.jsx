import { useState } from 'react'

const TOPICS = [
  {
    id: 'install',
    title: '📲 Installing the App',
    body: [
      'Set Collector is a Progressive Web App (PWA) — you can install it on your phone or desktop and use it like a native app, even offline.',
      'ON iPHONE / SAFARI:',
      '• Open the site in Safari.',
      '• Tap the Share button (the box with an arrow at the bottom of the screen).',
      '• Scroll down and tap "Add to Home Screen".',
      '• Tap Add — the app icon will appear on your home screen.',
      'ON ANDROID / CHROME:',
      '• Open the site in Chrome.',
      '• Tap the three-dot menu in the top right.',
      '• Tap "Add to Home Screen" or "Install App".',
      'ON DESKTOP (CHROME / EDGE):',
      '• Look for the install icon (⊕) in the browser address bar.',
      '• Click it and confirm — the app opens in its own window.',
      'Once installed, your data is stored on your device and works offline.',
    ],
  },
  {
    id: 'bulk-import',
    title: '📋 Bulk Import — Loading a Full Checklist',
    body: [
      'Bulk Import lets you paste an entire card checklist at once instead of adding cards one by one. The best source is TCDB.com (Trading Card Database).',
      'HOW TO GET DATA FROM TCDB.com:',
      '• Go to tcdb.com and find the set you want.',
      '• Open the checklist view and select all the text (Ctrl+A / Cmd+A).',
      '• Copy it (Ctrl+C / Cmd+C).',
      'HOW TO IMPORT IT:',
      '• Open a set in Set Collector.',
      '• Tap "Bulk Import".',
      '• Paste the copied text into the text box.',
      '• The app previews how many cards were found and how many are new.',
      '• Tap "Import X Cards" to add them.',
      'WHAT GETS SKIPPED:',
      '• Cards whose number already exists in the set are skipped automatically — no duplicates.',
      '• Tap the ⓘ tutorial link inside the Bulk Import panel for step-by-step screenshots.',
    ],
  },
  {
    id: 'tracking',
    title: '✅ Tracking Cards — Have, Need & Copies',
    body: [
      'Each card in a set has a checkbox that tracks whether you own it.',
      'MARKING A CARD:',
      '• Tap the checkbox on a card to toggle it between Need and Have.',
      '• When marked Have, the card gets a green left border and the copies count defaults to 1.',
      '• When unchecked back to Need, the copies count resets to 0.',
      'COPIES STEPPER:',
      '• If you own a card, a − / number / + control appears on the right.',
      '• Use it to track duplicates — useful if you have extras for trading.',
      '• The count cannot go below 1 while the card is marked as owned.',
      'FILTERING:',
      '• Use the All / Have / Need tabs at the top to view only the cards you want.',
      '• The summary bar at the top always shows your total, have, need, and completion percentage.',
    ],
  },
  {
    id: 'condition',
    title: '🏷️ Condition & Notes',
    body: [
      'Each card can store a condition grade and a short notes field for extra detail.',
      'HOW TO EDIT:',
      '• Tap the pencil icon (✎) on any card row to expand the edit panel.',
      '• Tap it again to close.',
      'CONDITION:',
      '• Choose from: Raw, Good, VG, EX, NM, NM-MT, Mint, or Graded.',
      '• The grade appears as a colour-coded badge on the card row once set.',
      '• Leave it blank if you don\'t want to track condition.',
      'NOTES:',
      '• Up to 80 characters — use it for anything useful: PSA 8, from trade, off-center, needs toploader, etc.',
      '• Notes appear as a small line below the player name on the card row.',
    ],
  },
  {
    id: 'sport',
    title: '🏆 Sport Categories & Filtering',
    body: [
      'Sets can be tagged with a sport so you can filter your home screen by category.',
      'TAGGING A SET:',
      '• When creating a new set, choose a sport from the Sport dropdown in the form.',
      '• Inside any set, use the Sport dropdown in the header to tag or change it at any time.',
      '• Options: Baseball, Football, Basketball, Hockey, Other.',
      '• Leave it blank for untagged sets — they always appear under "All".',
      'FILTERING ON THE HOME SCREEN:',
      '• Once you have tagged sets, filter buttons appear below "My Card Sets".',
      '• Tap a sport to show only those sets.',
      '• Tap "All" to see everything again.',
    ],
  },
  {
    id: 'search',
    title: '🔍 Searching Within a Set',
    body: [
      'The search bar inside a set lets you quickly find specific cards.',
      'HOW IT WORKS:',
      '• Tap the search bar and type a player name or card number.',
      '• Results update instantly as you type.',
      '• Search works on top of the Have / Need filter — for example, switch to Need and then search to find a specific card you still require.',
      'CLEARING SEARCH:',
      '• Tap the × button inside the search bar to clear it.',
      '• The result count shows how many cards match while a search is active.',
    ],
  },
  {
    id: 'print',
    title: '🖨️ Printing a Checklist',
    body: [
      'You can print a card checklist directly from any set page.',
      'HOW TO PRINT:',
      '• Open a set.',
      '• Use the All / Have / Need tabs to choose what you want to print.',
      '• Tap the Print button on the right of the toolbar.',
      '• Your browser\'s print dialog will open.',
      'WHAT GETS PRINTED:',
      '• A clean black-and-white checklist — all interactive buttons and controls are hidden.',
      '• The set name and filter context (e.g. "Cards Needed · 47 Need") appear at the top.',
      '• Only the cards visible under the current filter are printed, so switching to Need before printing gives you a want list.',
    ],
  },
  {
    id: 'export',
    title: '↓ Export — Backing Up Your Collection',
    body: [
      'Export saves everything in your collection — all sets, cards, conditions, notes, and copy counts — to a single JSON file on your device.',
      'HOW TO USE IT:',
      '• Tap the Export button in the top-right of the home screen.',
      '• Your browser downloads a file named card-collector-YYYY-MM-DD.json.',
      '• Store it somewhere safe: cloud storage, email it to yourself, etc.',
      'WHAT YOU CAN DO WITH IT:',
      '• Back up your data before switching devices or clearing your browser.',
      '• Share a pre-built set checklist with other collectors — they can import your file and get the full card list instantly.',
    ],
  },
  {
    id: 'import',
    title: '↑ Import — Loading a Collection File',
    body: [
      'Import reads a Set Collector export file and adds any new sets it finds into your collection.',
      'HOW TO USE IT:',
      '• Tap the Import button in the top-right of the home screen.',
      '• Choose a .json file that was exported from Set Collector.',
      '• New sets are added automatically.',
      'SAFE BY DEFAULT:',
      '• Any set already in your collection (matched by its unique ID) is skipped — nothing is overwritten.',
      '• You can safely import files shared by other collectors to load pre-built checklists without losing your own data.',
    ],
  },
]

export default function HelpPanel({ onClose }) {
  const [openId, setOpenId] = useState(null)

  return (
    <>
      <div className="help-overlay" onClick={onClose} />
      <div className="help-drawer">
        <div className="help-drawer-header">
          <h2 className="help-drawer-title">Help</h2>
          <button className="help-close btn-icon" onClick={onClose} aria-label="Close help">&#10005;</button>
        </div>
        <div className="help-drawer-body">
          {TOPICS.map(topic => {
            const isOpen = openId === topic.id
            return (
              <div key={topic.id} className={`help-topic${isOpen ? ' open' : ''}`}>
                <button className="help-topic-btn" onClick={() => setOpenId(isOpen ? null : topic.id)}>
                  <span>{topic.title}</span>
                  <span className="help-chevron">{isOpen ? '▲' : '▼'}</span>
                </button>
                {isOpen && (
                  <div className="help-topic-body">
                    {topic.body.map((line, i) => {
                      if (line.endsWith(':') && !line.startsWith('•')) {
                        return <p key={i} className="help-section-label">{line}</p>
                      }
                      return <p key={i} className={line.startsWith('•') ? 'help-bullet' : 'help-para'}>{line}</p>
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
