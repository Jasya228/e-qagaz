"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function HeadStudentsList() {
  const [students, setStudents] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [search, setSearch] = useState('');
  const [courseYear, setCourseYear] = useState('');
  const [groupName, setGroupName] = useState('');
  const [gender, setGender] = useState('');

  const fetchStudents = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/departments/head/students', {
        params: { page, limit: meta.limit, search, courseYear, groupName, gender }
      });
      setStudents(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      toast.error('Ошибка загрузки студентов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchStudents(1);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, courseYear, groupName, gender]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= meta.totalPages) {
      fetchStudents(newPage);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Список студентов</h2>
        <p className="text-gray-400 mt-1">Управление студентами отделения</p>
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
        
        <div className="flex gap-4">
          <select value={courseYear} onChange={(e) => setCourseYear(e.target.value)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-accent outline-none">
            <option value="">Все курсы</option>
            <option value="1">1 курс</option>
            <option value="2">2 курс</option>
            <option value="3">3 курс</option>
            <option value="4">4 курс</option>
          </select>
          <input type="text" placeholder="Группа (напр. CS-202)" value={groupName} onChange={(e) => setGroupName(e.target.value)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent w-48" />
          <select value={gender} onChange={(e) => setGender(e.target.value)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-accent outline-none">
            <option value="">Любой пол</option>
            <option value="MALE">Мужской</option>
            <option value="FEMALE">Женский</option>
          </select>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-400">
            <thead className="bg-white/5 text-gray-300 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">ФИО Студента</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Группа/Курс</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">ФИО Куратора</th>
                <th className="px-6 py-4 font-medium text-right uppercase tracking-wider text-xs">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-white/10 rounded w-48"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-white/10 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-white/10 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-white/10 rounded w-8"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 bg-white/10 rounded w-20 ml-auto"></div></td>
                  </tr>
                ))
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">Студенты не найдены.</td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{student.fio}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{student.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300 font-medium">
                        {student.groupName} <span className="text-gray-600 mx-1">|</span> {student.courseYear} курс
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300">{student.curatorName}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/head/students/${student.id}`} 
                        className="inline-flex items-center px-4 py-2 bg-white/5 border border-white/10 hover:border-green-500/50 hover:bg-green-500/10 hover:text-green-400 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)] text-white rounded-xl text-xs font-semibold transition-all duration-300"
                      >
                        Профиль
                      </Link>
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
