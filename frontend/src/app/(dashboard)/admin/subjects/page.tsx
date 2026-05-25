"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', description: '', credits: 3, courseYear: 1, semester: 1, departmentId: ''
  });

  const fetchSubjectsAndDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/subjects');
      setSubjects(res.data);
      const depRes = await api.get('/admin/references');
      setDepartments(depRes.data.departments || []);
    } catch (err) {
      toast.error('Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjectsAndDepartments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/subjects', {
        ...formData,
        credits: Number(formData.credits),
        courseYear: Number(formData.courseYear),
        semester: Number(formData.semester),
        departmentId: formData.departmentId || '123e4567-e89b-12d3-a456-426614174000'
      });
      toast.success('Предмет создан!');
      setIsModalOpen(false);
      fetchSubjectsAndDepartments();
    } catch (err) {
      toast.error('Ошибка создания');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить предмет? Все связанные оценки удалятся (Cascade).')) return;
    try {
      await api.delete(`/subjects/${id}`);
      toast.success('Удалено');
      fetchSubjectsAndDepartments();
    } catch (err) {
      toast.error('Ошибка');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Управление предметами</h2>
        <button onClick={() => setIsModalOpen(true)} className="glass-button flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white">
          <Plus className="h-4 w-4" /> Добавить предмет
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="bg-white/5 text-gray-300 border-b border-white/10">
            <tr>
              <th className="px-6 py-4">Название</th>
              <th className="px-6 py-4">Курс / Семестр</th>
              <th className="px-6 py-4">Кредиты</th>
              <th className="px-6 py-4">Отделение</th>
              <th className="px-6 py-4 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {subjects.map(s => (
              <tr key={s.id} className="hover:bg-white/5">
                <td className="px-6 py-4 text-white font-medium">{s.name}</td>
                <td className="px-6 py-4">{s.courseYear} курс / {s.semester} сем.</td>
                <td className="px-6 py-4">{s.credits} ECTS</td>
                <td className="px-6 py-4">{s.department?.name || s.departmentId}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => handleDelete(s.id)} className="p-2 text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-lg glass-card p-6 z-10">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
              <h3 className="text-xl font-bold text-white mb-6">Новый предмет</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Название предмета</label>
                  <input type="text" required placeholder="Например: Основы программирования" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Курс</label>
                    <input type="number" required placeholder="Для какого курса (1-4)" min="1" max="4" value={formData.courseYear} onChange={e => setFormData({...formData, courseYear: Number(e.target.value)})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Семестр</label>
                    <input type="number" required placeholder="Какой семестр (1-2)" min="1" max="2" value={formData.semester} onChange={e => setFormData({...formData, semester: Number(e.target.value)})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Количество ECTS кредитов</label>
                  <input type="number" required placeholder="Например: 3 или 5" min="1" value={formData.credits} onChange={e => setFormData({...formData, credits: Number(e.target.value)})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Отделение (Кафедра)</label>
                  <select required value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white">
                    <option value="">Выберите отделение, за которым закреплен предмет</option>
                    {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                
                <div className="flex justify-end gap-3 mt-4">
                  <button type="submit" className="px-6 py-2 bg-accent text-white rounded-xl">Сохранить</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
