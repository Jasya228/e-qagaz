import { NextResponse, NextRequest } from 'next/server';
import { readDB } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'HEAD_DEPARTMENT') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const db = await readDB();
  
  // Find the department where the user is the head
  const department = db.departments.find((d: any) => d.headUserId === user.sub);
  if (!department) return NextResponse.json({ message: 'Department not found' }, { status: 404 });

  // Find all students in this department
  const deptStudents = db.students.filter((s: any) => s.departmentId === department.id);
  
  // Calculate unique groups
  const uniqueGroups = new Set(deptStudents.map((s: any) => s.groupName).filter(Boolean));

  return NextResponse.json({
    departmentName: department.name,
    totalStudents: deptStudents.length,
    totalGroups: uniqueGroups.size
  });
}
