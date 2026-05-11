export async function exportToPDF(elementId: string, filename: string): Promise<void> {
  const { default: jsPDF } = await import('jspdf')
  const { default: html2canvas } = await import('html2canvas')
  const element = document.getElementById(elementId)
  if (!element) return
  const canvas = await html2canvas(element, { scale: 2, useCORS: true })
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const width = pdf.internal.pageSize.getWidth()
  const height = (canvas.height * width) / canvas.width
  pdf.addImage(imgData, 'PNG', 0, 0, width, height)
  pdf.save(filename)
}

export function generateTransactionReportHTML(
  transactions: Array<{ date: string; type: string; amount: number; note_en?: string }>,
  shopName: string,
  dateRange: string
): string {
  const rows = transactions.map(t =>
    `<tr><td>${t.date}</td><td>${t.type}</td><td>Rs. ${t.amount.toLocaleString()}</td><td>${t.note_en || ''}</td></tr>`
  ).join('')
  return `
    <div style="font-family:Arial;padding:20px;">
      <h2>${shopName}</h2>
      <p>Period: ${dateRange}</p>
      <table border="1" cellpadding="4" cellspacing="0" style="width:100%;border-collapse:collapse">
        <thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Note</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `
}
