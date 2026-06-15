"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { Users, Mail, Phone, ShieldCheck } from 'lucide-react';

export default function MyGroupPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Student modal state
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

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
                    key={student.id} 
                    className="hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => setSelectedStudent(student)}
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

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedStudent(null)} />
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-2xl glass-card p-6 md:p-8 z-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button onClick={() => setSelectedStudent(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
            
            <div className="flex items-center gap-6 mb-8 border-b border-white/10 pb-6">
              <div className="h-24 w-24 rounded-2xl bg-accent/20 flex items-center justify-center text-3xl text-accent font-bold border-2 border-accent/30 overflow-hidden flex-shrink-0">
                {selectedStudent.avatarUrl ? (
                  <img src={selectedStudent.avatarUrl} alt="Аватар" className="h-full w-full object-cover" />
                ) : (
                  `${selectedStudent.firstName?.[0] || ''}${selectedStudent.lastName?.[0] || ''}`
                )}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{selectedStudent.lastName} {selectedStudent.firstName} {selectedStudent.patronymic}</h3>
                <div className="flex gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1"><ShieldCheck className="h-4 w-4 text-accent" /> ID: {selectedStudent.studentIdNumber || '-'}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-accent font-medium uppercase tracking-wider text-sm border-b border-white/10 pb-2">Контакты</h4>
                <div><p className="text-xs text-gray-500">Email</p><p className="text-white">{selectedStudent.email}</p></div>
                <div><p className="text-xs text-gray-500">Телефон</p><p className="text-white">{selectedStudent.phone || 'Не указан'}</p></div>
              </div>
              <div className="space-y-4">
                <h4 className="text-accent font-medium uppercase tracking-wider text-sm border-b border-white/10 pb-2">Учебные данные</h4>
                <div><p className="text-xs text-gray-500">Национальность</p><p className="text-white">{selectedStudent.nationality || 'Не указана'}</p></div>
                <div><p className="text-xs text-gray-500">Дата рождения</p><p className="text-white">{selectedStudent.dateOfBirth || 'Не указана'}</p></div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button onClick={() => setSelectedStudent(null)} className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors">Закрыть</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
