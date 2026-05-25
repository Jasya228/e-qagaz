import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AchievementStatus } from '@prisma/client';

export class UpdateStatusDto {
  @ApiProperty({ enum: AchievementStatus })
  @IsEnum(AchievementStatus)
  status: AchievementStatus;

  @ApiPropertyOptional({ example: 'Молодец!' })
  @IsString()
  @IsOptional()
  comment?: string;
}
