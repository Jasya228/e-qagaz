"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Save, Users, Calendar } from 'lucide-react';

export default function AdminGradesPage() {
  const [references, setReferences] = useState({ groups: [] });
  const [lessonsData, setLessonsData] = useState({ lessons: [], subjects: [] });
  
  const [courseYear, setCourseYear] = useState<number>(1);
  const [groupName, setGroupName] = useState('');
  const [lessonId, setLessonId] = useState('');

  const [studentsData, setStudentsData] = useState<any[]>([]);
  const [gradesState, setGradesState] = useState<Record<string, { score: string, totalScore: string }>>({});
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/admin/references').then(res => setReferences(res.data)).catch(() => {});
    api.get('/admin/lessons').then(res => setLessonsData(res.data)).catch(() => {});
  }, []);

  const selectedLesson = lessonsData.lessons.find((l: any) => l.id === lessonId) as any;
  const filteredLessons = lessonsData.lessons.filter((l: any) => l.courseYear === courseYear);

  useEffect(() => {
    if (groupName && lessonId && selectedLesson) {
      fetchGrades();
    } else {
      setStudentsData([]);
    }
  }, [groupName, lessonId]);

  const fetchGrades = async () => {
    setLoadingGrades(true);
    try {
      const res = await api.get(`/admin/grades/bulk?lessonId=${lessonId}&subjectId=${selectedLesson.subjectId}&groupName=${groupName}`);
      const { students, grades, totalScores } = res.data;
      
      setStudentsData(students);

      const newState: Record<string, { score: string, totalScore: string }> = {};
      students.forEach((s: any) => {
        const studentGrade = grades.find((g: any) => g.studentId === s.userId);
        const studentTotal = totalScores.find((t: any) => t.studentId === s.userId && t.semester === selectedLesson.semester);
        
        newState[s.userId] = {
          score: studentGrade ? String(studentGrade.score) : '',
          totalScore: studentTotal ? String(studentTotal.score) : '0'
        };
      });
      setGradesState(newState);

    } catch (err) {
      toast.error('Ошибка загрузки журнала');
    } finally {
      setLoadingGrades(false);
    }
  };

  const handleGradeChange = (studentId: string, field: 'score' | 'totalScore', value: string) => {
    setGradesState(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    if (!selectedLesson) return;
    setSaving(true);
    try {
      const updates = Object.keys(gradesState).map(studentId => ({
        studentId,
        score: gradesState[studentId].score,
        totalScore: gradesState[studentId].totalScore
      }));

      await api.post('/admin/grades/bulk', {
        lessonId: selectedLesson.id,
        subjectId: selectedLesson.subjectId,
        semester: selectedLesson.semester,
        updates
      });

      toast.success('Журнал сохранен!');
    } catch (err) {
      toast.error('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Журнал успеваемости</h2>
          <p className="text-gray-400 mt-1">Здесь вы можете массово выставлять оценки студентам за конкретные даты занятий.</p>
        </div>
      </div>

      {/* Helper Step Box */}
      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-start gap-3">
        <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400 mt-0.5">
          <Calendar className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-blue-400 font-bold text-sm mb-1">Как заполнять журнал:</h4>
          <p className="text-xs text-blue-300/80 leading-relaxed">
            1. Выберите курс и группу студентов.<br/>
            2. Выберите дату занятия по нужному предмету (даты создаются в Справочнике занятий).<br/>
            3. Проставьте баллы за этот день и, при необходимости, обновите "Итоговую оценку" за семестр.<br/>
            4. Нажмите "Сохранить всё".
          </p>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Курс</label>
            <select value={courseYear} onChange={e => {setCourseYear(Number(e.target.value)); setLessonId('');}} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white">
              <option value={1}>1 курс</option>
              <option value={2}>2 курс</option>
              <option value={3}>3 курс</option>
              <option value={4}>4 курс</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Группа</label>
            <select value={groupName} onChange={e => setGroupName(e.target.value)} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white">
              <option value="">Выберите группу...</option>
              {references.groups.map((g: any) => <option key={g.id} value={g.name}>{g.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Занятие (Предмет и Дата)</label>
            <select value={lessonId} onChange={e => setLessonId(e.target.value)} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white">
              <option value="">Выберите урок...</option>
              {filteredLessons.map((l: any) => {
                const sub = lessonsData.subjects.find((s:any) => s.id === l.subjectId);
                return <option key={l.id} value={l.id}>{new Date(l.date).toLocaleDateString()} - {sub?.name}</option>
              })}
            </select>
          </div>
        </div>

        {selectedLesson && groupName && (
          <div className="border-t border-white/10 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-accent" /> Студенты группы {groupName}
              </h3>
              <button 
                onClick={handleSave} 
                disabled={saving || studentsData.length === 0}
                className="flex items-center gap-2 px-6 py-2 bg-accent text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" /> {saving ? 'Сохранение...' : 'Сохранить всё'}
              </button>
            </div>

            {loadingGrades ? (
              <div className="text-center py-8 text-gray-400">Загрузка журнала...</div>
            ) : studentsData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">В этой группе нет студентов</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                  <thead className="bg-white/5 text-gray-300 border-b border-white/10">
                    <tr>
                      <th className="px-4 py-3">ФИО Студента</th>
                      <th className="px-4 py-3">Оценка за занятие (0-100)</th>
                      <th className="px-4 py-3">Итоговая оценка (Total)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {studentsData.map((s) => (
                      <tr key={s.userId} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 font-medium text-white">
                          {s.user?.lastName} {s.user?.firstName}
                        </td>
                        <td className="px-4 py-3">
                          <input 
                            type="number" 
                            min="0" max="100"
                            value={gradesState[s.userId]?.score || ''}
                            onChange={(e) => handleGradeChange(s.userId, 'score', e.target.value)}
                            placeholder="Нет оценки"
                            className="w-32 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-accent"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input 
                            type="number" 
                            min="0" max="100"
                            value={gradesState[s.userId]?.totalScore || '0'}
                            onChange={(e) => handleGradeChange(s.userId, 'totalScore', e.target.value)}
                            className="w-32 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-lg text-accent font-bold focus:ring-2 focus:ring-accent"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
