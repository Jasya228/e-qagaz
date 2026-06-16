import { NextResponse, NextRequest } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'HEAD_DEPARTMENT') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const db = await readDB();
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get('search')?.toLowerCase() || '';
  const courseYearParam = searchParams.get('courseYear') || '';
  const groupNameParam = searchParams.get('groupName')?.toLowerCase() || '';
  const genderParam = searchParams.get('gender') || '';
  const curatorNameParam = searchParams.get('curatorName') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  // 1. Find the department where the user is the head
  const department = db.departments.find((d: any) => d.headUserId === user.sub);
  if (!department) return NextResponse.json({ message: 'Department not found' }, { status: 404 });

  // 2. Find all students in this department
  let deptStudents = db.students.filter((s: any) => s.departmentId === department.id);

  // Apply filters to students directly where possible
  if (courseYearParam) {
    deptStudents = deptStudents.filter((s: any) => String(s.courseYear) === courseYearParam);
  }
  if (groupNameParam) {
    deptStudents = deptStudents.filter((s: any) => s.groupName?.toLowerCase().includes(groupNameParam));
  }
  if (curatorNameParam) {
    deptStudents = deptStudents.filter((s: any) => s.curatorName === curatorNameParam);
  }

  // 3. Map required fields
  let results = deptStudents.map((s: any) => {
    const userProfile = db.users.find((u: any) => u.id === s.userId);
    return {
      id: s.id,
      fio: `${userProfile?.lastName || ''} ${userProfile?.firstName || ''}`.trim(),
      email: userProfile?.email || '',
      gender: userProfile?.gender || '',
      courseYear: s.courseYear,
      groupName: s.groupName,
      curatorName: s.curatorName || 'Не назначен',
      isActive: userProfile?.isActive ?? true,
      achievementsCount: db.achievements.filter((a: any) => a.studentId === s.userId).length
    };
  });

  // 4. Apply User Profile Filters (Gender & Search)
  if (genderParam) {
    results = results.filter((s: any) => s.gender === genderParam);
  }
  if (search) {
    results = results.filter((s: any) => s.fio.toLowerCase().includes(search) || s.email.toLowerCase().includes(search));
  }

  // 5. Pagination
  const total = results.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const paginatedResults = results.slice((page - 1) * limit, page * limit);

  return NextResponse.json({
    data: paginatedResults,
    meta: { total, page, limit, totalPages }
  });
}
