import {Entity, Column, ObjectIdColumn} from 'typeorm';

@Entity()
export class Monitor{
    @ObjectIdColumn()
    id: string;

    @Column()
    chainId:number;

    @Column()
    nftAddress:string;
}