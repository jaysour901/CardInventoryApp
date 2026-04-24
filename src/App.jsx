import { useState, useEffect } from 'react'
import SetList from './components/SetList'
import SetDetail from './components/SetDetail'
import HelpPanel from './components/HelpPanel'
import './App.css'

const STORAGE_KEY = 'card-collector-sets'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function loadSets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export default function App() {
  const [sets, setSets] = useState(loadSets)
  const [view, setView] = useState('home') // 'home' | 'detail'
  const [activeSetId, setActiveSetId] = useState(null)
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sets))
  }, [sets])

  const activeSet = sets.find(s => s.id === activeSetId) ?? null

  function addSet(brand, year, sport) {
    setSets(prev => [
      ...prev,
      { id: generateId(), brand: brand.trim(), year: year.trim(), sport: sport || '', cards: [] }
    ])
  }

  function updateSet(id, updates) {
    setSets(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
  }

  function deleteSet(id) {
    setSets(prev => prev.filter(s => s.id !== id))
    if (activeSetId === id) setActiveSetId(null)
  }

  function addCard(setId, number, player) {
    setSets(prev => prev.map(s =>
      s.id !== setId ? s : {
        ...s,
        cards: [
          ...s.cards,
          { id: generateId(), number: number.trim(), player: player.trim(), owned: false, copies: 0 }
        ]
      }
    ))
  }

  function toggleOwned(setId, cardId) {
    setSets(prev => prev.map(s =>
      s.id !== setId ? s : {
        ...s,
        cards: s.cards.map(c => {
          if (c.id !== cardId) return c
          const nowOwned = !c.owned
          return { ...c, owned: nowOwned, copies: nowOwned ? Math.max(1, c.copies || 0) : 0 }
        })
      }
    ))
  }

  function updateCopies(setId, cardId, newCount) {
    setSets(prev => prev.map(s =>
      s.id !== setId ? s : {
        ...s,
        cards: s.cards.map(c => c.id === cardId ? { ...c, copies: Math.max(1, newCount) } : c)
      }
    ))
  }

  function updateCard(setId, cardId, updates) {
    setSets(prev => prev.map(s =>
      s.id !== setId ? s : {
        ...s,
        cards: s.cards.map(c => c.id === cardId ? { ...c, ...updates } : c)
      }
    ))
  }

  function deleteCard(setId, cardId) {
    setSets(prev => prev.map(s =>
      s.id !== setId ? s : { ...s, cards: s.cards.filter(c => c.id !== cardId) }
    ))
  }

  function exportData() {
    const json = JSON.stringify(sets, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `card-collector-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function importData(incoming) {
    setSets(prev => {
      const existingIds = new Set(prev.map(s => s.id))
      const newSets = incoming.filter(s => !existingIds.has(s.id))
      return [...prev, ...newSets]
    })
    return incoming.filter(s => !sets.some(e => e.id === s.id)).length
  }

  function bulkAddCards(setId, cards) {
    setSets(prev => prev.map(s =>
      s.id !== setId ? s : {
        ...s,
        cards: [
          ...s.cards,
          ...cards.map(c => ({ id: generateId(), number: c.number, player: c.player, owned: false, copies: 0 }))
        ]
      }
    ))
  }

  if (view === 'detail' && activeSet) {
    return (
      <>
        <SetDetail
          set={activeSet}
          onBack={() => { setView('home'); setActiveSetId(null) }}
          onOpenHelp={() => setShowHelp(true)}
          onUpdateSet={updates => updateSet(activeSet.id, updates)}
        onAddCard={(number, player) => addCard(activeSet.id, number, player)}
        onBulkAddCards={cards => bulkAddCards(activeSet.id, cards)}
        onToggleOwned={cardId => toggleOwned(activeSet.id, cardId)}
        onUpdateCopies={(cardId, count) => updateCopies(activeSet.id, cardId, count)}
        onUpdateCard={(cardId, updates) => updateCard(activeSet.id, cardId, updates)}
        onDeleteCard={cardId => deleteCard(activeSet.id, cardId)}
        />
        {showHelp && <HelpPanel onClose={() => setShowHelp(false)} />}
      </>
    )
  }

  return (
    <>
      <SetList
        sets={sets}
        onAddSet={addSet}
        onSelectSet={id => { setActiveSetId(id); setView('detail') }}
        onDeleteSet={deleteSet}
        onExport={exportData}
        onImport={importData}
        onOpenHelp={() => setShowHelp(true)}
      />
      {showHelp && <HelpPanel onClose={() => setShowHelp(false)} />}
    </>
  )
}
