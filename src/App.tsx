import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GlobalProvider } from './context/GlobalContext';
import { DeepEvalFormProvider } from './components/DeepEvalFormContext';

import StyleEvalPage from './pages/StyleEval';
import LeadsPage from './pages/Leads';
import RegisterPage from './pages/Register';
import LoginWrapper from './pages/Register/LoginWrapper';
import ContractsPage from './pages/Contracts';
import UserHomePage from './pages/UserHome';
import OrderDetailPage from './pages/UserHome/OrderDetailPage';
import DeepEvalPage from './pages/DeepEval';
import ProjectsPage from './pages/Projects';
import BudgetPage from './pages/Budget';
import DesignFeedbackPage from './pages/DesignFeedback';

export default function App() {
  return (
    <GlobalProvider>
      <DeepEvalFormProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/style-eval" replace />} />
            <Route path="/style-eval" element={<StyleEvalPage />} />
            <Route path="/leads" element={<LeadsPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginWrapper />} />
            <Route path="/contracts" element={<ContractsPage />} />
            <Route path="/home" element={<UserHomePage />} />
            <Route path="/order/:id" element={<OrderDetailPage />} />
            <Route path="/deep-eval" element={<DeepEvalPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/budget" element={<BudgetPage />} />
            <Route path="/feedback" element={<DesignFeedbackPage />} />
          </Routes>
        </BrowserRouter>
      </DeepEvalFormProvider>
    </GlobalProvider>
  );
}
