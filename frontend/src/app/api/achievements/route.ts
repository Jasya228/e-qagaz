import { NextResponse, NextRequest } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'STUDENT') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const data = await request.json();
    const db = await readDB();
    
    const newAchievement = {
      id: `ach-${Date.now()}`,
      studentId: user.sub,
      title: data.title,
      description: data.description,
      category: data.category,
      scale: data.scale || 'Внутри колледжа',
      status: 'APPROVED',
      createdAt: new Date().toISOString(),
      files: [
        {
          fileUrl: data.fileUrl,
          fileType: data.fileType,
          size: data.fileSize,
        }
      ]
    };

    db.achievements.push(newAchievement);
    await writeDB(db);

    return NextResponse.json(newAchievement, { status: 201 });
  } catch (error) {
    console.error('Achievement POST Error:', error);
    return NextResponse.json({ message: 'Failed to create achievement' }, { status: 500 });
  }
}
