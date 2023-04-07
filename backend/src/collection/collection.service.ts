import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Product} from "../entity/product.entity";
import {Repository} from "typeorm";

@Injectable()
export class CollectionService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
    ) {}

    async getAllProducts(address:string): Promise<Product[]> {
        console.log(address);
        return await this.productRepository.find({
            where: {
                creatorAddress: address.toLowerCase()
            },
        });
    }
}
