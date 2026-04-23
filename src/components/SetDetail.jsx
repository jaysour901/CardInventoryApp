import { useState, useMemo } from 'react'

const FILTERS = ['All', 'Have', 'Need']

export default function SetDetail({ set, onBack, onAddCard, onToggleOwned, onDeleteCard }) {
  const [filter, setFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [number, setNumber] = useState('')
  const [player, setPlayer] = useState('')
  const [sortBy, setSortBy] = useState('number')

  const total = set.cards.length
  const owned = set.cards.filter(c => c.owned).length
  const pct = total === 0 ? 0 : Math.round((owned / total) * 100)

  const visibleCards = useMemo(() => {
    let cards = set.cards
    if (filter === 'Have') cards = cards.filter(c => c.owned)
    if (filter === 'Need') cards = cards.filter(c => !c.owned)
    return [...cards].sort((a, b) => {
      if (sortBy === 'number') {
        const na = parseInt(a.number, 10)
        const nb = parseInt(b.number, 10)
        if (!isNaN(na) && !isNaN(nb)) return na - nb
        return a.number.localeCompare(b.number)
      }
      return a.player.localeCompare(b.player)
    })
  }, [set.cards, filter, sortBy])

  function handleSubmit(e) {
    e.preventDefault()
    if (!number.trim() || !player.trim()) return
    onAddCard(number, player)
    setNumber('')
    setPlayer('')
  }

  function handleAddAnother(e) {
    e.preventDefault()
    if (!number.trim() || !player.trim()) return
    onAddCard(number, player)
    setNumber('')
    setPlayer('')
  }

  return (
    <div className="page">
      <header className="app-header">
        <div className="header-inner">
          <button className="back-btn" onClick={onBack}>
            &#8592; All Sets
          </button>
          <div className="set-title">
            <span className="set-year-lg">{set.year}</span>
            <h1>{set.brand}</h1>
          </div>
        </div>
      </header>

      <main className="content">
        {total > 0 && (
          <div className="summary-bar card">
            <div className="summary-numbers">
              <div className="summary-stat">
                <span className="stat-val">{total}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="summary-stat have">
                <span className="stat-val">{owned}</span>
                <span className="stat-label">Have</span>
              </div>
              <div className="summary-stat need">
                <span className="stat-val">{total - owned}</span>
                <span className="stat-label">Need</span>
              </div>
              <div className="summary-stat pct">
                <span className="stat-val">{pct}%</span>
                <span className="stat-label">Complete</span>
              </div>
            </div>
            <div className="progress-bar large">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        <div className="section-header">
          <div className="filter-tabs">
            {FILTERS.map(f => (
              <button
                key={f}
                className={`filter-tab${filter === f ? ' active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f}
                {f === 'Have' && total > 0 && <span className="tab-count">{owned}</span>}
                {f === 'Need' && total > 0 && <span className="tab-count">{total - owned}</span>}
                {f === 'All' && total > 0 && <span className="tab-count">{total}</span>}
              </button>
            ))}
          </div>
          <div className="toolbar-right">
            {total > 1 && (
              <select
                className="sort-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                aria-label="Sort cards by"
              >
                <option value="number">Sort: # Number</option>
                <option value="player">Sort: Player</option>
              </select>
            )}
            <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
              {showForm ? 'Cancel' : '+ Add Card'}
            </button>
          </div>
        </div>

        {showForm && (
          <form className="add-form card" onSubmit={handleSubmit}>
            <h3>Add Card</h3>
            <div className="form-row">
              <div className="form-group narrow">
                <label htmlFor="card-number">Card #</label>
                <input
                  id="card-number"
                  type="text"
                  placeholder="e.g. 42"
                  value={number}
                  onChange={e => setNumber(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label htmlFor="card-player">Player</label>
                <input
                  id="card-player"
                  type="text"
                  placeholder="e.g. Mike Trout"
                  value={player}
                  onChange={e => setPlayer(e.target.value)}
                />
              </div>
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleAddAnother}
                disabled={!number.trim() || !player.trim()}
              >
                Add &amp; Another
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!number.trim() || !player.trim()}
              >
                Add Card
              </button>
            </div>
          </form>
        )}

        {total === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">&#9827;</div>
            <p>No cards in this set yet. Add your first card!</p>
          </div>
        ) : visibleCards.length === 0 ? (
          <div className="empty-state small">
            <p>No cards match this filter.</p>
          </div>
        ) : (
          <ul className="card-list">
            {visibleCards.map(card => (
              <li key={card.id} className={`card-item${card.owned ? ' owned' : ' needed'}`}>
                <label className="card-label">
                  <input
                    type="checkbox"
                    checked={card.owned}
                    onChange={() => onToggleOwned(card.id)}
                    className="card-checkbox"
                  />
                  <span className="card-number">#{card.number}</span>
                  <span className="card-player">{card.player}</span>
                  <span className={`status-pill ${card.owned ? 'have' : 'need'}`}>
                    {card.owned ? 'Have' : 'Need'}
                  </span>
                </label>
                <button
                  className="btn-icon delete-btn"
                  onClick={() => onDeleteCard(card.id)}
                  title="Remove card"
                  aria-label={`Remove #${card.number} ${card.player}`}
                >
                  &#10005;
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
