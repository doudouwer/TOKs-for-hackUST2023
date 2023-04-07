import { Injectable } from '@nestjs/common';
import {Product} from "../entity/product.entity";
import {Event} from "../entity/event.entity"
import {RedeemEntity} from "../entity/redeem.entity";
import {Cid} from "../entity/cid.entity";
import {Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import {verifyTypedData} from "ethers/lib/utils";


@Injectable()
export class GoodService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        @InjectRepository(Event)
        private readonly eventRepository: Repository<Event>,
         @InjectRepository(RedeemEntity)
         private readonly redeemEntityRepository: Repository<RedeemEntity>,
        @InjectRepository(Cid)
        private readonly cidEntityRepository: Repository<Cid>
    ) {}

    async getAllGoods(address:string): Promise<any[]> {
        const eventList = await this.eventRepository.find({
            where : {
                isLatest: true,
                to: address.toLowerCase()
            }
        });
        console.log(eventList);
        let res:any[] = [];
        for(let i = 0 ; i<eventList.length ;i++){
            console.log(eventList[i].nftAddress.toLowerCase());
            let info:any = await this.productRepository.findOne({
                where: {
                    nftAddress: eventList[i].nftAddress.toLowerCase()
                }
            });
            console.log(info);
            // @ts-ignore
            info.tokenId = eventList[i].tokenId;
            let redeemStatus = await this.redeemEntityRepository.findOne({
                where: {
                    nftAddress: eventList[i].nftAddress.toLowerCase(),
                    tokenId: info.tokenId,
                }
            });
            let temp;
            if(redeemStatus)
            {
                info.redemptionStatus = redeemStatus.redemptionStatus;
                info.messageToSign = redeemStatus.messageToSign;
                temp = {
                    chainId: info.chainId,
                    created_at: info.created_at,
                    creatorAddress: info.creatorAddress,
                    description: info.description,
                    id:info.id,
                    image: info.image,
                    messageToSign:redeemStatus.messageToSign,
                    name: info.name,
                    nftAddress:info.nftAddress,
                    redemptionStatus:redeemStatus.redemptionStatus,
                    signButtonStatus:redeemStatus.signStatus,
                    tokenId:info.tokenId
                };
            }
            else
            {
                temp = {
                    chainId: info.chainId,
                    created_at: info.created_at,
                    creatorAddress: info.creatorAddress,
                    description: info.description,
                    id:info.id,
                    image: info.image,
                    name: info.name,
                    nftAddress:info.nftAddress,
                    redemptionStatus:0,
                    signButtonStatus:false,
                    tokenId:info.tokenId
                };
            }

            res = res.concat(temp);
        }
        return res;
    }

    async getRedeemList(address:string):Promise<RedeemEntity[]>{
        console.log(address);
        const res = await this.redeemEntityRepository.find({
            where:{
                creatorAddress:address.toLowerCase(),
                isActive:true,
            }
        });
        return res;
    }

    async setRedemptionStatus(ownerAddress:string, nftAddress:string, tokenId:number, status:number): Promise<RedeemEntity>{
        const product = await this.productRepository.findOne({
            where:{nftAddress: nftAddress.toLowerCase()}
        });
        if(status == 1)
        {
            const redeemInfo= {
                isActive: true,
                nftAddress:nftAddress.toLowerCase(),
                tokenId: tokenId,
                redemptionStatus:status,
                name: product.name,
                chainId: product.chainId,
                description: product.description,
                image: product.image,
                ownerAddress: ownerAddress.toLowerCase(),
                creatorAddress: product.creatorAddress.toLowerCase(),
                signStatus:false
            }
            return await this.redeemEntityRepository.save(redeemInfo);
        }
    }

    async getSignButtonStatus(nftAddress:string, tokenId:number):Promise<any>{
        const data = await this.redeemEntityRepository.findOne({
           where:{
               nftAddress: nftAddress.toLowerCase(),
               tokenId: tokenId,
               isActive: true
           }
        });
        let response;
        if(data) {
            response = {
                status: data.signStatus,
                messageToSign: data.messageToSign
            };
        }
        else{
            response = {
                status: false,
                messageToSign: null
            };
        }
        return response;
    }

    async generateMessageToSign(nftAddress:string, tokenId:number): Promise<RedeemEntity>{
        const state = await this.redeemEntityRepository.findOne({
            where:{
                nftAddress: nftAddress.toLowerCase(),
                tokenId: tokenId,
                isActive: true
            }
        });
        state.signStatus = true;
        const timeStamp = Date.now().toString();
        const randomNum = Math.floor(Math.random() * 1000001).toString();
        const id = state.tokenId;
        state.messageToSign = timeStamp+randomNum+id;
        return await this.redeemEntityRepository.save(state);
    }

    async verifySignature(nftAddress:string, tokenId:number, domain:any, types:any, signature:any, message:any, activeAccount:any) : Promise<boolean>{
        const res = verifyTypedData(domain, types, message, signature).toLowerCase() === activeAccount.toLowerCase();
        let info = await this.redeemEntityRepository.findOne({
            where : {
                isActive:true,
                nftAddress:nftAddress,
                tokenId: tokenId
            }
        });
        if(res)
        {
            info.redemptionStatus = 2;
            await this.redeemEntityRepository.save(info);
        }
        else{
            info.redemptionStatus = 0;
            info.isActive = false;
            await this.redeemEntityRepository.save(info);
        }
        return res;
    }

    async confirmReceipt(nftAddress:string, tokenId:number):Promise<void>{
        let info = await this.redeemEntityRepository.findOne({
            where : {
                isActive:true,
                nftAddress:nftAddress,
                tokenId: tokenId
            }
        });
        info.redemptionStatus = 3;
        info.isActive = false;
        await this.redeemEntityRepository.save(info);
        return;
    }

    async getCid(nftAddress:string, status:number):Promise<any>{
        let res = await this.cidEntityRepository.findOne({
            where:{
                nftAddress:nftAddress.toLowerCase(),
            }
        })
        if(status == 0)
        {return res.state0;}
        else if(status == 1)
        {return res.state1;}
        else if(status == 2)
        {return res.state2;}
        else if(status == 3)
        {
            return res.state3;
        }
        return null;
    }
}
