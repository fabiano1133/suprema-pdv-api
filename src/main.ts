import 'dotenv/config';
import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { VersioningType, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './presentation/http/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Filtro global: captura todas as exceções do sistema
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  // Validação de entrada: rejeita payloads inválidos (segurança e consistência)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove propriedades não declaradas no DTO
      forbidNonWhitelisted: true, // retorna 400 se enviar campo extra
      transform: true, // converte query/body para tipo do DTO (ex: string -> number)
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Headers de segurança (Helmet)
  app.use(helmet());

  // CORS: origens vindas do config (em produção defina CORS_ORIGINS no .env)
  app.enableCors({
    origin: config.get<boolean | string[]>('corsOrigins') ?? true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  app.setGlobalPrefix(config.get<string>('globalPrefix') ?? 'api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const port = config.get<number>('port') ?? 3000;
  await app.listen(port);
}
bootstrap();
