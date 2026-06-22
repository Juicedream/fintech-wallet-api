import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const publicUrl = process.env.PUBLIC_URL;
  app.enableCors({
    origin: publicUrl,
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
