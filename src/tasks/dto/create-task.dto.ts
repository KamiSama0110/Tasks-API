import { IsIn, IsString, IsOptional } from "class-validator";
import { TaskStatus } from "../entities/task.entity";

export class CreateTaskDto {

    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsOptional()
    @IsIn([TaskStatus.DONE, TaskStatus.IN_PROGRESS, TaskStatus.OPEN])
    status?: TaskStatus;
}