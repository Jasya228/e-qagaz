"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User as UserIcon, LayoutDashboard, FileText, Settings, Award, Users, Bell, Check, Menu, X } from 'lucide-react';
import { api } from '@/lib/api';
import GlobalAICopilot from '@/components/GlobalAICopilot';

// ---------- Notifications Dropdown ----------
function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const int = setInterval(fetchNotifications, 30000);
    return () => clearInterval(int);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (e) {}
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {}
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-[#0F172A]">
            {unreadCount}
          </span>
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-80 glass-card z-50 overflow-hidden shadow-2xl"
            >
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h3 className="font-medium text-white">Уведомления</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-accent hover:underline">
                    Прочитать все
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">Нет уведомлений</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-4 border-b border-white/5 flex gap-3 hover:bg-white/5 transition-colors ${!n.isRead ? 'bg-accent/5' : ''}`}
                    >
                      <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!n.isRead ? 'bg-accent' : 'bg-transparent'}`} />
                      <div className="flex-1">
                        <p className="text-sm text-gray-300">{n.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!n.isRead && (
                        <button
                          onClick={() => markAsRead(n.id)}
                          className="text-gray-400 hover:text-green-400 self-start p-1"
                          title="Отметить как прочитанное"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------- Dashboard Layout ----------
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error(e);
    } finally {
      logout();
      router.push('/login');
    }
  };

  const getNavItems = () => {
    if (!user) return [];
    if (user.role === 'ADMIN') {
      return [
        { name: 'Дашборд', href: '/admin', icon: LayoutDashboard },
        { name: 'Пользователи', href: '/admin/users', icon: Users },
        { name: 'Справочники', href: '/admin/references', icon: FileText },
        { name: 'Предметы', href: '/admin/subjects', icon: FileText },
        { name: 'Оценки', href: '/admin/lessons', icon: Award },
        { name: 'Журнал', href: '/admin/journal', icon: FileText },
        { name: 'Настройки', href: '/settings', icon: Settings },
      ];
    }
    if (user.role === 'HEAD_DEPARTMENT') {
      return [
        { name: 'Дашборд', href: '/head', icon: LayoutDashboard },
        { name: 'Преподаватели', href: '/head/teachers', icon: Users },
        { name: 'Студенты', href: '/head/students', icon: Users },
        { name: 'Настройки', href: '/settings', icon: Settings },
      ];
    }
    if (user.role === 'TEACHER') {
      return [
        { name: 'Обо мне', href: '/profile', icon: UserIcon },
        { name: 'Моя группа', href: '/my-group', icon: Users },
        { name: 'Настройки', href: '/settings', icon: Settings },
      ];
    }
    // STUDENT
    return [
      { name: 'Обо мне', href: '/profile', icon: UserIcon },
      { name: 'Успеваемость', href: '/grades', icon: Award },
      { name: 'Документы', href: '/documents', icon: FileText },
      { name: 'Достижения', href: '/achievements', icon: Award },
      { name: 'Настройки', href: '/settings', icon: Settings },
    ];
  };

  const navItems = getNavItems();

  if (!user) return null; // could show a loading skeleton

  return (
    <div className="flex h-screen overflow-hidden">
      
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 glass border-r border-white/5 flex flex-col h-full transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
          <h1 className="text-xl font-bold text-white tracking-wider">e-qagaz</h1>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-colors duration-200 ${
                  isActive ? 'bg-accent/10 text-accent' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-accent' : 'text-gray-500 group-hover:text-gray-300'}`} aria-hidden="true" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex w-full items-center px-3 py-2.5 text-sm font-medium text-red-400 rounded-xl hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Выйти
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="h-16 glass border-b border-white/5 flex items-center justify-between px-4 md:px-8 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-gray-400 hover:text-white p-2 -ml-2"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="text-sm text-gray-400 hidden md:block">
              {new Date().toLocaleDateString('ru-RU', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
          <div className="flex items-center gap-6 ml-auto">
            <NotificationsDropdown />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-white">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-xs text-gray-500">{user.role}</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold border border-accent/30 flex-shrink-0">
                {user.firstName[0]}
                {user.lastName[0]}
              </div>
            </div>
          </div>
        </header>
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full max-w-[100vw]">
          {children}
        </main>
      </div>
      {user.role !== 'ADMIN' && <GlobalAICopilot />}
    </div>
  );
}
