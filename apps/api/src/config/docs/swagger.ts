import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const configSwagger = (app: NestExpressApplication) => {
  const config = new DocumentBuilder()
    .setTitle('Fincheck API')
    .setDescription(
      'O Fincheck é um aplicativo fullstack desenvolvido para ajudar usuários a monitorar suas finanças pessoais de forma fácil e eficiente.\nO objetivo do projeto é fornecer ferramentas que permitam o controle total sobre contas bancárias, investimentos, despesas, receitas e planejamento financeiro.\n\nEste projeto foi desenvolvido como parte do curso JStack e teve como foco a prática de desenvolvimento fullstack moderno, explorando desde o backend com NestJS até o frontend com React.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addGlobalResponse({
      status: 500,
      description: 'Internal server error',
    })
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('openapi', app, documentFactory, {
    jsonDocumentUrl: 'openapi/json',
    customSiteTitle: 'Fincheck Swagger',
    explorer: true,
  });
};
