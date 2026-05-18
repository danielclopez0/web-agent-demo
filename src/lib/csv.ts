import type { Order } from '../types'

export function ordersToCsv(orders: Order[]): string {
  const header = ['id', 'vendor', 'description', 'amount', 'status', 'createdAt', 'costCenter']
  const escape = (v: string | number): string => {
    const s = String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const rows = orders.map(o =>
    [o.id, o.vendor, o.description, o.amount, o.status, o.createdAt, o.costCenter].map(escape).join(','),
  )
  return [header.join(','), ...rows].join('\n') + '\n'
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
