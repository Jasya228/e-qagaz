import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AchievementCategory } from '@prisma/client';

export class CreateAchievementDto {
  @ApiProperty({ example: 'Победитель олимпиады' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Занял 1 место по программированию' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: AchievementCategory })
  @IsEnum(AchievementCategory)
  category: AchievementCategory;

  @ApiProperty({ example: '/uploads/cert.pdf' })
  @IsString()
  @IsNotEmpty()
  fileUrl: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  @IsNotEmpty()
  fileType: string;

  @ApiProperty({ example: 102400 })
  @IsNotEmpty()
  fileSize: number;
}
