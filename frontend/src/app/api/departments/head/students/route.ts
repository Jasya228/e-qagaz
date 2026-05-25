import { NextResponse, NextRequest } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'HEAD_DEPARTMENT') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const db = await readDB();
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get('search')?.toLowerCase() || '';

  // 1. Find the department where the user is the head
  const department = db.departments.find((d: any) => d.headUserId === user.sub);
  if (!department) return NextResponse.json({ message: 'Department not found' }, { status: 404 });

  // 2. Find all students in this department
  let deptStudents = db.students.filter((s: any) => s.departmentId === department.id);

  // 3. Map required fields
  let results = deptStudents.map((s: any) => {
    const userProfile = db.users.find((u: any) => u.id === s.userId);
    return {
      id: s.id,
      fio: `${userProfile?.lastName || ''} ${userProfile?.firstName || ''}`.trim(),
      email: userProfile?.email || '',
      courseYear: s.courseYear,
      groupName: s.groupName,
      curatorName: s.curatorName || 'Не назначен',
      isActive: userProfile?.isActive ?? true,
      achievementsCount: db.achievements.filter((a: any) => a.studentId === s.userId).length
    };
  });

  // 4. Search Filter
  if (search) {
    results = results.filter((s: any) => s.fio.toLowerCase().includes(search));
  }

  return NextResponse.json({
    data: results,
    meta: { total: results.length, page: 1, limit: results.length || 10, totalPages: 1 }
  });
}
