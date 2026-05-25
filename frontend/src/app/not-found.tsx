import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="glass-card p-12 text-center max-w-md w-full">
        <div className="text-accent text-6xl font-bold mb-4">404</div>
        <h1 className="text-2xl font-bold text-white mb-2">Страница не найдена</h1>
        <p className="text-gray-400 mb-8">
          Извините, мы не смогли найти то, что вы искали.
        </p>
        <Link 
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-accent hover:bg-blue-600 transition-colors w-full"
        >
          Вернуться на главную
        </Link>
      </div>
    </div>
  );
}
