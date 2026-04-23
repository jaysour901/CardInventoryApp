import { useState } from 'react'

const PRINT_FILTERS = ['All', 'Need', 'Have']

const FILTER_LABELS = {
  All:  'Complete Checklist',
  Have: 'Cards Collected',
  Need: 'Cards Needed',
}

export default function PrintView({ set, onBack }) {
  const [filter, setFilter] = useState('All')

  const allCards = [...set.cards].sort((a, b) => {
    const na = parseInt(a.number, 10)
    const nb = parseInt(b.number, 10)
    if (!isNaN(na) && !isNaN(nb)) return na - nb
    return a.number.localeCompare(b.number)
  })

  const visibleCards = filter === 'Have'
    ? allCards.filter(c => c.owned)
    : filter === 'Need'
      ? allCards.filter(c => !c.owned)
      : allCards

  const totalOwned = allCards.filter(c => c.owned).length
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <div className="page">
      <div className="report-actions no-print">
        <button className="back-btn-plain" onClick={onBack}>&#8592; All Sets</button>
        <button className="btn btn-primary" onClick={() => window.print()}>
          &#128438; Print / Save PDF
        </button>
      </div>

      <div className="report-filter-bar no-print">
        <span className="report-filter-label">Show:</span>
        <div className="filter-tabs">
          {PRINT_FILTERS.map(f => (
            <button
              key={f}
              className={`filter-tab${filter === f ? ' active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
              <span className="tab-count">
                {f === 'All'  ? allCards.length
                : f === 'Have' ? totalOwned
                : allCards.length - totalOwned}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="report-page">
        <div className="report-header">
          <div className="report-title-block">
            <div className="report-set-name">{set.year} {set.brand}</div>
            <div className="report-subtitle">{FILTER_LABELS[filter]}</div>
          </div>
          <div className="report-summary">
            <div className="report-stat">
              <span className="rstat-val">{allCards.length}</span>
              <span className="rstat-label">Total</span>
            </div>
            <div className="report-stat have">
              <span className="rstat-val">{totalOwned}</span>
              <span className="rstat-label">Have</span>
            </div>
            <div className="report-stat need">
              <span className="rstat-val">{allCards.length - totalOwned}</span>
              <span className="rstat-label">Need</span>
            </div>
          </div>
          <div className="report-date">Generated {today}</div>
        </div>

        {allCards.length === 0 ? (
          <p className="report-empty">No cards in this set yet.</p>
        ) : visibleCards.length === 0 ? (
          <p className="report-empty">No cards match this filter.</p>
        ) : (
          <table className="report-table">
            <thead>
              <tr>
                <th className="col-num">Card #</th>
                <th className="col-player">Player</th>
                {filter === 'All' && <th className="col-status">Status</th>}
              </tr>
            </thead>
            <tbody>
              {visibleCards.map(card => (
                <tr key={card.id} className={card.owned ? 'row-have' : 'row-need'}>
                  <td className="col-num">#{card.number}</td>
                  <td className="col-player">{card.player}</td>
                  {filter === 'All' && (
                    <td className="col-status">
                      <span className={`rpt-pill ${card.owned ? 'have' : 'need'}`}>
                        {card.owned ? 'Have' : 'Need'}
                      </span>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
