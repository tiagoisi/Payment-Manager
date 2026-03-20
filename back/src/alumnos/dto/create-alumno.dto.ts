import { IsString, IsNotEmpty, IsNumber, IsIn, Min } from 'class-validator'
import { Type } from 'class-transformer'

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const TIPOS = ['mensual', 'clase']
const METODOS = ['efectivo', 'transferencia']
const ESTADOS = ['pagado', 'pendiente']

export class CreateAlumnoDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string

  @IsString()
  @IsIn(DIAS, { message: 'Día inválido' })
  dia: string

  @IsString()
  @IsIn(TIPOS, { message: 'Tipo de pago inválido' })
  tipo: string

  @IsString()
  @IsIn(METODOS, { message: 'Método de pago inválido' })
  metodo: string

  @IsString()
  @IsIn(ESTADOS, { message: 'Estado inválido' })
  estado: string

  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'El monto no puede ser negativo' })
  monto: number
}