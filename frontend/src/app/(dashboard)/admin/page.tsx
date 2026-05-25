"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { Users, Shield, FileText, Activity } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    api.get('/admin/analytics').then(res => setData(res.data));
  }, []);

  if (!data) return <div className="animate-pulse">Загрузка аналитики...</div>;

  const stats = [
    { title: 'Всего пользователей', value: data.users, icon: Users, color: 'text-blue-400' },
    { title: 'Студентов', value: data.students, icon: Users, color: 'text-green-400' },
    { title: 'Зав. отделениями', value: data.heads, icon: Shield, color: 'text-purple-400' },
    { title: 'Загружено файлов', value: data.files, icon: FileText, color: 'text-yellow-400' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Панель Администратора</h2>
          <p className="text-gray-400 mt-1">Глобальная статистика системы e-qagaz</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 flex items-center justify-between"
          >
            <div>
              <div className="text-gray-400 text-sm font-medium mb-1">{stat.title}</div>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
            </div>
            <div className={`h-12 w-12 rounded-full bg-white/5 flex items-center justify-center ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-card p-6 mt-8">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="h-5 w-5 text-accent" />
          <h3 className="text-lg font-bold text-white">Журнал действий (Последние 50)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-400">
            <thead className="bg-white/5 text-gray-300 border-b border-white/10">
              <tr>
                <th className="px-4 py-3">Время</th>
                <th className="px-4 py-3">Администратор</th>
                <th className="px-4 py-3">Действие</th>
                <th className="px-4 py-3">Детали</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.recentLogs.map((log: any) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">{log.user?.lastName} {log.user?.firstName}</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 bg-white/10 rounded text-xs">{log.action}</span></td>
                  <td className="px-4 py-3"><pre className="text-xs">{JSON.stringify(log.details)}</pre></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-12 flex justify-center pb-8">
        <button 
          onClick={() => {
            toast('Скоро будет доступно', {
              description: 'Голосовой помощник (ГС) находится в разработке.',
              icon: '🎙️',
            });
          }}
          className="relative inline-flex items-center justify-center px-12 py-4 font-bold text-white transition-all duration-300 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] hover:scale-105 active:scale-95 group"
        >
          <span className="absolute inset-0 w-full h-full rounded-full opacity-0 group-hover:opacity-20 bg-white blur-sm transition-opacity duration-300"></span>
          <span className="flex items-center gap-3 relative z-10 text-lg tracking-wider">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
            ГС
          </span>
        </button>
      </div>
    </div>
  );
}
