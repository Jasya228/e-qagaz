"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { Users, GraduationCap, Award, Activity } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

export default function HeadDashboard() {
  const [data, setData] = useState<any>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    api.get('/departments/head/analytics').then(res => setData(res.data));
  }, []);

  if (!data) return <div className="animate-pulse flex space-x-4">Загрузка аналитики...</div>;

  const stats = [
    { title: 'У ВАС УЧИТСЯ: студентов', value: data.totalStudents, icon: Users, color: 'text-blue-400' },
    { title: 'Количество групп', value: data.totalGroups, icon: GraduationCap, color: 'text-purple-400' },
  ];

  return (
    <div className="space-y-6 mt-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Здравствуйте {user?.firstName} {user?.lastName}!
          </h2>
          <p className="text-gray-400 text-lg">{data.departmentName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 max-w-3xl">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-8 flex items-center justify-between"
          >
            <div>
              <div className="text-gray-400 text-sm font-medium mb-2 uppercase tracking-wide">{stat.title}</div>
              <div className="text-4xl font-bold text-white">{stat.value}</div>
            </div>
            <div className={`h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner ${stat.color}`}>
              <stat.icon className="h-8 w-8" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
