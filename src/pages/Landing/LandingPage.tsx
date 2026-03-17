import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Settings, ChevronRight, Sparkles } from 'lucide-react';
import { useGlobal } from '../../context/GlobalContext';
import { getProjects } from '../../services/projects';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useGlobal();

  const handleEnterProjects = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    try {
      const projects = await getProjects();
      if (projects.length === 1) {
        navigate('/home');
      } else {
        navigate('/projects');
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      navigate('/projects');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF3] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#FFCE42]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-[#4887FF]/5 rounded-full blur-3xl" />

      <main className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-gray-100 mb-8">
            <Sparkles size={16} className="text-[#EF6B00]" />
            <span className="text-sm font-medium text-gray-600">Dsphr Home</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight mb-6">
            开启您的<br />
            <span className="text-[#EF6B00]">专属家居定制</span>之旅
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-12">
            从风格测评到深度定制，我们为您提供全方位的家居设计与交付服务。
            让每一个空间都承载您的生活理想。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/style-eval')}
              className="group relative px-8 py-4 bg-[#FF9C3E] text-white rounded-2xl font-bold text-lg shadow-lg shadow-orange-200 hover:bg-[#EF6B00] transition-all active:scale-95 flex items-center gap-2"
            >
              立即开启体验
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button
              onClick={handleEnterProjects}
              className="px-8 py-4 bg-white text-gray-700 rounded-2xl font-bold text-lg border border-gray-200 hover:bg-gray-50 transition-all active:scale-95"
            >
              进入我的项目
            </button>
          </div>
        </motion.div>
      </main>

      {/* Settings Icon in Bottom Left */}
      <div className="absolute bottom-8 left-8">
        <button
          onClick={() => navigate('/admin')}
          className="w-12 h-12 rounded-2xl bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#EF6B00] hover:border-[#EF6B00]/20 transition-all active:scale-90 group"
          title="进入后台管理"
        >
          <Settings size={24} className="group-hover:rotate-90 transition-transform duration-500" />
        </button>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-8 right-8 text-right hidden md:block">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Version 1.0.4</div>
        <div className="text-xs text-gray-500 font-medium">© 2026 Dsphr Home</div>
      </div>
    </div>
  );
}
