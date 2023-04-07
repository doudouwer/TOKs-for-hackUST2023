import { Module } from '@nestjs/common';
import { CollectionController } from './collection.controller';
import { CollectionService } from './collection.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Product} from "../entity/product.entity";
import {Monitor} from "../entity/monitor.entity";
import {Event} from "../entity/event.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [CollectionController],
  providers: [CollectionService]
})
export class CollectionModule {}
