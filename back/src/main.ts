import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilito CORS para que el front pueda llamar al back
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  })

  // Activo validaciones de los dtos
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true
    })
  )

  const port = process.env.PORT ?? 3000
  await app.listen(port);
  console.log(`🎨 Artesanias API corriendo en http://localhost:${port}`)
}
bootstrap();
