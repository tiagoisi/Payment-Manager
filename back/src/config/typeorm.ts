import { DataSource, DataSourceOptions } from 'typeorm'
import { config } from 'dotenv'
import { registerAs } from '@nestjs/config'

config({ path: '.env' })

const typeormConfig = {
  type: 'postgres' as const,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT as unknown as number,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  autoLoadEntities: true,
  synchronize: true,
  logging: false,
  dropSchema: false,
}

export const typeOrmConfig = registerAs('typeorm', () => typeormConfig)
export const connectionSource = new DataSource(typeormConfig as DataSourceOptions)