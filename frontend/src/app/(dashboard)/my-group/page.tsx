"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { Users, Mail, Phone, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MyGroupPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api.get('/teachers/my-group')
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="animate-pulse">Загрузка...</div>;
  }

  if (!data?.groupName) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-full space-y-6 pt-20"
      >
        <h2 className="text-3xl font-bold text-white text-center">Извините, у вас нет группы</h2>
        <img 
          src="https://images.meme-arsenal.com/77a07eb2e7722d01aff0540dd511acdf.jpg" 
          alt="Нет группы" 
          className="rounded-2xl shadow-2xl max-w-md w-full border border-white/10"
        />
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Моя группа: {data.groupName}</h2>
        <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2 text-gray-300">
          <Users className="h-5 w-5 text-accent" />
          <span>Всего студентов: {data.students?.length || 0}</span>
        </div>
      </div>
      
      <div className="glass-card overflow-hidden">
        {data.students?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-400">
              <thead className="bg-white/5 text-gray-300 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4">Студент</th>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Телефон</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.students.map((student: any) => (
                  <tr 
                    key={student.id || student.userId} 
                    className="hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => router.push(`/my-group/${student.userId}`)}
                  >
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold border border-accent/30 overflow-hidden flex-shrink-0">
                        {student.avatarUrl ? (
                          <img src={student.avatarUrl} alt="Аватар" className="h-full w-full object-cover" />
                        ) : (
                          `${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`
                        )}
                      </div>
                      <div>
                        <div className="text-white font-medium">{student.lastName} {student.firstName} {student.patronymic}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1"><ShieldCheck className="h-4 w-4 text-accent" /> {student.studentIdNumber || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1"><Mail className="h-4 w-4 text-gray-500" /> {student.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1"><Phone className="h-4 w-4 text-gray-500" /> {student.phone || '-'}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a 
                        href={`/my-group/${student.userId}`} 
                        className="inline-flex items-center px-4 py-2 bg-white/5 border border-white/10 hover:border-accent/50 hover:bg-accent/10 hover:text-accent rounded-xl text-xs font-semibold transition-all duration-300"
                      >
                        Профиль
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-400">
            В эту группу пока не добавлено ни одного студента.
          </div>
        )}
      </div>
    </div>
  );
}
