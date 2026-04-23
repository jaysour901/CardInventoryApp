import { useState } from 'react'

export default function ReportView({ sets, onBack }) {
  const [selectedSetId, setSelectedSetId] = useState(null)

  const selectedSet = sets.find(s => s.id === selectedSetId)

  if (selectedSet) {
    return <SetReport set={selectedSet} onBack={() => setSelectedSetId(null)} />
  }

  return (
    <div className="page">
      <header className="app-header">
        <div className="header-inner">
          <button className="back-btn" onClick={onBack}>&#8592; Back</button>
          <div className="header-title">
            <span className="card-icon">&#9827;</span>
            <h1>Reports</h1>
          </div>
          <p className="header-sub">Select a set to view and print</p>
        </div>
      </header>

      <main className="content">
        {sets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">&#9827;</div>
            <p>No card sets yet. Add some sets first.</p>
          </div>
        ) : (
          <ul className="set-list">
            {sets.map(set => {
              const total = set.cards.length
              const owned = set.cards.filter(c => c.owned).length
              return (
                <li key={set.id} className="set-card card">
                  <button className="set-card-body" onClick={() => setSelectedSetId(set.id)}>
                    <div className="set-info">
                      <span className="set-year">{set.year}</span>
                      <span className="set-brand">{set.brand}</span>
                    </div>
                    <div className="set-stats">
                      <span className="progress-label">
                        {total} cards &nbsp;&middot;&nbsp; {owned} have &nbsp;&middot;&nbsp; {total - owned} need
                      </span>
                    </div>
                    <span className="report-arrow">&#8594;</span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </main>
    </div>
  )
}

function SetReport({ set, onBack }) {
  const cards = [...set.cards].sort((a, b) => {
    const na = parseInt(a.number, 10)
    const nb = parseInt(b.number, 10)
    if (!isNaN(na) && !isNaN(nb)) return na - nb
    return a.number.localeCompare(b.number)
  })

  const owned = cards.filter(c => c.owned).length
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <div className="page">
      <div className="report-actions no-print">
        <button className="back-btn-plain" onClick={onBack}>&#8592; All Reports</button>
        <button className="btn btn-primary" onClick={() => window.print()}>
          &#128438; Print / Save PDF
        </button>
      </div>

      <div className="report-page">
        <div className="report-header">
          <div className="report-title-block">
            <div className="report-set-name">{set.year} {set.brand}</div>
            <div className="report-subtitle">Card Set Report</div>
          </div>
          <div className="report-summary">
            <div className="report-stat">
              <span className="rstat-val">{cards.length}</span>
              <span className="rstat-label">Total</span>
            </div>
            <div className="report-stat have">
              <span className="rstat-val">{owned}</span>
              <span className="rstat-label">Have</span>
            </div>
            <div className="report-stat need">
              <span className="rstat-val">{cards.length - owned}</span>
              <span className="rstat-label">Need</span>
            </div>
          </div>
          <div className="report-date">Generated {today}</div>
        </div>

        {cards.length === 0 ? (
          <p className="report-empty">No cards in this set yet.</p>
        ) : (
          <table className="report-table">
            <thead>
              <tr>
                <th className="col-num">Card #</th>
                <th className="col-player">Player</th>
                <th className="col-status">Status</th>
              </tr>
            </thead>
            <tbody>
              {cards.map(card => (
                <tr key={card.id} className={card.owned ? 'row-have' : 'row-need'}>
                  <td className="col-num">#{card.number}</td>
                  <td className="col-player">{card.player}</td>
                  <td className="col-status">
                    <span className={`rpt-pill ${card.owned ? 'have' : 'need'}`}>
                      {card.owned ? 'Have' : 'Need'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
