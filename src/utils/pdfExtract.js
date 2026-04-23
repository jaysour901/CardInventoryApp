import * as pdfjsLib from 'pdfjs-dist'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc

export async function extractTextFromPdf(file) {
  const buffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise

  // ── Pass 1: collect every text item from every page ─────────────────────
  const allItems = []
  let pageWidth = 612

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p)
    const viewport = page.getViewport({ scale: 1 })
    pageWidth = Math.max(pageWidth, viewport.width)

    const content = await page.getTextContent()
    for (const item of content.items) {
      const s = item.str?.trim()
      if (!s || !item.transform) continue
      allItems.push({
        page: p,
        x: item.transform[4],
        y: item.transform[5],
        str: s,
      })
    }
  }

  if (allItems.length === 0) return ''

  // ── Pass 2: find column left-edges ──────────────────────────────────────
  // Card numbers (pure digit strings) always sit at the left edge of each
  // column. Bucket their X positions and find the peaks.
  const BUCKET = 8 // group X coords into 8-unit buckets
  const buckets = {}
  for (const item of allItems) {
    if (!/^\d+$/.test(item.str)) continue
    const b = Math.round(item.x / BUCKET)
    buckets[b] = (buckets[b] || 0) + 1
  }

  // Keep buckets that appear on at least 3 different rows (real columns,
  // not occasional numbers in card names like "1952 MVPs")
  const peaks = Object.entries(buckets)
    .filter(([, count]) => count >= 3)
    .map(([b]) => Number(b) * BUCKET)
    .sort((a, b) => a - b)

  // Merge peaks that are within 15 units of each other
  const columnStarts = peaks.reduce((acc, x) => {
    if (acc.length === 0 || x - acc[acc.length - 1] > 15) acc.push(x)
    return acc
  }, [])

  // ── Pass 3: assign every item to a column ───────────────────────────────
  // A column spans from its left edge to the next column's left edge minus a
  // small margin. Items to the LEFT of the first detected column go into
  // column 0 (handles any checkboxes/bullets before the card number).
  const numCols = Math.max(columnStarts.length, 1)

  function getColumn(x) {
    for (let i = columnStarts.length - 1; i >= 0; i--) {
      if (x >= columnStarts[i] - 5) return i
    }
    return 0
  }

  // ── Pass 4: per-column, rebuild text lines sorted top-to-bottom ─────────
  // We build one text stream per column so cards are in reading order.
  const columnMaps = Array.from({ length: numCols }, () => new Map())

  for (const item of allItems) {
    const col = getColumn(item.x)
    // Key by page + Y so items on the same line in the same column group together
    const key = `${item.page}:${Math.round(item.y / 2) * 2}`
    if (!columnMaps[col].has(key)) columnMaps[col].set(key, [])
    columnMaps[col].get(key).push(item)
  }

  let fullText = ''
  for (const lineMap of columnMaps) {
    // Sort lines: by page first, then top-to-bottom within page (Y desc)
    const sorted = [...lineMap.entries()].sort(([ka], [kb]) => {
      const [pa, ya] = ka.split(':').map(Number)
      const [pb, yb] = kb.split(':').map(Number)
      return pa !== pb ? pa - pb : yb - ya
    })
    for (const [, items] of sorted) {
      items.sort((a, b) => a.x - b.x)
      fullText += items.map(i => i.str).join(' ').trim() + '\n'
    }
  }

  return fullText
}
