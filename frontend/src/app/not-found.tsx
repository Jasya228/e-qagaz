"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-8 text-center max-w-lg w-full relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 mb-4 tracking-tighter">
          404
        </h1>
        
        <p className="text-xl text-gray-300 font-medium mb-8">
          Вы забрели куда-то не туда, бро...
        </p>

        <div className="rounded-xl overflow-hidden shadow-2xl shadow-purple-500/10 mb-8 border border-white/10">
          {/* Using http.cat as a reliable meme source */}
          <img 
            src="https://http.cat/404" 
            alt="404 Cat Meme" 
            className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>

        <Link href="/">
          <button className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-white/10 hover:bg-white/20 hover:scale-105 transition-all duration-300 border-white/5 shadow-lg">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Вернуться домой
          </button>
        </Link>
      </motion.div>
    </div>
  );
}
