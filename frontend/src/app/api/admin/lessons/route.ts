import { NextResponse, NextRequest } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const db = await readDB();
  return NextResponse.json({
    lessons: db.lessons || [],
    subjects: db.subjects || [],
    departments: db.departments || []
  });
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  try {
    const data = await request.json();
    const db = await readDB();

    if (!db.lessons) db.lessons = [];

    const newLesson = {
      id: `lesson-${Date.now()}`,
      courseYear: data.courseYear,
      semester: data.semester,
      departmentId: data.departmentId,
      subjectId: data.subjectId,
      date: data.date,
      createdAt: new Date().toISOString()
    };

    db.lessons.push(newLesson);
    await writeDB(db);

    return NextResponse.json(newLesson, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error adding lesson' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ message: 'Missing id' }, { status: 400 });

  const db = await readDB();
  if (!db.lessons) return NextResponse.json({ message: 'Not found' }, { status: 404 });

  db.lessons = db.lessons.filter((l: any) => l.id !== id);
  // Also delete associated grades? Optional for now, but good practice.
  if (db.grades) {
    db.grades = db.grades.filter((g: any) => g.lessonId !== id);
  }

  await writeDB(db);
  return NextResponse.json({ message: 'Deleted successfully' });
}
