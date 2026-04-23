import { useState, useEffect } from 'react'
import SetList from './components/SetList'
import SetDetail from './components/SetDetail'
import PrintView from './components/PrintView'
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
  const [view, setView] = useState('home') // 'home' | 'detail' | 'print'
  const [activeSetId, setActiveSetId] = useState(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sets))
  }, [sets])

  const activeSet = sets.find(s => s.id === activeSetId) ?? null

  function addSet(brand, year) {
    setSets(prev => [
      ...prev,
      { id: generateId(), brand: brand.trim(), year: year.trim(), cards: [] }
    ])
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

  function deleteCard(setId, cardId) {
    setSets(prev => prev.map(s =>
      s.id !== setId ? s : { ...s, cards: s.cards.filter(c => c.id !== cardId) }
    ))
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

  if (view === 'print' && activeSet) {
    return <PrintView set={activeSet} onBack={() => { setView('home'); setActiveSetId(null) }} />
  }

  if (view === 'detail' && activeSet) {
    return (
      <SetDetail
        set={activeSet}
        onBack={() => { setView('home'); setActiveSetId(null) }}
        onAddCard={(number, player) => addCard(activeSet.id, number, player)}
        onBulkAddCards={cards => bulkAddCards(activeSet.id, cards)}
        onToggleOwned={cardId => toggleOwned(activeSet.id, cardId)}
        onUpdateCopies={(cardId, count) => updateCopies(activeSet.id, cardId, count)}
        onDeleteCard={cardId => deleteCard(activeSet.id, cardId)}
      />
    )
  }

  return (
    <SetList
      sets={sets}
      onAddSet={addSet}
      onSelectSet={id => { setActiveSetId(id); setView('detail') }}
      onDeleteSet={deleteSet}
      onPrintSet={id => { setActiveSetId(id); setView('print') }}
    />
  )
}
