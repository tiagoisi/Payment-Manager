import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { typeOrmConfig } from './config/typeorm'
import { AlumnosModule } from './alumnos/alumnos.module'
import { AsistenciasModule } from './asistencias/asistencias.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeOrmConfig],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('typeorm')!,
    }),

    AlumnosModule,
    AsistenciasModule,
  ],
})
export class AppModule {}