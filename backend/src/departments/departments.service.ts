import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardAnalytics(userId: string) {
    const headDept = await this.prisma.department.findUnique({ where: { headUserId: userId } });
    if (!headDept) throw new NotFoundException('Отделение не найдено');

    const [totalStudents, activeStudents, achievementsCount, groups] = await Promise.all([
      this.prisma.student.count({ where: { departmentId: headDept.id } }),
      this.prisma.student.count({ where: { departmentId: headDept.id, user: { isActive: true } } }),
      this.prisma.achievement.count({ where: { student: { departmentId: headDept.id } } }),
      this.prisma.student.findMany({
        where: { departmentId: headDept.id },
        select: { groupName: true },
        distinct: ['groupName']
      }),
    ]);

    return {
      totalStudents,
      activeStudents,
      totalGroups: groups.length,
      achievementsCount,
      departmentName: headDept.name
    };
  }

  async getStudentsList(userId: string, query: any) {
    const headDept = await this.prisma.department.findUnique({ where: { headUserId: userId } });
    if (!headDept) throw new NotFoundException('Отделение не найдено');

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = { departmentId: headDept.id };
    
    if (query.search) {
      where.user = {
        OR: [
          { firstName: { contains: query.search, mode: 'insensitive' } },
          { lastName: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } }
        ]
      };
    }
    if (query.courseYear) where.courseYear = Number(query.courseYear);
    if (query.groupName) where.groupName = query.groupName;
    
    // gender is on user model
    if (query.gender) {
      where.user = { ...where.user, gender: query.gender };
    }

    const [items, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        include: {
          user: { select: { firstName: true, lastName: true, email: true, phone: true, gender: true, isActive: true } },
          _count: { select: { achievements: true, grades: true } }
        },
        skip,
        take: limit,
        orderBy: { user: { lastName: 'asc' } },
      }),
      this.prisma.student.count({ where }),
    ]);

    return {
      data: items.map(i => ({
        id: i.id,
        userId: i.userId,
        fio: `${i.user.lastName} ${i.user.firstName}`,
        email: i.user.email,
        phone: i.user.phone,
        groupName: i.groupName,
        courseYear: i.courseYear,
        gender: i.user.gender,
        isActive: i.user.isActive,
        achievementsCount: i._count.achievements
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  async getStudentDetails(headId: string, studentId: string) {
    const headDept = await this.prisma.department.findUnique({ where: { headUserId: headId } });
    if (!headDept) throw new NotFoundException('Отделение не найдено');

    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: { select: { firstName: true, lastName: true, patronymic: true, email: true, phone: true, avatarUrl: true, gender: true, dateOfBirth: true, isActive: true } },
        achievements: { 
          include: { files: true },
          orderBy: { createdAt: 'desc' }
        },
        grades: {
          include: { subject: true },
          orderBy: { awardedAt: 'desc' }
        },
        files: true
      }
    });

    if (!student) throw new NotFoundException('Студент не найден');
    if (student.departmentId !== headDept.id) throw new ForbiddenException('Студент не принадлежит вашему отделению');

    return student;
  }
}
