import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('alumnos')
export class Alumno {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    nombre: string

    @Column()
    dia: string // 'Lunes' | 'Martes' ...

    @Column({ default: 'mensual' })
    tipo: string // 'mensual' | 'clase'

    @Column({ default: 'efectivo' })
    metodo: string

    @Column({ default: 'pendiente' })
    estado: string // 'pago' | 'pendiente'

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    monto: number

    @Column({ type: 'varchar', length: 7,  nullable: true, default: null })
    ultimoPagoMes: string | null // 'YYYY-MM', ej: '2026-03'

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}
