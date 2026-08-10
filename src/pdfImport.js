export async function extractLinesFromPdf(file) {
  const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist')
  const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).href
  GlobalWorkerOptions.workerSrc = workerUrl

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await getDocument({ data: arrayBuffer }).promise
  const allLines = []

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p)
    const content = await page.getTextContent()

    // Group text items by their Y position to reconstruct lines
    const byY = {}
    for (const item of content.items) {
      if (!item.str) continue
      const y = Math.round(item.transform[5])
      byY[y] = (byY[y] || '') + item.str
    }

    // PDF Y-axis is bottom-up, so sort descending to get reading order
    const sorted = Object.keys(byY)
      .map(Number)
      .sort((a, b) => b - a)

    for (const y of sorted) {
      allLines.push(byY[y].trim())
    }
  }

  return allLines.join('\n')
}
