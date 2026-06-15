import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateBusinessSettingsDto } from './dto/update-business-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getBusinessSettings(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        businessName: true,
        phone: true,
        address: true,
        gstNumber: true,
        invoiceFooterText: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateBusinessSettings(userId: string, dto: UpdateBusinessSettingsDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        businessName: dto.businessName,
        phone: dto.phone,
        address: dto.address,
        gstNumber: dto.gstNumber,
        invoiceFooterText: dto.invoiceFooterText,
      },
      select: {
        businessName: true,
        phone: true,
        address: true,
        gstNumber: true,
        invoiceFooterText: true,
      },
    });
    return user;
  }
}
