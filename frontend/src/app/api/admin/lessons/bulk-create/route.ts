import { NextResponse, NextRequest } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  try {
    const data = await request.json();
    const db = await readDB();

    if (!db.lessons) db.lessons = [];

    const newLessons = data.dates.map((date: string, idx: number) => ({
      id: `lesson-${Date.now()}-${idx}`,
      courseYear: data.courseYear,
      semester: data.semester,
      groupName: data.groupName,
      subjectId: data.subjectId,
      date: date,
      createdAt: new Date().toISOString()
    }));

    db.lessons.push(...newLessons);
    await writeDB(db);

    return NextResponse.json({ success: true, count: newLessons.length }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error adding lessons' }, { status: 500 });
  }
}
