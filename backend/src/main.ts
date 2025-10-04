import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Fincheck API')
    .setDescription(
      'O Fincheck é um aplicativo fullstack desenvolvido para ajudar usuários a monitorar suas finanças pessoais de forma fácil e eficiente.\nO objetivo do projeto é fornecer ferramentas que permitam o controle total sobre contas bancárias, investimentos, despesas, receitas e planejamento financeiro.\n\nEste projeto foi desenvolvido como parte do curso JStack e teve como foco a prática de desenvolvimento fullstack moderno, explorando desde o backend com NestJS até o frontend com React.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documentFactory = () =>
    SwaggerModule.createDocument(app, config, { autoTagControllers: false });
  SwaggerModule.setup('openapi', app, documentFactory, {
    jsonDocumentUrl: 'openapi/json',
    customSiteTitle: 'Fincheck Swagger',
  });
  app.enableCors();
  app.setGlobalPrefix('/api/v1');
  await app.listen(process.env.PORT ?? 3333);
}
bootstrap();
