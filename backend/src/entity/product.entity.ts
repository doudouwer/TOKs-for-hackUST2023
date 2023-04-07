import {Entity, Column, ObjectIdColumn, CreateDateColumn} from 'typeorm';

@Entity()
export class Product{
    @ObjectIdColumn()
    id: string;

    @Column()
    name:string;

    @Column()
    chainId:number;

    @Column()
    nftAddress: string;

    @Column()
    description:string;

    @Column()
    image:string;

    @Column()
    creatorAddress:string;

    @CreateDateColumn()
    created_at:Date;
}