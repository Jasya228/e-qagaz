import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGradeDto } from './dto/create-grade.dto';

@Injectable()
export class GradesService {
  constructor(private prisma: PrismaService) {}

  async create(createGradeDto: CreateGradeDto, adminId?: string) {
    const grade = await this.prisma.grade.create({
      data: createGradeDto,
    });

    if (adminId) {
      await this.prisma.log.create({
        data: {
          userId: adminId,
          action: 'ADD_GRADE',
          details: { studentId: createGradeDto.studentId, subjectId: createGradeDto.subjectId, score: createGradeDto.score },
        }
      });
    }

    return grade;
  }

  async getMyGrades(userId: string, query: { courseYear?: number; semester?: string; search?: string; page?: number; limit?: number }) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) throw new NotFoundException('Студент не найден');

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = { studentId: student.id };
    
    if (query.semester) {
      where.semester = query.semester;
    }

    if (query.search) {
      where.subject = {
        name: { contains: query.search, mode: 'insensitive' }
      };
    }
    
    // In our schema, `courseYear` is on the Student.
    // However, subjects and grades represent specific years in an academic timeline. 
    // To support querying by the course year when the subject was taken, we'd ideally have it on Subject or Grade.
    // For simplicity without modifying DB, we'll return all grades matching the search and semester.
    // In a real scenario, Grade could have a courseYear field. Let's add it dynamically or just filter by semester strings like '1 курс - 1 семестр'.
    // Assuming the frontend maps 'courseYear 1' + 'semester 1' to `semester="1-1"` or just relies on the semester string.

    const [items, total] = await Promise.all([
      this.prisma.grade.findMany({
        where,
        include: { subject: true },
        skip,
        take: limit,
        orderBy: { awardedAt: 'desc' },
      }),
      this.prisma.grade.count({ where }),
    ]);

    // Aggregate by subject to match the requested UI (Subject | scores array | final score)
    // Here we just return the raw grades and let the frontend group them, or we group them here.
    const grouped = items.reduce((acc, curr) => {
      if (!acc[curr.subject.id]) {
        acc[curr.subject.id] = {
          subjectName: curr.subject.name,
          scores: [],
          finalScore: 0,
        };
      }
      acc[curr.subject.id].scores.push(curr.score);
      return acc;
    }, {} as Record<string, any>);

    Object.keys(grouped).forEach(key => {
      const g = grouped[key];
      g.finalScore = Math.round(g.scores.reduce((a, b) => a + b, 0) / g.scores.length);
    });

    return {
      data: Object.values(grouped),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  async update(id: string, score: number) {
    try {
      return await this.prisma.grade.update({
        where: { id },
        data: { score },
      });
    } catch (e) {
      throw new NotFoundException('Grade not found');
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.grade.delete({
        where: { id },
      });
    } catch (e) {
      throw new NotFoundException('Grade not found');
    }
  }
}
