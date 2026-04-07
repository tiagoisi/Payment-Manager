import { useState } from 'react'
import { AlumnosPage } from './pages/AlumnosPage'
import { DashboardPage } from './pages/DashboardPage'

type Tab = 'alumnos' | 'dashboard'

export function App() {
  const [tab, setTab] = useState<Tab>('alumnos')

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="header-brand">
          <span className="brand-icon">
            <img src="/mitaitilogo2.png" alt="" />
          </span>
          <div>
            <h1 className="brand-title">El Taller de So</h1>
            <p className="brand-sub">Sistema de alumnos y pagos</p>
          </div>
        </div>
        <nav className="header-nav">
          <button
            className={`nav-btn ${tab === 'alumnos' ? 'active' : ''}`}
            onClick={() => setTab('alumnos')}
          >
            Alumnas
          </button>
          <button
            className={`nav-btn ${tab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setTab('dashboard')}
          >
            Dashboard
          </button>
        </nav>
      </header>

      <main className="app-main">
        {tab === 'alumnos' ? <AlumnosPage /> : <DashboardPage />}
      </main>
    </div>
  )
}