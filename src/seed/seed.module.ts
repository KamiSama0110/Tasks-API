import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { SeedController } from './seed.controller';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Task])],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
