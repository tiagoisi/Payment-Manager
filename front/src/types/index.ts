export type EstadoPago = 'pagado' | 'pendiente'
export type TipoPago = 'mensual' | 'clase'
export type MetodoPago = 'efectivo' | 'transferencia'
export type DiaSemana = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado'

export interface Alumno {
  id: number
  nombre: string
  dia: DiaSemana
  tipo: TipoPago
  metodo: MetodoPago
  estado: EstadoPago
  monto: number
  ultimoPagoMes?: string | null
  createdAt?: string
}

export interface CreateAlumnoDto {
  nombre: string
  dia: DiaSemana
  tipo: TipoPago
  metodo: MetodoPago
  estado: EstadoPago
  monto: number
}

export type UpdateAlumnoDto = Partial<CreateAlumnoDto>

export interface AlumnoFilters {
  search?: string
  estado?: EstadoPago | ''
  dia?: DiaSemana | ''
}

export interface DashboardStats {
  total: number
  pagados: number
  pendientes: number
  recaudado: number
  porCobrar: number
  porcentajePago: number
}

// ── Asistencias ──────────────────────────────────────────

export interface Asistencia {
  id: number
  alumnoId: number
  fecha: string       // 'YYYY-MM-DD'
  vino: boolean
  pagoDia: boolean    // solo relevante para tipo='clase'
  monto: number       // monto cobrado ese día (tipo='clase')
}

export interface CreateAsistenciaDto {
  alumnoId: number
  fecha: string
  vino: boolean
  pagoDia?: boolean
  monto?: number
}

export type UpdateAsistenciaDto = Partial<CreateAsistenciaDto>

export interface ResumenMensual {
  sabados: number
  vino: number
  falto: number
  pago?: number          // solo para tipo='clase'
  totalCobrado?: number  // solo para tipo='clase'
}