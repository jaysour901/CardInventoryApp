import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href

export async function extractTextFromPdf(file) {
  const buffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
  let fullText = ''

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p)
    const content = await page.getTextContent()

    // Group text items by their Y position to reconstruct lines
    const lineMap = new Map()
    for (const item of content.items) {
      if (!item.str?.trim()) continue
      // Round Y to nearest 2px to handle minor float differences on same line
      const y = Math.round(item.transform[5] / 2) * 2
      if (!lineMap.has(y)) lineMap.set(y, [])
      lineMap.get(y).push({ x: item.transform[4], str: item.str })
    }

    // Sort lines top-to-bottom (PDF Y axis is bottom-up, so descending)
    const sortedLines = [...lineMap.entries()].sort(([ya], [yb]) => yb - ya)
    for (const [, items] of sortedLines) {
      items.sort((a, b) => a.x - b.x)
      fullText += items.map(i => i.str).join(' ').trim() + '\n'
    }
  }

  return fullText
}
