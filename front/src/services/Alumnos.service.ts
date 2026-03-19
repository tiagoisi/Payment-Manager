import axios from 'axios'
import type { Alumno, CreateAlumnoDto, UpdateAlumnoDto, CreateAsistenciaDto } from '../types'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

export const alumnosService = {
  getAll: async (params?: { estado?: string; dia?: string }): Promise<Alumno[]> => {
    const { data } = await api.get('/alumnos', { params })
    return data
  },

  getById: async (id: number): Promise<Alumno> => {
    const { data } = await api.get(`/alumnos/${id}`)
    return data
  },

  create: async (dto: CreateAlumnoDto): Promise<Alumno> => {
    const { data } = await api.post('/alumnos', dto)
    return data
  },

  update: async (id: number, dto: UpdateAlumnoDto): Promise<Alumno> => {
    const { data } = await api.patch(`/alumnos/${id}`, dto)
    return data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/alumnos/${id}`)
  },

  marcarPagado: async (id: number): Promise<Alumno> => {
    const { data } = await api.patch(`/alumnos/${id}/pago`, { estado: 'pagado' })
    return data
  },
}

// ── Asistencias ──────────────────────────────────────────────────────────────

export const asistenciasService = {
  // Traer asistencias de una alumna en un mes/año
  getByAlumnoMes: async (alumnoId: number, year: number, month: number) => {
    const { data } = await api.get('/asistencias', {
      params: { alumnoId, year, month: month + 1 },
    })
    return data
  },

  // Crear o actualizar asistencia de un sábado (upsert por alumnoId+fecha)
  upsert: async (dto: CreateAsistenciaDto) => {
    const { data } = await api.post('/asistencias/upsert', dto)
    return data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/asistencias/${id}`)
  },
}