"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Calendar, Users, Building, ShieldCheck, Camera, Award, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface Profile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  patronymic: string | null;
  phone: string | null;
  avatarUrl: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  studentIdNumber: string;
  courseYear: number;
  groupName: string;
  curatorName: string | null;
  department: string;
  nationality: string | null;
  birthPlace: string | null;
  actualAddress: string | null;
  familyStatus: string | null;
  hobbies: string | null;
  
  // Teacher specific
  role?: string;
  position?: string;
  curatorshipGroup?: string;
  education?: string;
  qualificationCategory?: string;
  totalExperience?: string;
  pedagogicalExperience?: string;
  trainingCertificates?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/me')
      .then(res => setProfile(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      toast.loading('Загрузка фото...', { id: 'upload' });
      const uploadRes = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) throw new Error('Ошибка загрузки');
      const uploadData = await uploadRes.json();
      const newAvatarUrl = uploadData.url;

      await api.patch('/users/me', { avatarUrl: newAvatarUrl });
      
      setProfile(prev => prev ? { ...prev, avatarUrl: newAvatarUrl } : null);
      toast.success('Фото обновлено', { id: 'upload' });
    } catch (err) {
      toast.error('Не удалось обновить фото', { id: 'upload' });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-white/5 animate-pulse rounded-2xl border border-white/10" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-white/5 animate-pulse rounded-2xl border border-white/10" />
          <div className="h-64 bg-white/5 animate-pulse rounded-2xl border border-white/10" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <User className="h-12 w-12 mb-4 opacity-50" />
        <p>Профиль не найден</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Обо мне</h2>
      </div>

      {/* Header Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="relative group flex-shrink-0">
          <div className="w-[120px] h-[160px] rounded-xl bg-accent/20 flex items-center justify-center text-4xl text-accent font-bold border-2 border-accent/30 overflow-hidden relative">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Аватар" className="h-full w-full object-cover" />
            ) : (
              `${profile.firstName[0]}${profile.lastName[0]}`
            )}
            
            {/* Hover overlay for upload */}
            <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <Camera className="h-8 w-8 text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={handleUploadPhoto} />
            </label>
          </div>
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-white mb-2">
            {profile.lastName} {profile.firstName} {profile.patronymic}
          </h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-400">
            {profile.role !== 'TEACHER' && (
              <span className="flex items-center gap-1"><ShieldCheck className="h-4 w-4" /> ID: {profile.studentIdNumber}</span>
            )}
            <span className="flex items-center gap-1"><Building className="h-4 w-4" /> {profile.department}</span>
            {profile.role !== 'TEACHER' && (
              <span className="flex items-center gap-1"><Users className="h-4 w-4" /> Группа {profile.groupName}</span>
            )}
            {profile.role === 'TEACHER' && profile.position && (
              <span className="flex items-center gap-1"><ShieldCheck className="h-4 w-4" /> {profile.position}</span>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
          <h3 className="text-lg font-medium text-white mb-6 border-b border-white/10 pb-4">Личная информация</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0"><Mail className="h-5 w-5 text-accent" /></div>
              <div><p className="text-sm text-gray-500">Email</p><p className="text-white">{profile.email}</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0"><Phone className="h-5 w-5 text-accent" /></div>
              <div><p className="text-sm text-gray-500">Номер телефона</p><p className="text-white">{profile.phone || 'Не указан'}</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0"><Calendar className="h-5 w-5 text-accent" /></div>
              <div>
                <p className="text-sm text-gray-500">Дата рождения</p>
                <p className="text-white">{profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('ru-RU') : 'Не указана'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0"><User className="h-5 w-5 text-accent" /></div>
              <div><p className="text-sm text-gray-500">Национальность</p><p className="text-white">{profile.nationality || 'Не указана'}</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0"><User className="h-5 w-5 text-accent" /></div>
              <div><p className="text-sm text-gray-500">Место рождения</p><p className="text-white">{profile.birthPlace || 'Не указано'}</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0"><Building className="h-5 w-5 text-accent" /></div>
              <div><p className="text-sm text-gray-500">Место фактического проживания</p><p className="text-white">{profile.actualAddress || 'Не указано'}</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0"><Users className="h-5 w-5 text-accent" /></div>
              <div><p className="text-sm text-gray-500">Состав семьи</p><p className="text-white">{profile.familyStatus || 'Не указан'}</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0"><ShieldCheck className="h-5 w-5 text-accent" /></div>
              <div><p className="text-sm text-gray-500">Хобби</p><p className="text-white">{profile.hobbies || 'Нет'}</p></div>
            </div>
          </div>
        </motion.div>

        {/* Academic Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <h3 className="text-lg font-medium text-white mb-6 border-b border-white/10 pb-4">
            {profile.role === 'TEACHER' ? 'Официальные и профессиональные данные' : 'Академическая информация'}
          </h3>
          <div className="space-y-4">
            {profile.role === 'TEACHER' ? (
              <>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0"><ShieldCheck className="h-5 w-5 text-accent" /></div>
                  <div><p className="text-sm text-gray-500">Образование</p><p className="text-white">{profile.education || 'Не указано'}</p></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0"><Award className="h-5 w-5 text-accent" /></div>
                  <div><p className="text-sm text-gray-500">Квалификационная категория</p><p className="text-white">{profile.qualificationCategory || 'Не указана'}</p></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0"><Calendar className="h-5 w-5 text-accent" /></div>
                  <div><p className="text-sm text-gray-500">Общий стаж работы</p><p className="text-white">{profile.totalExperience || 'Не указан'}</p></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0"><Calendar className="h-5 w-5 text-accent" /></div>
                  <div><p className="text-sm text-gray-500">Педагогический стаж</p><p className="text-white">{profile.pedagogicalExperience || 'Не указан'}</p></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0"><FileText className="h-5 w-5 text-accent" /></div>
                  <div><p className="text-sm text-gray-500">Повышение квалификации</p><p className="text-white">{profile.trainingCertificates || 'Нет'}</p></div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center"><Users className="h-5 w-5 text-accent" /></div>
                  <div><p className="text-sm text-gray-500">Группа</p><p className="text-white">{profile.groupName}</p></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center"><ShieldCheck className="h-5 w-5 text-accent" /></div>
                  <div><p className="text-sm text-gray-500">Курс</p><p className="text-white">{profile.courseYear}</p></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center"><User className="h-5 w-5 text-accent" /></div>
                  <div><p className="text-sm text-gray-500">Куратор</p><p className="text-white">{profile.curatorName || 'Не назначен'}</p></div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
