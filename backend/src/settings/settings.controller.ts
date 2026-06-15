import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateBusinessSettingsDto } from './dto/update-business-settings.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('business')
  getBusinessSettings(@Request() req: { user: { userId: string } }) {
    return this.settingsService.getBusinessSettings(req.user.userId);
  }

  @Patch('business')
  updateBusinessSettings(
    @Request() req: { user: { userId: string } },
    @Body() dto: UpdateBusinessSettingsDto,
  ) {
    return this.settingsService.updateBusinessSettings(req.user.userId, dto);
  }
}
