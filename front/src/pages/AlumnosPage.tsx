import { useState } from 'react'
import { useAlumnos } from '../hooks/useAlumnos'
import { AlumnoModal } from '../components/AlumnoModal'
import { AsistenciasPage } from './Asistenciaspage'
import type { Alumno, AlumnoFilters, CreateAlumnoDto, DiaSemana, EstadoPago } from '../types'

const DIAS: DiaSemana[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export function AlumnosPage() {
  const [filters, setFilters] = useState<AlumnoFilters>({ search: '', estado: '', dia: '' })
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAlumno, setEditingAlumno] = useState<Alumno | null>(null)
  const [verAsistencias, setVerAsistencias] = useState<Alumno | null>(null)

  const { alumnos, loading, error, crear, actualizar, eliminar } = useAlumnos(filters)

  const setFilter = <K extends keyof AlumnoFilters>(k: K, v: AlumnoFilters[K]) =>
    setFilters(f => ({ ...f, [k]: v }))

  const handleSave = async (data: CreateAlumnoDto) => {
    if (editingAlumno) {
      await actualizar(editingAlumno.id, data)
    } else {
      await crear(data)
    }
  }

  const openEdit = (a: Alumno) => { setEditingAlumno(a); setModalOpen(true) }
  const openNew = () => { setEditingAlumno(null); setModalOpen(true) }

  // Si estamos viendo asistencias de una alumna, mostramos esa página
  if (verAsistencias) {
    return (
      <AsistenciasPage
        alumno={verAsistencias}
        onVolver={() => setVerAsistencias(null)}
      />
    )
  }

  const total = alumnos.length
  const pagados = alumnos.filter(a => a.estado === 'pagado').length
  const recaudado = alumnos.filter(a => a.estado === 'pagado').reduce((s, a) => s + a.monto, 0)
  const porCobrar = alumnos.filter(a => a.estado === 'pendiente').reduce((s, a) => s + a.monto, 0)

  return (
    <div className="page">
      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-label">Total alumnas</span>
          <span className="metric-value">{total}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Pagaron</span>
          <span className="metric-value">{pagados}</span>
          <span className="metric-sub">{total - pagados} pendientes</span>
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

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Buscar alumna..."
          value={filters.search}
          onChange={e => setFilter('search', e.target.value)}
        />
        <select value={filters.estado} onChange={e => setFilter('estado', e.target.value as EstadoPago | '')}>
          <option value="">Todos los pagos</option>
          <option value="pagado">Pagado</option>
          <option value="pendiente">Pendiente</option>
        </select>
        <select value={filters.dia} onChange={e => setFilter('dia', e.target.value as DiaSemana | '')}>
          <option value="">Todos los días</option>
          {DIAS.map(d => <option key={d}>{d}</option>)}
        </select>
        <button className="btn-primary" onClick={openNew}>+ Nueva alumna</button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="table-wrapper">
        {loading ? (
          <div className="table-empty">Cargando...</div>
        ) : alumnos.length === 0 ? (
          <div className="table-empty">No hay alumnas que coincidan con los filtros.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Método</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {alumnos.map(a => (
                <tr key={a.id}>
                  <td className="td-nombre">{a.nombre}</td>
                  <td><span className={`badge badge-${a.tipo}`}>{a.tipo === 'mensual' ? 'Mensual' : 'Por clase'}</span></td>
                  <td>{a.metodo === 'efectivo' ? 'Efectivo' : 'Transferencia'}</td>
                  <td className="td-monto">${a.monto.toLocaleString('es-AR')}</td>
                  <td><span className={`badge badge-${a.estado}`}>{a.estado === 'pagado' ? 'Pagado' : 'Pendiente'}</span></td>
                  <td>
                    <div className="row-actions">
                      <button className="btn-action" onClick={() => setVerAsistencias(a)}>Asistencias</button>
                      <button className="btn-action" onClick={() => openEdit(a)}>Editar</button>
                      <button className="btn-action btn-danger" onClick={() => { if (confirm(`¿Eliminar a ${a.nombre}?`)) eliminar(a.id) }}>Borrar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AlumnoModal
        open={modalOpen}
        alumno={editingAlumno}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  )
}