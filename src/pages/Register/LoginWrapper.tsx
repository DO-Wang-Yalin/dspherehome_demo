import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginPage } from './LoginPage';

export default function LoginWrapper() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#FFFDF3] text-gray-900 font-sans flex flex-col">
      <header className="w-full pt-8 pb-4 px-6 flex justify-center">
        <h1 className="text-2xl font-medium text-gray-900">登录</h1>
      </header>
      <main className="flex-1">
        <LoginPage
          onSuccess={() => navigate('/projects')}
          onBack={() => navigate('/register')}
        />
      </main>
    </div>
  );
}
