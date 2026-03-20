import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Between } from 'typeorm'
import { Asistencia } from './entities/asistencia.entity'
import { CreateAsistenciaDto } from './dto/create-asistencia.dto'
import { UpdateAsistenciaDto } from './dto/update-asistencia.dto'

@Injectable()
export class AsistenciasService {
  constructor(
    @InjectRepository(Asistencia)
    private readonly repo: Repository<Asistencia>,
  ) {}

  // Listar asistencias de una alumna filtradas por mes/año
  async findByAlumnoMes(alumnoId: number, year: number, month: number): Promise<Asistencia[]> {
    // Calcular primer y último día del mes
    const desde = `${year}-${String(month).padStart(2, '0')}-01`
    const lastDay = new Date(year, month, 0).getDate() // día 0 del mes siguiente = último del actual
    const hasta = `${year}-${String(month).padStart(2, '0')}-${lastDay}`

    return this.repo.find({
      where: {
        alumnoId,
        fecha: Between(desde, hasta),
      },
      order: { fecha: 'ASC' },
    })
  }

  // Buscar una asistencia por ID
  async findOne(id: number): Promise<Asistencia> {
    const a = await this.repo.findOneBy({ id })
    if (!a) throw new NotFoundException(`Asistencia ${id} no encontrada`)
    return a
  }

  // Upsert: crea o actualiza según alumnoId + fecha
  // Es el método principal que usa el frontend al tocar los toggles
  async upsert(dto: CreateAsistenciaDto): Promise<Asistencia> {
    const existing = await this.repo.findOneBy({
      alumnoId: dto.alumnoId,
      fecha: dto.fecha,
    })

    if (existing) {
      Object.assign(existing, {
        vino: dto.vino,
        pagoDia: dto.pagoDia ?? false,
        monto: dto.monto ?? 0,
      })
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

  // Actualizar parcialmente
  async update(id: number, dto: UpdateAsistenciaDto): Promise<Asistencia> {
    const a = await this.findOne(id)
    Object.assign(a, dto)
    return this.repo.save(a)
  }

  // Eliminar
  async remove(id: number): Promise<void> {
    const a = await this.findOne(id)
    await this.repo.remove(a)
  }
}