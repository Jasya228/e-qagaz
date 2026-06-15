import { NextResponse, NextRequest } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const db = await readDB();
  
  // Find user data
  const userData = db.users.find((u: any) => u.id === user.sub);
  if (!userData) return NextResponse.json({ message: 'User not found' }, { status: 404 });

  if (userData.role === 'STUDENT') {
    const studentData = db.students.find((s: any) => s.userId === user.sub) || {};
    const deptData = db.departments.find((d: any) => d.id === studentData.departmentId) || {};
    return NextResponse.json({
      role: 'STUDENT',
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
  } else if (userData.role === 'TEACHER') {
    const teacherData = db.teachers?.find((t: any) => t.userId === user.sub) || {};
    const deptData = db.departments.find((d: any) => d.id === teacherData.departmentId) || {};
    return NextResponse.json({
      role: 'TEACHER',
      id: userData.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      patronymic: userData.patronymic || '',
      phone: userData.phone || '',
      avatarUrl: userData.avatarUrl || null,
      dateOfBirth: userData.dateOfBirth || null,
      gender: userData.gender || null,
      department: deptData.name || 'Не указано',
      position: teacherData.position || '',
      curatorshipGroup: teacherData.curatorshipGroup || '',
      education: teacherData.education || '',
      qualificationCategory: teacherData.qualificationCategory || '',
      totalExperience: teacherData.totalExperience || '',
      pedagogicalExperience: teacherData.pedagogicalExperience || '',
      trainingCertificates: teacherData.trainingCertificates || '',
      nationality: teacherData.nationality || '',
      birthPlace: teacherData.birthPlace || '',
      actualAddress: teacherData.actualAddress || '',
      familyStatus: teacherData.familyStatus || '',
      hobbies: teacherData.hobbies || ''
    });
  } else {
    return NextResponse.json({ ...userData, role: userData.role });
  }
}

export async function PATCH(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const data = await request.json();
  const db = await readDB();

  const userIndex = db.users.findIndex((u: any) => u.id === user.sub);
  if (userIndex === -1) return NextResponse.json({ message: 'User not found' }, { status: 404 });

  if (data.avatarUrl !== undefined) {
    db.users[userIndex].avatarUrl = data.avatarUrl;
  }

  await writeDB(db);
  return NextResponse.json({ message: 'Profile updated successfully', avatarUrl: data.avatarUrl });
}
