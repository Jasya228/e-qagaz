import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: {
          include: {
            department: true,
          }
        }
      }
    });

    if (!user) throw new NotFoundException('Пользователь не найден');
    if (!user.studentProfile) throw new BadRequestException('Пользователь не является студентом');

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      patronymic: user.patronymic,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      studentIdNumber: user.studentProfile.studentIdNumber,
      courseYear: user.studentProfile.courseYear,
      groupName: user.studentProfile.groupName,
      curatorName: user.studentProfile.curatorName,
      department: user.studentProfile.department.name,
    };
  }

  async updateSettings(userId: string, dto: UpdateSettingsDto) {
    const data: any = {};
    if (dto.email) data.email = dto.email;
    if (dto.phone) data.phone = dto.phone;
    if (dto.avatarUrl) data.avatarUrl = dto.avatarUrl;
    if (dto.password) data.passwordHash = await bcrypt.hash(dto.password, 10);

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true, email: true, phone: true, avatarUrl: true, firstName: true, lastName: true,
      }
    });

    await this.prisma.log.create({
      data: {
        userId: userId,
        action: 'UPDATE_PROFILE',
        details: { updatedFields: Object.keys(data) },
      }
    });

    return updatedUser;
  }
}
