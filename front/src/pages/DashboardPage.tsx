import { useState, useEffect } from 'react'
import { useAlumnos } from '../hooks/useAlumnos'
import { asistenciasService } from '../services/alumnos.service'
import type { DiaSemana } from '../types'

const NO_FILTERS = { search: '', estado: '' as const, dia: '' as const }

const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
]

export function DashboardPage() {
  const { alumnos, loading, marcarPagado } = useAlumnos(NO_FILTERS)

  const hoy = new Date()
  const [year, setYear] = useState(hoy.getFullYear())
  const [month, setMonth] = useState(hoy.getMonth())

  const [resumen, setResumen] = useState({
    recaudadoMensual: 0,
    recaudadoClases: 0,
    totalRecaudado: 0,
    porCobrarMensual: 0,
    porCobrarClases: 0,
    totalPorCobrar: 0,
  })
  const [loadingResumen, setLoadingResumen] = useState(false)

  useEffect(() => {
    setLoadingResumen(true)
    asistenciasService.resumenMes(year, month)
      .then(data => setResumen(data))
      .catch(() => {})
      .finally(() => setLoadingResumen(false))
  }, [year, month])

  function changeMonth(dir: number) {
    let m = month + dir
    let y = year
    if (m > 11) { m = 0; y++ }
    if (m < 0)  { m = 11; y-- }
    setMonth(m)
    setYear(y)
  }

  const total = alumnos.length
  const mesActual = `${year}-${String(month + 1).padStart(2, '0')}`
  const mensuales = alumnos.filter(a => a.tipo === 'mensual')
  const pagados = mensuales.filter(a => a.ultimoPagoMes === mesActual).length
  // alumnas mensuales que no pagaron el mes
  const mensualPendiente = alumnos.filter(a => a.tipo === 'mensual' && a.ultimoPagoMes !== mesActual)

  // alumnas por clase con clases sin pagar — ya lo tenemos en el resumen
  // las mostramos si porCobrarClases > 0
  const clasesPendientes = alumnos.filter(a => a.tipo === 'clase')
  const pct = mensuales.length ? Math.round(pagados / mensuales.length * 100) : 0
  const pendientes = alumnos.filter(a => a.tipo === 'mensual' && a.ultimoPagoMes !== mesActual)
  
  // Agrupar por día para el gráfico
  const porDia: Record<string, number> = {}
  alumnos.forEach(a => { porDia[a.dia] = (porDia[a.dia] || 0) + 1 })
  const diasOrden: DiaSemana[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const maxDia = Math.max(...Object.values(porDia), 1)

  if (loading) return <div className="page"><div className="table-empty">Cargando...</div></div>

  return (
    <div className="page">

      {/* Navegación de mes */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button className="btn-secondary" style={{ padding: '6px 12px' }} onClick={() => changeMonth(-1)}>←</button>
        <span style={{ fontSize: '15px', fontWeight: 500, minWidth: '160px', textAlign: 'center' }}>
          {MESES[month]} {year}
        </span>
        <button className="btn-secondary" style={{ padding: '6px 12px' }} onClick={() => changeMonth(1)}>→</button>
      </div>

      {/* Métricas principales */}
      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-label">Total alumnas</span>
          <span className="metric-value">{total}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Al día</span>
          <span className="metric-value">{pct}%</span>
          <span className="metric-sub">{pagados} de {mensuales.length}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Total recaudado</span>
          <span className="metric-value">
            {loadingResumen ? '...' : `$${Number(resumen.totalRecaudado).toLocaleString('es-AR')}`}
          </span>
          <span className="metric-sub">
            mensual ${Number(resumen.recaudadoMensual).toLocaleString('es-AR')} · clases ${Number(resumen.recaudadoClases).toLocaleString('es-AR')}
          </span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Por cobrar</span>
          <span className="metric-value">
            {loadingResumen ? '...' : `$${Number(resumen.totalPorCobrar).toLocaleString('es-AR')}`}
          </span>
          <span className="metric-sub">
            mensual ${Number(resumen.porCobrarMensual).toLocaleString('es-AR')} · clases ${Number(resumen.porCobrarClases).toLocaleString('es-AR')}
          </span>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Alumnas por día */}
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

        {/* Desglose recaudación */}
        <div className="dash-card">
          <h4>Recaudación del mes</h4>
          {[
            { label: 'Mensual cobrado', val: resumen.recaudadoMensual, color: 'bar-fill--green' },
            { label: 'Clases cobradas', val: resumen.recaudadoClases, color: 'bar-fill--blue' },
            { label: 'Mensual pendiente', val: resumen.porCobrarMensual, color: 'bar-fill--red' },
            { label: 'Clases pendientes', val: resumen.porCobrarClases, color: 'bar-fill--red' },
          ].map(({ label, val, color }) => {
            const max = resumen.totalRecaudado + resumen.totalPorCobrar || 1
            return (
              <div className="bar-row" key={label}>
                <span className="bar-label" style={{ width: '130px', fontSize: '11px' }}>{label}</span>
                <div className="bar-track">
                  <div className={`bar-fill ${color}`} style={{ width: `${Math.round(Number(val) / max * 100)}%` }} />
                </div>
                <span className="bar-val" style={{ width: '60px', fontSize: '11px' }}>${Math.round(Number(val) / 1000)}k</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Pendientes */}
      <div className="dash-card">
        <h4>Pendientes de pago</h4>
        {mensualPendiente.length === 0 && resumen.porCobrarClases === 0 ? (
          <p className="empty-text">Todas las alumnas están al día ✓</p>
        ) : (
          <>
            {mensualPendiente.map(a => (
              <div className="pendiente-row" key={a.id}>
                <div>
                  <span className="pendiente-nombre">{a.nombre}</span>
                  <span className="pendiente-dia">{a.dia} · mensual</span>
                </div>
                <div className="pendiente-right">
                  <span className="pendiente-monto">${Number(a.monto).toLocaleString('es-AR')}</span>
                  <button className="btn-action" onClick={() => marcarPagado(a.id)}>Marcar pagado</button>
                </div>
              </div>
            ))}
            {resumen.porCobrarClases > 0 && clasesPendientes.map(a => (
              <div className="pendiente-row" key={a.id}>
                <div>
                  <span className="pendiente-nombre">{a.nombre}</span>
                  <span className="pendiente-dia">{a.dia} · por clase</span>
                </div>
                <div className="pendiente-right">
                  <span className="pendiente-monto">tiene clases sin pagar</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

    </div>
  )
}