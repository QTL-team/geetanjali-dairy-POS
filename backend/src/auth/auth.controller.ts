import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

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

  // TEMPORARY DEVELOPMENT ROUTE
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
