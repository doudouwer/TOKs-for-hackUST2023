import {Controller, Post, Body, UploadedFile, UseInterceptors} from '@nestjs/common';
import {Product} from "../entity/product.entity";
import {CreateProductService} from "./create-product.service";
import {MonitorService} from "../monitor/monitor.service";
import {Cid} from "../entity/cid.entity";
import * as fs from "fs";
import {FileInterceptor} from "@nestjs/platform-express";

@Controller('create-product')
export class CreateProductController {
    constructor(private createProductService: CreateProductService, private monitorService:MonitorService) {}

    @Post('/')
    async createProduct(@Body() product: Product): Promise<Product> {
        product.nftAddress = product.nftAddress.toLowerCase();
        product.creatorAddress = product.creatorAddress.toLowerCase();
        const res = await this.createProductService.createProduct(product);
        const contract = {
            chainId:res.chainId,
            nftAddress:res.nftAddress.toLowerCase()
        }
        await this.monitorService.addMonitor(contract);
        return res;
    }

    @Post('/saveCid')
    async saveCid(@Body() cid: Cid): Promise<Cid> {
        return await this.createProductService.saveCid(cid);
    }

    @Post('pic')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file) {
        console.log(file);
        const filePath = "./picture/product/"+ Date.now() + "."+file.originalname.split('.').pop();
        fs.writeFileSync(filePath, file.buffer);
        // 文件保存成功，返回响应
        return { url: filePath};
    }

}
