"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Eye, Clock, CheckCircle, AlertCircle, Plus, X, UploadCloud, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface Document {
  id: string;
  title: string;
  type: string;
  status: 'READY' | 'PROCESSING' | 'REJECTED';
  createdAt: string;
  fileUrl?: string;
}

const statusConfig = {
  READY: { label: 'Доступно', icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  PROCESSING: { label: 'В обработке', icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  REJECTED: { label: 'Отклонён', icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
};

const docTypeLabels: Record<string, string> = {
  TRANSCRIPT: 'Транскрипт',
  CERTIFICATE: 'Справка',
  DIPLOMA: 'Диплом',
  ID_CARD: 'Удостоверение личности',
  STUDENT_ID: 'Студенческий билет',
  OTHER: 'Другое',
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('ID_CARD');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = () => {
    api.get('/documents')
      .then(res => setDocuments(res.data))
      .catch(() => setDocuments([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот документ?')) return;
    try {
      await api.delete(`/documents/${id}`);
      toast.success('Документ удален');
      setDocuments(documents.filter(d => d.id !== id));
    } catch (err) {
      toast.error('Ошибка удаления');
    }
  };

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
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(f.type)) {
      toast.error('Только JPG, PNG, PDF');
      return;
    }
    setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await api.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          setUploadProgress(Math.round((e.loaded * 100) / (e.total || 1)));
        },
      });

      await api.post('/documents', {
        title,
        type,
        fileUrl: uploadRes.data.url,
      });

      toast.success('Документ загружен');
      setIsModalOpen(false);
      setFile(null);
      setTitle('');
      fetchDocuments();
    } catch (err) {
      toast.error('Ошибка загрузки');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Документы</h2>
          <p className="text-gray-400 mt-1">Ваши справки, удостоверения и другие документы</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 border border-transparent rounded-xl text-sm font-medium text-white bg-accent hover:bg-blue-600 transition-all shadow-sm"
        >
          <Plus className="h-5 w-5" /> Загрузить
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-white/5 animate-pulse rounded-2xl border border-white/10" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-16 flex flex-col items-center justify-center text-center"
        >
          <div className="h-20 w-20 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 border border-accent/20">
            <FileText className="h-10 w-10 text-accent" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Документов пока нет</h3>
          <p className="text-gray-400 max-w-sm">
            Загрузите свои документы (удостоверение, студенческий билет), чтобы они всегда были под рукой.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc, i) => {
            const status = statusConfig[doc.status] || statusConfig.PROCESSING;
            const StatusIcon = status.icon;
            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-6 flex flex-col justify-between group hover:border-white/10 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
                      <FileText className="h-6 w-6 text-accent" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.bg} ${status.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </span>
                      <button onClick={() => handleDelete(doc.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1 line-clamp-2">{doc.title}</h3>
                  <p className="text-xs text-gray-500 mb-1">{docTypeLabels[doc.type] || doc.type}</p>
                  <p className="text-xs text-gray-600">{new Date(doc.createdAt).toLocaleDateString('ru-RU')}</p>
                </div>
                {doc.status === 'READY' && doc.fileUrl && (
                  <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
                    <a
                      href={process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') + doc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium text-gray-300 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" /> Просмотр
                    </a>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-md glass-card p-6 z-10">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
              <h3 className="text-xl font-bold text-white mb-6">Загрузить документ</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Название (для себя)</label>
                  <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 border border-white/10 rounded-xl bg-white/5 text-white focus:ring-2 focus:ring-accent" placeholder="Например: Мое удостоверение" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Тип документа</label>
                  <select value={type} onChange={e => setType(e.target.value)} className="w-full px-4 py-2 border border-white/10 rounded-xl bg-white/5 text-white focus:ring-2 focus:ring-accent">
                    <option value="ID_CARD">Удостоверение личности</option>
                    <option value="STUDENT_ID">Студенческий билет</option>
                    <option value="CERTIFICATE">Справка</option>
                    <option value="OTHER">Другое</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Файл</label>
                  <div
                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragging ? 'border-accent bg-accent/10' : 'border-white/20 hover:border-accent/50 bg-white/5'}`}
                  >
                    <input type="file" ref={fileInputRef} className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={e => { if (e.target.files && e.target.files[0]) validateAndSetFile(e.target.files[0]) }} />
                    {!file ? (
                      <div className="flex flex-col items-center">
                        <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-300">Нажмите или перетащите файл</p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG, PDF</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <FileText className="h-10 w-10 text-accent mb-2" />
                        <p className="text-sm text-white font-medium">{file.name}</p>
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
                    {uploading ? 'Загрузка...' : 'Сохранить'}
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
