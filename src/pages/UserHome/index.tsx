import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { WorkbenchPage } from './WorkbenchPage';
import { useGlobal } from '../../context/GlobalContext';
import { getLeadById } from '../../services/leads/savedLeadsStorage';

export default function UserHomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data, activeProjectLeadId } = useGlobal();
  const activeLead = activeProjectLeadId ? getLeadById(activeProjectLeadId) : null;

  const userDisplayName = `${data.userName || '用户'}${data.userTitle || ''}`.trim();
  const projectName =
    activeLead?.projectName ||
    activeLead?.projectPosition ||
    data.projectName ||
    data.projectLocation ||
    '';
  const contractAccepted =
    activeLead?.status === 'project' || !!data.contractAccepted;
  const contractSignatureData =
    activeLead?.contractSignatureData || data.contractSignatureData;
  const initialTab = (
    (location.state as { activeTab?: string } | null)?.activeTab ??
    (location.pathname === '/budget' ? 'budget' : undefined)
  ) as import('./WorkbenchPage').WorkbenchPageProps['initialTab'];

  return (
    <WorkbenchPage
      userDisplayName={userDisplayName}
      projectName={projectName}
      contractAccepted={contractAccepted}
      contractSignatureData={contractSignatureData}
      contractCustomText={data.contractCustomText}
      initialTab={initialTab}
      onExit={() => navigate('/')}
      onGoToContract={() => navigate('/contracts?from=home')}
      onBackToProjects={() => navigate('/projects')}
      onViewOrderDetail={(id) => navigate(`/order/${id}`)}
    />
  );
}
