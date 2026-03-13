import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectPage } from './ProjectPage';
import { useGlobal } from '../../context/GlobalContext';

export default function ProjectsPage() {
  const navigate = useNavigate();
  // const { updateData } = useGlobal();

  return (
    <ProjectPage
      onSelectProject={(project) => {
        // Handle project selection logic if needed, e.g. update global data
        navigate('/home');
      }}
      onBack={() => navigate('/register')} // Or login
    />
  );
}
