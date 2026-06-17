"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Save, Users, Calendar, Plus, Download, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';

export default function AdminJournalPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Selection
  const [courseYear, setCourseYear] = useState<number>(1);
  const [semester, setSemester] = useState<number>(1);
  const [groupName, setGroupName] = useState('');
  const [subjectId, setSubjectId] = useState('');

  // References
  const [groups, setGroups] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  // Journal Data
  const [students, setStudents] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  
  // gradesState shape: { [studentId]: { [lessonId]: string, totalScore: string } }
  const [gradesState, setGradesState] = useState<Record<string, any>>({});

  // Modal State
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [newLessonDate, setNewLessonDate] = useState(new Date().toISOString().split('T')[0]);
  const [addingLesson, setAddingLesson] = useState(false);

  useEffect(() => {
    api.get('/admin/references').then(res => setGroups(res.data.groups || [])).catch(() => {});
    api.get('/subjects').then(res => setSubjects(res.data || [])).catch(() => {});
  }, []);

  const availableSubjects = subjects.filter(s => s.courseYear === courseYear && s.semester === semester);

  useEffect(() => {
    if (groupName && subjectId) {
      fetchJournal();
    } else {
      setStudents([]);
      setLessons([]);
      setGradesState({});
    }
  }, [courseYear, semester, groupName, subjectId]);

  const fetchJournal = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/journal?groupName=${groupName}&subjectId=${subjectId}&semester=${semester}`);
      const { students, lessons, grades, totalScores } = res.data;
      
      setStudents(students);
      
      // Sort lessons by date
      const sortedLessons = lessons.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setLessons(sortedLessons);

      const newState: Record<string, any> = {};
      students.forEach((s: any) => {
        newState[s.userId] = { totalScore: '0' };
        
        const tScore = totalScores.find((t: any) => t.studentId === s.userId);
        if (tScore) newState[s.userId].totalScore = String(tScore.score);

        sortedLessons.forEach((l: any) => {
          const grade = grades.find((g: any) => g.studentId === s.userId && g.lessonId === l.id);
          newState[s.userId][l.id] = grade ? String(grade.score) : '';
        });
      });

      setGradesState(newState);
    } catch (err) {
      toast.error('Ошибка загрузки журнала');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (studentId: string, field: string, value: string) => {
    setGradesState(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = Object.keys(gradesState).map(studentId => ({
        studentId,
        totalScore: gradesState[studentId].totalScore,
        lessons: lessons.map(l => ({
          lessonId: l.id,
          score: gradesState[studentId]?.[l.id] ?? ''
        }))
      }));

      await api.post('/admin/journal', {
        subjectId,
        semester,
        updates
      });

      toast.success('Журнал сохранен!');
    } catch (err) {
      toast.error('Ошибка сохранения журнала');
    } finally {
      setSaving(false);
    }
  };

  const handleAddLessonSubmit = async () => {
    if (!newLessonDate) {
      toast.error("Выберите дату");
      return;
    }
    
    setAddingLesson(true);
    try {
      const res = await api.post('/admin/lessons', {
        courseYear,
        semester,
        groupName,
        subjectId,
        date: new Date(newLessonDate).toISOString(),
        departmentId: students[0]?.departmentId || ''
      });
      
      const newLesson = res.data;
      
      // Update local state without losing unsaved grades
      setLessons(prev => {
        const updated = [...prev, newLesson];
        return updated.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      });
      
      setGradesState(prev => {
        const newState = { ...prev };
        Object.keys(newState).forEach(studentId => {
          newState[studentId][newLesson.id] = '';
        });
        return newState;
      });

      toast.success('Занятие добавлено');
      setIsDateModalOpen(false);
    } catch (err) {
      toast.error('Ошибка добавления занятия');
    } finally {
      setAddingLesson(false);
    }
  };

  const handleExportExcel = () => {
    const headers = ["ФИО Студента", ...lessons.map(l => new Date(l.date).toLocaleDateString('ru-RU')), "Итоговая"];
    const rows = students.map(s => {
      const rowData: any = {};
      rowData["ФИО Студента"] = `${s.user?.lastName || ''} ${s.user?.firstName || ''}`.trim();
      
      lessons.forEach(l => {
        const dateKey = new Date(l.date).toLocaleDateString('ru-RU');
        rowData[dateKey] = gradesState[s.userId]?.[l.id] || '-';
      });
      
      rowData["Итоговая"] = gradesState[s.userId]?.totalScore || '0';
      return rowData;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Журнал");
    
    XLSX.writeFile(workbook, `Journal_${groupName}_course${courseYear}_sem${semester}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Журнал</h2>
          <p className="text-gray-400 mt-1">Единая ведомость успеваемости</p>
        </div>
      </div>

      <div className="glass-card p-6">
        {/* FILTERS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 border-b border-white/10 pb-6">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Курс</label>
            <select value={courseYear} onChange={e => {setCourseYear(Number(e.target.value)); setSubjectId('');}} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white">
              <option value={1}>1 курс</option>
              <option value={2}>2 курс</option>
              <option value={3}>3 курс</option>
              <option value={4}>4 курс</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Семестр</label>
            <select value={semester} onChange={e => {setSemester(Number(e.target.value)); setSubjectId('');}} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white">
              <option value={1}>{courseYear * 2 - 1} семестр</option>
              <option value={2}>{courseYear * 2} семестр</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Группа</label>
            <select value={groupName} onChange={e => setGroupName(e.target.value)} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white">
              <option value="">Выберите группу...</option>
              {groups.map((g: any) => <option key={g.id} value={g.name}>{g.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Предмет</label>
            <select value={subjectId} onChange={e => setSubjectId(e.target.value)} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white disabled:opacity-50" disabled={!groupName}>
              <option value="">Выберите предмет...</option>
              {availableSubjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        {/* JOURNAL GRID */}
        {groupName && subjectId ? (
          <div>
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-accent" /> Журнал группы {groupName}
              </h3>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleExportExcel}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors"
                >
                  <Download className="h-4 w-4" /> Скачать Excel
                </button>
                <button 
                  onClick={handleSave} 
                  disabled={saving || students.length === 0}
                  className="flex items-center gap-2 px-6 py-2 bg-accent text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 shadow-lg shadow-blue-500/20"
                >
                  <Save className="h-4 w-4" /> {saving ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-400">Загрузка журнала...</div>
            ) : students.length === 0 ? (
              <div className="text-center py-12 text-gray-500">В этой группе нет студентов</div>
            ) : (
              <div className="glass-card overflow-x-auto relative">
                <table className="w-full text-sm text-left text-gray-400 min-w-[800px] whitespace-nowrap">
                  <thead className="bg-white/5 text-gray-300 border-b border-white/10">
                    <tr>
                      <th className="px-4 py-3 sticky left-0 bg-[#0F172A] z-20 min-w-[200px]">ФИО Студента</th>
                      {lessons.map(l => (
                        <th key={l.id} className="px-2 py-3 text-center border-l border-white/5">
                          <div className="text-xs text-gray-500 font-normal">Урок</div>
                          <div className="font-medium text-white">{new Date(l.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}</div>
                        </th>
                      ))}
                      {/* ADD LESSON BUTTON IN HEADER */}
                      <th className="px-2 py-3 text-center border-l border-white/5 bg-white/5 w-16">
                         <button onClick={() => setIsDateModalOpen(true)} className="p-1.5 bg-accent/20 text-accent rounded hover:bg-accent hover:text-white transition-colors mx-auto block" title="Добавить дату занятия">
                           <Plus className="h-4 w-4" />
                         </button>
                      </th>
                      <th className="px-4 py-3 text-center border-l border-white/10 bg-accent/5 text-accent min-w-[120px]">
                        Итоговая
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {students.map((s) => (
                      <tr key={s.userId} className="hover:bg-white/5 transition-colors group">
                        <td className="px-4 py-3 font-medium text-white sticky left-0 bg-[#0F172A] group-hover:bg-[#1a2333] transition-colors z-10">
                          {s.user?.lastName} {s.user?.firstName}
                        </td>
                        
                        {/* LESSON COLUMNS */}
                        {lessons.map(l => (
                          <td key={l.id} className="px-2 py-2 text-center border-l border-white/5">
                            <input 
                              type="text" 
                              value={gradesState[s.userId]?.[l.id] || ''}
                              onChange={(e) => handleGradeChange(s.userId, l.id, e.target.value)}
                              placeholder="-"
                              className="w-14 px-1 py-1.5 text-center bg-white/5 border border-white/10 rounded text-white focus:ring-1 focus:ring-accent focus:bg-white/10 transition-colors uppercase"
                            />
                          </td>
                        ))}
                        
                        {/* EMPTY CELL UNDER PLUS BUTTON */}
                        <td className="px-2 py-2 border-l border-white/5 bg-white/5"></td>

                        {/* TOTAL SCORE COLUMN */}
                        <td className="px-4 py-2 text-center border-l border-white/10 bg-accent/5">
                          <input 
                            type="number" 
                            min="0" max="100"
                            value={gradesState[s.userId]?.totalScore || '0'}
                            onChange={(e) => handleGradeChange(s.userId, 'totalScore', e.target.value)}
                            className="w-20 px-2 py-1.5 text-center bg-accent/20 border border-accent/30 rounded text-accent font-bold focus:ring-2 focus:ring-accent transition-colors"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
           <div className="text-center py-16 text-gray-500">
             Сначала выберите курс, семестр и группу, а затем предмет для отображения журнала.
           </div>
        )}
      </div>

      {/* Date Picker Modal */}
      <AnimatePresence>
        {isDateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsDateModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm glass-card p-6 overflow-hidden z-10"
            >
              <button 
                onClick={() => setIsDateModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-accent/20 rounded-full text-accent">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Новое занятие</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Выберите дату проведения</label>
                  <input 
                    type="date" 
                    value={newLessonDate}
                    onChange={(e) => setNewLessonDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-accent focus:bg-white/10 transition-colors"
                  />
                </div>
                
                <button
                  onClick={handleAddLessonSubmit}
                  disabled={addingLesson}
                  className="w-full py-3 bg-accent text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                >
                  <Plus className="h-5 w-5" /> {addingLesson ? 'Добавление...' : 'Создать колонку'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
