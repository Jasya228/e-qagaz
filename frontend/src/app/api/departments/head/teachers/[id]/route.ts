import { NextResponse, NextRequest } from 'next/server';
import { readDB } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'HEAD_DEPARTMENT') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const resolvedParams = await params;
  const teacherId = resolvedParams.id;

  const db = await readDB();

  // 1. Find the department where the user is the head
  const department = db.departments.find((d: any) => d.headUserId === user.sub);
  if (!department) return NextResponse.json({ message: 'Department not found' }, { status: 404 });

  // 2. Find teacher
  const teacher = db.teachers?.find((t: any) => t.id === teacherId && t.departmentId === department.id);
  if (!teacher) return NextResponse.json({ message: 'Teacher not found' }, { status: 404 });

  // 3. Find user profile
  const userProfile = db.users.find((u: any) => u.id === teacher.userId) || {};

  return NextResponse.json({
    ...teacher,
    user: userProfile,
  });
}
