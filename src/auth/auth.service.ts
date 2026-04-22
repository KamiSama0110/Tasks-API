import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';
import { handleDBExceptions } from 'src/common/helpers/exception.helper';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  
  constructor(
    @InjectRepository(User)
    private readonly userRepostory: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createAuthDto: CreateUserDto) {
    try {
      const { password, ...userDate } = createAuthDto;

      const user = this.userRepostory.create({
        ...userDate,
        password: bcrypt.hashSync(password, 10),
      });
      await this.userRepostory.save(user);

      return {
      ...user,
      token: this.getJwtToken({ id: user.id })
    };
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;

    const user = await this.userRepostory.findOne({
      where: { email },
      select: {
        email: true,
        password: true,
        id: true
      },
    });

    if (!user) throw new UnauthorizedException(`Credential not valid`);

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException(`Credential not valid`);

    return {
      ...user,
      token: this.getJwtToken({ id: user.id })
    };
  }

  async checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id })
    };
  }  


  private getJwtToken( payload: JwtPayload) {
    return this.jwtService.sign( payload );
  }
}