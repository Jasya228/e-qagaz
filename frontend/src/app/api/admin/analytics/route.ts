import { NextResponse, NextRequest } from 'next/server';
import { readDB } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const db = await readDB();

  const totalUsers = db.users.length;
  const totalStudents = db.users.filter((u: any) => u.role === 'STUDENT').length;
  const totalHeads = db.users.filter((u: any) => u.role === 'HEAD_DEPARTMENT').length;
  const totalFiles = db.files.length;
  const recentLogs = db.logs.slice(0, 50).reverse();

  return NextResponse.json({
    users: totalUsers,
    students: totalStudents,
    heads: totalHeads,
    files: totalFiles,
    recentLogs,
  });
}
