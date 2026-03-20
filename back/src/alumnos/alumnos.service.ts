import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Alumno } from './entities/alumno.entity'
import { CreateAlumnoDto } from './dto/create-alumno.dto'
import { UpdateAlumnoDto } from './dto/update-alumno.dto'

@Injectable()
export class AlumnosService {
  constructor(
    @InjectRepository(Alumno)
    private readonly repo: Repository<Alumno>,
  ) {}

  // Listar con filtros opcionales
  async findAll(filters: { estado?: string; dia?: string }): Promise<Alumno[]> {
    const query = this.repo.createQueryBuilder('alumno')

    if (filters.estado) {
      query.andWhere('alumno.estado = :estado', { estado: filters.estado })
    }
    if (filters.dia) {
      query.andWhere('alumno.dia = :dia', { dia: filters.dia })
    }

    query.orderBy('alumno.nombre', 'ASC')
    return query.getMany()
  }

  // Buscar por ID o lanzar 404
  async findOne(id: number): Promise<Alumno> {
    const alumno = await this.repo.findOneBy({ id })
    if (!alumno) {
      throw new NotFoundException(`Alumna con id ${id} no encontrada`)
    }
    return alumno
  }

  // Crear nueva alumna
  async create(dto: CreateAlumnoDto): Promise<Alumno> {
    const alumno = this.repo.create(dto)
    return this.repo.save(alumno)
  }

  // Actualizar parcialmente
  async update(id: number, dto: UpdateAlumnoDto): Promise<Alumno> {
    const alumno = await this.findOne(id) // lanza 404 si no existe
    Object.assign(alumno, dto)
    return this.repo.save(alumno)
  }

  // Shortcut para marcar pagado/pendiente
  async updateEstado(id: number, estado: 'pagado' | 'pendiente'): Promise<Alumno> {
    return this.update(id, { estado })
  }

  // Eliminar
  async remove(id: number): Promise<void> {
    const alumno = await this.findOne(id) // lanza 404 si no existe
    await this.repo.remove(alumno)
  }
}