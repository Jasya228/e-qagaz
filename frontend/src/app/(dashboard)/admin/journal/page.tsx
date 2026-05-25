"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Save, Users, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminJournalPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Selection
  const [courseYear, setCourseYear] = useState<number>(1);
  const [semester, setSemester] = useState<number>(1);
  const [groupName, setGroupName] = useState('');
  const [subjectId, setSubjectId] = useState('');

  // References
  const [groups, setGroups] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  // Journal Data
  const [students, setStudents] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  
  // gradesState shape: { [studentId]: { [lessonId]: string, totalScore: string } }
  const [gradesState, setGradesState] = useState<Record<string, any>>({});

  useEffect(() => {
    api.get('/admin/references').then(res => setGroups(res.data.groups || [])).catch(() => {});
    api.get('/subjects').then(res => setSubjects(res.data || [])).catch(() => {});
  }, []);

  const availableSubjects = subjects.filter(s => s.courseYear === courseYear && s.semester === semester);

  useEffect(() => {
    if (groupName && subjectId) {
      fetchJournal();
    } else {
      setStudents([]);
      setLessons([]);
      setGradesState({});
    }
  }, [courseYear, semester, groupName, subjectId]);

  const fetchJournal = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/journal?groupName=${groupName}&subjectId=${subjectId}&semester=${semester}`);
      const { students, lessons, grades, totalScores } = res.data;
      
      setStudents(students);
      
      // Sort lessons by date
      const sortedLessons = lessons.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setLessons(sortedLessons);

      const newState: Record<string, any> = {};
      students.forEach((s: any) => {
        newState[s.userId] = { totalScore: '0' };
        
        const tScore = totalScores.find((t: any) => t.studentId === s.userId);
        if (tScore) newState[s.userId].totalScore = String(tScore.score);

        sortedLessons.forEach((l: any) => {
          const grade = grades.find((g: any) => g.studentId === s.userId && g.lessonId === l.id);
          newState[s.userId][l.id] = grade ? String(grade.score) : '';
        });
      });

      setGradesState(newState);
    } catch (err) {
      toast.error('Ошибка загрузки журнала');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (studentId: string, field: string, value: string) => {
    setGradesState(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = Object.keys(gradesState).map(studentId => ({
        studentId,
        totalScore: gradesState[studentId].totalScore,
        lessons: lessons.map(l => ({
          lessonId: l.id,
          score: gradesState[studentId][l.id]
        }))
      }));

      await api.post('/admin/journal', {
        subjectId,
        semester,
        updates
      });

      toast.success('Журнал сохранен!');
    } catch (err) {
      toast.error('Ошибка сохранения журнала');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Журнал</h2>
          <p className="text-gray-400 mt-1">Единая ведомость успеваемости</p>
        </div>
      </div>

      <div className="glass-card p-6">
        {/* FILTERS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 border-b border-white/10 pb-6">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Курс</label>
            <select value={courseYear} onChange={e => {setCourseYear(Number(e.target.value)); setSubjectId('');}} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white">
              <option value={1}>1 курс</option>
              <option value={2}>2 курс</option>
              <option value={3}>3 курс</option>
              <option value={4}>4 курс</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Семестр</label>
            <select value={semester} onChange={e => {setSemester(Number(e.target.value)); setSubjectId('');}} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white">
              <option value={1}>1 семестр</option>
              <option value={2}>2 семестр</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Группа</label>
            <select value={groupName} onChange={e => setGroupName(e.target.value)} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white">
              <option value="">Выберите группу...</option>
              {groups.map((g: any) => <option key={g.id} value={g.name}>{g.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Предмет</label>
            <select value={subjectId} onChange={e => setSubjectId(e.target.value)} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white">
              <option value="">Выберите предмет...</option>
              {availableSubjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        {/* JOURNAL GRID */}
        {groupName && subjectId ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-accent" /> Журнал группы {groupName}
              </h3>
              <button 
                onClick={handleSave} 
                disabled={saving || students.length === 0}
                className="flex items-center gap-2 px-6 py-2 bg-accent text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 shadow-lg shadow-blue-500/20"
              >
                <Save className="h-4 w-4" /> {saving ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-400">Загрузка журнала...</div>
            ) : students.length === 0 ? (
              <div className="text-center py-12 text-gray-500">В этой группе нет студентов</div>
            ) : lessons.length === 0 ? (
              <div className="text-center py-12 text-gray-500 border border-white/5 rounded-xl bg-white/5">
                Для этой группы и предмета еще не назначены уроки.<br/>
                Перейдите в раздел "Оценки" (Назначение уроков), чтобы создать даты занятий.
              </div>
            ) : (
              <div className="overflow-x-auto pb-4 custom-scrollbar">
                <table className="w-full text-sm text-left text-gray-400 whitespace-nowrap">
                  <thead className="bg-white/5 text-gray-300 border-b border-white/10">
                    <tr>
                      <th className="px-4 py-3 sticky left-0 bg-[#0F172A] z-10 min-w-[200px]">ФИО Студента</th>
                      {lessons.map(l => (
                        <th key={l.id} className="px-2 py-3 text-center border-l border-white/5">
                          <div className="text-xs text-gray-500 font-normal">Урок</div>
                          <div className="font-medium text-white">{new Date(l.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}</div>
                        </th>
                      ))}
                      <th className="px-4 py-3 text-center border-l border-white/10 bg-accent/5 text-accent min-w-[120px]">
                        Итоговая
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {students.map((s) => (
                      <tr key={s.userId} className="hover:bg-white/5 transition-colors group">
                        <td className="px-4 py-3 font-medium text-white sticky left-0 bg-[#0F172A] group-hover:bg-[#1a2333] transition-colors z-10">
                          {s.user?.lastName} {s.user?.firstName}
                        </td>
                        
                        {/* LESSON COLUMNS */}
                        {lessons.map(l => (
                          <td key={l.id} className="px-2 py-2 text-center border-l border-white/5">
                            <input 
                              type="number" 
                              min="0" max="100"
                              value={gradesState[s.userId]?.[l.id] || ''}
                              onChange={(e) => handleGradeChange(s.userId, l.id, e.target.value)}
                              placeholder="-"
                              className="w-14 px-1 py-1.5 text-center bg-white/5 border border-white/10 rounded text-white focus:ring-1 focus:ring-accent focus:bg-white/10 transition-colors"
                            />
                          </td>
                        ))}

                        {/* TOTAL SCORE COLUMN */}
                        <td className="px-4 py-2 text-center border-l border-white/10 bg-accent/5">
                          <input 
                            type="number" 
                            min="0" max="100"
                            value={gradesState[s.userId]?.totalScore || '0'}
                            onChange={(e) => handleGradeChange(s.userId, 'totalScore', e.target.value)}
                            className="w-20 px-2 py-1.5 text-center bg-accent/20 border border-accent/30 rounded text-accent font-bold focus:ring-2 focus:ring-accent transition-colors"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
           <div className="text-center py-16 text-gray-500">
             Выберите курс, семестр, группу и предмет для отображения журнала
           </div>
        )}
      </div>
    </div>
  );
}
