import { NextResponse, NextRequest } from 'next/server';
import { readDB } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const db = await readDB();
  const achievements = db.achievements.filter((a: any) => a.studentId === user.sub) || [];
  
  return NextResponse.json(achievements);
}
