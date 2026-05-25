import { NextResponse, NextRequest } from 'next/server';
import { readDB } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user || user.role === 'STUDENT') return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });

  const db = await readDB();
  // Return pending achievements
  const pending = db.achievements.filter((a: any) => a.status === 'PENDING') || [];
  
  // Attach student details to each
  const enhanced = pending.map((a: any) => {
    const student = db.students.find((s: any) => s.id === a.studentId) || {};
    const studentUser = db.users.find((u: any) => u.id === student.userId) || {};
    return {
      ...a,
      student: {
        ...student,
        user: studentUser
      }
    };
  });

  return NextResponse.json(enhanced);
}
