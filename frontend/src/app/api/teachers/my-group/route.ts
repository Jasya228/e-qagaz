import { NextResponse, NextRequest } from 'next/server';
import { readDB } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'TEACHER') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const db = await readDB();
  
  // Find the teacher's profile
  const teacherProfile = db.teachers?.find((t: any) => t.userId === user.sub);
  if (!teacherProfile || !teacherProfile.curatorshipGroup) {
    return NextResponse.json({ students: [] });
  }

  const groupName = teacherProfile.curatorshipGroup;

  // Find all students in this group
  const studentsInGroup = db.students
    .filter((s: any) => s.groupName === groupName)
    .map((s: any) => {
      const u = db.users.find((user: any) => user.id === s.userId) || {};
      return {
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        patronymic: u.patronymic,
        email: u.email,
        phone: s.phoneNumber || u.phone,
        avatarUrl: u.avatarUrl,
        studentIdNumber: s.studentIdNumber,
      };
    });

  return NextResponse.json({
    groupName,
    students: studentsInGroup
  });
}
