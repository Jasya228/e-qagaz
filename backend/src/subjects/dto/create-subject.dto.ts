import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubjectDto {
  @ApiProperty({ example: 'Программирование на C++' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Основы C++' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 4 })
  @IsNumber()
  @Min(1)
  credits: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  courseYear: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  semester: number;

  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  departmentId: string;
}
