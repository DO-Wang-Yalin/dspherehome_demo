import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DesignFeedbackApp } from './DesignFeedbackApp';
import { useGlobal } from '../../context/GlobalContext';
import { addResolvedPendingKey } from '../../utils/pendingDecisionResolvedStorage';

export default function DesignFeedbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeProjectLeadId } = useGlobal();
  const {
    orderNumber,
    openViewerDirectly,
    fromPendingDecision,
    pendingItemKeyOnReturnHome,
  } = (location.state || {}) as {
    orderNumber?: string;
    openViewerDirectly?: boolean;
    fromPendingDecision?: boolean;
    /** 从待定决策进入的 S01 回访：返回项目中心时记为已处理 */
    pendingItemKeyOnReturnHome?: string;
  };

  return (
    <DesignFeedbackApp
      onGoHome={() => {
        if (pendingItemKeyOnReturnHome && activeProjectLeadId) {
          addResolvedPendingKey(activeProjectLeadId, pendingItemKeyOnReturnHome);
        }
        if (fromPendingDecision) {
          navigate('/home');
          return;
        }
        if (orderNumber) navigate(`/order/${orderNumber}`);
        else navigate(-1);
      }}
      orderNumber={orderNumber}
      openViewerDirectly={!!openViewerDirectly}
    />
  );
}
