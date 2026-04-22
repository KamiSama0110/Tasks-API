import { Type } from 'class-transformer';
import { IsIn, IsOptional, IsNumberString, IsNumber } from 'class-validator';
import { TaskStatus } from 'src/tasks/entities/task.entity';

export class FilterDto {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  offset?: number;

  @IsOptional()
  @IsIn([TaskStatus.DONE, TaskStatus.IN_PROGRESS, TaskStatus.OPEN])
  status?: TaskStatus;
}
