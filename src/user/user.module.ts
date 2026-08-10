import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthRolesGuard } from './guard/auth-roles.guard';
import { AuthGuard } from './guard/auth.guard';

@Module({
  imports:[
    PrismaModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '1d',
        },
      }),
    }),
  ],
  controllers: [UserController],
  providers: [UserService,AuthGuard, AuthRolesGuard],
  exports:[UserService,AuthGuard, AuthRolesGuard, JwtModule]
})
export class UserModule {}
