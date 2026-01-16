import React, { useState, Suspense, useCallback } from 'react';
import { Layout } from './components/Layout';
import { AppStep, AppTab, Attachment, PatientData } from './types';
import { analyzeCase } from './services/geminiService';
import { AlertCircle, FileText, Loader2 } from 'lucide-react';

// Lazy load heavy view components
const InputForm = React.lazy(() => import('./components/InputForm').then(module => ({ default: module.InputForm })));
const LoadingView = React.lazy(() => import('./components/LoadingView').then(module => ({ default: module.LoadingView })));
const AnalysisView = React.lazy(() => import('./components/AnalysisView').then(module => ({ default: module.AnalysisView })));
const TelemedicineView = React.lazy(() => import('./components/TelemedicineView').then(module => ({ default: module.TelemedicineView })));
const DrHouseChat = React.lazy(() => import('./components/DrHouseChat').then(module => ({ default: module.DrHouseChat })));
const VisionView = React.lazy(() => import('./components/VisionView').then(module => ({ default: module.VisionView })));

const App: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DIAGNOSTIC);

  // Diagnostic Flow State
  const [step, setStep] = useState<AppStep>(AppStep.INPUT);
  const [report, setReport] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Memoized Handlers to prevent unnecessary re-renders of child components
  const handleSubmit = useCallback(async (data: PatientData, attachments: Attachment[]) => {
    setStep(AppStep.ANALYZING);
    setError(null);

    try {
      const result = await analyzeCase(data, attachments);
      setReport(result);
      setStep(AppStep.RESULT);
    } catch (err: unknown) {
      console.error(err);
      setError("Connection error with Vertice AI Health core. Please verify API key and network connection.");
      setStep(AppStep.INPUT);
    }
  }, []);

  const handleReset = useCallback(() => {
    setReport('');
    setStep(AppStep.INPUT);
  }, []);

  const handleTabChange = useCallback((tab: AppTab) => {
    setActiveTab(tab);
  }, []);

  // Content Renderer
  const renderContent = () => {
    // Shared Suspense fallback
    const fallback = (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="animate-spin text-brand-500" size={48} />
      </div>
    );

    if (activeTab === AppTab.VISION) {
      return (
        <Suspense fallback={fallback}>
          <VisionView />
        </Suspense>
      );
    }

    if (activeTab === AppTab.DR_HOUSE) {
      return (
        <Suspense fallback={fallback}>
          <DrHouseChat />
        </Suspense>
      );
    }

    if (activeTab === AppTab.TELEMEDICINE) {
      return (
        <Suspense fallback={fallback}>
          <TelemedicineView />
        </Suspense>
      );
    }

    if (activeTab === AppTab.HISTORY) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500 animate-fade-in">
          <div className="bg-white p-6 rounded-full shadow-sm mb-4">
            <FileText size={48} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-700">Patient Records</h3>
          <p>Secure history module is currently locked for this demo session.</p>
        </div>
      );
    }

    // Default: Diagnostic Tab
    return (
      <Suspense fallback={fallback}>
        {error && (
          <div className="max-w-4xl mx-auto mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3 shadow-sm animate-fade-in">
            <AlertCircle size={20} />
            <span className="font-semibold">Error:</span> {error}
          </div>
        )}

        {step === AppStep.INPUT && (
          <InputForm onSubmit={handleSubmit} isSubmitting={false} />
        )}

        {step === AppStep.ANALYZING && (
          <LoadingView />
        )}

        {step === AppStep.RESULT && (
          <AnalysisView report={report} onReset={handleReset} />
        )}
      </Suspense>
    );
  };

  return (
    <Layout activeTab={activeTab} onTabChange={handleTabChange}>
      {renderContent()}
    </Layout>
  );
};

export default App;