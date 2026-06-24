import { useState } from 'react'
import type { User, Order } from './types'
import { SEED_ORDERS } from './data/seed'
import { LoginPage } from './pages/LoginPage'
import { OrdersPage } from './pages/OrdersPage'
import { NewOrderPage } from './pages/NewOrderPage'
import { Layout } from './components/Layout'

type Page = 'orders' | 'new-order'

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [page, setPage] = useState<Page>('orders')
  const [orders, setOrders] = useState<Order[]>(SEED_ORDERS)

  if (!user) return <LoginPage onLogin={setUser} />

  return (
    <Layout
      user={user}
      currentPage={page}
      onNavigate={setPage}
      onSignOut={() => setUser(null)}
    >
      {page === 'orders' && (
        <OrdersPage
          orders={orders}
          onApprove={(id) =>
            setOrders((prev) =>
              prev.map((o) => (o.id === id ? { ...o, status: 'Approved' } : o)),
            )
          }
        />
      )}
      {page === 'new-order' && (
        <NewOrderPage
          onCreate={(order) => setOrders([order, ...orders])}
          onCancel={() => setPage('orders')}
        />
      )}
    </Layout>
  )
}
