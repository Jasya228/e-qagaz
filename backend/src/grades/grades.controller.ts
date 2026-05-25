import { Controller, Get, Post, Body, UseGuards, Req, Query, Put, Delete, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GradesService } from './grades.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CreateGradeDto } from './dto/create-grade.dto';

@ApiTags('grades')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('grades')
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.HEAD_DEPARTMENT)
  @ApiOperation({ summary: 'Assign a grade to a student' })
  create(@Req() req, @Body() createGradeDto: CreateGradeDto) {
    return this.gradesService.create(createGradeDto, req.user.id);
  }

  @Get('my-grades')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Get current student grades with search, pagination, and grouping' })
  getMyGrades(
    @Req() req,
    @Query('courseYear') courseYear?: number,
    @Query('semester') semester?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.gradesService.getMyGrades(req.user.id, { courseYear, semester, search, page, limit });
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.HEAD_DEPARTMENT)
  @ApiOperation({ summary: 'Update a grade score' })
  update(@Param('id') id: string, @Body('score') score: number) {
    return this.gradesService.update(id, score);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a grade' })
  remove(@Param('id') id: string) {
    return this.gradesService.remove(id);
  }
}
