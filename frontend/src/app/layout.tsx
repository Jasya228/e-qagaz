import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from 'sonner';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "e-qagaz - Студенческий Архив",
  description: "Система электронного архива студентов колледжа",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="dark">
      <body className={inter.className}>
        <div className="relative min-h-screen flex flex-col">
          {/* Global Background Glow - Matching Login Page Design */}
          <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse pointer-events-none" />
          <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />
          <div className="fixed top-[20%] right-[20%] w-[20vw] h-[20vw] bg-emerald-500/10 rounded-full blur-[100px] mix-blend-screen animate-pulse pointer-events-none" style={{ animationDelay: '4s' }} />
          
          <main className="flex-grow z-10">
            {children}
          </main>
        </div>
        <Toaster theme="dark" position="bottom-right" richColors />
      </body>
    </html>
  );
}
