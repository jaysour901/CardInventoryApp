import { useState, useMemo, useRef } from 'react'

const FILTERS = ['All', 'Have', 'Need']

function parsePaste(text) {
  return text
    .split('\n')
    .map(l => l.trim())
    .filter(l => /^\d/.test(l))
    .map(l => {
      const spaceIdx = l.indexOf(' ')
      if (spaceIdx === -1) return null
      return { number: l.slice(0, spaceIdx), player: l.slice(spaceIdx + 1).trim() }
    })
    .filter(Boolean)
}

export default function SetDetail({ set, onBack, onAddCard, onBulkAddCards, onToggleOwned, onDeleteCard }) {
  const [filter, setFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [showBulk, setShowBulk] = useState(false)
  const [bulkMode, setBulkMode] = useState('paste') // 'paste' | 'pdf'
  const [number, setNumber] = useState('')
  const [player, setPlayer] = useState('')
  const [pasteText, setPasteText] = useState('')
  const [sortBy, setSortBy] = useState('number')
  const [pdfStatus, setPdfStatus] = useState('idle') // 'idle' | 'loading' | 'done' | 'error'
  const [pdfFileName, setPdfFileName] = useState('')
  const [pdfError, setPdfError] = useState('')
  const fileInputRef = useRef(null)
  const [importDone, setImportDone] = useState(null)

  const total = set.cards.length
  const owned = set.cards.filter(c => c.owned).length
  const pct = total === 0 ? 0 : Math.round((owned / total) * 100)

  const existingNumbers = useMemo(() => new Set(set.cards.map(c => c.number)), [set.cards])

  const parsedCards = useMemo(() => parsePaste(pasteText), [pasteText])
  const newCards = useMemo(
    () => parsedCards.filter(c => !existingNumbers.has(c.number)),
    [parsedCards, existingNumbers]
  )
  const skipped = parsedCards.length - newCards.length

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

  function handleBulkImport() {
    if (newCards.length === 0) return
    onBulkAddCards(newCards)
    setImportDone(newCards.length)
    setPasteText('')
    setPdfStatus('idle')
    setPdfFileName('')
    setTimeout(() => { setImportDone(null); setShowBulk(false) }, 2500)
  }

  async function handlePdfUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setPdfFileName(file.name)
    setPdfStatus('loading')
    setPasteText('')
    setPdfError('')
    try {
      const { extractTextFromPdf } = await import('../utils/pdfExtract.js')
      const text = await extractTextFromPdf(file)
      setPasteText(text)
      setPdfStatus('done')
    } catch (err) {
      setPdfStatus('error')
      setPdfError('Could not read this PDF. Make sure it is a text-based PDF (not a scanned image).')
    }
    // Reset input so same file can be re-uploaded if needed
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function openBulk() {
    setShowBulk(true)
    setShowForm(false)
    setPasteText('')
    setImportDone(null)
    setPdfStatus('idle')
    setPdfFileName('')
    setPdfError('')
  }

  function openForm() {
    setShowForm(v => !v)
    setShowBulk(false)
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
            <button className="btn btn-secondary" onClick={openBulk}>
              &#128203; Bulk Import
            </button>
            <button className="btn btn-primary" onClick={openForm}>
              {showForm ? 'Cancel' : '+ Add Card'}
            </button>
          </div>
        </div>

        {showBulk && (
          <div className="bulk-panel card">
            <div className="bulk-header">
              <h3>Bulk Import from Checklist</h3>
              <button className="btn-icon" onClick={() => setShowBulk(false)} aria-label="Close">&#10005;</button>
            </div>

            {/* Mode tabs */}
            <div className="bulk-mode-tabs">
              <button
                className={`bulk-mode-tab${bulkMode === 'paste' ? ' active' : ''}`}
                onClick={() => { setBulkMode('paste'); setPasteText(''); setPdfStatus('idle'); setPdfFileName('') }}
              >
                &#128203; Paste Text
              </button>
              <button
                className={`bulk-mode-tab${bulkMode === 'pdf' ? ' active' : ''}`}
                onClick={() => { setBulkMode('pdf'); setPasteText(''); setPdfStatus('idle'); setPdfFileName('') }}
              >
                &#128196; Upload PDF
              </button>
            </div>

            {bulkMode === 'paste' ? (
              <>
                <p className="bulk-hint">
                  Paste a checklist below. Each line should start with a card number followed by the player name — extra tags like RC, MGR, UER are kept as part of the name.
                </p>
                <textarea
                  className="bulk-textarea"
                  placeholder={"12 National League 1964 Str LL\n70 Bill Skowron\n127 Frank Lary\n185 Max Alvis RC\n..."}
                  value={pasteText}
              onChange={e => { setPasteText(e.target.value); setImportDone(null) }}
              rows={10}
                />
              </>
            ) : (
              /* PDF upload mode */
              <>
                <p className="bulk-hint">
                  Upload a checklist PDF from TCDB or similar. The text will be extracted automatically — works with any PDF where the text is selectable.
                </p>
                <div className="pdf-upload-area">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    id="pdf-file-input"
                    className="pdf-file-input"
                    onChange={handlePdfUpload}
                  />
                  <label htmlFor="pdf-file-input" className="pdf-upload-label">
                    {pdfStatus === 'loading' ? (
                      <span className="pdf-loading">&#8987; Reading PDF...</span>
                    ) : pdfStatus === 'done' ? (
                      <span className="pdf-done">&#10003; {pdfFileName}</span>
                    ) : (
                      <>
                        <span className="pdf-icon">&#128196;</span>
                        <span className="pdf-upload-text">Tap to choose a PDF file</span>
                      </>
                    )}
                  </label>
                  {pdfStatus === 'error' && (
                    <p className="pdf-error">{pdfError}</p>
                  )}
                  {pdfStatus === 'done' && (
                    <button
                      className="btn btn-secondary pdf-reselect"
                      onClick={() => { fileInputRef.current?.click() }}
                      type="button"
                    >
                      Choose a different file
                    </button>
                  )}
                </div>
              </>
            )}

            {parsedCards.length > 0 && (
              <div className="bulk-preview">
                <span className="bulk-found">&#10003; {parsedCards.length} cards found</span>
                {skipped > 0 && (
                  <span className="bulk-skipped">&nbsp;&middot;&nbsp; {skipped} already in set (will skip)</span>
                )}
                {newCards.length > 0 && (
                  <span className="bulk-new">&nbsp;&middot;&nbsp; {newCards.length} will be added</span>
                )}
              </div>
            )}

            {importDone !== null && (
              <div className="bulk-success">&#10003; {importDone} cards imported successfully!</div>
            )}

            <div className="form-actions">
              <button className="btn btn-secondary" onClick={() => setShowBulk(false)}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={handleBulkImport}
                disabled={newCards.length === 0 || pdfStatus === 'loading'}
              >
                Import {newCards.length > 0 ? `${newCards.length} ` : ''}Cards
              </button>
            </div>
          </div>
        )}

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
            <p>No cards in this set yet. Use <strong>Bulk Import</strong> to paste a checklist, or add cards one by one.</p>
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
