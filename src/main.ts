import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExecutionFilter } from './filters/http-execution.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const publicUrl = process.env.PUBLIC_URL;
  const PORT = process.env.PORT ?? 3000;

  const config = new DocumentBuilder()
    .setTitle('Fintech Wallet Api')
    .setDescription('For a fintech wallet api guides')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer(`http://localhost:${PORT}`)
    .addGlobalResponse({
      status: 500,
      description: 'Internal server error',
    })
    .build();

  app.useGlobalFilters(new HttpExecutionFilter());

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: publicUrl,
    credentials: true,
  });

  const documentFactory = () =>
    SwaggerModule.createDocument(app as any, config);
  SwaggerModule.setup('/api/docs', app as any, documentFactory);

  await app.listen(PORT);
  console.log(`Application started on http://localhost:${PORT}`);
  console.log(`Swagger docs started on http://localhost:${PORT}/api/docs`);
}
bootstrap();
