import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DesignFeedbackApp } from './DesignFeedbackApp';

export default function DesignFeedbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderNumber, openViewerDirectly } = (location.state || {}) as {
    orderNumber?: string;
    openViewerDirectly?: boolean;
  };

  return (
    <DesignFeedbackApp
      onGoHome={() => (orderNumber ? navigate(`/order/${orderNumber}`) : navigate(-1))}
      orderNumber={orderNumber}
      openViewerDirectly={!!openViewerDirectly}
    />
  );
}
