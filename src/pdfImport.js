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

    // Group text items by Y coordinate to reconstruct reading order
    const byY = {}
    for (const item of content.items) {
      if (!item.str) continue
      const y = Math.round(item.transform[5])
      byY[y] = (byY[y] || '') + item.str
    }

    // PDF Y-axis is bottom-up — sort descending for top-to-bottom reading order
    const sorted = Object.keys(byY).map(Number).sort((a, b) => b - a)
    for (const y of sorted) {
      allLines.push(byY[y].trim())
    }
  }

  return allLines.join('\n')
}
