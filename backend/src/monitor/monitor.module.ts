import { Module } from '@nestjs/common';
import { MonitorService } from './monitor.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Product} from "../entity/product.entity";
import {Monitor} from "../entity/monitor.entity";
import {Event} from "../entity/event.entity" ;

@Module({
  imports: [TypeOrmModule.forFeature([Product, Monitor, Event])],
  providers: [MonitorService]
})
export class MonitorModule {}
