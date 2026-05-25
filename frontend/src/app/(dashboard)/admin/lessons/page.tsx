"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Calendar, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLessonsPage() {
  const [data, setData] = useState({ lessons: [], subjects: [], groups: [] });
  const [loading, setLoading] = useState(true);

  // Form State
  const [courseYear, setCourseYear] = useState(1);
  const [semester, setSemester] = useState(1);
  const [groupName, setGroupName] = useState('');
  const [subjectId, setSubjectId] = useState('');
  
  const [lessonCount, setLessonCount] = useState(1);
  const [dates, setDates] = useState<string[]>(['']);

  const fetchAll = async () => {
    try {
      const [resL, resR, resS] = await Promise.all([
        api.get('/admin/lessons'),
        api.get('/admin/references'),
        api.get('/subjects')
      ]);
      setData({
        lessons: resL.data.lessons || [],
        groups: resR.data.groups || [],
        subjects: resS.data || []
      });
    } catch (err) {
      toast.error('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleLessonCountChange = (count: number) => {
    const newCount = Math.max(1, count);
    setLessonCount(newCount);
    setDates(Array(newCount).fill(''));
  };

  const handleDateChange = (index: number, value: string) => {
    const newDates = [...dates];
    newDates[index] = value;
    setDates(newDates);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName || !subjectId) {
      toast.error('Заполните все поля (Группа и Предмет)');
      return;
    }
    if (dates.some(d => !d)) {
      toast.error('Заполните все даты уроков');
      return;
    }
    
    try {
      await api.post('/admin/lessons/bulk-create', { 
        courseYear, 
        semester, 
        groupName, 
        subjectId, 
        dates 
      });
      toast.success('Уроки успешно назначены');
      setDates(['']);
      setLessonCount(1);
      setSubjectId('');
      fetchAll();
    } catch (err) {
      toast.error('Ошибка назначения уроков');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить этот урок? Будут удалены все оценки за этот день.')) return;
    try {
      await api.delete(`/admin/lessons?id=${id}`);
      toast.success('Урок удален');
      fetchAll();
    } catch (err) {
      toast.error('Ошибка удаления');
    }
  };

  // Filter subjects based on course and semester
  const availableSubjects = data.subjects.filter((s: any) => 
    s.courseYear === courseYear && s.semester === semester
  );

  if (loading) return <div className="text-gray-400">Загрузка...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Назначение уроков</h2>
          <p className="text-gray-400 mt-1">Привязка предмета к группе и выбор дат проведения уроков</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form */}
        <div className="lg:col-span-1 glass-card p-6 h-fit">
          <h3 className="text-lg font-bold text-white mb-4">Назначить уроки</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Группа</label>
              <select value={groupName} onChange={e => setGroupName(e.target.value)} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white">
                <option value="">Выберите группу...</option>
                {data.groups.map((g: any) => <option key={g.id} value={g.name}>{g.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Предмет</label>
              <select value={subjectId} onChange={e => setSubjectId(e.target.value)} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white">
                <option value="">Выберите предмет...</option>
                {availableSubjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              {availableSubjects.length === 0 && (
                <p className="text-xs text-yellow-500 mt-1">Нет предметов для этого курса/семестра.</p>
              )}
            </div>

            <div className="border-t border-white/10 pt-4 mt-4">
              <label className="block text-sm text-gray-400 mb-1">Количество уроков</label>
              <input type="number" min="1" max="30" value={lessonCount} onChange={e => handleLessonCountChange(Number(e.target.value))} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white" />
            </div>

            <div className="space-y-3 mt-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
              {dates.map((date, idx) => (
                <div key={idx}>
                  <label className="block text-xs text-gray-500 mb-1">Урок {idx + 1}</label>
                  <input type="date" required value={date} onChange={e => handleDateChange(idx, e.target.value)} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300" />
                </div>
              ))}
            </div>

            <button type="submit" disabled={availableSubjects.length === 0} className="w-full flex items-center justify-center gap-2 py-2 mt-4 bg-accent text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50">
              <Plus className="h-5 w-5" /> Назначить уроки
            </button>
          </form>
        </div>

        {/* List of Lessons */}
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-4">Назначенные уроки</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-400">
              <thead className="bg-white/5 text-gray-300 border-b border-white/10">
                <tr>
                  <th className="px-4 py-3">Дата</th>
                  <th className="px-4 py-3">Группа</th>
                  <th className="px-4 py-3">Предмет</th>
                  <th className="px-4 py-3 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.lessons.map((l: any) => {
                  const sub = data.subjects.find((s:any) => s.id === l.subjectId);
                  return (
                    <tr key={l.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-medium text-white flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-accent" /> {new Date(l.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-white">{l.groupName || 'Н/Д'}</td>
                      <td className="px-4 py-3">{sub?.name || 'Н/Д'}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleDelete(l.id)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {data.lessons.length === 0 && <p className="text-center py-8 text-gray-500">Нет добавленных уроков</p>}
          </div>
        </div>

      </div>
    </div>
  );
}
