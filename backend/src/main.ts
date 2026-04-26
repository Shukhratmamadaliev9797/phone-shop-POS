import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const normalizeOrigin = (value: string) =>
    value.trim().toLowerCase().replace(/\/+$/, '');

  const frontendOrigins = [
    ...(process.env.FRONTEND_URLS
      ? process.env.FRONTEND_URLS.split(',').map((origin) =>
          normalizeOrigin(origin),
        )
      : []),
    ...(process.env.FRONTEND_URL
      ? [normalizeOrigin(process.env.FRONTEND_URL)]
      : []),
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ]
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const normalizedOrigin = normalizeOrigin(origin);
      const isConfiguredOrigin = frontendOrigins.some(
        (allowedOrigin) => allowedOrigin.toLowerCase() === normalizedOrigin,
      );
      const isVercelPreview = normalizedOrigin.endsWith('.vercel.app');

      if (isConfiguredOrigin || isVercelPreview) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('POS Backend API')
    .setDescription('Authentication and authorization APIs for POS')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
