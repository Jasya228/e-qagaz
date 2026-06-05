"use client";

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { UploadCloud, File as FileIcon, CheckCircle, XCircle, Clock, Plus, X, Download } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  scale?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  files: { fileUrl: string; fileType: string; size: number; name?: string }[];
  student?: { user: { firstName: string; lastName: string } };
}

export default function AchievementsPage() {
  const { user } = useAuthStore();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isStudent = user?.role === 'STUDENT';

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('OTHER');
  const [scale, setScale] = useState('Внутри колледжа');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const endpoint = isStudent ? '/achievements/my' : '/achievements/pending';
      const res = await api.get(endpoint);
      setAchievements(res.data);
    } catch (err) {
      toast.error('Ошибка загрузки достижений');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, [user]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragging(true);
    else if (e.type === 'dragleave') setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const validateAndSetFile = (f: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(f.type)) {
      toast.error('Неверный формат. Только JPG, PNG, PDF, DOCX');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error('Файл слишком большой (макс. 5MB)');
      return;
    }
    setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !category) {
      toast.error('Заполните все обязательные поля и прикрепите файл');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // 1. Upload file
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await api.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(percentCompleted);
        },
      });

      const fileData = uploadRes.data;

      // 2. Create achievement record
      await api.post('/achievements', {
        title,
        description,
        category,
        scale,
        fileUrl: fileData.url,
        fileType: fileData.mimetype,
        fileSize: fileData.size,
      });

      toast.success('Достижение отправлено на проверку');
      setIsModalOpen(false);
      resetForm();
      fetchAchievements();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Ошибка загрузки');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setTitle('');
    setDescription('');
    setCategory('OTHER');
    setScale('Внутри колледжа');
    setUploadProgress(0);
  };

  const handleStatusUpdate = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await api.patch(`/achievements/${id}/status`, { status, comment: status === 'APPROVED' ? 'Молодец!' : 'Не соответствует требованиям' });
      toast.success(`Статус обновлен на ${status}`);
      setAchievements(achievements.filter(a => a.id !== id));
    } catch (err) {
      toast.error('Ошибка обновления статуса');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить это достижение?')) return;
    try {
      await api.delete(`/achievements/${id}`);
      toast.success('Достижение удалено');
      setAchievements(achievements.filter(a => a.id !== id));
    } catch (err) {
      toast.error('Ошибка при удалении');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">{isStudent ? 'Мои достижения' : 'Ожидающие проверки'}</h2>
          <p className="text-gray-400 mt-1">
            {isStudent ? 'Загружайте грамоты и сертификаты для портфолио' : 'Проверьте загруженные достижения студентов'}
          </p>
        </div>
        {isStudent && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-transparent rounded-xl text-sm font-medium text-white bg-accent hover:bg-blue-600 transition-all shadow-sm"
          >
            <Plus className="h-5 w-5" /> Добавить
          </button>
        )}
      </div>

      {/* Achievement Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-64 bg-white/5 animate-pulse rounded-2xl border border-white/10" />)}
        </div>
      ) : achievements.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 glass-card animate-in fade-in zoom-in duration-500">
          <img src="https://http.cat/404" alt="Where are the achievements?" className="w-64 rounded-xl shadow-xl shadow-blue-500/20 border border-white/10 mb-6 hover:scale-105 transition-transform" />
          <p className="text-xl font-bold text-gray-300">
            {isStudent ? 'Где твои достижения, Лебовски? Пока тут пусто.' : 'Достижений на проверку нет. Можно отдыхать!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement) => (
            <motion.div key={achievement.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-6 flex flex-col justify-between group">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                    achievement.status === 'APPROVED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                    achievement.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                  }`}>
                    {achievement.status === 'APPROVED' && <CheckCircle className="h-3 w-3" />}
                    {achievement.status === 'REJECTED' && <XCircle className="h-3 w-3" />}
                    {achievement.status === 'PENDING' && <Clock className="h-3 w-3" />}
                    {achievement.status}
                  </span>
                  <span className="text-xs text-gray-500">{new Date(achievement.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{achievement.title}</h3>
                {!isStudent && achievement.student && (
                  <p className="text-sm text-accent mb-2">{achievement.student.user.lastName} {achievement.student.user.firstName}</p>
                )}
                {achievement.scale && (
                  <span className="inline-block px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-blue-300 mb-2">
                    Уровень: {achievement.scale}
                  </span>
                )}
                <p className="text-sm text-gray-400 line-clamp-2 mb-4">{achievement.description || 'Нет описания'}</p>
                
                {achievement.files.length > 0 && (
                  <a href={process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') + achievement.files[0].fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-gray-300 hover:text-accent transition-colors">
                    <FileIcon className="h-4 w-4 text-accent" />
                    <span>Посмотреть файл</span>
                  </a>
                )}
              </div>
              
              {!isStudent && (
                <div className="mt-6 flex gap-2 pt-4 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleStatusUpdate(achievement.id, 'APPROVED')} className="flex-1 py-2 text-xs font-medium text-green-400 bg-green-500/10 rounded-lg hover:bg-green-500/20 transition-colors">Одобрить</button>
                  <button onClick={() => handleStatusUpdate(achievement.id, 'REJECTED')} className="flex-1 py-2 text-xs font-medium text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors">Отклонить</button>
                </div>
              )}
              {isStudent && (
                <div className="mt-6 flex justify-end pt-4 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleDelete(achievement.id)} className="px-3 py-2 text-xs font-medium text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-1">
                    <XCircle className="h-4 w-4" /> Удалить
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-lg glass-card p-6 z-10 max-h-[90vh] overflow-y-auto">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
              <h3 className="text-xl font-bold text-white mb-6">Добавить достижение</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Название</label>
                  <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 border border-white/10 rounded-xl bg-white/5 text-white focus:ring-2 focus:ring-accent" placeholder="Например: Победитель олимпиады" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Категория</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-2 border border-white/10 rounded-xl bg-white/5 text-white focus:ring-2 focus:ring-accent">
                    <option value="OLYMPIAD">Олимпиада</option>
                    <option value="SPORT">Спорт</option>
                    <option value="SCIENCE">Наука</option>
                    <option value="COMMUNITY">Общественная деятельность</option>
                    <option value="OTHER">Другое</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Где было получено (Уровень)</label>
                  <select value={scale} onChange={e => setScale(e.target.value)} className="w-full px-4 py-2 border border-white/10 rounded-xl bg-white/5 text-white focus:ring-2 focus:ring-accent">
                    <option value="Внутри колледжа">Внутри колледжа</option>
                    <option value="Районный">Районный</option>
                    <option value="Городской">Городской</option>
                    <option value="Республиканский">Республиканский</option>
                    <option value="Международный">Международный</option>
                    <option value="По спорту">По спорту</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Описание</label>
                  <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 border border-white/10 rounded-xl bg-white/5 text-white focus:ring-2 focus:ring-accent" placeholder="Краткое описание..." />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Файл (Сертификат, Грамота)</label>
                  <div
                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragging ? 'border-accent bg-accent/10' : 'border-white/20 hover:border-accent/50 bg-white/5'}`}
                  >
                    <input type="file" ref={fileInputRef} className="hidden" accept=".jpg,.jpeg,.png,.pdf,.docx" onChange={e => e.target.files && validateAndSetFile(e.target.files[0])} />
                    {!file ? (
                      <div className="flex flex-col items-center">
                        <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-300">Нажмите или перетащите файл сюда</p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG, PDF, DOCX до 5MB</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <FileIcon className="h-10 w-10 text-accent mb-2" />
                        <p className="text-sm text-white font-medium">{file.name}</p>
                        <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {uploading && (
                  <div className="w-full bg-white/10 rounded-full h-2 mt-4">
                    <div className="bg-accent h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                )}

                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Отмена</button>
                  <button type="submit" disabled={uploading || !file} className="px-6 py-2 bg-accent text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50">
                    {uploading ? 'Загрузка...' : 'Отправить'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Just a quick icon for empty state
function AwardIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>;
}
