interface CSVMetadata {
  company?: string
  reportType?: string
  dateRange?: string
  generatedOn?: string
  totalRecords?: number
}

export function exportToCSV(data: any[], filename: string, metadata?: CSVMetadata) {
  if (!data || data.length === 0) return

  const headers = Object.keys(data[0])

  // Build metadata rows if provided
  const metadataRows: string[] = []
  if (metadata) {
    if (metadata.company) metadataRows.push(`Company: ${metadata.company}`)
    if (metadata.reportType) metadataRows.push(`Report Type: ${metadata.reportType}`)
    if (metadata.dateRange) metadataRows.push(`Period: ${metadata.dateRange}`)
    if (metadata.generatedOn) metadataRows.push(`Generated On: ${metadata.generatedOn}`)
    if (metadata.totalRecords !== undefined) metadataRows.push(`Total Records: ${metadata.totalRecords}`)
    metadataRows.push('') // Empty row separator
  }

  const csvContent = [
    ...metadataRows,
    headers.join(','),
    ...data.map(row => headers.map(header => {
      const value = row[header]
      if (value === null || value === undefined) return ''

      let stringValue = String(value)

      // Auto-format phone numbers and long numeric strings to text to prevent scientific notation
      const isPhoneHeader = /phone|mobile|tel|contact/i.test(header)
      const isLongNumeric = /^\d{10,}$/.test(stringValue)

      if ((isPhoneHeader || isLongNumeric) && !stringValue.startsWith('\t')) {
        stringValue = `\t${stringValue}`
      }

      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    }).join(','))
  ].join('\n')

  // Add BOM for Excel compatibility
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}