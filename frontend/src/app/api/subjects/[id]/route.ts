import { NextResponse, NextRequest } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  try {
    const resolvedParams = await params;
    const db = await readDB();
    if (!db.subjects) return NextResponse.json({ message: 'Not found' }, { status: 404 });

    db.subjects = db.subjects.filter((s: any) => s.id !== resolvedParams.id);
    
    // Optionally cascade delete grades or lessons
    if (db.lessons) db.lessons = db.lessons.filter((l: any) => l.subjectId !== resolvedParams.id);
    if (db.grades) db.grades = db.grades.filter((g: any) => g.subjectId !== resolvedParams.id);
    if (db.totalScores) db.totalScores = db.totalScores.filter((t: any) => t.subjectId !== resolvedParams.id);

    await writeDB(db);

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting subject' }, { status: 500 });
  }
}
