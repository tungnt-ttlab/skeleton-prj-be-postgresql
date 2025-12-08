import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

export class BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn({ type: 'timestamptz', nullable: true })
    createdAt?: Date;

    @UpdateDateColumn({ type: 'timestamptz', nullable: true })
    updatedAt?: Date;

    @DeleteDateColumn({ type: 'timestamptz', nullable: true })
    deletedAt?: Date;

    @Column({ type: 'int', nullable: true })
    createdBy?: number;

    @Column({ type: 'int', nullable: true })
    updatedBy?: number;

    @Column({ type: 'int', nullable: true })
    deletedBy?: number;
}
