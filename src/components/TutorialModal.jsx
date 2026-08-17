const BASE = import.meta.env.BASE_URL

const STEPS = [
  {
    title: 'Search for your set on TCDB',
    img: `${BASE}tcdb_1.JPG`,
    bullets: [
      'Open your web browser and go to tcdb.com.',
      'Select your sport from the dropdown on the left (e.g. Baseball).',
      'Type the year and brand name in the search box — for example: 1975 Topps.',
      'Tap the blue Search button.',
    ],
  },
  {
    title: 'Find your set and tap Overview',
    img: `${BASE}tcdb_2.JPG`,
    bullets: [
      'Your set appears at the top of the results under "Top Match."',
      'You\'ll see the set name, total card count, and a card image.',
      'Tap the blue Overview button.',
    ],
  },
  {
    title: 'Tap the Checklist tab',
    img: `${BASE}tcdb_3.JPG`,
    bullets: [
      'You\'re now on the set\'s overview page.',
      'Scroll down past the card image and set details.',
      'Look for the word Checklist in the row of links — it\'s highlighted in the image above.',
      'Tap it.',
    ],
  },
  {
    title: 'Open Printable View',
    img: `${BASE}tcdb_4.JPG`,
    bullets: [
      'You\'ll see the full card list.',
      'Tap the Options button in the upper right corner.',
      'Tap Printable View from the dropdown — it\'s highlighted in the image above.',
    ],
  },
  {
    title: 'Set columns to 3, then tap Go',
    img: `${BASE}tcdb_5.JPG`,
    bullets: [
      'You\'ll land on a "Print Center" page.',
      'Change No. of Columns to 3 (the lowest option available).',
      'Leave Font Size as-is.',
      'Tap the blue Go button.',
    ],
  },
  {
    title: 'Save the page as a PDF',
    img: null,
    bullets: [
      'Computer (Windows): press Ctrl+P to open Print, change the Destination to "Save as PDF," then click Save.',
      'Computer (Mac): press Cmd+P, click the PDF dropdown in the lower-left, and choose "Save as PDF."',
      'iPhone / iPad: tap the Share icon (box with an arrow), scroll the bottom row and tap "Print." Pinch-to-zoom the small preview to expand it, then tap the Share icon again and choose "Save to Files."',
      'Android: tap the browser menu (⋮), tap Print, then tap the printer dropdown and select "Save as PDF."',
    ],
  },
  {
    title: 'Upload the PDF in BTC Set Collector',
    img: null,
    bullets: [
      'Return to this app and open your set — or create a new one first if you haven\'t already.',
      'Tap the Bulk Import button.',
      'Tap "Upload PDF from TCDB" and select the PDF you just saved.',
      'Cards are found and listed automatically — tap Import Cards and you\'re done!',
      'Prefer not to save a file? Use copy-paste instead: on the printable page press Ctrl+A / Cmd+A to select all, copy, then paste into the text box in Bulk Import.',
    ],
  },
]

export default function TutorialModal({ onClose }) {
  return (
    <div className="tutorial-overlay" onClick={onClose}>
      <div className="tutorial-modal" onClick={e => e.stopPropagation()}>
        <div className="tutorial-modal-header">
          <div>
            <h2 className="tutorial-title">How to Import from TCDB.com</h2>
            <p className="tutorial-subtitle">Follow these steps to copy a checklist from the Trading Card Database</p>
          </div>
          <button className="tutorial-close" onClick={onClose} aria-label="Close">&#10005;</button>
        </div>

        <div className="tutorial-body">
          {STEPS.map((step, i) => (
            <div key={i} className="tutorial-step">
              <div className="tutorial-step-num">{i + 1}</div>
              <div className="tutorial-step-content">
                <h3 className="tutorial-step-title">{step.title}</h3>
                {step.img && (
                  <img
                    src={step.img}
                    alt={`Step ${i + 1}: ${step.title}`}
                    className="tutorial-step-img"
                  />
                )}
                {!step.img && (
                  <div className="tutorial-step-icon">&#128203;</div>
                )}
                <ul className="tutorial-step-bullets">
                  {step.bullets.map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}

          <div className="tutorial-footer">
            <button className="btn btn-primary" onClick={onClose}>
              Got it — let me import!
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
