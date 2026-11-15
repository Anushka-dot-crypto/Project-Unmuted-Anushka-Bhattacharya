import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { LocaleProvider } from './context/LocaleContext';
import { CaseProvider } from './context/CaseContext';

import { Header } from './components/Header';
import { HomeDashboard } from './components/HomeDashboard';
import { DigitalEmergencyWorkflow } from './components/DigitalEmergencyWorkflow';
import { ReportGeneratorScreen } from './components/ReportGeneratorScreen';
import { DeepfakeDetectorScreen } from './components/DeepfakeDetectorScreen';
import { LocationServices } from './components/LocationServices';
import { AICompanionScreen } from './components/AICompanionScreen';
import { ReportingGuideScreen } from './components/ReportingGuideScreen';
import { EvidenceVault } from './components/EvidenceVault';
import { TwoFactorLockModal } from './components/TwoFactorLockModal';

import {
  Home,
  Shield,
  Sparkles,
  MapPin,
  Bot,
  FolderLock,
  Lock,
} from 'lucide-react';

export function AppContent() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string | null>(null);
  const [activeCaseIdForReport, setActiveCaseIdForReport] = useState<string | null>(null);

  const [isVaultModalOpen, setIsVaultModalOpen] = useState<boolean>(false);

  const handleCompleteWorkflow = (caseId?: string) => {
    if (caseId) {
      setActiveCaseIdForReport(caseId);
    }
    setActiveTab('report_view');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-24 sm:pb-8">
      {/* Top Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Screen Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-24 md:pb-12">
        {activeTab === 'home' && (
          <HomeDashboard
            onStartEmergency={() => {
              setSelectedCategoryKey(null);
              setActiveTab('emergency');
            }}
            onNavigate={(t) => setActiveTab(t)}
          />
        )}

        {activeTab === 'emergency' && (
          <DigitalEmergencyWorkflow
            onCompleteWorkflow={handleCompleteWorkflow}
            selectedCategoryKey={selectedCategoryKey}
          />
        )}

        {activeTab === 'companion' && <AICompanionScreen />}

        {activeTab === 'guide' && <ReportingGuideScreen />}

        {activeTab === 'vault' && <EvidenceVault onBackToHome={() => setActiveTab('home')} />}

        {activeTab === 'report_view' && (
          <ReportGeneratorScreen
            caseIdOverride={activeCaseIdForReport || undefined}
            onBack={() => setActiveTab('home')}
            onNavigateToVault={() => setActiveTab('vault')}
          />
        )}

        {activeTab === 'deepfake' && <DeepfakeDetectorScreen />}

        {activeTab === 'location' && <LocationServices />}
      </main>

      {/* Discreet Bottom Navigation Bar for Mobile */}
      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-2 z-40 flex items-center justify-around text-[10px] font-bold text-slate-400">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 p-1 ${activeTab === 'home' ? 'text-indigo-400 font-extrabold' : ''}`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveTab('emergency')}
          className={`flex flex-col items-center gap-1 p-1 ${activeTab === 'emergency' ? 'text-rose-400 font-extrabold' : ''}`}
        >
          <Shield className="w-5 h-5" />
          <span>Emergency</span>
        </button>

        <button
          onClick={() => setActiveTab('companion')}
          className={`flex flex-col items-center gap-1 p-1 ${activeTab === 'companion' ? 'text-purple-400 font-extrabold' : ''}`}
        >
          <Bot className="w-5 h-5" />
          <span>Companion</span>
        </button>

        <button
          onClick={() => setActiveTab('vault')}
          className={`flex flex-col items-center gap-1 p-1 ${activeTab === 'vault' ? 'text-teal-400 font-extrabold' : ''}`}
        >
          <FolderLock className="w-5 h-5" />
          <span>Vault</span>
        </button>

        <button
          onClick={() => setActiveTab('deepfake')}
          className={`flex flex-col items-center gap-1 p-1 ${activeTab === 'deepfake' ? 'text-indigo-400 font-extrabold' : ''}`}
        >
          <Sparkles className="w-5 h-5 text-teal-400" />
          <span>Deepfake</span>
        </button>

        <button
          onClick={() => setActiveTab('location')}
          className={`flex flex-col items-center gap-1 p-1 ${activeTab === 'location' ? 'text-indigo-400 font-extrabold' : ''}`}
        >
          <MapPin className="w-5 h-5" />
          <span>Nearby</span>
        </button>
      </div>

      {/* Modals */}
      <TwoFactorLockModal
        isOpen={isVaultModalOpen}
        onClose={() => setIsVaultModalOpen(false)}
        onCancel={() => {
          setIsVaultModalOpen(false);
          setActiveTab('home');
        }}
        onUnlocked={() => {
          setIsVaultModalOpen(false);
          setActiveTab('vault');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LocaleProvider>
        <CaseProvider>
          <AppContent />
        </CaseProvider>
      </LocaleProvider>
    </AuthProvider>
  );
}
