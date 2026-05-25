import { Controller, Get, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('departments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get('head/analytics')
  @Roles(Role.HEAD_DEPARTMENT)
  @ApiOperation({ summary: 'Get dashboard analytics for head department' })
  getAnalytics(@Req() req) {
    return this.departmentsService.getDashboardAnalytics(req.user.id);
  }

  @Get('head/students')
  @Roles(Role.HEAD_DEPARTMENT)
  @ApiOperation({ summary: 'Get paginated and filtered students list' })
  getStudents(@Req() req, @Query() query: any) {
    return this.departmentsService.getStudentsList(req.user.id, query);
  }

  @Get('head/students/:id')
  @Roles(Role.HEAD_DEPARTMENT)
  @ApiOperation({ summary: 'Get detailed student profile, grades, and achievements' })
  getStudentDetails(@Req() req, @Param('id') studentId: string) {
    return this.departmentsService.getStudentDetails(req.user.id, studentId);
  }
}
