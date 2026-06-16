"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Search, ChevronLeft, ChevronRight, User, ShieldCheck, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function HeadTeachersList() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ total: 0, page: 1, limit: 50, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [search, setSearch] = useState('');

  const fetchTeachers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/departments/head/teachers', {
        params: { page, limit: meta.limit, search }
      });
      setTeachers(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      toast.error('Ошибка загрузки преподавателей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTeachers(1);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= meta.totalPages) {
      fetchTeachers(newPage);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Список преподавателей</h2>
        <p className="text-gray-400 mt-1">Управление преподавателями и кураторами вашего отделения</p>
      </div>

      <div className="glass-card p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Поиск по ФИО или Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-400">
            <thead className="bg-white/5 text-gray-300 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">ФИО Преподавателя</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Должность</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Кураторство</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [1,2,3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-white/10 rounded w-48"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-white/10 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-white/10 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-white/10 rounded w-12"></div></td>
                  </tr>
                ))
              ) : teachers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">Преподаватели не найдены.</td>
                </tr>
              ) : (
                teachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                    <td className="px-6 py-4 flex items-center gap-3">
                       <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold border border-blue-500/30">
                         {teacher.fio.charAt(0)}
                       </div>
                       <div>
                         <div className="font-semibold text-white">{teacher.fio}</div>
                         <div className="text-xs text-gray-500 mt-0.5">{teacher.email}</div>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300">{teacher.position}</div>
                    </td>
                    <td className="px-6 py-4">
                      {teacher.curatorshipGroup !== 'Нет' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded bg-accent/20 text-accent text-xs font-medium">
                          Группа: {teacher.curatorshipGroup}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">Нет</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${teacher.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {teacher.isActive ? 'Активен' : 'Заблокирован'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/5">
          <div className="text-sm text-gray-400">
            Показано {(meta.page - 1) * meta.limit + 1} - {Math.min(meta.page * meta.limit, meta.total)} из {meta.total}
          </div>
          <div className="flex gap-2">
            <button onClick={() => handlePageChange(meta.page - 1)} disabled={meta.page === 1} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 transition-colors">
              <ChevronLeft className="h-4 w-4 text-white" />
            </button>
            <button onClick={() => handlePageChange(meta.page + 1)} disabled={meta.page === meta.totalPages} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 transition-colors">
              <ChevronRight className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
