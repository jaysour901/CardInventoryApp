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
    title: 'Select all the text and copy it',
    img: `${BASE}tcdb_6.JPG`,
    bullets: [
      'The checklist opens as a numbered list of cards.',
      'On a computer — press Ctrl+A (Windows) or Cmd+A (Mac) to select everything, then Ctrl+C or Cmd+C to copy.',
      'On a phone or tablet — tap and hold on the text, tap Select All, then tap Copy.',
    ],
  },
  {
    title: 'Paste into Card Collector',
    img: null,
    bullets: [
      'Come back to this app and open your set — or create a new one first if you haven\'t already.',
      'Tap the Bulk Import button.',
      'Tap inside the text box and paste: Ctrl+V on a computer, or tap and hold then tap Paste on a phone.',
      'You\'ll see a count of how many cards were found.',
      'Tap Import Cards — and you\'re done!',
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
