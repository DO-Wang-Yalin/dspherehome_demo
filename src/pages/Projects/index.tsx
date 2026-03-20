import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectPage } from './ProjectPage';
import { useGlobal } from '../../context/GlobalContext';
import { enterProjectWorkbenchFromLead } from '../../services/leads/enterProjectFromLead';
import { getLeadById } from '../../services/leads/savedLeadsStorage';

function normalizePhoneDigits(p: string) {
  return p.replace(/\D/g, '');
}

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { data, updateData, setActiveProjectLeadId } = useGlobal();

  return (
    <ProjectPage
      onSelectProject={(project) => {
        const lead = getLeadById(project.leadId);
        const sameSession =
          !!lead &&
          normalizePhoneDigits(lead.phone || '') !== '' &&
          normalizePhoneDigits(lead.phone || '') === normalizePhoneDigits(data.userPhone || '');
        enterProjectWorkbenchFromLead(
          project.leadId,
          updateData,
          setActiveProjectLeadId,
          sameSession ? data : undefined,
        );
        navigate('/home', { state: { activeTab: 'requirements' } });
      }}
      onBack={() => navigate('/')}
    />
  );
}
