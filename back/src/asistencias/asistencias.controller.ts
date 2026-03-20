import { Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common'
import { AsistenciasService } from './asistencias.service'
import { CreateAsistenciaDto } from './dto/create-asistencia.dto'
import { UpdateAsistenciaDto } from './dto/update-asistencia.dto'

@Controller('asistencias')
export class AsistenciasController {
  constructor(private readonly asistenciasService: AsistenciasService) {}

  // GET /asistencias?alumnoId=1&year=2025&month=3
  @Get()
  findByAlumnoMes(
    @Query('alumnoId', ParseIntPipe) alumnoId: number,
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ) {
    return this.asistenciasService.findByAlumnoMes(alumnoId, year, month)
  }

  // POST /asistencias/upsert  → crea o actualiza según alumnoId+fecha
  @Post('upsert')
  upsert(@Body() dto: CreateAsistenciaDto) {
    return this.asistenciasService.upsert(dto)
  }

  // PATCH /asistencias/:id
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAsistenciaDto,
  ) {
    return this.asistenciasService.update(id, dto)
  }

  // DELETE /asistencias/:id
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.asistenciasService.remove(id)
  }
}