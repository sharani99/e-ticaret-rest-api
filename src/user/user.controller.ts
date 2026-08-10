import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import type { JWTPaylodType } from 'src/utils/types';
import { AuthGuard } from './guard/auth.guard';
import { UpdateUserDto } from './dto/update.dto';
import { AuthRolesGuard } from './guard/auth-roles.guard';
import { Roles } from './decorators/user-role.decorator';
import { UserRole } from 'generated/prisma/enums';

@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.userService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.userService.login(dto);
  }

  @Get()
  @UseGuards(AuthGuard, AuthRolesGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.userService.findAll();
  }

  @Get('current-user')
  @UseGuards(AuthGuard)
  currentUser(@CurrentUser() payload: JWTPaylodType) {
    return this.userService.currentUser(payload.id);
  }

  @Put('')
  @UseGuards(AuthGuard)
  update(@CurrentUser() payload: JWTPaylodType, @Body() dto: UpdateUserDto) {
    return this.userService.update(payload.id, dto);
  }

  @Delete('')
  @UseGuards(AuthGuard)
  remove(@CurrentUser() payload: JWTPaylodType) {
    return this.userService.remove(payload.id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AuthRolesGuard)
  @Roles(UserRole.ADMIN)
  removeUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
