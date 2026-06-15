"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';

export default function MyGroupPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/me')
      .then(res => setProfile(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="animate-pulse">Загрузка...</div>;
  }

  if (!profile?.curatorshipGroup) {
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
        <h2 className="text-2xl font-bold text-white">Моя группа: {profile.curatorshipGroup}</h2>
      </div>
      <div className="glass-card p-6">
        <p className="text-gray-400">Список студентов вашей группы скоро появится здесь.</p>
      </div>
    </div>
  );
}
