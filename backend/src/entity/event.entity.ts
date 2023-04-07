import {Entity, Column, ObjectIdColumn} from 'typeorm';

@Entity()
export class Event{
    @ObjectIdColumn()
    id: string;

    @Column()
    chainId:number;

    @Column()
    nftAddress:string;

    @Column()
    tokenId:number;

    @Column()
    isLatest:boolean;

    @Column()
    from:string;

    @Column()
    to:string;
}