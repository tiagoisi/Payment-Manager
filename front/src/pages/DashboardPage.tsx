// import { useState } from 'react'
import { useAlumnos } from '../hooks/useAlumnos'
import type { DiaSemana } from '../types'

// Sin filtros en el dashboard — vemos todos los alumnos
const NO_FILTERS = { search: '', estado: '' as const, dia: '' as const }

export function DashboardPage() {
  const { alumnos, loading, marcarPagado } = useAlumnos(NO_FILTERS)

  const total = alumnos.length
  const pagados = alumnos.filter(a => a.estado === 'pagado').length
  const recaudado = alumnos.filter(a => a.estado === 'pagado').reduce((s, a) => s + Number(a.monto), 0)
  const porCobrar = alumnos.filter(a => a.estado === 'pendiente').reduce((s, a) => s + Number(a.monto), 0)
  const pct = total ? Math.round(pagados / total * 100) : 0

  // Agrupar por método de pago (solo pagados)
  const porMetodo: Record<string, number> = {}
  alumnos.filter(a => a.estado === 'pagado').forEach(a => {
    porMetodo[a.metodo] = (porMetodo[a.metodo] || 0) + a.monto
  })
  const maxMetodo = Math.max(...Object.values(porMetodo), 1)

  // Agrupar por día
  const porDia: Record<string, number> = {}
  alumnos.forEach(a => { porDia[a.dia] = (porDia[a.dia] || 0) + 1 })
  const diasOrden: DiaSemana[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const maxDia = Math.max(...Object.values(porDia), 1)

  const pendientes = alumnos.filter(a => a.estado === 'pendiente')

  if (loading) return <div className="page"><div className="table-empty">Cargando...</div></div>

  return (
    <div className="page">
      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-label">Total alumnas</span>
          <span className="metric-value">{total}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Al día</span>
          <span className="metric-value">{pct}%</span>
          <span className="metric-sub">{pagados} de {total}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Recaudado</span>
          <span className="metric-value">${recaudado.toLocaleString('es-AR')}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Por cobrar</span>
          <span className="metric-value">${porCobrar.toLocaleString('es-AR')}</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dash-card">
          <h4>Recaudado por método</h4>
          {Object.keys(porMetodo).length === 0 ? (
            <p className="empty-text">Sin datos</p>
          ) : (
            Object.entries(porMetodo).map(([metodo, monto]) => (
              <div className="bar-row" key={metodo}>
                <span className="bar-label">{metodo.charAt(0).toUpperCase() + metodo.slice(1)}</span>
                <div className="bar-track">
                  <div className="bar-fill bar-fill--green" style={{ width: `${Math.round(monto / maxMetodo * 100)}%` }} />
                </div>
                <span className="bar-val">${Math.round(monto / 1000)}k</span>
              </div>
            ))
          )}
        </div>

        <div className="dash-card">
          <h4>Alumnas por día</h4>
          {diasOrden.filter(d => porDia[d]).map(dia => (
            <div className="bar-row" key={dia}>
              <span className="bar-label">{dia}</span>
              <div className="bar-track">
                <div className="bar-fill bar-fill--blue" style={{ width: `${Math.round(porDia[dia] / maxDia * 100)}%` }} />
              </div>
              <span className="bar-val">{porDia[dia]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dash-card" style={{ marginTop: '1rem' }}>
        <h4>Pendientes de pago</h4>
        {pendientes.length === 0 ? (
          <p className="empty-text">Todas las alumnas están al día ✓</p>
        ) : (
          pendientes.map(a => (
            <div className="pendiente-row" key={a.id}>
              <div>
                <span className="pendiente-nombre">{a.nombre}</span>
                <span className="pendiente-dia">{a.dia}</span>
              </div>
              <div className="pendiente-right">
                <span className="pendiente-monto">${a.monto.toLocaleString('es-AR')}</span>
                <button className="btn-action" onClick={() => marcarPagado(a.id)}>Marcar pagado</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}