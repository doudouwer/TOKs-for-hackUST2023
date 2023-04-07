import { Module } from '@nestjs/common';
import { GoodController } from './good.controller';
import { GoodService } from './good.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Product} from "../entity/product.entity";
import {Event} from "../entity/event.entity"
import {RedeemEntity} from "../entity/redeem.entity";
import {Cid} from "../entity/cid.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Product, Event, RedeemEntity, Cid])],
  controllers: [GoodController],
  providers: [GoodService]
})
export class GoodModule {}
