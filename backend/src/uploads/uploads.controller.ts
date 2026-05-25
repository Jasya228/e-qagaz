import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, BadRequestException, Req } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const storage = diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = join(__dirname, '..', '..', 'uploads');
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestException('Недопустимый формат файла. Доступны: JPG, PNG, PDF, DOCX'), false);
  }
};

@ApiTags('uploads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class UploadsController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @ApiOperation({ summary: 'Upload file (JPG, PNG, PDF, DOCX)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', { storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } })) // 5MB limit
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req) {
    if (!file) throw new BadRequestException('Файл не был загружен');
    
    await this.prisma.log.create({
      data: {
        userId: req.user.id,
        action: 'UPLOAD_FILE',
        details: { filename: file.originalname, size: file.size, mimetype: file.mimetype },
      }
    });

    return {
      url: `/uploads/${file.filename}`,
      name: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }
}
