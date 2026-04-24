import { useState } from 'react'

const TOPICS = [
  {
    id: 'export',
    title: '↓ Export — Backing up your collection',
    body: [
      'Export saves everything in your collection — all sets, cards, conditions, notes, and copy counts — to a single JSON file on your device.',
      'HOW TO USE IT:',
      '• Tap the Export button in the top-right of the home screen.',
      '• Your browser downloads a file named card-collector-YYYY-MM-DD.json.',
      '• Store it somewhere safe: cloud storage, email it to yourself, etc.',
      'WHAT YOU CAN DO WITH IT:',
      '• Back up your data before switching devices or clearing your browser.',
      '• Share a pre-built set checklist with other collectors in the community — they can import your file and get the full card list instantly.',
    ],
  },
  {
    id: 'import',
    title: '↑ Import — Loading a collection file',
    body: [
      'Import reads a Card Collector export file and adds any new sets it finds into your collection.',
      'HOW TO USE IT:',
      '• Tap the Import button in the top-right of the home screen.',
      '• Choose a .json file that was exported from Card Collector.',
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
