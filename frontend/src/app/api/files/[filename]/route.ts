import { NextResponse, NextRequest } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: NextRequest, { params }: { params: { filename: string } }) {
  try {
    const filename = params.filename;
    // Файлы загружались в public/uploads, поэтому читаем оттуда
    const filepath = path.join(process.cwd(), 'public', 'uploads', filename);
    const buffer = await fs.readFile(filepath);
    
    // Определяем тип файла
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.pdf') contentType = 'application/pdf';
    else if (ext === '.docx') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${filename}"`
      },
    });
  } catch (error) {
    return NextResponse.json({ message: `Cannot GET /api/files/${params.filename}`, error: "Not Found", statusCode: 404 }, { status: 404 });
  }
}
