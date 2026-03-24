import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm'
import { Alumno } from 'src/alumnos/entities/alumno.entity'

@Entity('asistencias')
@Unique(['alumnoId', 'fecha'])
export class Asistencia {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  alumnoId: number

  @ManyToOne(() => Alumno, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'alumnoId' })
  alumno: Alumno

  // varchar en vez de date — evita que Postgres devuelva objetos Date
  @Column({ type: 'varchar', length: 10 })
  fecha: string // siempre 'YYYY-MM-DD'

  @Column({ default: false })
  vino: boolean

  @Column({ default: false })
  pagoDia: boolean

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  monto: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}