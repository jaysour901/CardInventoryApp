import { useState, useMemo } from 'react'
import TradingCardIcon from './TradingCardIcon'

const SPORTS = ['Baseball', 'Football', 'Basketball', 'Hockey']

const SPORT_EMOJI = {
  Baseball: '⚾',
  Football: '🏈',
  Basketball: '🏀',
  Hockey: '🏒',
}

export default function SetList({ sets, onAddSet, onSelectSet, onDeleteSet }) {
  const [showForm, setShowForm] = useState(false)
  const [brand, setBrand] = useState('')
  const [year, setYear] = useState('')
  const [sport, setSport] = useState('')
  const [sportFilter, setSportFilter] = useState('All')

  const sportCounts = useMemo(() => {
    const counts = {}
    SPORTS.forEach(s => { counts[s] = sets.filter(set => set.sport === s).length })
    return counts
  }, [sets])

  const visibleSets = useMemo(() => {
    if (sportFilter === 'All') return sets
    return sets.filter(s => s.sport === sportFilter)
  }, [sets, sportFilter])

  function handleSubmit(e) {
    e.preventDefault()
    if (!brand.trim() || !year.trim()) return
    onAddSet(brand, year, sport)
    setBrand('')
    setYear('')
    setSport('')
    setShowForm(false)
  }

  return (
    <div className="page">
      <header className="app-header">
        <div className="header-inner">
          <div className="header-title">
            <TradingCardIcon size={38} className="card-icon-svg" />
            <h1>Card Collector</h1>
          </div>
          <p className="header-sub">Track your sets — see what you have and what you need</p>
        </div>
      </header>

      <main className="content">
        <div className="section-header">
          <h2>My Card Sets</h2>
          <div className="header-actions">
            <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
              {showForm ? 'Cancel' : '+ Add Set'}
            </button>
          </div>
        </div>

        {showForm && (
          <form className="add-form card" onSubmit={handleSubmit}>
            <h3>New Card Set</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="brand">Brand</label>
                <input
                  id="brand"
                  type="text"
                  placeholder="e.g. Topps, Panini, Bowman"
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="form-group narrow">
                <label htmlFor="year">Year</label>
                <input
                  id="year"
                  type="text"
                  placeholder="e.g. 2024"
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  maxLength={4}
                />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: 4 }}>
              <label>Sport</label>
              <div className="sport-picker">
                {SPORTS.map(s => (
                  <button
                    key={s}
                    type="button"
                    className={`sport-pick-btn${sport === s ? ' active' : ''}`}
                    onClick={() => setSport(prev => prev === s ? '' : s)}
                  >
                    {SPORT_EMOJI[s]} {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={!brand.trim() || !year.trim()}>
                Create Set
              </button>
            </div>
          </form>
        )}

        {sets.length > 0 && (
          <div className="sport-filter-row">
            <button
              className={`sport-filter-btn${sportFilter === 'All' ? ' active' : ''}`}
              onClick={() => setSportFilter('All')}
            >
              All <span className="tab-count">{sets.length}</span>
            </button>
            {SPORTS.filter(s => sportCounts[s] > 0).map(s => (
              <button
                key={s}
                className={`sport-filter-btn${sportFilter === s ? ' active' : ''}`}
                onClick={() => setSportFilter(s)}
              >
                {SPORT_EMOJI[s]} {s} <span className="tab-count">{sportCounts[s]}</span>
              </button>
            ))}
          </div>
        )}

        {sets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><TradingCardIcon size={64} /></div>
            <p>No card sets yet. Add your first set to get started!</p>
          </div>
        ) : visibleSets.length === 0 ? (
          <div className="empty-state small">
            <p>No {sportFilter} sets yet.</p>
          </div>
        ) : (
          <ul className="set-list">
            {visibleSets.map(set => {
              const total = set.cards.length
              const owned = set.cards.filter(c => c.owned).length
              const pct = total === 0 ? 0 : Math.round((owned / total) * 100)
              return (
                <li key={set.id} className="set-card card">
                  <button className="set-card-body" onClick={() => onSelectSet(set.id)}>
                    <div className="set-info">
                      <span className="set-year">{set.year}</span>
                      <span className="set-brand">{set.brand}</span>
                      {set.sport && (
                        <span className={`sport-tag sport-tag-${set.sport.toLowerCase()}`}>
                          {SPORT_EMOJI[set.sport]} {set.sport}
                        </span>
                      )}
                    </div>
                    <div className="set-stats">
                      {total === 0 ? (
                        <span className="no-cards">No cards added</span>
                      ) : (
                        <>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="progress-label">
                            {owned}/{total} <span className="dim">collected ({pct}%)</span>
                          </span>
                        </>
                      )}
                    </div>
                    <div className="set-badges">
                      {total > 0 && (
                        <>
                          <span className="badge badge-have">{owned} Have</span>
                          <span className="badge badge-need">{total - owned} Need</span>
                        </>
                      )}
                    </div>
                  </button>
                  <button
                    className="btn-icon delete-btn"
                    onClick={e => { e.stopPropagation(); onDeleteSet(set.id) }}
                    title="Delete set"
                    aria-label={`Delete ${set.year} ${set.brand}`}
                  >
                    &#10005;
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
