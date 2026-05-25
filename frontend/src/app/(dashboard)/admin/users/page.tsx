"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Lock, Unlock, KeyRound, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // References Data
  const [references, setReferences] = useState({ groups: [], curators: [], departments: [] });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  
  // Selected Role (for Create)
  const [selectedRole, setSelectedRole] = useState('STUDENT');

  // Form State
  const initialFormState = {
    email: '', firstName: '', lastName: '', patronymic: '',
    phone: '', dateOfBirth: '', gender: 'MALE', role: 'STUDENT',
    // Student specifics
    groupName: '', courseYear: 1, studentIdNumber: '', departmentId: '', curatorName: '',
    nationality: '', birthPlace: '', actualAddress: '', familyStatus: '', hobbies: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.data);
    } catch (err) {
      toast.error('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  const fetchReferences = async () => {
    try {
      const res = await api.get('/admin/references');
      setReferences(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchReferences();
  }, []);

  const handleBlock = async (id: string, currentlyActive: boolean) => {
    try {
      await api.patch(`/admin/users/${id}/block`, { block: currentlyActive });
      toast.success(`Пользователь ${currentlyActive ? 'заблокирован' : 'разблокирован'}`);
      fetchUsers();
    } catch (err) {
      toast.error('Ошибка');
    }
  };

  const handleResetPassword = async (id: string) => {
    if (!confirm('Вы уверены, что хотите сбросить пароль?')) return;
    try {
      const res = await api.patch(`/admin/users/${id}/reset-password`);
      toast.success(`Пароль сброшен. Новый пароль: ${res.data.defaultPassword}`, { duration: 10000 });
    } catch (err) {
      toast.error('Ошибка');
    }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setEditingUserId(null);
    setFormData(initialFormState);
    setSelectedRole('STUDENT');
    setIsModalOpen(true);
  };

  const openEditModal = async (user: any) => {
    setIsEditing(true);
    setEditingUserId(user.id);
    setSelectedRole(user.role);
    
    // Fetch full profile details
    try {
      const res = await api.get(`/admin/users/${user.id}`);
      const data = res.data;
      
      setFormData({
        email: data.user.email || '',
        firstName: data.user.firstName || '',
        lastName: data.user.lastName || '',
        patronymic: data.user.patronymic || '',
        phone: data.user.phone || '',
        dateOfBirth: data.user.dateOfBirth ? new Date(data.user.dateOfBirth).toISOString().split('T')[0] : '',
        gender: data.user.gender || 'MALE',
        role: data.user.role,
        
        groupName: data.profile?.groupName || '',
        courseYear: data.profile?.courseYear || 1,
        studentIdNumber: data.profile?.studentIdNumber || '',
        departmentId: data.profile?.departmentId || data.department?.id || '',
        curatorName: data.profile?.curatorName || '',
        nationality: data.profile?.nationality || '',
        birthPlace: data.profile?.birthPlace || '',
        actualAddress: data.profile?.actualAddress || '',
        familyStatus: data.profile?.familyStatus || '',
        hobbies: data.profile?.hobbies || ''
      });
      setIsModalOpen(true);
    } catch (err) {
      toast.error('Ошибка загрузки профиля');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/admin/users/${editingUserId}`, { ...formData, role: selectedRole });
        toast.success('Профиль успешно обновлен!');
      } else {
        const res = await api.post('/admin/users', { ...formData, role: selectedRole });
        toast.success(`Создан! Пароль: ${res.data.defaultPassword || 'password123'}`, { duration: 10000 });
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Ошибка сохранения');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Управление пользователями</h2>
        </div>
        <button onClick={openCreateModal} className="glass-button flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white">
          <Plus className="h-4 w-4" /> Добавить пользователя
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="bg-white/5 text-gray-300 border-b border-white/10">
            <tr>
              <th className="px-6 py-4">ФИО / Email</th>
              <th className="px-6 py-4">Роль</th>
              <th className="px-6 py-4">Статус</th>
              <th className="px-6 py-4 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-white/5">
                <td className="px-6 py-4">
                  <div className="text-white font-medium">{u.lastName} {u.firstName}</div>
                  <div className="text-xs">{u.email}</div>
                </td>
                <td className="px-6 py-4">{u.role}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs ${u.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {u.isActive ? 'Активен' : 'Заблокирован'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => openEditModal(u)} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 text-blue-400" title="Редактировать">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleResetPassword(u.id)} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 text-white" title="Сбросить пароль">
                    <KeyRound className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleBlock(u.id, u.isActive)} className={`p-2 rounded-lg text-white ${u.isActive ? 'bg-red-500/20 hover:bg-red-500/40 text-red-400' : 'bg-green-500/20 hover:bg-green-500/40 text-green-400'}`} title={u.isActive ? 'Заблокировать' : 'Разблокировать'}>
                    {u.isActive ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-4xl glass-card p-8 z-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
              <h3 className="text-xl font-bold text-white mb-6">
                {isEditing ? 'Редактирование пользователя' : 'Создание пользователя'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {!isEditing && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Тип пользователя</label>
                    <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-accent">
                      <option value="STUDENT">Студент</option>
                      <option value="HEAD_DEPARTMENT">Заведующий отделением</option>
                      <option value="ADMIN">Администратор</option>
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Basic Info */}
                  <div className="col-span-full border-b border-white/10 pb-2 mb-2">
                    <h4 className="text-accent font-medium text-sm uppercase tracking-wider">Основная информация</h4>
                  </div>
                  <input type="email" required placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="col-span-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-accent" />
                  <input type="text" required placeholder="Фамилия" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-accent" />
                  <input type="text" required placeholder="Имя" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-accent" />
                  <input type="text" placeholder="Отчество" value={formData.patronymic} onChange={e => setFormData({...formData, patronymic: e.target.value})} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-accent" />
                  <input type="text" placeholder="Телефон" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-accent" />
                  <input type="date" placeholder="Дата рождения" value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 focus:ring-2 focus:ring-accent" />
                  <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-accent">
                    <option value="MALE">Мужской</option>
                    <option value="FEMALE">Женский</option>
                  </select>

                  {/* Role Specifics */}
                  {selectedRole === 'STUDENT' && (
                    <>
                      <div className="col-span-full border-b border-white/10 pb-2 mb-2 mt-4">
                        <h4 className="text-accent font-medium text-sm uppercase tracking-wider">Учебные данные</h4>
                      </div>
                      
                      <select required value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value})} className="col-span-full md:col-span-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-accent">
                        <option value="">Выберите отделение</option>
                        {references.departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>

                      <select required value={formData.groupName} onChange={e => setFormData({...formData, groupName: e.target.value})} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-accent">
                        <option value="">Выберите группу</option>
                        {references.groups.map((g: any) => <option key={g.id} value={g.name}>{g.name}</option>)}
                      </select>

                      <select required value={formData.courseYear} onChange={e => setFormData({...formData, courseYear: Number(e.target.value)})} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-accent">
                        <option value={1}>1 курс</option>
                        <option value={2}>2 курс</option>
                        <option value={3}>3 курс</option>
                        <option value={4}>4 курс</option>
                      </select>

                      <select required value={formData.curatorName} onChange={e => setFormData({...formData, curatorName: e.target.value})} className="col-span-full md:col-span-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-accent">
                        <option value="">Выберите куратора</option>
                        {references.curators.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                      
                      <input type="text" required placeholder="ID Студента (Номер билета)" value={formData.studentIdNumber} onChange={e => setFormData({...formData, studentIdNumber: e.target.value})} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-accent" />

                      <div className="col-span-full border-b border-white/10 pb-2 mb-2 mt-4">
                        <h4 className="text-accent font-medium text-sm uppercase tracking-wider">Дополнительная информация (Обо мне)</h4>
                      </div>
                      <input type="text" placeholder="Национальность" value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-accent" />
                      <input type="text" placeholder="Место рождения" value={formData.birthPlace} onChange={e => setFormData({...formData, birthPlace: e.target.value})} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-accent" />
                      <input type="text" placeholder="Фактический адрес" value={formData.actualAddress} onChange={e => setFormData({...formData, actualAddress: e.target.value})} className="col-span-full md:col-span-2 lg:col-span-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-accent" />
                      <input type="text" placeholder="Состав семьи" value={formData.familyStatus} onChange={e => setFormData({...formData, familyStatus: e.target.value})} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-accent" />
                      <input type="text" placeholder="Хобби" value={formData.hobbies} onChange={e => setFormData({...formData, hobbies: e.target.value})} className="col-span-full md:col-span-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-accent" />
                    </>
                  )}

                  {selectedRole === 'HEAD_DEPARTMENT' && (
                    <>
                      <div className="col-span-full border-b border-white/10 pb-2 mb-2 mt-4">
                        <h4 className="text-accent font-medium text-sm uppercase tracking-wider">Отделение</h4>
                      </div>
                      <select required value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value})} className="col-span-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-accent">
                        <option value="">Выберите отделение для заведующего</option>
                        {references.departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-white/10">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-400">Отмена</button>
                  <button type="submit" className="px-8 py-2 bg-accent hover:bg-blue-600 text-white font-medium rounded-xl transition-colors">
                    {isEditing ? 'Сохранить изменения' : 'Создать'}
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
