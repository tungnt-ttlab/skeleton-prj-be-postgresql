import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './000.base.entity';
import { TableName } from '../constants';

@Entity(TableName.IAM_USERS)
export class IamUser extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    email?: string;
}
