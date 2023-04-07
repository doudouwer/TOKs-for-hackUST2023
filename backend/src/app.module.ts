import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CreateProductModule } from './create-product/create-product.module';
import {join} from "path";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Product} from "./entity/product.entity";
import {ServeStaticModule} from "@nestjs/serve-static";
import {Monitor} from "./entity/monitor.entity";
import { MonitorModule } from './monitor/monitor.module';
import {Event} from './entity/event.entity';
import { CollectionModule } from './collection/collection.module';
import { GoodModule } from './good/good.module';
import {RedeemEntity} from "./entity/redeem.entity";
import {Cid} from "./entity/cid.entity";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mongodb',
      host: 'localhost',
      port: 27017,
      database: 'HackDatabase',
      entities: [Product, Monitor,Event, RedeemEntity, Cid],
      synchronize: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'picture', 'product'),
      serveRoot: '/picture/product',
    }),
    CreateProductModule,
    MonitorModule,
    CollectionModule,
    GoodModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
