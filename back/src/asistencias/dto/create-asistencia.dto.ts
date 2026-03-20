import { IsInt, IsString, IsBoolean, IsNumber, IsOptional, Min, Matches } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateAsistenciaDto {
  @IsInt()
  @Type(() => Number)
  alumnoId: number

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'La fecha debe tener formato YYYY-MM-DD' })
  fecha: string

  @IsBoolean()
  vino: boolean

  @IsOptional()
  @IsBoolean()
  pagoDia?: boolean

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  monto?: number
}