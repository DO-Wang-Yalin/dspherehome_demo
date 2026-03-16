import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { WorkbenchPage } from './WorkbenchPage';
import { useGlobal } from '../../context/GlobalContext';

export default function UserHomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data } = useGlobal();

  const userDisplayName = `${data.userName || '用户'}${data.userTitle || ''}`.trim();
  const projectName = data.projectName || data.projectLocation || '';
  const initialTab = location.state?.activeTab as any;

  return (
    <WorkbenchPage
      userDisplayName={userDisplayName}
      projectName={projectName}
      contractAccepted={data.contractAccepted}
      contractSignatureData={data.contractSignatureData}
      contractCustomText={data.contractCustomText}
      initialTab={initialTab}
      onExit={() => navigate('/')}
      onGoToFirstPage={() => navigate('/style-eval')}
      onBackToProjects={() => navigate('/projects')}
      onViewOrderDetail={(id) => navigate(`/order/${id}`)}
    />
  );
}
