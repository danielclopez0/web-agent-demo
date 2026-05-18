import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Order } from '../types'
import { VENDORS, COST_CENTERS } from '../data/seed'
import { Button } from '../components/Button'

type Props = {
  onCreate: (order: Order) => void
  onCancel: () => void
}

export function NewOrderPage({ onCreate, onCancel }: Props) {
  const [vendor, setVendor] = useState(VENDORS[0].name)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [costCenter, setCostCenter] = useState(COST_CENTERS[0].id)
  const [submitted, setSubmitted] = useState<Order | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const amountNum = Number(amount)
    if (!description.trim()) return setError('Description is required.')
    if (!Number.isFinite(amountNum) || amountNum <= 0) return setError('Amount must be a positive number.')
    const order: Order = {
      id: `PO-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
      vendor,
      description: description.trim(),
      amount: amountNum,
      status: 'Submitted',
      createdAt: new Date().toISOString().slice(0, 10),
      costCenter,
    }
    setSubmitted(order)
    setError(null)
    onCreate(order)
  }

  if (submitted) {
    return (
      <div className="max-w-xl space-y-4" data-testid="new-order-success">
        <h1 className="text-2xl font-semibold text-slate-900">Order Submitted</h1>
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-2 text-sm">
          <div><span className="text-slate-500">PO #:</span> <span className="font-mono">{submitted.id}</span></div>
          <div><span className="text-slate-500">Vendor:</span> {submitted.vendor}</div>
          <div><span className="text-slate-500">Description:</span> {submitted.description}</div>
          <div><span className="text-slate-500">Amount:</span> ${submitted.amount.toLocaleString()}</div>
          <div><span className="text-slate-500">Cost Center:</span> {submitted.costCenter}</div>
          <div><span className="text-slate-500">Status:</span> {submitted.status}</div>
        </div>
        <Button variant="secondary" onClick={onCancel}>Back to Orders</Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5" data-testid="new-order-form">
      <h1 className="text-2xl font-semibold text-slate-900">New Purchase Order</h1>

      <div className="space-y-2">
        <label htmlFor="vendor" className="block text-sm font-medium text-slate-700">Vendor</label>
        <select
          id="vendor"
          value={vendor}
          onChange={(e) => setVendor(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white"
        >
          {VENDORS.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label>
        <input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
          placeholder="e.g. 4x Dell PowerEdge servers"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="amount" className="block text-sm font-medium text-slate-700">Amount (USD)</label>
        <input
          id="amount"
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="cost-center" className="block text-sm font-medium text-slate-700">Cost Center</label>
        <select
          id="cost-center"
          value={costCenter}
          onChange={(e) => setCostCenter(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white"
        >
          {COST_CENTERS.map(c => <option key={c.id} value={c.id}>{c.id} — {c.name}</option>)}
        </select>
      </div>

      {error && <div className="text-sm text-red-600" role="alert" data-testid="form-error">{error}</div>}

      <div className="flex gap-3">
        <Button type="submit" data-testid="submit-order-btn">Submit Order</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}
