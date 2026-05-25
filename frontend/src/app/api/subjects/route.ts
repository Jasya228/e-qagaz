import { NextResponse, NextRequest } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  const db = await readDB();
  const subjects = db.subjects || [];
  
  const enriched = subjects.map((s: any) => ({
    ...s,
    department: (db.departments || []).find((d: any) => d.id === s.departmentId)
  }));
  return NextResponse.json(enriched);
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  try {
    const data = await request.json();
    const db = await readDB();
    if (!db.subjects) db.subjects = [];

    const newSubject = {
      id: `subj-${Date.now()}`,
      name: data.name,
      courseYear: data.courseYear || 1,
      semester: data.semester || 1,
      credits: data.credits || 3,
      departmentId: data.departmentId
    };

    db.subjects.push(newSubject);
    await writeDB(db);

    return NextResponse.json(newSubject, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error adding subject' }, { status: 500 });
  }
}
