import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Asistencia } from './entities/asistencia.entity'
import { CreateAsistenciaDto } from './dto/create-asistencia.dto'
import { UpdateAsistenciaDto } from './dto/update-asistencia.dto'
import { Alumno } from 'src/alumnos/entities/alumno.entity'

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function getRango(year: number, month: number) {
  const desde = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate() // month ya es 1-12, funciona igual
  const hasta = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  return { desde, hasta }
}

@Injectable()
export class AsistenciasService {
  constructor(
    @InjectRepository(Asistencia)
    private readonly repo: Repository<Asistencia>,
    @InjectRepository(Alumno)
    private readonly alumnoRepo: Repository<Alumno>,
  ) {}

  async findByAlumnoMes(alumnoId: number, year: number, month: number): Promise<Asistencia[]> {
    const { desde, hasta } = getRango(year, month)
    return this.repo
      .createQueryBuilder('a')
      .where('a.alumnoId = :alumnoId', { alumnoId })
      .andWhere('a.fecha >= :desde', { desde })
      .andWhere('a.fecha <= :hasta', { hasta })
      .orderBy('a.fecha', 'ASC')
      .getMany()
  }

  async findOne(id: number): Promise<Asistencia> {
    const a = await this.repo.findOneBy({ id })
    if (!a) throw new NotFoundException(`Asistencia ${id} no encontrada`)
    return a
  }

  async upsert(dto: CreateAsistenciaDto): Promise<Asistencia> {
    const existing = await this.repo
      .createQueryBuilder('a')
      .where('a.alumnoId = :alumnoId', { alumnoId: dto.alumnoId })
      .andWhere('a.fecha = :fecha', { fecha: dto.fecha })
      .getOne()

    if (existing) {
      existing.vino = dto.vino
      existing.pagoDia = dto.pagoDia ?? false
      existing.monto = dto.monto ?? 0
      return this.repo.save(existing)
    }

    const nueva = this.repo.create({
      alumnoId: dto.alumnoId,
      fecha: dto.fecha,
      vino: dto.vino,
      pagoDia: dto.pagoDia ?? false,
      monto: dto.monto ?? 0,
    })
    return this.repo.save(nueva)
  }

  async update(id: number, dto: UpdateAsistenciaDto): Promise<Asistencia> {
    const a = await this.findOne(id)
    Object.assign(a, dto)
    return this.repo.save(a)
  }

  async remove(id: number): Promise<void> {
    const a = await this.findOne(id)
    await this.repo.remove(a)
  }

  async resumenMes(year: number, month: number) {
    const { desde, hasta } = getRango(year, month)
    const alumnos = await this.alumnoRepo.find()

    const mesConsultado = `${year}-${String(month).padStart(2, '0')}`

    const mensuales = alumnos.filter(a => a.tipo === 'mensual')
    const recaudadoMensual = mensuales
      .filter(a => a.ultimoPagoMes === mesConsultado)
      .reduce((s, a) => s + Number(a.monto), 0)
    const porCobrarMensual = mensuales
      .filter(a => a.ultimoPagoMes === mesConsultado)
      .reduce((s, a) => s + Number(a.monto), 0)

    const asistPagadas = await this.repo
      .createQueryBuilder('a')
      .where('a.pagoDia = true')
      .andWhere('a.fecha >= :desde', { desde })
      .andWhere('a.fecha <= :hasta', { hasta })
      .getMany()
    const recaudadoClases = asistPagadas.reduce((s, a) => s + Number(a.monto), 0)

    const porClaseIds = alumnos.filter(a => a.tipo === 'clase').map(a => a.id)
    const asistSinPagar = await this.repo
      .createQueryBuilder('a')
      .where('a.vino = true')
      .andWhere('a.pagoDia = false')
      .andWhere('a.fecha >= :desde', { desde })
      .andWhere('a.fecha <= :hasta', { hasta })
      .getMany()

    const porCobrarClases = asistSinPagar
      .filter(a => porClaseIds.includes(a.alumnoId))
      .reduce((s, a) => {
        const alumna = alumnos.find(al => al.id === a.alumnoId)
        return s + Number(alumna?.monto ?? 0)
      }, 0)

    return {
      recaudadoMensual,
      recaudadoClases,
      totalRecaudado: recaudadoMensual + recaudadoClases,
      porCobrarMensual,
      porCobrarClases,
      totalPorCobrar: porCobrarMensual + porCobrarClases,
    }
  }
}