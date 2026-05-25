import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@ApiTags('students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get('me')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Get current student profile' })
  getProfile(@Req() req) {
    return this.studentsService.getProfile(req.user.id);
  }

  @Patch('settings')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Update student settings' })
  updateSettings(@Req() req, @Body() dto: UpdateSettingsDto) {
    return this.studentsService.updateSettings(req.user.id, dto);
  }
}
