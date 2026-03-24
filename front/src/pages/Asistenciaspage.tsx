import { useState } from 'react'
import { useAsistencias } from '../hooks/useAsistencias'
import type { Alumno } from '../types'

const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
]

interface Props {
  alumno: Alumno
  onVolver: () => void
}

function fmtDisplay(fecha: string) {
  const [y, m, d] = fecha.split('-')
  return { dia: d, corta: `${d}/${m}/${y}` }
}

export function AsistenciasPage({ alumno, onVolver }: Props) {
  const hoy = new Date()
  const [year, setYear] = useState(hoy.getFullYear())
  const [month, setMonth] = useState(hoy.getMonth())

  const { sabados, getAsistencia, registrar, resumen, loading } = useAsistencias(alumno, year, month)
  const esPorClase = alumno.tipo === 'clase'

  function changeMonth(dir: number) {
    let m = month + dir
    let y = year
    if (m > 11) { m = 0; y++ }
    if (m < 0) { m = 11; y-- }
    setMonth(m)
    setYear(y)
  }

  async function toggleVino(fecha: string, vino: boolean) {
    await registrar({
      alumnoId: alumno.id,
      fecha,
      vino,
      // Si deja de venir, reseteamos el pago del día
      pagoDia: vino ? (getAsistencia(fecha)?.pagoDia ?? false) : false,
      monto: vino ? alumno.monto : 0,
    })
  }

  async function togglePago(fecha: string, pagoDia: boolean) {
    await registrar({
      alumnoId: alumno.id,
      fecha,
      vino: true,
      pagoDia,
      monto: pagoDia ? alumno.monto : 0,
    })
  }

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontWeight: 400, fontSize: '22px', color: 'var(--ink)' }}>
            {alumno.nombre}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--ink-muted)', marginTop: '2px' }}>
            {esPorClase
              ? 'Pago por clase — asistencia y cobro por sábado'
              : 'Pago mensual — solo se registra asistencia'}
          </p>
        </div>
        <button className="btn-secondary" onClick={onVolver}>← Volver</button>
      </div>

      {/* Navegación de mes */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button className="btn-secondary" style={{ padding: '6px 12px' }} onClick={() => changeMonth(-1)}>←</button>
        <span style={{ fontSize: '15px', fontWeight: 500, minWidth: '160px', textAlign: 'center' }}>
          {MESES[month]} {year}
        </span>
        <button className="btn-secondary" style={{ padding: '6px 12px' }} onClick={() => changeMonth(1)}>→</button>
      </div>

      {/* Resumen del mes */}
      <div className="resumen-strip">
        <div className="resumen-item">
          <span className="resumen-label">Sábados</span>
          <span className="resumen-val">{resumen.sabados}</span>
        </div>
        <div className="resumen-item">
          <span className="resumen-label">Asistió</span>
          <span className="resumen-val">{resumen.vino}</span>
        </div>
        <div className="resumen-item">
          <span className="resumen-label">Faltó</span>
          <span className="resumen-val">{resumen.falto}</span>
        </div>
        {esPorClase ? (
          <>
            <div className="resumen-item">
              <span className="resumen-label">Pagó</span>
              <span className="resumen-val">{resumen.pago ?? 0} clases</span>
            </div>
            <div className="resumen-item">
              <span className="resumen-label">Total cobrado</span>
              <span className="resumen-val">${Number(resumen.totalCobrado ?? 0).toLocaleString('es-AR')}</span>
            </div>
          </>
        ) : (
          <div className="resumen-item">
            <span className="resumen-label">Pago mensual</span>
            <span className={`badge badge-${alumno.estado}`}>
              {alumno.estado === 'pagado' ? 'Pagado' : 'Pendiente'}
            </span>
          </div>
        )}
      </div>

      {/* Grilla de sábados */}
      {loading ? (
        <div className="table-empty">Cargando...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sabados.map(fecha => {
            const reg = getAsistencia(fecha)
            const vino = reg?.vino ?? false
            const pagoDia = reg?.pagoDia ?? false
            const { dia, corta } = fmtDisplay(fecha)

            return (
              <div key={fecha} className="sab-card">
                <div className="sab-fecha">
                  <span className="sab-dia">Sáb {dia}</span>
                  <span className="sab-corta">{corta}</span>
                </div>

                {/* Toggle vino / no vino */}
                <div className="toggle-group">
                  <button
                    className={`toggle-btn ${vino ? 'toggle-vino' : ''}`}
                    onClick={() => toggleVino(fecha, true)}
                  >
                    Vino
                  </button>
                  <button
                    className={`toggle-btn ${!vino && reg ? 'toggle-novino' : ''}`}
                    onClick={() => toggleVino(fecha, false)}
                  >
                    No vino
                  </button>

                  {/* Toggle pagó / no pagó (solo por clase y si vino) */}
                  {esPorClase && vino && (
                    <>
                      <div className="toggle-sep" />
                      <button
                        className={`toggle-btn ${pagoDia ? 'toggle-pago' : ''}`}
                        onClick={() => togglePago(fecha, true)}
                      >
                        Pagó
                      </button>
                      <button
                        className={`toggle-btn ${!pagoDia && reg ? 'toggle-nopago' : ''}`}
                        onClick={() => togglePago(fecha, false)}
                      >
                        No pagó
                      </button>
                    </>
                  )}
                </div>

                {/* Monto al final */}
                <div className="sab-monto">
                  {esPorClase && pagoDia && (
                    <span>${alumno.monto.toLocaleString('es-AR')}</span>
                  )}
                  {!esPorClase && (
                    <span className="sab-mensual-tag">mensual</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}