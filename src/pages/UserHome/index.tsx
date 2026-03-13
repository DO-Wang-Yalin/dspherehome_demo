import React from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkbenchPage } from './WorkbenchPage';
import { useGlobal } from '../../context/GlobalContext';

export default function UserHomePage() {
  const navigate = useNavigate();
  const { data } = useGlobal();

  const userDisplayName = `${data.userName || '用户'}${data.userTitle || ''}`.trim();
  const projectName = data.projectName || data.projectLocation || '';

  return (
    <WorkbenchPage
      userDisplayName={userDisplayName}
      projectName={projectName}
      contractAccepted={data.contractAccepted}
      contractSignatureData={data.contractSignatureData}
      contractCustomText={data.contractCustomText}
      onExit={() => navigate('/')}
      onGoToFirstPage={() => navigate('/style-eval')}
      onBackToProjects={() => navigate('/projects')}
      onViewOrderDetail={(id) => navigate(`/order/${id}`)}
    />
  );
}
