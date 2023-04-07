import { Module } from '@nestjs/common';
import { CreateProductController } from './create-product.controller';
import { CreateProductService } from './create-product.service';
import {MonitorService} from "../monitor/monitor.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Product} from "../entity/product.entity";
import {Monitor} from "../entity/monitor.entity";
import {Event} from "../entity/event.entity";
import {Cid} from "../entity/cid.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Product,Monitor,Event, Cid])],
  controllers: [CreateProductController],
  providers: [CreateProductService, MonitorService]
})
export class CreateProductModule {}
