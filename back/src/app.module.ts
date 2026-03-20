import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Alumno } from './alumnos/entities/alumno.entity'
import { Asistencia } from './asistencias/entities/asistencia.entity'
import { AlumnosModule } from './alumnos/alumnos.module'
import { AsistenciasModule } from './asistencias/asistencias.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USERNAME', ''),
        password: config.get('DB_PASSWORD', ''),
        database: config.get('DB_DATABASE', ''),
        entities: [Alumno, Asistencia], // <-- Asistencia registrada acá
        synchronize: true,              // crea la tabla automáticamente
      }),
    }),

    AlumnosModule,
    AsistenciasModule, // <-- módulo nuevo
  ],
})
export class AppModule {}