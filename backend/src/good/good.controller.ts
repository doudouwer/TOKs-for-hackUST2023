import {Controller, Get, Param, Post, Body} from '@nestjs/common';
import {GoodService} from "./good.service";
import { Product } from "../entity/product.entity"
import {RedeemEntity} from "../entity/redeem.entity";


@Controller('good')
export class GoodController {
    constructor(private goodService:GoodService) {}

    @Get("/:address")
    async getAllGoods(@Param('address') address: string): Promise<Product[]> {
        return await this.goodService.getAllGoods(address);
    }

    @Get("/redeemList/:address")
    async getRedeemList(@Param('address') address:string):Promise<RedeemEntity[]>{
        return await this.goodService.getRedeemList(address);
    }

    @Post("/redeemList/generateMessageToSign")
    async generateMessageToSign(@Body() body:{nftAddress: string, tokenId: number}){
        const {nftAddress, tokenId} = body;
        return await this.goodService.generateMessageToSign(nftAddress, tokenId);
    }

    @Post("/setRedemptionStatus")
    async setRedemptionStatus(@Body() body: { ownerAddress:string, nftAddress: string, tokenId: number, status: number }) {
        const { ownerAddress, nftAddress, tokenId, status} = body;
        return await this.goodService.setRedemptionStatus(ownerAddress, nftAddress, tokenId, status);
    }

    @Post("/signButtonStatus")
    async getSignButtonStatus(@Body() body: {nftAddress: string, tokenId: number}){
        const {nftAddress, tokenId} = body;
        const res = await this.goodService.getSignButtonStatus(nftAddress, tokenId);
        return res;
    }

    @Post("/verifySignature")
    async verifySignature(@Body() body: {nftAddress, tokenId, domain, types, signature, message, activeAccount}){
        const {nftAddress, tokenId, domain, types, signature, message, activeAccount} = body;
        return await this.goodService.verifySignature(nftAddress, tokenId, domain, types, signature, message, activeAccount);
    }

    @Post("/confirmReceipt")
    async confirmReceipt(@Body()body:{nftAddress, tokenId}){
        const{nftAddress, tokenId} = body;
        return await this.goodService.confirmReceipt(nftAddress, tokenId);
    }

    @Post("/getCid")
    async getCid(@Body()body:{nftAddress, status}){
        const{nftAddress, status} = body;
        return await this.goodService.getCid(nftAddress, status);
    }
}
