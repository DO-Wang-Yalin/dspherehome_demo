import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import { getProjects } from '../../services/projects';

export default function LoginWrapper() {
  const navigate = useNavigate();

  const handleLoginSuccess = async () => {
    try {
      const projects = await getProjects();
      if (projects.length === 1) {
        navigate('/home');
      } else {
        navigate('/projects');
      }
    } catch (error) {
      console.error('Failed to fetch projects after login:', error);
      navigate('/projects');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF3] text-gray-900 font-sans flex flex-col">
      <header className="w-full pt-8 pb-4 px-6 flex justify-center">
        <h1 className="text-2xl font-medium text-gray-900">登录</h1>
      </header>
      <main className="flex-1">
        <LoginPage
          onSuccess={handleLoginSuccess}
          onBack={() => navigate('/style-eval')}
        />
      </main>
    </div>
  );
}
