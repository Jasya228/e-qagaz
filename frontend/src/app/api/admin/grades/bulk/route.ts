import { NextResponse, NextRequest } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const lessonId = searchParams.get('lessonId');
  const subjectId = searchParams.get('subjectId');
  const groupName = searchParams.get('groupName');

  const db = await readDB();
  
  let students = db.students || [];
  if (groupName) {
    students = students.filter((s: any) => s.groupName === groupName);
  }

  // Get users for these students
  const studentUsers = students.map((s: any) => {
    const u = db.users.find((user: any) => user.id === s.userId);
    return { ...s, user: u };
  });

  // Get existing grades for the lesson
  const grades = (db.grades || []).filter((g: any) => g.lessonId === lessonId);
  
  // Get existing total scores for the subject
  const totalScores = (db.totalScores || []).filter((t: any) => t.subjectId === subjectId);

  return NextResponse.json({
    students: studentUsers,
    grades,
    totalScores
  });
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  try {
    const { lessonId, subjectId, semester, updates } = await request.json();
    const db = await readDB();

    if (!db.grades) db.grades = [];
    if (!db.totalScores) db.totalScores = [];

    // updates is an array: { studentId, score, totalScore }
    for (const update of updates) {
      // Update Daily Grade
      if (update.score !== undefined && update.score !== null && update.score !== '') {
        const existingGradeIndex = db.grades.findIndex((g: any) => g.studentId === update.studentId && g.lessonId === lessonId);
        if (existingGradeIndex >= 0) {
          db.grades[existingGradeIndex].score = Number(update.score);
        } else {
          db.grades.push({
            id: `grade-${Date.now()}-${Math.random()}`,
            studentId: update.studentId,
            lessonId,
            subjectId,
            score: Number(update.score),
            createdAt: new Date().toISOString()
          });
        }
      }

      // Update Total Score
      if (update.totalScore !== undefined && update.totalScore !== null && update.totalScore !== '') {
        const existingTotalIndex = db.totalScores.findIndex((t: any) => t.studentId === update.studentId && t.subjectId === subjectId && t.semester === semester);
        if (existingTotalIndex >= 0) {
          db.totalScores[existingTotalIndex].score = Number(update.totalScore);
        } else {
          db.totalScores.push({
            id: `total-${Date.now()}-${Math.random()}`,
            studentId: update.studentId,
            subjectId,
            semester,
            score: Number(update.totalScore)
          });
        }
      }
    }

    await writeDB(db);
    return NextResponse.json({ message: 'Grades updated successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Error updating grades' }, { status: 500 });
  }
}
