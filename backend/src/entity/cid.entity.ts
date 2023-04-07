import {Entity, Column, ObjectIdColumn} from 'typeorm';

@Entity()
export class Cid{
    @ObjectIdColumn()
    id: string;

    @Column()
    nftAddress:string;

    @Column()
    state0:string;

    @Column()
    state1:string;

    @Column()
    state2:string;

    @Column()
    state3:string;
}