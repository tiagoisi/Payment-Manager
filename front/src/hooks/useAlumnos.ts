import { useState, useEffect, useCallback } from 'react'
import { alumnosService } from '../services/Alumnos.service'
import type { Alumno, AlumnoFilters, CreateAlumnoDto, UpdateAlumnoDto } from '../types'

// MOCK DATA — cuando el backend no está disponible todavía
// con back listo, borrar USE_MOCK y toda la sección de mock
const USE_MOCK = false

const MOCK_ALUMNOS: Alumno[] = [
  { id: 1, nombre: 'Lucía Fernández',  dia: 'Sábado',    tipo: 'mensual', metodo: 'transferencia', estado: 'pagado',   monto: 6000 },
  { id: 2, nombre: 'Marta Rodríguez', dia: 'Sábado',    tipo: 'mensual', metodo: 'efectivo',       estado: 'pendiente', monto: 6000 },
  { id: 3, nombre: 'Paula Gómez',      dia: 'Miércoles', tipo: 'clase',   metodo: 'efectivo',       estado: 'pagado',   monto: 1500 },
  { id: 4, nombre: 'Elena Torres',     dia: 'Lunes',     tipo: 'mensual', metodo: 'transferencia', estado: 'pagado',   monto: 6000 },
  { id: 5, nombre: 'Carmen Díaz',      dia: 'Sábado',    tipo: 'clase',   metodo: 'efectivo',       estado: 'pendiente', monto: 1500 },
  { id: 6, nombre: 'Rosa López',       dia: 'Viernes',   tipo: 'mensual', metodo: 'transferencia', estado: 'pagado',   monto: 6000 },
]
let mockNextId = 7

export function useAlumnos(filters: AlumnoFilters) {
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAlumnos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (USE_MOCK) {
        // Simula filtros del backend localmente
        let result = [...MOCK_ALUMNOS]
        if (filters.estado) result = result.filter(a => a.estado === filters.estado)
        if (filters.dia) result = result.filter(a => a.dia === filters.dia)
        if (filters.search) {
          const q = filters.search.toLowerCase()
          result = result.filter(a => a.nombre.toLowerCase().includes(q))
        }
        setAlumnos(result)
      } else {
        const data = await alumnosService.getAll({
          estado: filters.estado || undefined,
          dia: filters.dia || undefined,
        })
        const filtered = filters.search
          ? data.filter(a => a.nombre.toLowerCase().includes(filters.search!.toLowerCase()))
          : data
        setAlumnos(filtered)
      }
    } catch {
      setError('No se pudo cargar los alumnos')
    } finally {
      setLoading(false)
    }
  }, [filters.estado, filters.dia, filters.search])

  useEffect(() => { fetchAlumnos() }, [fetchAlumnos])

  const crear = async (dto: CreateAlumnoDto): Promise<void> => {
    if (USE_MOCK) {
      MOCK_ALUMNOS.push({ ...dto, id: mockNextId++ })
    } else {
      await alumnosService.create(dto)
    }
    await fetchAlumnos()
  }

  const actualizar = async (id: number, dto: UpdateAlumnoDto): Promise<void> => {
    if (USE_MOCK) {
      const idx = MOCK_ALUMNOS.findIndex(a => a.id === id)
      if (idx !== -1) MOCK_ALUMNOS[idx] = { ...MOCK_ALUMNOS[idx], ...dto }
    } else {
      await alumnosService.update(id, dto)
    }
    await fetchAlumnos()
  }

  const eliminar = async (id: number): Promise<void> => {
    if (USE_MOCK) {
      const idx = MOCK_ALUMNOS.findIndex(a => a.id === id)
      if (idx !== -1) MOCK_ALUMNOS.splice(idx, 1)
    } else {
      await alumnosService.delete(id)
    }
    await fetchAlumnos()
  }

  const marcarPagado = async (id: number): Promise<void> => {
    await actualizar(id, { estado: 'pagado' })
  }

  return { alumnos, loading, error, crear, actualizar, eliminar, marcarPagado, refetch: fetchAlumnos }
}