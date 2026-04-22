import { User } from "src/auth/entities/user.entity";
import {
    Column,
    DeleteDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";

export enum TaskStatus {
    OPEN = 'OPEN',
    IN_PROGRESS = 'IN_PROGRESS',
    DONE = 'DONE'
}

@Entity()
export class Task {

    @PrimaryGeneratedColumn('increment')
    id: number;
    
    @Column('text')
    title: string;

    @Column('text')
    description: string;

    @Column('text', {
        default: TaskStatus.OPEN
    })
    status: TaskStatus;

    @ManyToOne(
        () => User,
        (user) => user.tasks,
    )
    user: User;

    @DeleteDateColumn({ nullable: true })
    deletedAt?: Date | null;
}