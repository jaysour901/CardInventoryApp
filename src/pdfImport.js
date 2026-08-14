// Static imports ensure Vite bundles pdfjs into a predictable vendor chunk
// that the service worker precaches at install time — avoiding "Failed to fetch
// dynamically imported module" errors caused by SW version mismatches or timeouts.
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.js?url'

// Set once at module load; safe to call multiple times (idempotent).
GlobalWorkerOptions.workerSrc = workerSrc

export async function extractLinesFromPdf(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await getDocument({ data: arrayBuffer }).promise
  const allLines = []

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p)
    const content = await page.getTextContent()

    // Group text items by Y coordinate to reconstruct reading order.
    // Store each item with its X position and width so we can detect columns.
    const byY = {}
    for (const item of content.items) {
      if (!item.str) continue
      const y = Math.round(item.transform[5])
      if (!byY[y]) byY[y] = []
      byY[y].push({
        x: item.transform[4],
        str: item.str,
        width: item.width || 0,
      })
    }

    // PDF Y-axis is bottom-up — sort descending for top-to-bottom reading order
    const sorted = Object.keys(byY).map(Number).sort((a, b) => b - a)

    for (const y of sorted) {
      // Sort items left-to-right within this row
      const items = byY[y].sort((a, b) => a.x - b.x)

      // Walk items left-to-right; when the gap from the end of the previous
      // item to the start of the next item exceeds the threshold, treat it as
      // a column break and emit the current column as its own line.
      // 20pt ≈ 7mm — large enough to skip inter-word spaces but small enough
      // to catch the narrowest column gutters in typical TCDB checklists.
      const COL_GAP = 20

      let col = items[0].str
      let prevEnd = items[0].x + items[0].width

      for (let i = 1; i < items.length; i++) {
        const gap = items[i].x - prevEnd
        if (gap > COL_GAP) {
          allLines.push(col.trim())
          col = items[i].str
        } else {
          col += items[i].str
        }
        prevEnd = items[i].x + items[i].width
      }
      allLines.push(col.trim())
    }
  }

  return allLines.join('\n')
}
