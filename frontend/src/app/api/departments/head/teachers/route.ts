import { NextResponse, NextRequest } from 'next/server';
import { readDB } from '@/lib/db';
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

  // 2. Find all teachers in this department
  const deptTeachers = db.teachers?.filter((t: any) => t.departmentId === department.id) || [];

  // 3. Map required fields
  let results = deptTeachers.map((t: any) => {
    const userProfile = db.users.find((u: any) => u.id === t.userId);
    return {
      id: t.id,
      fio: `${userProfile?.lastName || ''} ${userProfile?.firstName || ''} ${userProfile?.patronymic || ''}`.trim(),
      email: userProfile?.email || '',
      position: t.position || 'Преподаватель',
      curatorshipGroup: t.curatorshipGroup || 'Нет',
      isActive: userProfile?.isActive ?? true
    };
  });

  // 4. Search Filter
  if (search) {
    results = results.filter((t: any) => t.fio.toLowerCase().includes(search) || t.email.toLowerCase().includes(search));
  }

  return NextResponse.json({
    data: results,
    meta: { total: results.length, page: 1, limit: results.length || 50, totalPages: 1 }
  });
}
