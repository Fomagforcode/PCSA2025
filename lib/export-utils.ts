// Utility functions for exporting data to CSV and triggering browser download

export type CSVRow = Record<string, string | number | boolean | null | undefined>

function escapeCSV(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return ""
  const str = String(value)
  // Escape quotes by doubling, and wrap in quotes if needed
  const escaped = str.replace(/"/g, '""')
  if (/[,\n"]/.test(escaped)) {
    return `"${escaped}"`
  }
  return escaped
}

export function generateCSV(rows: CSVRow[]): string {
  if (rows.length === 0) return ""
  const headers = Object.keys(rows[0])
  const csvLines = [] as string[]
  csvLines.push(headers.join(","))
  for (const row of rows) {
    const line = headers.map((h) => escapeCSV(row[h])).join(",")
    csvLines.push(line)
  }
  return csvLines.join("\n")
}

export function downloadCSV(filename: string, rows: CSVRow[]): boolean {
  try {
    const csv = generateCSV(rows)
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }) // add BOM for Excel
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    return true
  } catch (err) {
    console.error("CSV download failed", err)
    return false
  }
}
