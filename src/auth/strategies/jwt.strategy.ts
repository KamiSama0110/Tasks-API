import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "../entities/user.entity";
import { ConfigService } from "@nestjs/config";
import { Repository } from "typeorm";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { UnauthorizedException } from "@nestjs/common";

export class JWTStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(User)
        private readonly userRepositoy: Repository<User>,
        configService: ConfigService,
    ) {
        super({
            secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
    }
    
    async validate( payload: JwtPayload): Promise<User> {
        
        const { id } =  payload;

        const user = await this.userRepositoy.findOneBy({id});

        if ( !user ) throw new UnauthorizedException(`Token not valid`);

        if ( !user.isActive ) throw new UnauthorizedException(`User is inactive, talk with an admin`);

        return user;
        
    }
	
}