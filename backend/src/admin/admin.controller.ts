import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CreateStudentDto } from './dto/create-student.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('analytics')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get overall analytics for admin dashboard' })
  getAnalytics() {
    return this.adminService.getDashboardAnalytics();
  }

  @Get('users')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all users' })
  getUsers(@Query() query: any) {
    return this.adminService.getAllUsers(query);
  }

  @Post('students')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new student with profile' })
  createStudent(@Req() req, @Body() dto: CreateStudentDto) {
    return this.adminService.createStudent(req.user.id, dto);
  }

  @Patch('users/:id/block')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Block or unblock a user' })
  blockUser(@Req() req, @Param('id') id: string, @Body('block') block: boolean) {
    return this.adminService.blockUser(req.user.id, id, block);
  }

  @Patch('users/:id/reset-password')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Reset a user password to default' })
  resetPassword(@Req() req, @Param('id') id: string) {
    return this.adminService.resetPassword(req.user.id, id);
  }
}
