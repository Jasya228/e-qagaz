import { NextResponse, NextRequest } from 'next/server';
import { getUserFromRequest } from '@/lib/auth-server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ message: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }

    // Create a safe unique filename
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const filename = `${Date.now()}-${safeName}`;
    const filepath = path.join(uploadsDir, filename);

    await fs.writeFile(filepath, buffer);
    
    return NextResponse.json({
      url: `/uploads/${filename}`,
      mimetype: file.type,
      size: file.size,
      name: file.name
    });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ message: 'Upload processing failed' }, { status: 500 });
  }
}
