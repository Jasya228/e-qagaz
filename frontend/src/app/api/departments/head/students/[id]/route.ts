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
  const studentId = resolvedParams.id;

  const db = await readDB();

  // Find student record
  const student = db.students.find((s: any) => s.id === studentId);
  if (!student) return NextResponse.json({ message: 'Student not found' }, { status: 404 });

  // Verify this student is in the Head's department
  const department = db.departments.find((d: any) => d.id === student.departmentId);
  if (!department || department.headUserId !== user.sub) {
    return NextResponse.json({ message: 'Access denied to this student' }, { status: 403 });
  }

  // Find user profile
  const userProfile = db.users.find((u: any) => u.id === student.userId) || {};

  // Find achievements
  const achievements = db.achievements.filter((a: any) => a.studentId === student.userId) || [];

  // Find documents
  const documents = (db.documents || []).filter((d: any) => d.userId === student.userId);

  // Find grades & total scores
  const grades = (db.grades || []).filter((g: any) => g.studentId === student.userId);
  const totalScores = (db.totalScores || []).filter((t: any) => t.studentId === student.userId);
  const lessons = db.lessons || [];
  const subjects = db.subjects || [];

  return NextResponse.json({
    ...student,
    user: userProfile,
    achievements,
    documents,
    grades,
    totalScores,
    lessons,
    subjects
  });
}
