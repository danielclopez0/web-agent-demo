export type User = {
  email: string
  name: string
  role: string
}

export type Order = {
  id: string
  vendor: string
  description: string
  amount: number
  status: 'Draft' | 'Submitted' | 'Approved'
  createdAt: string  // ISO date
  costCenter: string
}

export type Vendor = {
  id: string
  name: string
}

export type CostCenter = {
  id: string
  name: string
}
