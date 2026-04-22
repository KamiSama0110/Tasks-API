import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { FilterDto } from 'src/common/dtos/filter-dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Auth()
  async create(@Body() createTaskDto: CreateTaskDto, @GetUser() user: User) {
    return await this.tasksService.create(createTaskDto, user);
  }

  @Get()
  @Auth()
  async findAll(@Query() filter: FilterDto, @GetUser() user: User) {
    return await this.tasksService.findAll(filter, user);
  }

  @Get(':id')
  @Auth()
  async findOne(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return await this.tasksService.findOne(id, user);
  }

  @Patch(':id')
  @Auth()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @GetUser() user: User,
  ) {
    return this.tasksService.update(id, updateTaskDto, user);
  }

  @Delete(':id')
  @Auth()
  async remove(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.tasksService.remove(id, user);
  }
}