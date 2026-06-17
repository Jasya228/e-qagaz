"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminReferencesPage() {
  const [data, setData] = useState({ groups: [], curators: [], departments: [], subjects: [] });
  const [loading, setLoading] = useState(true);

  // Form states
  const [groupName, setGroupName] = useState('');
  const [deptName, setDeptName] = useState('');
  const [subjName, setSubjName] = useState('');
  const [subjCourse, setSubjCourse] = useState(1);
  const [subjSem, setSubjSem] = useState(1);

  const fetchReferences = async () => {
    try {
      const res = await api.get('/admin/references');
      setData(res.data);
    } catch (err) {
      toast.error('Ошибка загрузки справочников');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferences();
  }, []);

  const handleAdd = async (type: string, payload: any, resetFn: () => void) => {
    if (!payload.name) return;
    try {
      await api.post('/admin/references', { type, payload });
      toast.success('Добавлено успешно');
      resetFn();
      fetchReferences();
    } catch (err) {
      toast.error('Ошибка добавления');
    }
  };

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('Удалить эту запись?')) return;
    try {
      await api.delete(`/admin/references?type=${type}&id=${id}`);
      toast.success('Удалено успешно');
      fetchReferences();
    } catch (err) {
      toast.error('Ошибка удаления');
    }
  };

  if (loading) return <div className="text-gray-400">Загрузка...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Справочники</h2>
        <p className="text-gray-400 mt-1">Управление выпадающими списками системы</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* GROUPS */}
        <div className="glass-card p-6 flex flex-col h-full">
          <h3 className="text-lg font-bold text-white mb-4">Учебные группы</h3>
          <div className="flex gap-2 mb-4">
            <input 
              type="text" 
              placeholder="Название (напр. CS-202)" 
              value={groupName} 
              onChange={e => setGroupName(e.target.value)} 
              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-accent"
            />
            <button onClick={() => handleAdd('groups', { name: groupName }, () => setGroupName(''))} className="p-2 bg-accent text-white rounded-xl hover:bg-blue-600 transition-colors">
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto max-h-80 space-y-2 custom-scrollbar pr-2">
            {data.groups.map((g: any) => (
              <div key={g.id} className="flex justify-between items-center p-3 bg-white/5 border border-white/5 rounded-xl">
                <span className="text-gray-300 text-sm">{g.name}</span>
                <button onClick={() => handleDelete('groups', g.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {data.groups.length === 0 && <p className="text-sm text-gray-500">Нет добавленных групп</p>}
          </div>
        </div>


        {/* DEPARTMENTS */}
        <div className="glass-card p-6 flex flex-col h-full">
          <h3 className="text-lg font-bold text-white mb-4">Отделения</h3>
          <div className="flex gap-2 mb-4">
            <input 
              type="text" 
              placeholder="Название отделения" 
              value={deptName} 
              onChange={e => setDeptName(e.target.value)} 
              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-accent"
            />
            <button onClick={() => handleAdd('departments', { name: deptName }, () => setDeptName(''))} className="p-2 bg-accent text-white rounded-xl hover:bg-blue-600 transition-colors">
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto max-h-80 space-y-2 custom-scrollbar pr-2">
            {data.departments.map((d: any) => (
              <div key={d.id} className="flex justify-between items-center p-3 bg-white/5 border border-white/5 rounded-xl">
                <span className="text-gray-300 text-sm">{d.name}</span>
                <button onClick={() => handleDelete('departments', d.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {data.departments.length === 0 && <p className="text-sm text-gray-500">Нет добавленных отделений</p>}
          </div>
        </div>

        {/* SUBJECTS */}
        <div className="glass-card p-6 flex flex-col h-full md:col-span-2 lg:col-span-1">
          <h3 className="text-lg font-bold text-white mb-4">Предметы</h3>
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex gap-2">
              <select value={subjCourse} onChange={e => setSubjCourse(Number(e.target.value))} className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-accent">
                <option value={1}>1 курс</option>
                <option value={2}>2 курс</option>
                <option value={3}>3 курс</option>
                <option value={4}>4 курс</option>
              </select>
              <select value={subjSem} onChange={e => setSubjSem(Number(e.target.value))} className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-accent">
                <option value={1}>1 семестр</option>
                <option value={2}>2 семестр</option>
              </select>
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Название предмета" 
                value={subjName} 
                onChange={e => setSubjName(e.target.value)} 
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-accent"
              />
              <button 
                onClick={() => handleAdd('subjects', { name: subjName, courseYear: subjCourse, semester: subjSem }, () => setSubjName(''))} 
                className="p-2 bg-accent text-white rounded-xl hover:bg-blue-600 transition-colors"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto max-h-80 space-y-2 custom-scrollbar pr-2">
            {data.subjects?.map((s: any) => (
              <div key={s.id} className="flex justify-between items-center p-3 bg-white/5 border border-white/5 rounded-xl">
                <div>
                  <span className="text-gray-300 text-sm block">{s.name}</span>
                  <span className="text-gray-500 text-xs block">{s.courseYear} курс, {s.semester} сем.</span>
                </div>
                <button onClick={() => handleDelete('subjects', s.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {(!data.subjects || data.subjects.length === 0) && <p className="text-sm text-gray-500">Нет добавленных предметов</p>}
          </div>
        </div>

      </div>
    </div>
  );
}
