"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Mic, Send, User, ChevronRight, Trophy, BarChart, FileText } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function GlobalAICopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<any[]>([{
    role: 'ai',
    type: 'text',
    text: 'Привет! Я Qagaz-ai, ваш встроенный умный помощник. Вы можете пообщаться со мной или попросить найти студентов, рейтинг достижений или статистику системы. Чем могу помочь?',
  }]);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const router = useRouter();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const toggleVoiceInput = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Ваш браузер не поддерживает голосовой ввод');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'ru-RU';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      handleSend(transcript);
    };
    recognition.onerror = (event: any) => {
      setIsRecording(false);
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        toast.error('Разрешите доступ к микрофону в настройках браузера');
      } else if (event.error === 'audio-capture') {
        toast.error('Микрофон не найден. Подключите микрофон и попробуйте снова');
      } else if (event.error === 'no-speech') {
        toast.error('Голос не обнаружен. Пожалуйста, говорите громче');
      } else if (event.error === 'network') {
        toast.error('Сетевая ошибка. Для голосового ввода Chrome требуется связь с серверами распознавания Google. Проверьте интернет или отключите VPN.');
      } else if (event.error === 'aborted') {
        // Silent abort
      } else {
        toast.error(`Ошибка голосового ввода: ${event.error}`);
      }
    };
    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
    } catch (e) {
      console.error('Recognition start error:', e);
    }
  };

  const handleSend = async (text: string = query) => {
    if (!text.trim()) return;
    
    // Add User Message
    const userMsg = { role: 'user', type: 'text', text };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const res = await api.post('/ai', { query: text });
      
      setMessages(prev => [...prev, {
        role: 'ai',
        ...res.data
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'ai',
        type: 'text',
        text: 'К сожалению, сервис AI сейчас недоступен. Попробуйте позже.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessageContent = (msg: any) => {
    if (msg.role === 'user') {
      return <div className="text-white text-sm">{msg.text}</div>;
    }

    return (
      <div className="space-y-3">
        {/* Text Part */}
        <div className="text-gray-200 text-sm leading-relaxed">{msg.text}</div>
        
        {/* Rich Cards */}
        {msg.type === 'student_card' && msg.data && (
          <div className="bg-white/10 border border-white/20 p-3 rounded-xl flex items-center justify-between hover:bg-white/20 transition-colors cursor-pointer" onClick={() => { setIsOpen(false); router.push(`/head/students/${msg.data.userId}`); }}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                {msg.data.user?.lastName?.[0] || 'S'}
              </div>
              <div>
                <p className="text-white font-medium text-sm">{msg.data.user?.lastName} {msg.data.user?.firstName}</p>
                <p className="text-xs text-gray-400">{msg.data.courseYear} курс, {msg.data.groupName}</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        )}

        {msg.type === 'student_list' && msg.data && (
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
            {msg.data.map((s: any, idx: number) => (
              <div key={idx} className="bg-white/5 border border-white/10 p-2.5 rounded-lg flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer" onClick={() => { setIsOpen(false); router.push(`/head/students/${s.userId}`); }}>
                <div>
                  <p className="text-white text-sm">{s.user?.lastName} {s.user?.firstName}</p>
                  <p className="text-[10px] text-gray-400">{s.groupName}</p>
                </div>
                <button className="text-accent text-xs">Профиль</button>
              </div>
            ))}
          </div>
        )}

        {msg.type === 'leaderboard' && msg.data && (
          <div className="space-y-2">
            {msg.data.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center gap-3 bg-gradient-to-r from-accent/10 to-transparent p-3 rounded-xl border border-accent/20">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-accent/30 text-accent flex items-center justify-center text-xs font-bold">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{item.student.user?.lastName} {item.student.user?.firstName}</p>
                  <p className="text-xs text-gray-400">{item.student.groupName}</p>
                </div>
                <div className="flex items-center gap-1 text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-md text-xs font-bold border border-yellow-500/20">
                  <Trophy className="h-3 w-3" /> {item.count}
                </div>
              </div>
            ))}
          </div>
        )}

        {msg.type === 'navigation' && msg.data && (
          <div 
            className="bg-white/10 border border-indigo-500/30 p-3 rounded-xl flex items-center justify-between hover:bg-white/20 hover:border-indigo-500/50 transition-all cursor-pointer shadow-lg shadow-indigo-500/5" 
            onClick={() => { setIsOpen(false); router.push(msg.data.path); }}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0">
                {msg.data.icon === 'profile' && <User className="h-5 w-5" />}
                {msg.data.icon === 'grades' && <BarChart className="h-5 w-5" />}
                {msg.data.icon === 'achievements' && <Trophy className="h-5 w-5" />}
                {msg.data.icon === 'documents' && <FileText className="h-5 w-5" />}
                {!['profile', 'grades', 'achievements', 'documents'].includes(msg.data.icon) && <Sparkles className="h-5 w-5" />}
              </div>
              <div>
                <p className="text-white font-medium text-sm">{msg.data.title}</p>
                <p className="text-xs text-gray-400">Нажмите, чтобы открыть раздел</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-indigo-400 flex-shrink-0" />
          </div>
        )}

      </div>
    );
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 h-14 w-14 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30 z-50 group hover:shadow-indigo-500/50 transition-all duration-300"
          >
            <Sparkles className="h-6 w-6 text-white group-hover:animate-pulse" />
            <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
            
                <div className="absolute right-full mr-4 bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap backdrop-blur-md border border-white/10 pointer-events-none">
                  Qagaz-ai <span className="text-gray-400 ml-1">Cmd+K</span>
                </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Copilot Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0 sm:items-end sm:justify-end">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none" 
              onClick={() => setIsOpen(false)} 
            />
            
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95, transition: { duration: 0.2 } }}
              className="relative w-full max-w-md bg-[#0F172A]/90 backdrop-blur-xl border border-white/10 sm:rounded-2xl shadow-2xl sm:mb-6 sm:mr-6 flex flex-col overflow-hidden"
              style={{ height: '80vh', maxHeight: '600px' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm">Qagaz-ai</h3>
                    <p className="text-[10px] text-gray-400">Powered by e-Qagaz</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map((msg, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl p-4 ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-br-sm shadow-md' 
                        : 'bg-white/5 border border-white/10 rounded-bl-sm backdrop-blur-md'
                    }`}>
                      {msg.role === 'ai' && (
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="h-3 w-3 text-indigo-400" />
                          <span className="text-xs font-semibold text-indigo-400">Copilot</span>
                        </div>
                      )}
                      {renderMessageContent(msg)}
                    </div>
                  </motion.div>
                ))}
                
                {loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm p-4 flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-white/10 bg-white/5">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl p-1 pr-2 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all"
                >
                  <button 
                    type="button"
                    onClick={toggleVoiceInput}
                    className={`p-2 rounded-lg transition-colors ${isRecording ? 'text-red-400 bg-red-500/10 animate-pulse' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                  >
                    <Mic className="h-5 w-5" />
                  </button>
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Спросите ИИ о чем угодно..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-0 px-2 py-2"
                  />
                  <button 
                    type="submit"
                    disabled={!query.trim() || loading}
                    className="p-2 bg-indigo-500 text-white rounded-lg disabled:opacity-50 hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
                <div className="text-center mt-2">
                  <p className="text-[9px] text-gray-500">AI может допускать ошибки. Проверяйте информацию.</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
