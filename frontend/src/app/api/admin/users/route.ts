import { NextResponse, NextRequest } from 'next/server';
import { readDB } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const db = await readDB();

  // Basic mock
  return NextResponse.json({
    data: db.users,
    meta: { total: db.users.length, page: 1, limit: 10, totalPages: 1 }
  });
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  try {
    const data = await request.json();
    const db = await readDB();

    const newUser = {
      id: `user-${Date.now()}`,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      patronymic: data.patronymic,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      role: data.role,
      isActive: true,
      passwordHash: 'password123'
    };
    db.users.push(newUser);

    if (data.role === 'STUDENT') {
      const newStudent = {
        id: `stu-${Date.now()}`,
        userId: newUser.id,
        departmentId: data.departmentId,
        studentIdNumber: data.studentIdNumber,
        courseYear: data.courseYear,
        groupName: data.groupName,
        curatorName: data.curatorName,
        nationality: data.nationality || '',
        birthPlace: data.birthPlace || '',
        actualAddress: data.actualAddress || '',
        familyStatus: data.familyStatus || '',
        hobbies: data.hobbies || ''
      };
      db.students.push(newStudent);
    } else if (data.role === 'HEAD_DEPARTMENT') {
      if (data.departmentId) {
        const deptIndex = db.departments.findIndex((d: any) => d.id === data.departmentId);
        if (deptIndex !== -1) {
          db.departments[deptIndex].headUserId = newUser.id;
        }
      }
    }

    await writeDB(db);
    return NextResponse.json({ ...newUser, defaultPassword: 'password123' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error creating user' }, { status: 500 });
  }
}
