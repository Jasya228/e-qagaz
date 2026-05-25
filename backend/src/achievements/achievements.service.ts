import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class AchievementsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateAchievementDto) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) throw new NotFoundException('Студент не найден');

    // Create achievement and its file record in a transaction
    return this.prisma.$transaction(async (tx) => {
      const achievement = await tx.achievement.create({
        data: {
          studentId: student.id,
          title: dto.title,
          description: dto.description,
          category: dto.category,
        },
      });

      await tx.file.create({
        data: {
          uploaderId: student.id,
          achievementId: achievement.id,
          fileUrl: dto.fileUrl,
          fileType: dto.fileType,
          size: dto.fileSize,
          entityType: 'ACHIEVEMENT',
        },
      });

      return achievement;
    });
  }

  async getMyAchievements(userId: string) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) throw new NotFoundException('Студент не найден');

    return this.prisma.achievement.findMany({
      where: { studentId: student.id },
      include: {
        files: true,
        comments: { include: { author: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPending() {
    return this.prisma.achievement.findMany({
      where: { status: 'PENDING' },
      include: {
        student: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
        files: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, verifierId: string, dto: UpdateStatusDto) {
    const achievement = await this.prisma.achievement.update({
      where: { id },
      data: {
        status: dto.status,
        verifiedById: verifierId,
      },
    });

    if (dto.comment) {
      await this.prisma.comment.create({
        data: {
          authorId: verifierId,
          achievementId: id,
          content: dto.comment,
        },
      });
    }

    return achievement;
  }
}
