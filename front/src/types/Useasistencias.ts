import { useState, useEffect, useCallback } from 'react'
import { asistenciasService } from '../services/alumnos.service'
import type { Alumno, Asistencia, CreateAsistenciaDto, ResumenMensual } from '.'

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getSabadosDelMes(year: number, month: number): string[] {
  const sabados: string[] = []
  const d = new Date(year, month, 1)
  while (d.getMonth() === month) {
    if (d.getDay() === 6) {
      sabados.push(d.toISOString().split('T')[0])
    }
    d.setDate(d.getDate() + 1)
  }
  return sabados
}

// ── Mock data (igual que useAlumnos, se desactiva con USE_MOCK=false) ─────────

const USE_MOCK = true
const MOCK_STORE: Record<string, Asistencia> = {}
let mockNextId = 1

function mockKey(alumnoId: number, fecha: string) {
  return `${alumnoId}_${fecha}`
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useAsistencias(alumno: Alumno | null, year: number, month: number) {
  const [asistencias, setAsistencias] = useState<Asistencia[]>([])
  const [loading, setLoading] = useState(false)

  const sabados = getSabadosDelMes(year, month)

  const fetch = useCallback(async () => {
    if (!alumno) return
    setLoading(true)
    try {
      if (USE_MOCK) {
        const result = sabados
          .map(f => MOCK_STORE[mockKey(alumno.id, f)])
          .filter(Boolean) as Asistencia[]
        setAsistencias(result)
      } else {
        const data = await asistenciasService.getByAlumnoMes(alumno.id, year, month)
        setAsistencias(data)
      }
    } finally {
      setLoading(false)
    }
  }, [alumno?.id, year, month])

  useEffect(() => { fetch() }, [fetch])

  // Devuelve la asistencia de una fecha o null si no fue registrada
  const getAsistencia = (fecha: string): Asistencia | null => {
    return asistencias.find(a => a.fecha === fecha) ?? null
  }

  // Registrar o actualizar asistencia de un sábado
  const registrar = async (dto: CreateAsistenciaDto) => {
    if (USE_MOCK) {
      const key = mockKey(dto.alumnoId, dto.fecha)
      const existing = MOCK_STORE[key]
      if (existing) {
        MOCK_STORE[key] = { ...existing, ...dto }
      } else {
        MOCK_STORE[key] = {
          id: mockNextId++,
          alumnoId: dto.alumnoId,
          fecha: dto.fecha,
          vino: dto.vino,
          pagoDia: dto.pagoDia ?? false,
          monto: dto.monto ?? 0,
        }
      }
    } else {
      await asistenciasService.upsert(dto)
    }
    await fetch()
  }

  // Resumen del mes para mostrar en el header
  const resumen: ResumenMensual = {
    sabados: sabados.length,
    vino: sabados.filter(f => getAsistencia(f)?.vino).length,
    falto: sabados.filter(f => {
      const a = getAsistencia(f)
      return a && !a.vino
    }).length,
    ...(alumno?.tipo === 'clase' && {
      pago: sabados.filter(f => getAsistencia(f)?.pagoDia).length,
      totalCobrado: sabados
        .filter(f => getAsistencia(f)?.pagoDia)
        .reduce((sum, f) => sum + (getAsistencia(f)?.monto ?? 0), 0),
    }),
  }

  return { asistencias, loading, sabados, getAsistencia, registrar, resumen }
}