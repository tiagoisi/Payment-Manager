import { Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common'
import { AlumnosService } from './alumnos.service'
import { CreateAlumnoDto } from './dto/create-alumno.dto'
import { UpdateAlumnoDto } from './dto/update-alumno.dto'

@Controller('alumnos')
export class AlumnosController {
  constructor(private readonly alumnosService: AlumnosService) {}

  // GET /alumnos?estado=pagado&dia=Sábado
  @Get()
  findAll(
    @Query('estado') estado?: string,
    @Query('dia') dia?: string,
  ) {
    return this.alumnosService.findAll({ estado, dia })
  }

  // GET /alumnos/:id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.alumnosService.findOne(id)
  }

  // POST /alumnos
  @Post()
  create(@Body() dto: CreateAlumnoDto) {
    return this.alumnosService.create(dto)
  }

  // PATCH /alumnos/:id
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAlumnoDto,
  ) {
    return this.alumnosService.update(id, dto)
  }

  // PATCH /alumnos/:id/pago  → shortcut para cambiar estado
  @Patch(':id/pago')
  updatePago(
    @Param('id', ParseIntPipe) id: number,
    @Body('estado') estado: 'pagado' | 'pendiente',
  ) {
    return this.alumnosService.updateEstado(id, estado)
  }

  // DELETE /alumnos/:id
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // devuelve 204 sin body
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.alumnosService.remove(id)
  }
}