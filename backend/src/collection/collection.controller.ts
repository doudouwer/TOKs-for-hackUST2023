import { Controller, Get, Param} from '@nestjs/common';
import {CollectionService} from "./collection.service";
import {Product} from "../entity/product.entity"

@Controller('collection')
export class CollectionController {
    constructor(private collectionService: CollectionService) {}

    @Get('/:address')
    async getAllProducts(@Param('address') address: string): Promise<Product[]> {
        return await this.collectionService.getAllProducts(address);
    }
}
