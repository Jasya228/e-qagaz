import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import * as bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardAnalytics() {
    const [totalUsers, totalStudents, totalHeads, totalFiles, recentLogs] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.student.count(),
      this.prisma.department.count({ where: { headUserId: { not: null } } }),
      this.prisma.file.count(),
      this.prisma.log.findMany({ take: 50, orderBy: { createdAt: 'desc' }, include: { user: { select: { firstName: true, lastName: true, role: true } } } }),
    ]);

    return {
      users: totalUsers,
      students: totalStudents,
      heads: totalHeads,
      files: totalFiles,
      recentLogs,
    };
  }

  async getAllUsers(query: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async createStudent(adminId: string, dto: CreateStudentDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email уже используется');

    // Generate random default password (e.g. 123456)
    const defaultPassword = 'password123';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          patronymic: dto.patronymic,
          phone: dto.phone,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
          gender: dto.gender,
          avatarUrl: dto.avatarUrl,
          role: Role.STUDENT,
        },
      });

      await tx.student.create({
        data: {
          userId: newUser.id,
          departmentId: dto.departmentId,
          studentIdNumber: dto.studentIdNumber,
          courseYear: dto.courseYear,
          groupName: dto.groupName,
          curatorName: dto.curatorName,
        },
      });

      await tx.log.create({
        data: {
          userId: adminId,
          action: 'CREATED_STUDENT',
          details: { studentEmail: dto.email },
        }
      });

      return newUser;
    });

    return { user, defaultPassword };
  }

  async blockUser(adminId: string, id: string, block: boolean) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { isActive: !block },
    });
    
    await this.prisma.log.create({
      data: {
        userId: adminId,
        action: block ? 'BLOCKED_USER' : 'UNBLOCKED_USER',
        details: { targetUserId: id },
      }
    });

    return user;
  }

  async resetPassword(adminId: string, id: string) {
    const defaultPassword = 'password123';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    await this.prisma.log.create({
      data: {
        userId: adminId,
        action: 'RESET_PASSWORD',
        details: { targetUserId: id },
      }
    });

    return { message: 'Password reset successfully', defaultPassword };
  }
}
