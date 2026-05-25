import { NextResponse, NextRequest } from 'next/server';
import { readDB } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const db = await readDB();
  
  // Find user data
  const userData = db.users.find((u: any) => u.id === user.sub);
  if (!userData) return NextResponse.json({ message: 'User not found' }, { status: 404 });

  // Find student profile data
  const studentData = db.students.find((s: any) => s.userId === user.sub) || {};
  
  // Find department
  const deptData = db.departments.find((d: any) => d.id === studentData.departmentId) || {};

  return NextResponse.json({
    id: userData.id,
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    patronymic: userData.patronymic || '',
    phone: studentData.phoneNumber || userData.phone || '',
    avatarUrl: userData.avatarUrl || null,
    dateOfBirth: studentData.birthDate || userData.dateOfBirth || null,
    gender: userData.gender || null,
    studentIdNumber: studentData.studentIdNumber || '',
    courseYear: studentData.courseYear || 1,
    groupName: studentData.groupName || '',
    curatorName: studentData.curatorName || null,
    department: deptData.name || 'Не указано',
    nationality: studentData.nationality || '',
    birthPlace: studentData.birthPlace || '',
    actualAddress: studentData.actualAddress || '',
    familyStatus: studentData.familyStatus || '',
    hobbies: studentData.hobbies || ''
  });
}
