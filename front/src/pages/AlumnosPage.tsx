import { useState } from 'react'
import { useAlumnos } from '../hooks/useAlumnos'
import { AlumnoModal } from '../components/AlumnoModal'
import { AsistenciasPage } from './Asistenciaspage'
import type { Alumno, AlumnoFilters, CreateAlumnoDto, DiaSemana } from '../types'

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

  // Mostrar página de asistencias
  if (verAsistencias) {
    return (
      <AsistenciasPage
        alumno={verAsistencias}
        onVolver={() => setVerAsistencias(null)}
      />
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Alumnas</h1>
        <button className="btn-primary" onClick={openNew}>
          + Nueva alumna
        </button>
      </div>

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Buscar alumna por nombre..."
          value={filters.search}
          onChange={e => setFilter('search', e.target.value)}
        />
        <select 
          value={filters.estado} 
          onChange={e => setFilter('estado', e.target.value as any)}
        >
          <option value="">Todos los pagos</option>
          <option value="pagado">Pagado</option>
          <option value="pendiente">Pendiente</option>
        </select>
        <select 
          value={filters.dia} 
          onChange={e => setFilter('dia', e.target.value as DiaSemana | '')}
        >
          <option value="">Todos los días</option>
          {DIAS.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="table-wrapper">
        {loading ? (
          <div className="table-empty">Cargando alumnas...</div>
        ) : alumnos.length === 0 ? (
          <div className="table-empty">
            No se encontraron alumnas con los filtros aplicados.
          </div>
        ) : (
          <table className="alumnos-table">
            <thead>
              <tr>
                <th>Nombre de la alumna</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {alumnos.map(a => (
                <tr key={a.id}>
                  <td className="td-nombre">
                    <span className="alumna-name">{a.nombre}</span>
                  </td>
                  <td className="text-center">
                    <div className="row-actions">
                      <button 
                        className="btn-action btn-asistencias"
                        onClick={() => setVerAsistencias(a)}
                      >
                        📅 Ver Asistencias
                      </button>
                      <button 
                        className="btn-action"
                        onClick={() => openEdit(a)}
                      >
                        Editar
                      </button>
                      <button 
                        className="btn-action btn-danger"
                        onClick={() => {
                          if (confirm(`¿Eliminar a ${a.nombre}?`)) eliminar(a.id)
                        }}
                      >
                        Borrar
                      </button>
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