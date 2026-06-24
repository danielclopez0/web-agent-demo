import { useState } from 'react'
import type { User, Order } from './types'
import { SEED_ORDERS } from './data/seed'
import { LoginPage } from './pages/LoginPage'
import { OrdersPage } from './pages/OrdersPage'
import { NewOrderPage } from './pages/NewOrderPage'
import { Layout } from './components/Layout'

type Page = 'orders' | 'new-order'

const USER_STORAGE_KEY = 'democorp:user'

const loadUser = (): User | null => {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default function App() {
  const [user, setUser] = useState<User | null>(() => loadUser())
  const [page, setPage] = useState<Page>('orders')
  const [orders, setOrders] = useState<Order[]>(SEED_ORDERS)

  const handleLogin = (nextUser: User) => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser))
    setUser(nextUser)
  }

  const handleSignOut = () => {
    localStorage.removeItem(USER_STORAGE_KEY)
    setUser(null)
  }

  if (!user) return <LoginPage onLogin={handleLogin} />

  return (
    <Layout
      user={user}
      currentPage={page}
      onNavigate={setPage}
      onSignOut={handleSignOut}
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
