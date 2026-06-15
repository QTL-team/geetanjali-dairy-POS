import {
  Body,
  Controller,
  Post,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private prisma: PrismaService,
  ) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  changePassword(
    @Request() req: { user: { userId: string } },
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      req.user.userId,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  // / TEMPORARY DEVELOPMENT ROUTE
  // @Post('seed-admin')
  // async seedAdmin() {
  //   const password = await bcrypt.hash('admin123', 10);
  //
  //   return this.prisma.user.upsert({
  //     where: {
  //       email: 'admin@geetanjali.com',
  //     },
  //     update: {
  //       password,
  //     },
  //     create: {
  //       email: 'admin@geetanjali.com',
  //       password,
  //     },
  //   });
  // }
}
