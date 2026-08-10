import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JWTPaylodType } from 'src/utils/types';
import { UpdateUserDto } from './dto/update.dto';

const publicUserSelect = {
  id: true,
  username: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;


@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly JwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const username = dto.username.trim();

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Bu e-posta zaten kayıtlı');
    }

    const hashedPassword = await this.hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
      select: publicUserSelect,
    });

    const payload = {
      id: user.id,
      role: user.role,
    };

    const token = await this.generateJWT(payload);

    return {
      user,
      token,
    };
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('E-posta veya şifre hatalı');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('E-posta veya şifre hatalı');
    }

    const payload = {
      id: user.id,
      role: user.role,
    };

    const token = await this.generateJWT(payload);

    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return {
      user: safeUser,
      token,
    };
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: publicUserSelect,
    });
    return { users };
  }

  async currentUser(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });
    if (!user) throw new NotFoundException('Kullanıcı bulunmadı');
    return user;
  }

  async update(id: number, dto: UpdateUserDto) {
    const { username } = dto;
    await this.currentUser(id);

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(username !== undefined && {
          username: username.trim(),
        }),
      },
      select: publicUserSelect,
    });
    return user;
  }

  async remove(id: number) {
    await this.currentUser(id);
    await this.prisma.user.delete({
      where: { id },
    });
    return { message: 'kullanıcı silindi' };
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  private async generateJWT(payload: JWTPaylodType): Promise<string> {
    return this.JwtService.signAsync(payload);
  }
}
