import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { ValidRoles } from 'src/auth/interfaces/valid-roles.interface';
import { User } from 'src/auth/entities/user.entity';
import { Task, TaskStatus } from 'src/tasks/entities/task.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async runSeed() {
    await this.cleanDatabase();

    const users = await this.seedUsers();
    const tasks = await this.seedTasks(users);

    const softDeletedIds = tasks
      .filter((_, index) => index % 18 === 0)
      .map((task) => task.id);

    if (softDeletedIds.length > 0) {
      await this.taskRepository.softDelete(softDeletedIds);
    }

    return {
      message: 'Database seeded successfully',
      usersInserted: users.length,
      tasksInserted: tasks.length,
      softDeletedTasks: softDeletedIds.length,
      credentials: {
        password: 'Test1234',
        users: users.map((user) => ({
          email: user.email,
          fullName: user.fullName,
          roles: user.roles,
        })),
      },
    };
  }

  private async cleanDatabase() {
    await this.taskRepository.createQueryBuilder().delete().from(Task).execute();
    await this.userRepository.createQueryBuilder().delete().from(User).execute();
  }

  private async seedUsers() {
    const hashedPassword = bcrypt.hashSync('Test1234', 10);

    const usersToInsert = this.userRepository.create([
      {
        email: 'admin@seed.dev',
        fullName: 'Seed Admin',
        password: hashedPassword,
        roles: [ValidRoles.ADMIN, ValidRoles.USER],
      },
      {
        email: 'super@seed.dev',
        fullName: 'Seed SuperUser',
        password: hashedPassword,
        roles: [ValidRoles.SUPERUSER, ValidRoles.USER],
      },
      {
        email: 'user1@seed.dev',
        fullName: 'Seed User One',
        password: hashedPassword,
        roles: [ValidRoles.USER],
      },
      {
        email: 'user2@seed.dev',
        fullName: 'Seed User Two',
        password: hashedPassword,
        roles: [ValidRoles.USER],
      },
      {
        email: 'user3@seed.dev',
        fullName: 'Seed User Three',
        password: hashedPassword,
        roles: [ValidRoles.USER],
      },
    ]);

    return await this.userRepository.save(usersToInsert);
  }

  private async seedTasks(users: User[]) {
    const statuses = [TaskStatus.OPEN, TaskStatus.IN_PROGRESS, TaskStatus.DONE];

    const tasksToInsert: Task[] = [];

    users.forEach((user, userIndex) => {
      for (let i = 1; i <= 28; i++) {
        const status = statuses[(i + userIndex) % statuses.length];

        tasksToInsert.push(
          this.taskRepository.create({
            title: `Task ${i} for ${user.fullName}`,
            description: `Generated task ${i} assigned to ${user.email}`,
            status,
            user,
          }),
        );
      }
    });

    return await this.taskRepository.save(tasksToInsert);
  }
}
