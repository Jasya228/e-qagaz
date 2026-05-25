import { NextResponse, NextRequest } from 'next/server';
import { readDB } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'HEAD_DEPARTMENT') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.toLowerCase() || '';

  const db = await readDB();

  // Find department of Head
  const department = db.departments?.find((d: any) => d.headUserId === user.sub);
  if (!department) return NextResponse.json({ message: 'Отделение не найдено' }, { status: 404 });

  // Get students of this department
  let students = db.students?.filter((s: any) => s.departmentId === department.id) || [];
  
  // Attach user profiles
  students = students.map((s: any) => {
    const u = db.users?.find((u: any) => u.id === s.userId);
    return { ...s, user: u };
  });

  let matchedStudents = [];
  let message = '';

  if (query.includes('спорт')) {
    // Find athletes
    const achievements = db.achievements || [];
    matchedStudents = students.filter((s: any) => {
      const sAchs = achievements.filter((a: any) => a.studentId === s.userId);
      return sAchs.some((a: any) => a.category === 'SPORT' || a.scale === 'По спорту' || a.title.toLowerCase().includes('спорт'));
    });
    message = `Я нашел ${matchedStudents.length} студентов-спортсменов:`;
  } else if (query.includes('групп')) {
    // try to extract group name
    const words = query.split(' ');
    const groupIdx = words.findIndex(w => w.includes('групп'));
    if (groupIdx >= 0 && groupIdx + 1 < words.length) {
      const gName = words[groupIdx + 1].toUpperCase();
      matchedStudents = students.filter((s: any) => s.groupName?.toUpperCase().includes(gName));
      message = `Я нашел ${matchedStudents.length} студентов из группы ${gName}:`;
    } else {
      matchedStudents = students;
      message = `Я не понял название группы. Вывожу всех студентов:`;
    }
  } else {
    // Robust Name search
    const ignoreWords = ['найди', 'покажи', 'студента', 'ученика', 'мне', 'где'];
    const queryWords = query.split(/\s+/).filter(w => !ignoreWords.includes(w) && w.length > 2);
    
    if (queryWords.length === 0) {
       matchedStudents = students;
       message = "Вывожу всех студентов:";
    } else {
       matchedStudents = students.filter((s: any) => {
         const fullName = `${s.user?.lastName?.toLowerCase()} ${s.user?.firstName?.toLowerCase()}`;
         // Check if any significant word from query matches part of the name
         return queryWords.some(w => fullName.includes(w));
       });
       message = `Результаты поиска:`;
    }
  }

  return NextResponse.json({ message, students: matchedStudents });
}
