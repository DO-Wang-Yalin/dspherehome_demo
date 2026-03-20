import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectPage } from './ProjectPage';
import { useGlobal } from '../../context/GlobalContext';
import { enterProjectWorkbenchFromLead } from '../../services/leads/enterProjectFromLead';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { updateData, setActiveProjectLeadId } = useGlobal();

  return (
    <ProjectPage
      onSelectProject={(project) => {
        enterProjectWorkbenchFromLead(project.leadId, updateData, setActiveProjectLeadId);
        navigate('/home', { state: { activeTab: 'requirements' } });
      }}
      onBack={() => navigate('/')}
    />
  );
}
