export async function extractLinesFromPdf(file) {
  // Load pdfjs-dist v3 main library and worker in parallel.
  // Setting globalThis.pdfjsWorker before calling getDocument tells pdfjs
  // to run the worker in the main thread (fake-worker mode) — no Web Worker
  // creation, no browser compatibility issues.
  const [{ getDocument, GlobalWorkerOptions }, workerModule] = await Promise.all([
    import('pdfjs-dist'),
    import('pdfjs-dist/build/pdf.worker.min.js'),
  ])

  globalThis.pdfjsWorker = workerModule
  GlobalWorkerOptions.workerSrc = ''  // not used in fake-worker mode but required to be set

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
