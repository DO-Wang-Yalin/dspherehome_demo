import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DesignFeedbackApp } from './DesignFeedbackApp';

export default function DesignFeedbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderNumber } = location.state || {};

  return (
    <DesignFeedbackApp onGoHome={() => navigate(-1)} orderNumber={orderNumber} />
  );
}
