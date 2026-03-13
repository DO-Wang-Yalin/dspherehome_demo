import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DesignFeedbackApp } from './DesignFeedbackApp';

export default function DesignFeedbackPage() {
  const navigate = useNavigate();

  return (
    <DesignFeedbackApp onGoHome={() => navigate(-1)} />
  );
}
