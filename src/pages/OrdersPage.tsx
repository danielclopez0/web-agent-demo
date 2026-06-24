import { useMemo, useState } from 'react'
import type { Order } from '../types'
import { Button } from '../components/Button'
import { ordersToCsv, downloadCsv } from '../lib/csv'

type Props = {
  orders: Order[]
  onApprove: (id: string) => void
}

const STATUSES: Array<Order['status'] | 'All'> = ['All', 'Draft', 'Submitted', 'Approved']

const formatMoney = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

export function OrdersPage({ orders, onApprove }: Props) {
  const [filter, setFilter] = useState<Order['status'] | 'All'>('All')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const byStatus = filter === 'All' ? orders : orders.filter(o => o.status === filter)
    const q = search.trim().toLowerCase()
    if (!q) return byStatus
    return byStatus.filter(o =>
      o.id.toLowerCase().includes(q) ||
      o.vendor.toLowerCase().includes(q) ||
      o.description.toLowerCase().includes(q),
    )
  }, [orders, filter, search])

  const handleExport = () => {
    const csv = ordersToCsv(filtered)
    const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    downloadCsv(`orders-${ts}.csv`, csv)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Purchase Orders</h1>
        <Button onClick={handleExport} data-testid="export-csv-btn">
          Export CSV
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-sm rounded-full ${
                filter === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search PO #, vendor, description…"
          aria-label="Search orders"
          data-testid="order-search"
          className="w-72 px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-4 py-3 font-medium">PO #</th>
              <th className="text-left px-4 py-3 font-medium">Vendor</th>
              <th className="text-left px-4 py-3 font-medium">Description</th>
              <th className="text-right px-4 py-3 font-medium">Amount</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Created</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id} className="border-t border-slate-100" data-testid={`order-row-${o.id}`}>
                <td className="px-4 py-3 font-mono text-xs text-slate-700">{o.id}</td>
                <td className="px-4 py-3 text-slate-900">{o.vendor}</td>
                <td className="px-4 py-3 text-slate-700">{o.description}</td>
                <td className="px-4 py-3 text-right text-slate-900">{formatMoney(o.amount)}</td>
                <td className="px-4 py-3">
                  <span
                    data-testid={`status-${o.id}`}
                    className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                      o.status === 'Approved' ? 'bg-green-100 text-green-800' :
                      o.status === 'Submitted' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">{o.createdAt}</td>
                <td className="px-4 py-3 text-right">
                  {o.status !== 'Approved' && (
                    <button
                      onClick={() => onApprove(o.id)}
                      data-testid={`approve-btn-${o.id}`}
                      className="px-2.5 py-1 text-xs font-medium rounded-md border border-green-300 text-green-700 hover:bg-green-50"
                    >
                      Approve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-slate-500">No orders match this filter.</div>
        )}
      </div>
    </div>
  )
}
