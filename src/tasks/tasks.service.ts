import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskStatus } from './entities/task.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterDto } from 'src/common/dtos/filter-dto';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class TasksService {

  constructor(
    @InjectRepository( Task)
    private readonly taskRepository: Repository<Task>,
  ) {}
  
  async create(createTaskDto: CreateTaskDto, user: User) {
    const { status = TaskStatus.OPEN, ...taskData } = createTaskDto;
    const newTask = this.taskRepository.create({
      ...taskData,
      status,
      user,
    });
    return await this.taskRepository.save(newTask);
  }

  async findAll(filter: FilterDto, user: User) {
   
    const { limit = 10, offset = 0, status } = filter;    
    const whereCondition: any = {
      user: { id: user.id },
    };
    
    if (status !== undefined) {

      whereCondition.status = status;
    }
    
    return await this.taskRepository.find({
      skip: +offset,
      take: +limit,
      where: whereCondition,
    });
  }

  async findOne(id: number, user: User) {
    const task = await this.taskRepository.findOne({
      where: {
        id,
        user: { id: user.id },
      },
    });
    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }
    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, user: User) {
    const task = await this.findOne(id, user);
    this.taskRepository.merge(task, updateTaskDto);
    return await this.taskRepository.save(task);
  }

  async remove(id: number, user: User) {
    const task = await this.findOne(id, user);
    await this.taskRepository.softDelete(task.id);
    return { message: `Task with id ${id} has been soft deleted` };
  }

  async restore(id: number, user: User) {
    const task = await this.taskRepository.findOne({
      where: {
        id,
        user: { id: user.id },
      },
      withDeleted: true,
    });

    if (!task || !task.deletedAt) {
      throw new NotFoundException(`Deleted task with id ${id} not found`);
    }

    await this.taskRepository.restore(task.id);
    return await this.findOne(id, user);
  }
}