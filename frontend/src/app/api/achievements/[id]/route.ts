import { NextResponse, NextRequest } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'STUDENT') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const resolvedParams = await params;
    const targetId = resolvedParams.id;
    const db = await readDB();

    const achievementIndex = db.achievements.findIndex((a: any) => a.id === targetId && a.studentId === user.sub);
    
    if (achievementIndex === -1) {
      return NextResponse.json({ message: 'Achievement not found or access denied' }, { status: 404 });
    }

    db.achievements.splice(achievementIndex, 1);
    await writeDB(db);

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting achievement' }, { status: 500 });
  }
}
