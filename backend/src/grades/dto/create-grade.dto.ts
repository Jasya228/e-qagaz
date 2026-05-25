import { IsNotEmpty, IsNumber, IsString, IsUUID, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGradeDto {
  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  subjectId: string;

  @ApiProperty({ example: 95 })
  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;

  @ApiProperty({ example: '1 семестр' })
  @IsString()
  @IsNotEmpty()
  semester: string;
}
