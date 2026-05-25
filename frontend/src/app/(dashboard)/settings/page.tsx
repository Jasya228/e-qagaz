"use client";

import { useState } from 'react';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.password) {
      toast.info('Введите новый пароль');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Пароль должен быть не менее 6 символов');
      return;
    }

    setLoading(true);

    try {
      await api.patch('/students/settings/password', { password: formData.password });
      toast.success('Пароль успешно обновлен!');
      
      setFormData({ password: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Ошибка обновления пароля');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 mt-10">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Настройки</h2>
        <p className="text-gray-400">Смена пароля от учетной записи</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Новый пароль</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="block w-full px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition duration-200"
            />
            <p className="text-xs text-gray-500 mt-2">Минимум 6 символов</p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !formData.password}
              className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-accent hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent focus:ring-offset-background transition-all disabled:opacity-50"
            >
              {loading && <Loader2 className="animate-spin h-5 w-5 mr-2" />}
              Сохранить пароль
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
