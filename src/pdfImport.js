// Static imports ensure Vite bundles pdfjs into a predictable vendor chunk
// that the service worker precaches at install time — avoiding "Failed to fetch
// dynamically imported module" errors caused by SW version mismatches or timeouts.
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.js?url'

GlobalWorkerOptions.workerSrc = workerSrc

export async function extractLinesFromPdf(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await getDocument({ data: arrayBuffer }).promise
  const allLines = []

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p)
    const content = await page.getTextContent()

    // Collect non-empty text items with position info
    const items = []
    for (const item of content.items) {
      if (!item.str || !item.str.trim()) continue
      items.push({
        x: item.transform[4],
        y: item.transform[5],
        str: item.str,
        w: item.width || 0,
      })
    }
    if (!items.length) continue

    // Sort top-to-bottom (descending Y), then left-to-right (ascending X)
    items.sort((a, b) => b.y - a.y || a.x - b.x)

    // Cluster into visual rows: items within 3pt on the Y axis share a row.
    // This handles sub-pixel baseline variations that would otherwise split one
    // visual row into multiple Y buckets.
    const ROW_SNAP = 3
    const rows = []
    for (const item of items) {
      const last = rows[rows.length - 1]
      if (last && Math.abs(last[0].y - item.y) <= ROW_SNAP) {
        last.push(item)
      } else {
        rows.push([item])
      }
    }

    // Column-buffer approach: maintain one text buffer per column across rows.
    // When a new card-number entry starts in a column, the previous buffer is
    // flushed to allLines. When a non-card segment appears in a column position
    // that already has an active entry, it is appended — this joins wrapped
    // continuation lines (e.g. "RC", "Frazier / Tom Herr…") back to their card.
    const COL_GAP   = 20  // pt gap within a row that marks a new column
    const COL_MATCH = 40  // pt tolerance for recognising the same column across rows

    // buffers: approx-column-X → accumulated text for the card active in that column
    const buffers = new Map()

    // Find the existing buffer key nearest to x (within COL_MATCH), or x itself
    function nearestKey(x) {
      let best = null, bestDist = Infinity
      for (const k of buffers.keys()) {
        const d = Math.abs(k - x)
        if (d < bestDist && d <= COL_MATCH) { bestDist = d; best = k }
      }
      return best ?? x
    }

    for (const row of rows) {
      row.sort((a, b) => a.x - b.x)

      // Split row into column segments by X gap
      const segs = []
      let s = { x: row[0].x, end: row[0].x + row[0].w, str: row[0].str }
      for (let i = 1; i < row.length; i++) {
        if (row[i].x - s.end > COL_GAP) {
          segs.push({ x: s.x, str: s.str.trim() })
          s = { x: row[i].x, end: row[i].x + row[i].w, str: row[i].str }
        } else {
          s.str += row[i].str
          s.end = row[i].x + row[i].w
        }
      }
      segs.push({ x: s.x, str: s.str.trim() })

      for (const seg of segs) {
        if (!seg.str) continue
        const key = nearestKey(seg.x)

        if (/^\d+[a-zA-Z]?\s/.test(seg.str)) {
          // New card entry: flush the previous card in this column, start fresh
          const prev = buffers.get(key)
          if (prev) allLines.push(prev.trim())
          buffers.delete(key)
          buffers.set(seg.x, seg.str)  // anchor at actual X so continuations match
        } else if (buffers.has(key)) {
          // Continuation of the active card in this column — join it
          buffers.set(key, buffers.get(key) + ' ' + seg.str)
        }
        // else: orphan non-card text (PDF header/footer) with no active column — ignore
      }
    }

    // Flush remaining column buffers at end of page
    for (const [, text] of buffers) {
      if (text) allLines.push(text.trim())
    }
  }

  return allLines.join('\n')
}
