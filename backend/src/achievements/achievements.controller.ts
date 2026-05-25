import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AchievementsService } from './achievements.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@ApiTags('achievements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('achievements')
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Post()
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Submit an achievement for review' })
  create(@Req() req, @Body() dto: CreateAchievementDto) {
    return this.achievementsService.create(req.user.id, dto);
  }

  @Get('my')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Get current student achievements' })
  getMyAchievements(@Req() req) {
    return this.achievementsService.getMyAchievements(req.user.id);
  }

  @Get('pending')
  @Roles(Role.HEAD_DEPARTMENT, Role.ADMIN)
  @ApiOperation({ summary: 'Get all pending achievements (for Head/Admin)' })
  getPending() {
    return this.achievementsService.getPending();
  }

  @Patch(':id/status')
  @Roles(Role.HEAD_DEPARTMENT, Role.ADMIN)
  @ApiOperation({ summary: 'Approve or Reject an achievement' })
  updateStatus(@Req() req, @Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.achievementsService.updateStatus(id, req.user.id, dto);
  }
}
