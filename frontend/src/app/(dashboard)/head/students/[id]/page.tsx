"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, User, Mail, Phone, Calendar, ShieldCheck, Award, FileText } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function StudentDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/departments/head/students/${id}`)
      .then(res => setStudent(res.data))
      .catch(err => {
        console.error(err);
        router.push('/head/students');
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <div className="animate-pulse h-64 bg-white/5 rounded-2xl border border-white/10" />;
  if (!student) return null;

  const { user } = student;

  return (
    <div className="space-y-6">
      <button onClick={() => router.back()} className="flex items-center text-gray-400 hover:text-white transition-colors">
        <ChevronLeft className="h-5 w-5 mr-1" /> Назад к списку
      </button>

      {/* Header Profile */}
      <div className="glass-card p-8 flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="h-32 w-32 rounded-full bg-accent/20 flex items-center justify-center text-4xl text-accent font-bold border-2 border-accent/30 overflow-hidden flex-shrink-0 relative">
          {user.avatarUrl ? <Image src={user.avatarUrl} alt="Avatar" fill className="object-cover" /> : `${user.firstName[0]}${user.lastName[0]}`}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold text-white mb-2">{user.lastName} {user.firstName} {user.patronymic}</h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-400 mb-6">
            <span className="flex items-center gap-1"><ShieldCheck className="h-4 w-4" /> {student.studentIdNumber}</span>
            <span className="flex items-center gap-1"><User className="h-4 w-4" /> {student.courseYear} курс, {student.groupName}</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/10">
            <div><p className="text-xs text-gray-500 mb-1">Email</p><p className="text-sm text-white">{user.email}</p></div>
            <div><p className="text-xs text-gray-500 mb-1">Телефон</p><p className="text-sm text-white">{student.phoneNumber || user.phone || 'Не указан'}</p></div>
            <div><p className="text-xs text-gray-500 mb-1">Дата рождения</p><p className="text-sm text-white">{student.birthDate ? new Date(student.birthDate).toLocaleDateString() : 'Нет данных'}</p></div>
            <div><p className="text-xs text-gray-500 mb-1">Национальность</p><p className="text-sm text-white">{student.nationality || 'Не указано'}</p></div>
            <div><p className="text-xs text-gray-500 mb-1">Место рождения</p><p className="text-sm text-white">{student.birthPlace || 'Не указано'}</p></div>
            <div><p className="text-xs text-gray-500 mb-1">Фактический адрес</p><p className="text-sm text-white">{student.actualAddress || 'Не указан'}</p></div>
            <div><p className="text-xs text-gray-500 mb-1">Состав семьи</p><p className="text-sm text-white">{student.familyStatus || 'Не указан'}</p></div>
            <div><p className="text-xs text-gray-500 mb-1">Хобби</p><p className="text-sm text-white">{student.hobbies || 'Не указаны'}</p></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Achievements */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Award className="h-5 w-5 text-accent" />
            <h3 className="text-lg font-bold text-white">Достижения</h3>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {student.achievements.length === 0 ? <p className="text-gray-500 text-sm">Нет достижений</p> : 
              student.achievements.map((ach: any) => {
                const fileUrl = ach.files?.[0]?.fileUrl;
                const Wrapper = fileUrl ? 'a' : 'div';
                return (
                  <Wrapper 
                    key={ach.id} 
                    {...(fileUrl ? { href: fileUrl, target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className={`block p-4 bg-white/5 border border-white/10 rounded-xl transition-colors ${fileUrl ? 'hover:bg-white/10 hover:border-accent/50 cursor-pointer' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-white font-medium text-sm">{ach.title}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${
                        ach.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                        ach.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>{ach.status}</span>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2">{ach.description}</p>
                    {fileUrl && <p className="text-[10px] text-accent mt-2 font-medium">Посмотреть прикрепленный файл</p>}
                  </Wrapper>
                );
              })
            }
          </div>
        </div>

        {/* Grades Overview */}
        <div className="glass-card p-6 lg:col-span-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-accent" />
              <h3 className="text-lg font-bold text-white">Успеваемость студента</h3>
            </div>
            
            <div className="flex gap-2">
              <select 
                value={student.selectedCourse || 1} 
                onChange={e => setStudent({...student, selectedCourse: Number(e.target.value)})}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
              >
                {[1,2,3,4].map(c => <option key={c} value={c}>{c} курс</option>)}
              </select>
              <select 
                value={student.selectedSemester || 1} 
                onChange={e => setStudent({...student, selectedSemester: Number(e.target.value)})}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
              >
                <option value={1}>1 семестр</option>
                <option value={2}>2 семестр</option>
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto custom-scrollbar">
            {(() => {
              const cYear = student.selectedCourse || 1;
              const sem = student.selectedSemester || 1;
              const filteredTotal = student.totalScores?.filter((t:any) => t.semester === sem) || [];
              const subjectIds = filteredTotal.map((t:any) => t.subjectId);
              
              const relevantSubjects = student.subjects?.filter((s:any) => subjectIds.includes(s.id) || (s.courseYear === cYear && s.semester === sem)) || [];
              
              if (relevantSubjects.length === 0) return <p className="text-gray-500 py-8 text-center">В этом семестре нет оценок</p>;

              const gradesMatrix = relevantSubjects.map((sub:any) => {
                const total = student.totalScores?.find((t:any) => t.subjectId === sub.id && t.semester === sem)?.score || 0;
                const sLessons = student.lessons?.filter((l:any) => l.subjectId === sub.id) || [];
                const sGrades = student.grades?.filter((g:any) => g.subjectId === sub.id) || [];
                
                const mappedGrades = sGrades.map((g:any) => {
                  const lesson = sLessons.find((l:any) => l.id === g.lessonId);
                  return { date: lesson?.date || new Date().toISOString(), score: g.score };
                }).sort((a:any, b:any) => new Date(a.date).getTime() - new Date(b.date).getTime());

                return { subjectName: sub.name, grades: mappedGrades, finalScore: total };
              });

              const maxL = Math.max(1, ...gradesMatrix.map((m:any) => m.grades.length));

              return (
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-white/5 border-b border-white/10 text-gray-400">
                    <tr>
                      <th className="px-6 py-4 font-medium border-r border-white/5 w-64">Предмет</th>
                      {Array.from({ length: maxL }).map((_, i) => (
                        <th key={i} className="px-4 py-4 font-medium text-center border-r border-white/5">Урок {i + 1}</th>
                      ))}
                      <th className="px-6 py-4 font-medium text-center">Итоговая</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {gradesMatrix.map((grade:any, idx:number) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-medium text-white border-r border-white/5">{grade.subjectName}</td>
                        {Array.from({ length: maxL }).map((_, i) => {
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
                    ))}
                  </tbody>
                </table>
              );
            })()}
          </div>
        </div>

        {/* Documents */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="h-5 w-5 text-accent" />
            <h3 className="text-lg font-bold text-white">Документы</h3>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
             {(!student.documents || student.documents.length === 0) ? <p className="text-gray-500 text-sm">Документов пока нет</p> : 
               student.documents.map((doc: any) => (
                 <a key={doc.id} href={process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') + doc.fileUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                   <div>
                     <h4 className="text-sm font-medium text-white">{doc.title}</h4>
                     <p className="text-xs text-gray-400">{new Date(doc.createdAt).toLocaleDateString()}</p>
                   </div>
                   <FileText className="h-4 w-4 text-accent" />
                 </a>
               ))
             }
          </div>
        </div>
      </div>
    </div>
  );
}
