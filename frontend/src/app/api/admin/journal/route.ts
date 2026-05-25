import { NextResponse, NextRequest } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const groupName = searchParams.get('groupName');
  const subjectId = searchParams.get('subjectId');
  const semester = searchParams.get('semester');

  if (!groupName || !subjectId) return NextResponse.json({ message: 'Missing params' }, { status: 400 });

  const db = await readDB();

  const students = db.students?.filter((s: any) => s.groupName === groupName) || [];
  const populatedStudents = students.map((s: any) => ({
    ...s,
    user: db.users?.find((u: any) => u.id === s.userId)
  }));

  const lessons = db.lessons?.filter((l: any) => l.groupName === groupName && l.subjectId === subjectId) || [];
  
  const lessonIds = lessons.map((l: any) => l.id);
  const grades = db.grades?.filter((g: any) => lessonIds.includes(g.lessonId)) || [];
  
  const totalScores = db.totalScores?.filter((t: any) => t.subjectId === subjectId && t.semester === Number(semester)) || [];

  return NextResponse.json({
    students: populatedStudents,
    lessons,
    grades,
    totalScores
  });
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  try {
    const { subjectId, semester, updates } = await request.json();
    const db = await readDB();

    if (!db.grades) db.grades = [];
    if (!db.totalScores) db.totalScores = [];

    updates.forEach((update: any) => {
      // 1. Update total score
      const existingTotalIndex = db.totalScores.findIndex((t: any) => t.studentId === update.studentId && t.subjectId === subjectId && t.semester === semester);
      if (existingTotalIndex >= 0) {
        db.totalScores[existingTotalIndex].score = Number(update.totalScore) || 0;
      } else {
        db.totalScores.push({
          id: `total-${Date.now()}-${Math.random()}`,
          studentId: update.studentId,
          subjectId,
          semester,
          score: Number(update.totalScore) || 0,
          updatedAt: new Date().toISOString()
        });
      }

      // 2. Update daily lesson grades
      update.lessons.forEach((lUpdate: any) => {
        if (lUpdate.score === '') {
          // If empty string, delete grade if exists
          db.grades = db.grades.filter((g: any) => !(g.studentId === update.studentId && g.lessonId === lUpdate.lessonId));
        } else {
          const score = Number(lUpdate.score);
          if (!isNaN(score)) {
            const existingGradeIdx = db.grades.findIndex((g: any) => g.studentId === update.studentId && g.lessonId === lUpdate.lessonId);
            if (existingGradeIdx >= 0) {
              db.grades[existingGradeIdx].score = score;
            } else {
              db.grades.push({
                id: `grade-${Date.now()}-${Math.random()}`,
                studentId: update.studentId,
                lessonId: lUpdate.lessonId,
                subjectId,
                score,
                createdAt: new Date().toISOString()
              });
            }
          }
        }
      });
    });

    await writeDB(db);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ message: 'Error saving journal' }, { status: 500 });
  }
}
