import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm'
import { Alumno } from 'src/alumnos/entities/alumno.entity'

@Entity('asistencias')
@Unique(['alumnoId', 'fecha']) // un registro por alumna por sábado
export class Asistencia {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  alumnoId: number

  @ManyToOne(() => Alumno, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'alumnoId' })
  alumno: Alumno

  @Column({ type: 'date' })
  fecha: string // 'YYYY-MM-DD'

  @Column({ default: false })
  vino: boolean

  // Solo relevante para tipo='clase'
  @Column({ default: false })
  pagoDia: boolean

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  monto: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}