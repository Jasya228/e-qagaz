import { NextResponse, NextRequest } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const resolvedParams = await params;
  const targetId = resolvedParams.id;
  const db = await readDB();

  const targetUser = db.users.find((u: any) => u.id === targetId);
  if (!targetUser) return NextResponse.json({ message: 'User not found' }, { status: 404 });

  let profile = null;
  let department = null;

  if (targetUser.role === 'STUDENT') {
    profile = db.students.find((s: any) => s.userId === targetUser.id);
  } else if (targetUser.role === 'HEAD_DEPARTMENT') {
    department = db.departments.find((d: any) => d.headUserId === targetUser.id);
  }

  return NextResponse.json({
    user: targetUser,
    profile,
    department
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const resolvedParams = await params;
  const targetId = resolvedParams.id;
  const data = await request.json();
  const db = await readDB();

  const userIndex = db.users.findIndex((u: any) => u.id === targetId);
  if (userIndex === -1) return NextResponse.json({ message: 'User not found' }, { status: 404 });

  // Update user basic info
  db.users[userIndex] = {
    ...db.users[userIndex],
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    patronymic: data.patronymic,
    phone: data.phone,
    dateOfBirth: data.dateOfBirth,
    gender: data.gender
  };

  // Update specific profile info
  if (data.role === 'STUDENT') {
    const studentIndex = db.students.findIndex((s: any) => s.userId === targetId);
    if (studentIndex !== -1) {
      db.students[studentIndex] = {
        ...db.students[studentIndex],
        departmentId: data.departmentId,
        groupName: data.groupName,
        courseYear: data.courseYear,
        curatorName: data.curatorName,
        studentIdNumber: data.studentIdNumber,
        nationality: data.nationality,
        birthPlace: data.birthPlace,
        actualAddress: data.actualAddress,
        familyStatus: data.familyStatus,
        hobbies: data.hobbies
      };
    }
  } else if (data.role === 'HEAD_DEPARTMENT') {
    // Check if department changed
    const currentDeptIndex = db.departments.findIndex((d: any) => d.headUserId === targetId);
    if (currentDeptIndex !== -1) {
      db.departments[currentDeptIndex].headUserId = null; // Unassign from old
    }
    if (data.departmentId) {
      const newDeptIndex = db.departments.findIndex((d: any) => d.id === data.departmentId);
      if (newDeptIndex !== -1) {
        db.departments[newDeptIndex].headUserId = targetId; // Assign to new
      }
    }
  }

  await writeDB(db);
  return NextResponse.json({ message: 'User updated successfully' });
}
