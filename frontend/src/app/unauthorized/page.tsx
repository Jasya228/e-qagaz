import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="glass-card p-12 text-center max-w-md w-full">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/10 mb-6">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Доступ запрещен</h1>
        <p className="text-gray-400 mb-8">
          У вас нет прав для просмотра этой страницы.
        </p>
        <Link 
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-secondary hover:bg-secondary/80 transition-colors w-full"
        >
          Вернуться на дашборд
        </Link>
      </div>
    </div>
  );
}
