import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Monitor} from "../entity/monitor.entity";
import {Event} from '../entity/event.entity';
import {Repository} from "typeorm";
import {ethers} from "ethers";
import * as fs from "fs";

@Injectable()
export class MonitorService {
    constructor(
        @InjectRepository(Monitor)
        private readonly monitorRepository: Repository<Monitor>,
        @InjectRepository(Event)
        private readonly eventRepository: Repository<Event>,
    ) {
        //this.startListening();
    }

    async startListening() {
        const contracts = await this.monitorRepository.find();
        for (const contract of contracts) {
            // 根据你的智能合约 ABI 和地址初始化一个 ethers.js Contract 实例
            const jsonData = fs.readFileSync("./src/contracts/HackProperty.json");
            const contractData = JSON.parse(jsonData.toString());
            const contractInstance = new ethers.Contract(
                contract.nftAddress.toLowerCase(),
                contractData.abi,
                ethers.getDefaultProvider('http://localhost:8545'),
            );
            // 监听事件并保存交易信息到数据库
            contractInstance.on('Transfer', async (from, to, value) => {
                const transferFrom = from;
                const transferTo = to;
                const nftAddress = contract.nftAddress.toLowerCase();
                const chainId = contract.chainId;
                console.log(from);
                console.log(to);
                const tokenId = value.toNumber();

                //先把其他相同nftAddress和tokenId的数据改为非最新
                const eventsToUpdate = await this.eventRepository.find({
                    where: {
                        nftAddress: nftAddress.toLowerCase(),
                        tokenId: tokenId,
                    },
                });
                for (const event of eventsToUpdate) {
                    event.isLatest = false;
                }
                if(eventsToUpdate)
                {
                    await this.eventRepository.save(eventsToUpdate);
                }

                //再存储最新的交易
                const eventData = new Event();
                eventData.chainId = chainId;
                eventData.nftAddress = nftAddress.toLowerCase();
                eventData.tokenId = tokenId;
                eventData.isLatest = true;
                eventData.to = transferTo.toLowerCase();
                eventData.from = transferFrom.toLowerCase();
                // 将交易信息保存到数据库中
                await this.eventRepository.save(eventData);
            });
        }
    }

    async addMonitor(contract: any): Promise<void> {
        await this.monitorRepository.save(contract);
        //this.startListening();
        // 根据你的智能合约 ABI 和地址初始化一个 ethers.js Contract 实例
        const jsonData = fs.readFileSync("./src/contracts/HackProperty.json");
        const contractData = JSON.parse(jsonData.toString());
        const contractInstance = new ethers.Contract(
            contract.nftAddress.toLowerCase(),
            contractData.abi,
            ethers.getDefaultProvider('https://rpc-mumbai.maticvigil.com'),
        );
        // 监听事件并保存交易信息到数据库
        contractInstance.on('Transfer', async (from, to, value) => {
            const transferFrom = from.toLowerCase();
            const transferTo = to.toLowerCase();
            const nftAddress = contract.nftAddress.toLowerCase();
            const chainId = contract.chainId;
            const tokenId = value.toNumber();
            console.log(tokenId);
            //先把其他相同nftAddress和tokenId的数据改为非最新
            const eventsToUpdate = await this.eventRepository.find({
                where: {
                    nftAddress: nftAddress.toLowerCase(),
                    tokenId: tokenId,
                },
            });
            for (const event of eventsToUpdate) {
                event.isLatest = false;
            }
            await this.eventRepository.save(eventsToUpdate);

            //再存储最新的交易
            const eventData = new Event();
            eventData.chainId = chainId;
            eventData.nftAddress = nftAddress.toLowerCase();
            eventData.tokenId = tokenId;
            eventData.isLatest = true;
            eventData.to = transferTo.toLowerCase();
            eventData.from = transferFrom.toLowerCase();
            // 将交易信息保存到数据库中
            await this.eventRepository.save(eventData);
        });
    }
}
