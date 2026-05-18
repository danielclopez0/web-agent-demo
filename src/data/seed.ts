import type { Order, Vendor, CostCenter, User } from '../types'

export const DEMO_USER: User = {
  email: 'john.smith@acme-corp.com',
  name: 'John Smith',
  role: 'Procurement Manager',
}

export const DEMO_PASSWORD = 'Acme2024!'

export const VENDORS: Vendor[] = [
  { id: 'V-001', name: 'Vertex Technologies' },
  { id: 'V-002', name: 'Global Office Supplies' },
  { id: 'V-003', name: 'CloudNet Infrastructure' },
  { id: 'V-004', name: 'Pinnacle Consulting Group' },
  { id: 'V-005', name: 'Northwind Industrial' },
]

export const COST_CENTERS: CostCenter[] = [
  { id: 'CC-1001', name: 'Engineering' },
  { id: 'CC-1002', name: 'Marketing' },
  { id: 'CC-1003', name: 'Operations' },
  { id: 'CC-1004', name: 'IT Infrastructure' },
  { id: 'CC-1005', name: 'Finance' },
]

export const SEED_ORDERS: Order[] = [
  { id: 'PO-2026-001', vendor: 'Vertex Technologies',       description: '4x Dell PowerEdge servers',    amount: 26000, status: 'Approved',  createdAt: '2026-04-12', costCenter: 'CC-1004' },
  { id: 'PO-2026-002', vendor: 'Global Office Supplies',    description: 'Q2 office consumables',         amount:  3450, status: 'Approved',  createdAt: '2026-04-15', costCenter: 'CC-1003' },
  { id: 'PO-2026-003', vendor: 'CloudNet Infrastructure',   description: '12-month CDN contract',         amount: 48000, status: 'Submitted', createdAt: '2026-04-22', costCenter: 'CC-1004' },
  { id: 'PO-2026-004', vendor: 'Pinnacle Consulting Group', description: 'Salesforce migration assist',   amount: 92500, status: 'Submitted', createdAt: '2026-05-02', costCenter: 'CC-1001' },
  { id: 'PO-2026-005', vendor: 'Vertex Technologies',       description: 'Network switches (2x)',         amount:  6400, status: 'Draft',     createdAt: '2026-05-08', costCenter: 'CC-1004' },
  { id: 'PO-2026-006', vendor: 'Northwind Industrial',      description: 'Lab equipment refresh',         amount: 18750, status: 'Approved',  createdAt: '2026-05-10', costCenter: 'CC-1001' },
  { id: 'PO-2026-007', vendor: 'Global Office Supplies',    description: 'Standing desks (8)',            amount:  4800, status: 'Submitted', createdAt: '2026-05-12', costCenter: 'CC-1002' },
  { id: 'PO-2026-008', vendor: 'CloudNet Infrastructure',   description: 'WAF subscription upgrade',      amount: 14200, status: 'Approved',  createdAt: '2026-05-14', costCenter: 'CC-1005' },
]
