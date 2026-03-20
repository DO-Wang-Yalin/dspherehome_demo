import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { GlobalProvider } from './context/GlobalContext';
import { DeepEvalFormProvider } from './components/DeepEvalFormContext';

import StyleEvalPage from './pages/StyleEval';
import LandingPage from './pages/Landing/LandingPage';
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
import QuotationPage from './pages/Quotation';
import SettlementPage from './pages/Settlement';

function ScrollToTopOnNavigate() {
  const { pathname, search } = useLocation();
  React.useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, search]);
  return null;
}

export default function App() {
  return (
    <GlobalProvider>
      <DeepEvalFormProvider>
        <BrowserRouter>
          <ScrollToTopOnNavigate />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/admin" element={<Navigate to="/" replace />} />
            <Route path="/style-eval" element={<StyleEvalPage />} />
            <Route path="/leads" element={<LeadsPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginWrapper />} />
            <Route path="/contracts" element={<ContractsPage />} />
            <Route path="/home" element={<UserHomePage />} />
            <Route path="/order/:id" element={<OrderDetailPage />} />
            <Route path="/deep-eval" element={<DeepEvalPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/budget" element={<UserHomePage />} />
            <Route path="/budget-breakdown" element={<BudgetPage />} />
            <Route path="/feedback" element={<DesignFeedbackPage />} />
            <Route path="/quotation/:id/:ver" element={<QuotationPage />} />
            <Route path="/settlement/:id" element={<SettlementPage />} />
          </Routes>
        </BrowserRouter>
      </DeepEvalFormProvider>
    </GlobalProvider>
  );
}
