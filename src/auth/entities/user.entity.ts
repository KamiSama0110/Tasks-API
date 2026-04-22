import { Task } from "src/tasks/entities/task.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ValidRoles } from "../interfaces/valid-roles.interface";

@Entity()
export class User {
    
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true,
    })
    email: string;

    @Column('text')
    fullName: string;

    @Column('text', {
        select: false,
    })
    password: string;

    @Column('text', {
        nullable: true,
        select: false,
    })
    currentHashedRefreshToken?: string | null;

    @Column('boolean', {
        default: true,
    })  
    isActive: boolean;

    @Column('simple-array', {
        default: ValidRoles.USER,
    })
    roles: ValidRoles[]

    @OneToMany(
        () => Task,
        (task) => task.user,
    )
    tasks: Task;

}
