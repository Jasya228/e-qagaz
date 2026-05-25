import { NextResponse, NextRequest } from 'next/server';
import { readDB } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'STUDENT') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const semesterStr = searchParams.get('semester'); // e.g. "1-1" (Course 1, Sem 1)
  const search = searchParams.get('search')?.toLowerCase() || '';

  const db = await readDB();

  // Find student profile
  const student = (db.students || []).find((s: any) => s.userId === user.sub);
  if (!student) return NextResponse.json({ data: [] });

  const courseYear = parseInt(semesterStr?.split('-')[0] || '1', 10);
  const semester = parseInt(semesterStr?.split('-')[1] || '1', 10);

  // Get subjects that have lessons for this course/semester
  const relevantLessons = (db.lessons || []).filter((l: any) => l.courseYear === courseYear && l.semester === semester);
  
  const subjectMap = new Map();
  
  // Initialize map with all subjects that have lessons in this semester
  for (const lesson of relevantLessons) {
    if (!subjectMap.has(lesson.subjectId)) {
      const sub = (db.subjects || []).find((s: any) => s.id === lesson.subjectId);
      if (sub && (!search || sub.name.toLowerCase().includes(search))) {
          subjectMap.set(lesson.subjectId, {
            subjectName: sub.name,
            grades: [],
            finalScore: 0
          });
        }
      }
    }

    // Populate daily scores
    const myGrades = (db.grades || []).filter((g: any) => g.studentId === user.sub);
    for (const grade of myGrades) {
      const lesson = relevantLessons.find((l: any) => l.id === grade.lessonId);
      if (lesson && subjectMap.has(grade.subjectId)) {
        subjectMap.get(grade.subjectId).grades.push({
          date: lesson.date,
          score: grade.score
        });
      }
    }

    // Sort grades by date for each subject
    for (const subject of subjectMap.values()) {
      subject.grades.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    // Populate total scores
    const myTotalScores = (db.totalScores || []).filter((t: any) => t.studentId === user.sub && t.semester === semester);
    for (const tScore of myTotalScores) {
      if (subjectMap.has(tScore.subjectId)) {
        subjectMap.get(tScore.subjectId).finalScore = tScore.score;
      } else {
        // If there's a total score but no daily lessons yet
        const sub = (db.subjects || []).find((s: any) => s.id === tScore.subjectId);
        if (sub && (!search || sub.name.toLowerCase().includes(search))) {
          subjectMap.set(tScore.subjectId, {
            subjectName: sub.name,
            grades: [],
            finalScore: tScore.score
          });
        }
      }
    }

  const data = Array.from(subjectMap.values());

  return NextResponse.json({ data });
}
