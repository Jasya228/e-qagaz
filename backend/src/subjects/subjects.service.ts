import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  create(createSubjectDto: CreateSubjectDto) {
    return this.prisma.subject.create({
      data: createSubjectDto,
    });
  }

  findAll(query: any) {
    const where: any = {};
    if (query.departmentId) where.departmentId = query.departmentId;
    if (query.courseYear) where.courseYear = Number(query.courseYear);
    if (query.semester) where.semester = Number(query.semester);
    
    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    return this.prisma.subject.findMany({
      where,
      include: { department: { select: { name: true } } },
      orderBy: [{ courseYear: 'asc' }, { semester: 'asc' }, { name: 'asc' }],
    });
  }

  async update(id: string, updateData: Partial<CreateSubjectDto>) {
    try {
      return await this.prisma.subject.update({
        where: { id },
        data: updateData,
      });
    } catch (e) {
      throw new NotFoundException('Subject not found');
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.subject.delete({
        where: { id },
      });
    } catch (e) {
      throw new NotFoundException('Subject not found');
    }
  }
}
