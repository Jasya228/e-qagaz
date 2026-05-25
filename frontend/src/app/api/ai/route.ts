import { NextResponse, NextRequest } from 'next/server';
import { readDB } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const { query } = await request.json();
    const q = query.toLowerCase().trim();
    const db = await readDB();
    
    // Default response structure
    let aiResponse = {
      type: 'text',
      text: 'Я не совсем понял ваш запрос. Попробуйте переформулировать.',
      data: null as any
    };

    const students = db.students || [];
    const users = db.users || [];
    const achievements = db.achievements || [];
    const documents = db.documents || [];

    // Helper: populate student with user info
    const populateStudent = (s: any) => {
      const u = users.find((u: any) => u.id === s.userId);
      return { ...s, user: u };
    };

    // 1. INTENT: Small Talk / Conversational
    if (q.includes('привет') || q.includes('здравствуй') || q.includes('добрый день') || q.includes('хай') || q.includes('салам') || q.includes('добрый вечер') || q.includes('доброе утро') || q === 'hi' || q === 'hello') {
      return NextResponse.json({ type: 'text', text: 'Здравствуйте! Я Qagaz-ai, ваш встроенный умный помощник. Рад вас видеть! Чем могу помочь сегодня?', data: null });
    }

    if (q.includes('как дела') || q.includes('как ты') || q.includes('как сам') || q.includes('что делаешь')) {
      return NextResponse.json({ type: 'text', text: 'У меня всё отлично, мои системы работают на 100%! Анализирую данные e-Qagaz и готов выполнять ваши поручения. Как ваши дела?', data: null });
    }

    if (q.includes('кто ты') || q.includes('как тебя зовут') || q.includes('твое имя') || q === 'кто это') {
      return NextResponse.json({ type: 'text', text: 'Меня зовут Qagaz-ai! Я умный ассистент платформы e-Qagaz. Моя цель — помогать вам с навигацией, поиском студентов, просмотром достижений и анализом данных.', data: null });
    }

    if (q.includes('кто твой создатель') || q.includes('кто тебя создал') || q.includes('твой разработчик') || q.includes('кто разработчик') || q.includes('кто автор')) {
      return NextResponse.json({ type: 'text', text: 'Мой создатель — талантливый студент политеха! 😎', data: null });
    }

    if (q.includes('что ты умеешь') || q.includes('помоги') || q.includes('что можешь') || q.includes('help') || q === 'помощь') {
      return NextResponse.json({ 
        type: 'text', 
        text: 'Я могу помочь вам со следующими задачами:\n• "Найди студента [Имя]"\n• "Покажи группу ИС22-4Б" (или просто "ис22-б")\n• "Покажи всех спортсменов"\n• "Кто лучший по достижениям?"\n• "Покажи студентов 3 курса"\n• "Открой мои оценки" или "перейти в профиль"\nТакже я могу просто пообщаться с вами!', 
        data: null 
      });
    }

    if (q.includes('спасибо') || q.includes('благодарю') || q.includes('красавчик') || q.includes('молодец') || q.includes('круто') || q.includes('отлично') || q.includes('супер')) {
      return NextResponse.json({ type: 'text', text: 'Всегда пожалуйста! Рад быть полезным. Обращайтесь в любое время! 🚀', data: null });
    }

    if (q.split(/\s+/).includes('пока') || q.includes('до свидания') || q.includes('прощай') || q === 'bye') {
      return NextResponse.json({ type: 'text', text: 'До свидания! Если появятся вопросы по системе e-Qagaz, я всегда здесь. Удачи! 👋', data: null });
    }

    // 2. INTENT: Navigation / Help with site sections
    const navLower = q.toLowerCase();
    if (navLower.includes('профиль') || navLower.includes('кабинет') || navLower.includes('обо мне') || navLower.includes('аккаунт')) {
      return NextResponse.json({
        type: 'navigation',
        text: 'Вы можете перейти в свой личный профиль, чтобы посмотреть персональные данные, академические сведения и куратора.',
        data: { title: 'Мой профиль', path: '/profile', icon: 'profile' }
      });
    }
    
    if (navLower.includes('оценки') || navLower.includes('успеваемость') || (navLower.includes('балл') && !navLower.includes('достижен'))) {
      let targetPath = '/grades';
      let title = 'Успеваемость';
      let icon = 'grades';
      if (user.role === 'ADMIN') {
        targetPath = '/admin/journal';
        title = 'Журнал оценок (Админ)';
      } else if (user.role === 'HEAD_DEPARTMENT') {
        targetPath = '/head/students';
        title = 'Успеваемость студентов (Заведующий)';
      }
      return NextResponse.json({
        type: 'navigation',
        text: 'Перейдите в соответствующий раздел успеваемости для просмотра или ввода оценок:',
        data: { title, path: targetPath, icon }
      });
    }

    if (navLower.includes('документ') || navLower.includes('справк') || navLower.includes('удостоверен')) {
      return NextResponse.json({
        type: 'navigation',
        text: 'В разделе "Документы" вы можете загрузить необходимые документы или отправить запросы на справки.',
        data: { title: 'Документы', path: '/documents', icon: 'documents' }
      });
    }

    if (navLower.includes('достижен') && (navLower.includes('мои') || navLower.includes('добавить') || navLower.includes('загрузить') || navLower.includes('добавил'))) {
      return NextResponse.json({
        type: 'navigation',
        text: 'В разделе "Достижения" вы можете просмотреть свои грамоты и отправить новые на модерацию.',
        data: { title: 'Мои достижения', path: '/achievements', icon: 'achievements' }
      });
    }

    if (user.role === 'ADMIN') {
      if (navLower.includes('предмет') || navLower.includes('дисциплин')) {
        return NextResponse.json({
          type: 'navigation',
          text: 'Перейдите в справочник предметов для настройки курсов, отделений и семестров:',
          data: { title: 'Справочник предметов', path: '/admin/subjects', icon: 'admin' }
        });
      }
      if (navLower.includes('пользовател') || navLower.includes('преподавател')) {
        return NextResponse.json({
          type: 'navigation',
          text: 'Панель управления пользователями системы (добавление, редактирование, роли):',
          data: { title: 'Управление пользователями', path: '/admin/users', icon: 'admin' }
        });
      }
      if (navLower.includes('расписани') || navLower.includes('урок') || navLower.includes('заняти')) {
        return NextResponse.json({
          type: 'navigation',
          text: 'Управление расписанием и уроками для выставления оценок:',
          data: { title: 'Расписание занятий', path: '/admin/lessons', icon: 'admin' }
        });
      }
      if (navLower.includes('справочник')) {
        return NextResponse.json({
          type: 'navigation',
          text: 'Управление глобальными справочниками (группы, отделения, кураторы):',
          data: { title: 'Справочники e-Qagaz', path: '/admin/references', icon: 'admin' }
        });
      }
    }

    if (user.role === 'HEAD_DEPARTMENT') {
      if (navLower.includes('аналитик') || navLower.includes('отчет') || navLower.includes('статистик')) {
        return NextResponse.json({
          type: 'navigation',
          text: 'Вы можете просмотреть детальную аналитику и графики успеваемости в панели заведующего:',
          data: { title: 'Панель заведующего', path: '/head', icon: 'head' }
        });
      }
      if (navLower.includes('студент') || navLower.includes('список')) {
        return NextResponse.json({
          type: 'navigation',
          text: 'Поиск студентов по курсам и семестрам для проверки успеваемости:',
          data: { title: 'Успеваемость студентов', path: '/head/students', icon: 'head' }
        });
      }
    }

    // 3. INTENT: Find Athletes
    if (q.includes('спортсмен') || (q.includes('спорт') && q.includes('покажи'))) {
      const athleteIds = achievements
        .filter((a: any) => a.category === 'SPORT' || a.scale === 'По спорту' || a.title.toLowerCase().includes('спорт'))
        .map((a: any) => a.studentId);
      
      const uniqueAthleteIds = [...new Set(athleteIds)];
      const athletes = students
        .filter((s: any) => uniqueAthleteIds.includes(s.userId))
        .map(populateStudent);

      aiResponse = {
        type: 'student_list',
        text: `Я проанализировал достижения и нашел ${athletes.length} студентов со спортивными результатами:`,
        data: athletes
      };
      return NextResponse.json(aiResponse);
    }

    // 4. INTENT: Achievements / Leaderboard
    if (q.includes('больше всего достижений') || q.includes('рейтинг') || q.includes('лучшие студент') || q.includes('топ')) {
      const counts: Record<string, number> = {};
      achievements.forEach((a: any) => {
        counts[a.studentId] = (counts[a.studentId] || 0) + 1;
      });

      const sortedIds = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 5);
      const topStudents = sortedIds.map(id => {
        const s = students.find((st: any) => st.userId === id);
        return {
          student: populateStudent(s),
          count: counts[id]
        };
      }).filter(item => item.student !== undefined);

      aiResponse = {
        type: 'leaderboard',
        text: 'Вот топ студентов по количеству достижений:',
        data: topStudents
      };
      return NextResponse.json(aiResponse);
    }

    if (q.includes('достижен') || q.includes('наград') || q.includes('грамот')) {
      const ignoreWords = ['найди', 'покажи', 'студента', 'ученика', 'мне', 'где', 'информацию', 'про', 'достижения', 'достижении', 'награды', 'грамоты'];
      const studentNameWords = q.split(/\s+/).filter(w => !ignoreWords.includes(w) && w.length > 2);
      
      let targetStudent = null;
      if (studentNameWords.length > 0) {
        targetStudent = students.find((s: any) => {
          const u = users.find((user: any) => user.id === s.userId);
          if (!u) return false;
          const fullName = `${u.lastName} ${u.firstName} ${u.patronymic || ''}`.toLowerCase();
          return studentNameWords.some(w => fullName.includes(w));
        });
      }

      if (targetStudent) {
        const u = users.find((user: any) => user.id === targetStudent.userId);
        const studentAchievements = achievements.filter((a: any) => a.studentId === targetStudent.userId);
        if (studentAchievements.length > 0) {
          const achList = studentAchievements.map((a: any) => `• **${a.title}** (${a.scale || 'Внутри колледжа'})`).join('\n');
          return NextResponse.json({
            type: 'text',
            text: `Вот достижения студента ${u.lastName} ${u.firstName}:\n${achList}`,
            data: studentAchievements
          });
        } else {
          return NextResponse.json({
            type: 'text',
            text: `У студента ${u.lastName} ${u.firstName} пока нет зарегистрированных достижений.`,
            data: null
          });
        }
      } else {
        const latestAchievements = achievements.slice(-5).reverse();
        if (latestAchievements.length > 0) {
          const list = latestAchievements.map((a: any) => {
            const s = students.find((st: any) => st.userId === a.studentId);
            const u = s ? users.find((usr: any) => usr.id === s.userId) : null;
            const studentName = u ? `${u.lastName} ${u.firstName}` : 'Неизвестный студент';
            return `• **${studentName}**: ${a.title} (${a.scale || 'Внутри колледжа'})`;
          }).join('\n');
          return NextResponse.json({
            type: 'text',
            text: `Вот последние достижения в системе:\n${list}`,
            data: latestAchievements
          });
        }
      }
    }

    // 5. INTENT: Filter by Course
    const courseMatch = q.match(/(\d)\s*курс/);
    if (courseMatch) {
      const courseNum = Number(courseMatch[1]);
      const courseStudents = students
        .filter((s: any) => s.courseYear === courseNum)
        .map(populateStudent);
      
      aiResponse = {
        type: 'student_list',
        text: `Я нашел ${courseStudents.length} студентов на ${courseNum} курсе:`,
        data: courseStudents
      };
      return NextResponse.json(aiResponse);
    }

    // 6. INTENT: Analytics / Stats
    if (q.includes('сколько') && q.includes('документ')) {
      aiResponse = {
        type: 'text',
        text: `В системе сейчас загружено документов: ${documents.length}.`,
        data: null
      };
      return NextResponse.json(aiResponse);
    }
    
    if (q.includes('успеваемость') && q.includes('низк')) {
      aiResponse = {
        type: 'text',
        text: 'К сожалению, глубокий анализ успеваемости пока формируется. Рекомендую зайти в раздел "Журнал" для просмотра итоговых оценок.',
        data: null
      };
      return NextResponse.json(aiResponse);
    }

    // 7. INTENT: Search by Group
    const dbGroups = db.groups || [];
    const matchedGroups = dbGroups.filter((g: any) => {
      const gName = g.name.toLowerCase();
      if (q.includes(gName)) return true;
      const words = q.split(/[\s-]+/).filter((w: string) => w.length >= 3);
      return words.some((w: string) => gName.includes(w) || w.includes(gName));
    });

    if (matchedGroups.length > 0) {
      const matchedGroupNames = matchedGroups.map((g: any) => g.name.toLowerCase());
      const groupStudents = students
        .filter((s: any) => s.groupName && matchedGroupNames.includes(s.groupName.toLowerCase()))
        .map(populateStudent);
        
      const groupNamesStr = matchedGroups.map((g: any) => g.name).join(', ');
      
      if (groupStudents.length > 0) {
        return NextResponse.json({
          type: 'student_list',
          text: `Я нашел ${groupStudents.length} студентов в группе ${groupNamesStr}:`,
          data: groupStudents
        });
      } else {
        return NextResponse.json({
          type: 'text',
          text: `Группа ${groupNamesStr} найдена, но в ней пока нет зарегистрированных студентов.`,
          data: null
        });
      }
    }

    // 8. INTENT: Search Specific Student
    const ignoreWords = ['найди', 'покажи', 'студента', 'ученика', 'мне', 'где', 'информацию', 'про'];
    const queryWords = q.split(/\s+/).filter(w => !ignoreWords.includes(w) && w.length > 2);

    if (queryWords.length > 0) {
      const matched = students.filter((s: any) => {
        const u = users.find((user: any) => user.id === s.userId);
        if (!u) return false;
        const fullName = `${u.lastName} ${u.firstName} ${u.patronymic || ''}`.toLowerCase();
        return queryWords.some(w => fullName.includes(w));
      });

      if (matched.length === 1) {
        return NextResponse.json({
          type: 'student_card',
          text: 'Я нашел этого студента в базе данных:',
          data: populateStudent(matched[0])
        });
      } else if (matched.length > 1) {
        return NextResponse.json({
          type: 'student_list',
          text: `Я нашел несколько студентов, подходящих под запрос:`,
          data: matched.map(populateStudent)
        });
      } else {
        const isExplicitSearch = q.includes('найди') || q.includes('покажи') || q.includes('студент') || q.includes('поиск') || q.includes('кто такой');
        if (isExplicitSearch) {
          return NextResponse.json({
            type: 'text',
            text: 'К сожалению, я не смог найти студентов с таким именем.',
            data: null
          });
        }
      }
    }

    // 9. Fallback response
    return NextResponse.json({
      type: 'text',
      text: 'Интересный запрос! Как специализированный ИИ-помощник Qagaz-ai, я лучше всего справляюсь с поиском по базе e-Qagaz (студенты, группы, достижения, статистика) и навигацией по сайту. Напишите "что ты умеешь", чтобы посмотреть примеры команд.',
      data: null
    });

  } catch (error) {
    return NextResponse.json({ type: 'text', text: 'Произошла системная ошибка при обработке запроса.', data: null });
  }
}
