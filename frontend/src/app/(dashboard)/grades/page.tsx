"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Search, GraduationCap, X } from 'lucide-react';
import { toast } from 'sonner';

interface GradeGroup {
  subjectName: string;
  grades: { date: string, score: number }[];
  finalScore: number;
}

export default function GradesPage() {
  const [step, setStep] = useState<'course' | 'table'>('course');
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [search, setSearch] = useState('');
  const [grades, setGrades] = useState<GradeGroup[]>([]);
  const [loading, setLoading] = useState(false);

  // Fake or Real fetching when transitioning to table
  const fetchGrades = async (course: number, semester: number, searchQuery: string = '') => {
    setLoading(true);
    try {
      const res = await api.get('/grades/my-grades', {
        params: {
          semester: `${course}-${semester}`,
          search: searchQuery,
        }
      });
      setGrades(res.data.data);
    } catch (err) {
      toast.error('Не удалось загрузить успеваемость');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = (course: number) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleSemesterSelect = (semester: number) => {
    setSelectedSemester(semester);
    setIsModalOpen(false);
    setStep('table');
    fetchGrades(selectedCourse!, semester, search);
  };

  useEffect(() => {
    if (step === 'table' && selectedCourse && selectedSemester) {
      const delayFn = setTimeout(() => {
        fetchGrades(selectedCourse, selectedSemester, search);
      }, 500);
      return () => clearTimeout(delayFn);
    }
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Успеваемость</h2>
          <p className="text-gray-400 mt-1">Просмотр баллов и итоговых оценок по семестрам</p>
        </div>
        {step === 'table' && (
          <button 
            onClick={() => setStep('course')}
            className="glass-button flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
          >
            <ChevronLeft className="h-4 w-4" /> Назад к курсам
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {step === 'course' && (
          <motion.div 
            key="courses"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[1, 2, 3, 4].map((course) => (
              <motion.button
                key={course}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCourseSelect(course)}
                className="glass-card p-8 flex flex-col items-center justify-center gap-4 text-center group transition-all hover:border-accent/50 hover:bg-white/10"
              >
                <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <GraduationCap className="h-8 w-8 text-accent" />
                </div>
                <span className="text-xl font-semibold text-white">{course} курс</span>
              </motion.button>
            ))}
          </motion.div>
        )}

        {step === 'table' && (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="inline-flex items-center px-4 py-2 rounded-xl bg-accent/20 text-accent border border-accent/30 font-medium">
                {selectedCourse} курс, {selectedSemester} семестр
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Поиск по предмету..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>

            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-white/5 border-b border-white/10 text-gray-400">
                    <tr>
                      <th className="px-6 py-4 font-medium border-r border-white/5 w-64">Предмет</th>
                      {Array.from({ length: Math.max(1, ...grades.map(g => g.grades?.length || 0)) }).map((_, i) => (
                        <th key={i} className="px-4 py-4 font-medium text-center border-r border-white/5">Урок {i + 1}</th>
                      ))}
                      <th className="px-6 py-4 font-medium text-center">Итоговая</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading ? (
                      [1, 2, 3, 4, 5].map((i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-6 py-4"><div className="h-4 bg-white/10 rounded w-3/4"></div></td>
                          <td className="px-6 py-4"><div className="h-4 bg-white/10 rounded w-1/2"></div></td>
                          <td className="px-6 py-4"><div className="h-4 bg-white/10 rounded w-1/4 ml-auto"></div></td>
                        </tr>
                      ))
                    ) : grades.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                          Оценок не найдено.
                        </td>
                      </tr>
                    ) : (
                      grades.map((grade, idx) => {
                        const maxLessons = Math.max(1, ...grades.map(g => g.grades?.length || 0));
                        return (
                          <tr key={idx} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 font-medium text-white border-r border-white/5">{grade.subjectName}</td>
                            
                            {Array.from({ length: maxLessons }).map((_, i) => {
                              const g = grade.grades?.[i];
                              return (
                                <td key={i} className="px-2 py-2 border-r border-white/5 text-center min-w-[80px]">
                                  {g ? (
                                    <div className="flex flex-col items-center justify-center p-1 rounded hover:bg-white/5">
                                      <span className="text-[10px] text-gray-500 mb-1 leading-none">{new Date(g.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}</span>
                                      <span className={`font-bold text-sm leading-none ${g.score >= 90 ? 'text-green-400' : g.score >= 70 ? 'text-blue-400' : g.score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>{g.score}</span>
                                    </div>
                                  ) : (
                                    <span className="text-gray-600/50 text-xs">-</span>
                                  )}
                                </td>
                              );
                            })}

                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold border ${
                                grade.finalScore >= 90 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                                grade.finalScore >= 75 ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                grade.finalScore >= 50 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                'bg-red-500/10 text-red-400 border-red-500/20'
                              }`}>
                                {grade.finalScore}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Semester Selection Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm glass-card p-6 overflow-hidden z-10"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              
              <h3 className="text-xl font-bold text-white mb-6">Выберите семестр</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleSemesterSelect(1)}
                  className="w-full glass-button py-4 px-4 rounded-xl text-left text-white font-medium group hover:pl-6 transition-all"
                >
                  <span className="text-accent mr-2">I</span> Семестр
                </button>
                <button
                  onClick={() => handleSemesterSelect(2)}
                  className="w-full glass-button py-4 px-4 rounded-xl text-left text-white font-medium group hover:pl-6 transition-all"
                >
                  <span className="text-accent mr-2">II</span> Семестр
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
