type Cell = string | number | null | undefined

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a   = Object.assign(document.createElement('a'), { href: url, download: filename })
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function downloadCSV(filename: string, headers: string[], rows: Cell[][]): void {
  const esc = (v: Cell): string => {
    const s = String(v ?? '')
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = [headers.map(esc), ...rows.map(r => r.map(esc))].map(r => r.join(',')).join('\r\n')
  triggerDownload(
    new Blob(['﻿' + lines], { type: 'text/csv;charset=utf-8' }),
    filename.endsWith('.csv') ? filename : filename + '.csv'
  )
}

// SpreadsheetML — opens in Excel, Numbers, LibreOffice Calc without any npm package
export function downloadExcel(filename: string, sheetName: string, headers: string[], rows: Cell[][]): void {
  const xmlCell = (val: Cell, bold = false): string => {
    const v    = val ?? ''
    const type = typeof v === 'number' ? 'Number' : 'String'
    const safe = String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    return `<Cell${bold ? ' ss:StyleID="h"' : ''}><Data ss:Type="${type}">${safe}</Data></Cell>`
  }
  const xmlRows = [
    `<Row>${headers.map(h => xmlCell(h, true)).join('')}</Row>`,
    ...rows.map(r => `<Row>${r.map(c => xmlCell(c)).join('')}</Row>`),
  ].join('\n')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
          xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="h">
      <Font ss:Bold="1"/>
      <Interior ss:Color="#00F8B4" ss:Pattern="Solid"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="${sheetName}">
    <Table>${xmlRows}</Table>
  </Worksheet>
</Workbook>`
  triggerDownload(
    new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' }),
    filename.endsWith('.xls') ? filename : filename + '.xls'
  )
}

export async function downloadPDF(
  filename: string,
  title: string,
  subtitle: string,
  headers: string[],
  rows: Cell[][],
): Promise<void> {
  const { default: jsPDF } = await import('jspdf')

  const landscape = headers.length > 5
  const doc   = new jsPDF({ orientation: landscape ? 'landscape' : 'portrait', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const mg    = 12
  const tw    = pageW - mg * 2
  const colW  = tw / headers.length

  // ── Title block ──────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold'); doc.setFontSize(14)
  doc.setTextColor(0, 200, 140)
  doc.text('CashIQ  —  روز کیش', mg, 13)

  doc.setFontSize(11); doc.setTextColor(30, 30, 30)
  doc.text(title, mg, 21)

  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(110, 110, 110)
  doc.text(subtitle, mg, 27)
  doc.text(`Generated: ${new Date().toLocaleString('en-PK')}  ·  ${rows.length} records`, mg, 32)

  doc.setDrawColor(0, 248, 180); doc.setLineWidth(0.4)
  doc.line(mg, 35.5, pageW - mg, 35.5)

  // ── Table ────────────────────────────────────────────────────────────────────
  const hH  = 8
  const rH  = 6.5
  let y     = 42

  function drawHeader() {
    doc.setFillColor(10, 20, 16)
    doc.rect(mg, y - hH + 1.5, tw, hH, 'F')
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(0, 248, 180)
    headers.forEach((h, i) => doc.text(h.substring(0, 16), mg + i * colW + 1.5, y - 0.5))
    y += 2
  }

  drawHeader()
  doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5)

  rows.forEach((row, ri) => {
    if (y > pageH - 16) { doc.addPage(); y = 20; drawHeader() }
    if (ri % 2 === 0) {
      doc.setFillColor(244, 250, 247)
      doc.rect(mg, y - rH + 1.5, tw, rH, 'F')
    }
    doc.setTextColor(40, 40, 40)
    row.forEach((cell, i) => {
      const s   = String(cell ?? '')
      const max = Math.max(4, Math.floor(colW / 1.55))
      doc.text(s.length > max ? s.slice(0, max - 1) + '…' : s, mg + i * colW + 1.5, y)
    })
    y += rH
  })

  // ── Page numbers ─────────────────────────────────────────────────────────────
  const total = (doc as any).internal.getNumberOfPages()
  for (let p = 1; p <= total; p++) {
    doc.setPage(p); doc.setFontSize(6.5); doc.setTextColor(160, 160, 160)
    doc.text(`Page ${p} / ${total}`, pageW - mg - 14, pageH - 4)
    doc.text('CashIQ', mg, pageH - 4)
  }

  doc.save(filename.endsWith('.pdf') ? filename : filename + '.pdf')
}
