import { Module } from '@nestjs/common';
import { AsistenciasService } from './asistencias.service';
import { AsistenciasController } from './asistencias.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asistencia } from './entities/asistencia.entity';
import { Alumno } from 'src/alumnos/entities/alumno.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Asistencia, Alumno])], // alumno para resumen mes
  controllers: [AsistenciasController],
  providers: [AsistenciasService],
})
export class AsistenciasModule {}
