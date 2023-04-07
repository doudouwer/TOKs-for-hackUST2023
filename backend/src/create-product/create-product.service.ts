import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Product} from "../entity/product.entity";
import {Cid} from "../entity/cid.entity"
//import {Monitor} from "../entity/monitor.entity";
import {NFTStorage} from "nft.storage";

@Injectable()
export class CreateProductService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        @InjectRepository(Cid)
        private readonly cidRepository: Repository<Cid>
    ) {}

    async createProduct(product: Product): Promise<Product> {
        product.creatorAddress.toLowerCase();
        return await this.productRepository.save(product);
    }

    async saveCid(cid:Cid):Promise<Cid>{
        return await this.cidRepository.save(cid);
    }
}
// 以太坊账户私钥
//const privateKey = "your-private-key";
//const wallet = new ethers.Wallet(privateKey, provider);