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

    // Group text items by Y position (row), rounding to nearest 2 units
    // to handle minor float differences in items on the same line
    const lineMap = new Map()
    for (const item of content.items) {
      if (!item.str?.trim()) continue
      const y = Math.round(item.transform[5] / 2) * 2
      if (!lineMap.has(y)) lineMap.set(y, [])
      lineMap.get(y).push({
        x: item.transform[4],
        str: item.str,
        // item.width is the advance width in user space; fall back to
        // a character-count estimate when not available
        width: item.width > 0 ? item.width : item.str.length * 5
      })
    }

    // Sort rows top-to-bottom (PDF Y axis is inverted)
    const sortedLines = [...lineMap.entries()].sort(([ya], [yb]) => yb - ya)

    for (const [, items] of sortedLines) {
      items.sort((a, b) => a.x - b.x)

      if (items.length <= 1) {
        fullText += (items[0]?.str ?? '').trim() + '\n'
        continue
      }

      // Calculate the gap between each consecutive pair of items.
      // Gap = distance from the RIGHT edge of item[i] to the LEFT edge of item[i+1].
      const gaps = items.slice(1).map((item, i) =>
        item.x - (items[i].x + items[i].width)
      )

      // Use the median positive gap as the baseline "normal" word spacing.
      // A gap much larger than the median signals a column boundary.
      const positiveGaps = gaps.filter(g => g > 0).sort((a, b) => a - b)
      const median = positiveGaps.length
        ? positiveGaps[Math.floor(positiveGaps.length / 2)]
        : 0
      // Column gap threshold: at least 4× the median word gap, and at least 10 units
      const columnThreshold = Math.max(median * 4, 10)

      // Rebuild the row, inserting a newline wherever a column gap is detected
      let segment = items[0].str
      for (let i = 1; i < items.length; i++) {
        if (gaps[i - 1] > columnThreshold) {
          if (segment.trim()) fullText += segment.trim() + '\n'
          segment = items[i].str
        } else {
          segment += ' ' + items[i].str
        }
      }
      if (segment.trim()) fullText += segment.trim() + '\n'
    }
  }

  return fullText
}
