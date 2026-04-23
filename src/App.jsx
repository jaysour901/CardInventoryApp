import { useState, useEffect } from 'react'
import SetList from './components/SetList'
import SetDetail from './components/SetDetail'
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
          { id: generateId(), number: number.trim(), player: player.trim(), owned: false }
        ]
      }
    ))
  }

  function toggleOwned(setId, cardId) {
    setSets(prev => prev.map(s =>
      s.id !== setId ? s : {
        ...s,
        cards: s.cards.map(c => c.id === cardId ? { ...c, owned: !c.owned } : c)
      }
    ))
  }

  function deleteCard(setId, cardId) {
    setSets(prev => prev.map(s =>
      s.id !== setId ? s : { ...s, cards: s.cards.filter(c => c.id !== cardId) }
    ))
  }

  if (activeSet) {
    return (
      <SetDetail
        set={activeSet}
        onBack={() => setActiveSetId(null)}
        onAddCard={(number, player) => addCard(activeSet.id, number, player)}
        onToggleOwned={cardId => toggleOwned(activeSet.id, cardId)}
        onDeleteCard={cardId => deleteCard(activeSet.id, cardId)}
      />
    )
  }

  return (
    <SetList
      sets={sets}
      onAddSet={addSet}
      onSelectSet={setActiveSetId}
      onDeleteSet={deleteSet}
    />
  )
}
