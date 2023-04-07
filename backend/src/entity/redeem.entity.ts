import {Entity, Column, ObjectIdColumn, CreateDateColumn} from 'typeorm';

@Entity()
export class RedeemEntity {
    @ObjectIdColumn()
    id: string;

    @CreateDateColumn()
    created_at:Date;

    @Column()
    isActive:boolean;

    @Column()
    name:string;

    @Column()
    chainId:number;

    @Column()
    nftAddress: string;

    @Column()
    tokenId:number;

    @Column()
    description:string;

    @Column()
    image:string;

    @Column()
    ownerAddress:string;

    @Column()
    creatorAddress:string;

    @Column()
    redemptionStatus:number;

    @Column()
    signStatus:boolean;

    @Column()
    messageToSign:string;
}