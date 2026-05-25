"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, Send } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function HeadVoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const router = useRouter();

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const res = await api.get(`/head/voice-search?q=${encodeURIComponent(query)}`);
      setResults(res.data);
    } catch (err) {
      toast.error('Ошибка ИИ-поиска');
    } finally {
      setLoading(false);
    }
  };

  const simulateListening = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      setQuery('Найди мне спортсменов'); 
    }, 2000);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 h-16 w-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(139,92,246,0.5)] hover:shadow-[0_0_30px_rgba(139,92,246,0.8)] transition-all hover:scale-110 z-40 group"
      >
        <span className="absolute inset-0 w-full h-full rounded-full opacity-0 group-hover:opacity-20 bg-white blur-sm transition-opacity duration-300"></span>
        <Mic className="h-7 w-7" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
            
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-lg glass-card p-6 z-10 h-[80vh] flex flex-col">
              <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.5)]">
                  <Mic className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">ИИ Завуч</h3>
                  <p className="text-xs text-gray-400">Голосовой помощник</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto mb-4 space-y-4 custom-scrollbar pr-2">
                <div className="bg-white/5 p-4 rounded-xl rounded-tl-none inline-block max-w-[85%] border border-white/10">
                  <p className="text-sm text-gray-300">Здравствуйте! Я ваш ИИ-помощник. Кого мне найти? Вы можете спросить, например:</p>
                  <ul className="text-xs text-accent mt-2 space-y-1 list-disc pl-4">
                    <li>Найди мне спортсменов</li>
                    <li>Покажи студентов из группы IS-2</li>
                    <li>Найди Асанова Саята</li>
                  </ul>
                </div>

                {query && results && (
                  <div className="bg-accent/20 p-4 rounded-xl rounded-tr-none inline-block max-w-[85%] border border-accent/30 self-end ml-auto text-white text-sm">
                    {query}
                  </div>
                )}

                {loading && (
                   <div className="bg-white/5 p-4 rounded-xl rounded-tl-none inline-block max-w-[85%] border border-white/10 text-sm text-gray-400">
                     Ищу информацию...
                   </div>
                )}

                {results && (
                  <div className="bg-white/5 p-4 rounded-xl rounded-tl-none w-full border border-white/10 text-sm text-gray-300">
                    <p className="mb-4 font-medium text-white">{results.message}</p>
                    {results.students && results.students.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3">
                        {results.students.map((s: any) => (
                          <div key={s.id} onClick={() => { setIsOpen(false); router.push(`/head/students/${s.id}`); }} className="flex items-center gap-3 p-3 bg-black/20 border border-white/5 rounded-xl hover:bg-white/10 hover:border-accent/30 cursor-pointer transition-colors">
                            <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center text-accent text-lg flex-shrink-0 font-bold">
                              {s.user?.lastName?.[0] || ''}{s.user?.firstName?.[0] || ''}
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-medium text-sm">{s.user?.lastName} {s.user?.firstName}</p>
                              <p className="text-xs text-gray-400">{s.groupName}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">Никого не найдено по вашему запросу.</p>
                    )}
                  </div>
                )}
              </div>

              <form onSubmit={handleSearch} className="relative mt-auto">
                <input 
                  type="text" 
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder={isListening ? "Слушаю вас..." : "Введите запрос..."}
                  className={`w-full pl-4 pr-24 py-4 bg-white/5 border ${isListening ? 'border-purple-500 shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'border-white/10'} rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-accent transition-all`}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button type="button" onClick={simulateListening} className={`p-2 rounded-xl transition-colors ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'text-gray-400 hover:text-white hover:bg-white/10'}`} title="Имитация голоса">
                    <Mic className="h-5 w-5" />
                  </button>
                  <button type="submit" disabled={!query || loading} className="p-2 bg-accent text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-colors">
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
