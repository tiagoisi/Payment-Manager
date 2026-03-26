import { useState, useEffect } from 'react'
import type { Alumno, CreateAlumnoDto, DiaSemana, MetodoPago, TipoPago, EstadoPago } from '../types'

interface Props {
  open: boolean
  alumno?: Alumno | null
  onClose: () => void
  onSave: (data: CreateAlumnoDto) => Promise<void>
}

const DIAS: DiaSemana[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const empty: CreateAlumnoDto = {
  nombre: '',
  dia: 'Sábado',
  tipo: 'mensual',
  metodo: 'efectivo',
  estado: 'pagado',
  monto: 0,
}

export function AlumnoModal({ open, alumno, onClose, onSave }: Props) {
  const [form, setForm] = useState<CreateAlumnoDto>(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (alumno) {
      setForm({ nombre: alumno.nombre, dia: alumno.dia, tipo: alumno.tipo, metodo: alumno.metodo, estado: alumno.estado, monto: alumno.monto })
    } else {
      setForm(empty)
    }
    setError('')
  }, [alumno, open])

  const set = <K extends keyof CreateAlumnoDto>(key: K, val: CreateAlumnoDto[K]) =>
    setForm(f => ({ ...f, [key]: val }))

  const handleSave = async () => {
    if (!form.nombre.trim()) { setError('El nombre es requerido'); return }
    if (form.monto <= 0) { setError('Ingresá un monto válido'); return }
    setSaving(true)
    try {
      await onSave(form)
      onClose()
    } catch {
      setError('Ocurrió un error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{alumno ? 'Editar alumna' : 'Nueva alumna'}</h3>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <div className="field">
          <label>Nombre completo</label>
          <input value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Ej: Ana García" autoFocus />
        </div>

        <div className="field">
          <label>Día de clase</label>
          <select value={form.dia} onChange={e => set('dia', e.target.value as DiaSemana)}>
            {DIAS.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Tipo de pago</label>
            <select value={form.tipo} onChange={e => set('tipo', e.target.value as TipoPago)}>
              <option value="mensual">Mensual</option>
              <option value="clase">Por clase</option>
            </select>
          </div>
          <div className="field">
            <label>Método</label>
            <select value={form.metodo} onChange={e => set('metodo', e.target.value as MetodoPago)}>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
            </select>
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Monto ($)</label>
            <input type="number" value={form.monto || ''} onChange={e => set('monto', Number(e.target.value))} placeholder="20000" min={20000} />
          </div>
          <div className="field">
            <label>Estado</label>
            <select value={form.estado} onChange={e => set('estado', e.target.value as EstadoPago)}>
              <option value="pagado">Pagado</option>
              <option value="pendiente">Pendiente</option>
            </select>
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}