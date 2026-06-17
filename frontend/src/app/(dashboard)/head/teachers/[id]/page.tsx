"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, User, Mail, Phone, Calendar, ShieldCheck, Award, FileText, Building, Users } from 'lucide-react';
import Image from 'next/image';

export default function TeacherDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [teacher, setTeacher] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/departments/head/teachers/${id}`)
      .then(res => setTeacher(res.data))
      .catch(err => {
        console.error(err);
        router.push('/head/teachers');
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <div className="animate-pulse h-64 bg-white/5 rounded-2xl border border-white/10" />;
  if (!teacher) return null;

  const { user } = teacher;

  return (
    <div className="space-y-6">
      <button onClick={() => router.back()} className="flex items-center text-gray-400 hover:text-white transition-colors">
        <ChevronLeft className="h-5 w-5 mr-1" /> Назад к списку
      </button>

      {/* Header Profile */}
      <div className="glass-card p-8 flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="h-32 w-32 rounded-full bg-accent/20 flex items-center justify-center text-4xl text-accent font-bold border-2 border-accent/30 overflow-hidden flex-shrink-0 relative">
          {user.avatarUrl ? <Image src={user.avatarUrl} alt="Avatar" fill className="object-cover" /> : `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold text-white mb-2">{user.lastName} {user.firstName} {user.patronymic}</h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-400 mb-6">
            <span className="flex items-center gap-1"><ShieldCheck className="h-4 w-4" /> {teacher.position || 'Преподаватель'}</span>
            {teacher.curatorshipGroup && teacher.curatorshipGroup !== 'Нет' && (
              <span className="flex items-center gap-1"><Users className="h-4 w-4" /> Куратор группы {teacher.curatorshipGroup}</span>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/10">
            <div><p className="text-xs text-gray-500 mb-1">Email</p><p className="text-sm text-white">{user.email}</p></div>
            <div><p className="text-xs text-gray-500 mb-1">Телефон</p><p className="text-sm text-white">{user.phone || 'Не указан'}</p></div>
            <div><p className="text-xs text-gray-500 mb-1">Дата рождения</p><p className="text-sm text-white">{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Нет данных'}</p></div>
            <div><p className="text-xs text-gray-500 mb-1">Статус</p><p className="text-sm text-white">{user.isActive !== false ? 'Активен' : 'Заблокирован'}</p></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Academic Info */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-medium text-white mb-6 border-b border-white/10 pb-4">Официальные и профессиональные данные</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0"><ShieldCheck className="h-5 w-5 text-accent" /></div>
              <div><p className="text-sm text-gray-500">Образование</p><p className="text-white">{teacher.education || 'Не указано'}</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0"><Award className="h-5 w-5 text-accent" /></div>
              <div><p className="text-sm text-gray-500">Квалификационная категория</p><p className="text-white">{teacher.qualificationCategory || 'Не указана'}</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0"><Calendar className="h-5 w-5 text-accent" /></div>
              <div><p className="text-sm text-gray-500">Общий стаж работы</p><p className="text-white">{teacher.totalExperience || 'Не указан'}</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0"><Calendar className="h-5 w-5 text-accent" /></div>
              <div><p className="text-sm text-gray-500">Педагогический стаж</p><p className="text-white">{teacher.pedagogicalExperience || 'Не указан'}</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0"><FileText className="h-5 w-5 text-accent" /></div>
              <div><p className="text-sm text-gray-500">Повышение квалификации</p><p className="text-white">{teacher.trainingCertificates || 'Нет'}</p></div>
            </div>
          </div>
        </div>

        {/* Contact Info Extra */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-medium text-white mb-6 border-b border-white/10 pb-4">Дополнительная информация</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0"><User className="h-5 w-5 text-accent" /></div>
              <div><p className="text-sm text-gray-500">Национальность</p><p className="text-white">{user.nationality || 'Не указана'}</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0"><User className="h-5 w-5 text-accent" /></div>
              <div><p className="text-sm text-gray-500">Место рождения</p><p className="text-white">{user.birthPlace || 'Не указано'}</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0"><Building className="h-5 w-5 text-accent" /></div>
              <div><p className="text-sm text-gray-500">Фактический адрес</p><p className="text-white">{user.actualAddress || 'Не указан'}</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
