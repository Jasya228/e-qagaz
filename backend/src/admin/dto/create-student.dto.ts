import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID, MinLength, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStudentDto {
  @ApiProperty({ example: 'student@eqagaz.kz' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Иван' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Иванов' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional({ example: 'Иванович' })
  @IsString()
  @IsOptional()
  patronymic?: string;

  @ApiPropertyOptional({ example: '+77001234567' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: '1999-01-01' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: 'MALE' })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiProperty({ example: 'CS-202' })
  @IsString()
  @IsNotEmpty()
  groupName: string;

  @ApiProperty({ example: 2 })
  @IsNotEmpty()
  courseYear: number;

  @ApiProperty({ example: 'STU12345' })
  @IsString()
  @IsNotEmpty()
  studentIdNumber: string;

  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  departmentId: string;

  @ApiPropertyOptional({ example: 'Петров П.П.' })
  @IsString()
  @IsOptional()
  curatorName?: string;
}
