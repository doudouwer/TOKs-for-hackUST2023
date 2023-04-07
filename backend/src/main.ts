import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import * as cors from 'cors';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  // app.use(cors());
  // // 启用静态文件服务
  // app.use('/public', express.static(path.join(__dirname, '..', 'picture')));
  await app.listen(3000);
}
bootstrap();
