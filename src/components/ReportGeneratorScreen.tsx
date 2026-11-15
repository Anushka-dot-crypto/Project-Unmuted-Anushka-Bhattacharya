import React, { useState, useEffect } from 'react';
import { useCase } from '../context/CaseContext';
import { useLocale } from '../context/LocaleContext';
import { ReportSections } from '../types';
import { generatePoliceInvestigationPdf } from '../utils/policeDossierPdfGenerator';
import { getEvidenceFolderInfo } from '../utils/evidenceFolderUtils';
import {
  Sparkles,
  FileCheck,
  Edit3,
  Save,
  Download,
  Copy,
  Share2,
  AlertTriangle,
  CheckCircle2,
  Shield,
  FileText,
  Printer,
  WifiOff,
  Compass,
  MapPin,
  FileCheck2,
  FolderLock,
  FolderClock,
  Folder,
  ArrowRight,
} from 'lucide-react';

interface ReportGeneratorScreenProps {
  caseId?: string;
  caseIdOverride?: string;
  onBack: () => void;
  onNavigateToVault?: () => void;
}

const ensureString = (val: any): string => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (Array.isArray(val)) {
    return val.map((v) => ensureString(v)).join('\n');
  }
  if (typeof val === 'object') {
    return Object.entries(val)
      .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
      .join('\n');
  }
  return String(val);
};

const sanitizeSections = (raw: any): ReportSections => {
  if (!raw || typeof raw !== 'object') return {} as unknown as ReportSections;
  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    result[k] = ensureString(v);
  }
  return result as unknown as ReportSections;
};

export const ReportGeneratorScreen: React.FC<ReportGeneratorScreenProps> = ({
  caseId,
  caseIdOverride,
  onBack,
  onNavigateToVault,
}) => {
  const { cases, activeDraftCase, activeCaseId, getCaseById, saveGeneratedReport } = useCase();
  const { language } = useLocale();

  const effectiveCaseId =
    caseIdOverride ||
    caseId ||
    activeCaseId ||
    activeDraftCase?.id ||
    (cases.length > 0 ? cases[0].id : `UNMUTED-${Date.now()}`);

  const currentCase =
    (effectiveCaseId ? getCaseById(effectiveCaseId) : null) ||
    activeDraftCase ||
    (cases.length > 0 ? cases[0] : null);

  const [loading, setLoading] = useState(false);
  const [offlineError, setOfflineError] = useState(false);
  const [sections, setSections] = useState<ReportSections | null>(
    currentCase?.report?.sections ? sanitizeSections(currentCase.report.sections) : null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [vaultSavedFolder, setVaultSavedFolder] = useState<string | null>(() => {
    return getEvidenceFolderInfo(new Date()).folderName;
  });
  const [justSavedToVault, setJustSavedToVault] = useState<boolean>(false);

  // Trigger server-side AI report generation
  const generateReport = async () => {
    const caseToReport = currentCase || {
      id: effectiveCaseId,
      incidentType: 'blackmail',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      status: 'DRAFT',
      evidenceItems: [],
      evidenceChecklist: {},
      urgencyAnswers: {},
      details: {
        platform: 'Online Platform',
        description: 'Incident documented via emergency workflow.',
      },
    };

    setLoading(true);
    setOfflineError(false);

    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseData: caseToReport, language }),
      });

      if (!response.ok) {
        throw new Error('Server returned error status ' + response.status);
      }

      const data = await response.json();
      if (data.success && data.report) {
        const sanitized = sanitizeSections(data.report);
        setSections(sanitized);
        if (effectiveCaseId) {
          saveGeneratedReport(effectiveCaseId, sanitized);
          setVaultSavedFolder(getEvidenceFolderInfo(new Date()).folderName);
        }
      } else {
        throw new Error(data.error || 'Report generation failed');
      }
    } catch (err: any) {
      console.error('Error in AI Report Generation:', err);
      // Fallback local rule-based structured report generation
      const fallbackSections: ReportSections = {
        section1_case_info: `Case ID: ${caseToReport.id}\nIncident Category: ${(caseToReport.incidentType || 'CYBER_INCIDENT').toUpperCase()}\nCreated Date: ${new Date(caseToReport.createdAt || Date.now()).toLocaleString()}\nCalculated Risk Level: ${caseToReport.urgencyAssessment?.riskLevel || 'ELEVATED'}`,
        section2_summary: `EXECUTIVE SUMMARY:\nThis formal documentation records an alleged cyber incident categorized under ${(caseToReport.incidentType || 'cyber incident').toUpperCase()} occurring on or around ${caseToReport.details?.incidentDate || new Date().toISOString().split('T')[0]} primarily on ${caseToReport.details?.platform || 'Online Platform'}. Perpetrator Identifier: "${caseToReport.details?.username || caseToReport.details?.suspectHandles || 'Unidentified'}". Threats & Demands: ${caseToReport.details?.threatsReceived || caseToReport.details?.paymentDemands || 'Online intimidation and non-consensual demands'}. ${caseToReport.evidenceItems?.length || 0} evidence items preserved in vault.`,
        section3_timeline: `Discovery Date: ${new Date(caseToReport.createdAt || Date.now()).toLocaleDateString()}\nIncident Date Reported: ${caseToReport.details?.incidentDate || 'Unspecified'}\nReport Prepared: ${new Date().toLocaleString()}`,
        section4_platform_account: `Platform: ${caseToReport.details?.platform || 'Unknown / Unspecified'}\nSuspect Handle / Profile URL / Device: ${caseToReport.details?.username || caseToReport.details?.suspectHandles || 'Unspecified'}`,
        section5_detailed_description: caseToReport.details?.description || 'Incident reported in Project UNMUTED emergency intake workflow.',
        section6_threat_harm: caseToReport.details?.threatsReceived || 'Threat of unauthorized dissemination of private data and reputation harm.',
        section7_financial_info: caseToReport.details?.paymentDemands || 'No financial extortion demands or monetary transactions recorded.',
        section8_evidence_inventory: `${caseToReport.evidenceItems?.length || 0} evidence items preserved in local vault.\nCompleted Checklist Items: ${Object.keys(caseToReport.evidenceChecklist || {}).length} verified.`,
        section9_actions_taken: (caseToReport.details?.actionsTaken || []).join(', ') || 'Evidence preserved in Project UNMUTED encrypted vault.',
        section10_requested_assistance: caseToReport.details?.requestedAssistance || 'Guidance, formal report documentation, and takedown assistance under IT Act.',
        section11_missing_info: 'Exact IP addresses or official suspect identities if unknown.',
      };

      setSections(fallbackSections);
      if (effectiveCaseId) {
        saveGeneratedReport(effectiveCaseId, fallbackSections);
        setVaultSavedFolder(getEvidenceFolderInfo(new Date()).folderName);
      }
      if (!navigator.onLine) {
        setOfflineError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!sections) {
      generateReport();
    }
  }, []);

  const handleSectionChange = (key: keyof ReportSections, val: string) => {
    if (!sections) return;
    const updated = { ...sections, [key]: val };
    setSections(updated);
  };

  const handleSaveEdits = () => {
    if (sections && effectiveCaseId) {
      saveGeneratedReport(effectiveCaseId, sections);
      const folder = getEvidenceFolderInfo(new Date());
      setVaultSavedFolder(folder.folderName);
      setJustSavedToVault(true);
      setTimeout(() => setJustSavedToVault(false), 3000);
      setIsEditing(false);
    }
  };

  const handleManualSaveToVault = () => {
    if (!sections || !effectiveCaseId) return;
    saveGeneratedReport(effectiveCaseId, sections);
    const folder = getEvidenceFolderInfo(new Date());
    setVaultSavedFolder(folder.folderName);
    setJustSavedToVault(true);
    setTimeout(() => setJustSavedToVault(false), 3000);
  };

  const handleCopyText = () => {
    if (!sections) return;
    const fullText = Object.entries(sections)
      .map(([k, v]) => `=== ${k.toUpperCase().replace(/_/g, ' ')} ===\n${ensureString(v)}`)
      .join('\n\n');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!sections) return;
    const fullText = `PROJECT UNMUTED — FORMAL INCIDENT REPORT\nCase ID: ${caseId}\nGenerated: ${new Date().toLocaleString()}\n\n` +
      Object.entries(sections)
        .map(([k, v]) => `=== ${k.toUpperCase().replace(/_/g, ' ')} ===\n${ensureString(v)}`)
        .join('\n\n');

    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `UNMUTED_Report_${caseId}.txt`;
    a.click();
  };

  const handleExportPDF = () => {
    if (!sections || !currentCase) return;

    generatePoliceInvestigationPdf({
      caseData: currentCase,
      sections,
      complainantName: currentCase.details?.username || 'Aggrieved Complainant',
      stationJurisdiction: currentCase.details?.gpsLocation?.jurisdictionCell,
    });
  };

  if (!currentCase) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-sm text-slate-500">Case record not found.</p>
        <button onClick={onBack} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-full font-bold text-[10px] uppercase border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
              <FileCheck2 className="w-3 h-3" />
              <span>Sec 154 CrPC & 63 BSA Compliant</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">{caseId}</span>
            {currentCase?.details?.gpsLocation && (
              <span className="px-2 py-0.5 bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 rounded-md text-[10px] font-mono flex items-center gap-1 border border-teal-200 dark:border-teal-800">
                <MapPin className="w-3 h-3" />
                <span>
                  GPS Stamped ({currentCase.details.gpsLocation.latitude.toFixed(3)}°, {currentCase.details.gpsLocation.longitude.toFixed(3)}°)
                </span>
              </span>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Police Investigation Report
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'View Mode' : 'Edit Mode'}</span>
          </button>

          <button
            onClick={handleManualSaveToVault}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-slate-950 rounded-xl text-xs font-black shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            title="Save and preserve police complaint report into the 15-minute Evidence Vault"
          >
            <FolderLock className="w-3.5 h-3.5 text-slate-950" />
            <span>{justSavedToVault ? 'Saved to Vault ✓' : 'Save to Vault'}</span>
          </button>

          {onNavigateToVault && (
            <button
              onClick={onNavigateToVault}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Open Evidence Vault"
            >
              <Folder className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Open Vault</span>
            </button>
          )}

          <button
            onClick={handleDownloadTxt}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Download formatted text for cybercrime.gov.in portal"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Portal TXT</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white dark:text-slate-950 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            title="Download formatted Police Report PDF directly"
          >
            <Download className="w-3.5 h-3.5 text-teal-400 dark:text-slate-950" />
            <span>Police Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Evidence Vault Preserved Status Banner */}
      <div className="bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/80 rounded-2xl p-4 text-xs text-teal-950 dark:text-teal-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 border border-teal-300/40 dark:border-teal-700/60">
            <FolderClock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-teal-900 dark:text-teal-100">
                Official Police Complaint Saved in Vault
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300 dark:border-emerald-800">
                Sec 63 BSA & 154 CrPC
              </span>
            </div>
            <p className="text-teal-700 dark:text-teal-300 text-[11px] mt-0.5">
              Preserved in 15-minute folder: <strong>📁 {vaultSavedFolder || getEvidenceFolderInfo(new Date()).folderName}</strong> with SHA-256 tamper-evident integrity hash.
            </p>
          </div>
        </div>
        {onNavigateToVault && (
          <button
            onClick={onNavigateToVault}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-slate-950 font-black rounded-xl text-xs shrink-0 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>View in Vault</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
          </button>
        )}
      </div>

      {/* Mandatory Verification Warning Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4 text-xs font-medium text-amber-900 dark:text-amber-200 flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
        <span>
          <strong>AI-generated draft — please verify all details before submitting.</strong> Project UNMUTED does not automatically submit reports to police or platforms without explicit user action.
        </span>
      </div>

      {offlineError && (
        <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl text-xs flex items-center gap-3">
          <WifiOff className="w-5 h-5 text-amber-400 shrink-0" />
          <span>AI report generation requires an internet connection. Generated using fallback rule engine.</span>
        </div>
      )}

      {/* Loading Spinner */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-16 text-center space-y-4">
          <Sparkles className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Formatting Factual Incident Report...
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Organizing structured case information into 11 neutral, non-hallucinated report sections.
            </p>
          </div>
        </div>
      ) : (
        /* Report Sections View / Edit Form */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              FORMAL INCIDENT REPORT
            </h2>
            {isEditing && (
              <button
                onClick={handleSaveEdits}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            )}
          </div>

          {(() => {
            const activeSecs = sections;
            if (!activeSecs) return null;
            return (
              <div className="space-y-6 text-xs sm:text-sm">
                <div className="space-y-2">
                  <h3 className="font-extrabold text-indigo-900 dark:text-indigo-300 uppercase tracking-wide">
                    1. Case Information
                  </h3>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={ensureString(sections.section1_case_info)}
                      onChange={(e) => handleSectionChange('section1_case_info', e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl whitespace-pre-line text-slate-700 dark:text-slate-300 font-mono text-xs">
                      {ensureString(activeSecs.section1_case_info)}
                    </div>
                  )}
                </div>

                <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/70 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
                        <FileCheck className="w-4 h-4" />
                      </div>
                      <h3 className="font-extrabold text-indigo-950 dark:text-indigo-200 uppercase tracking-wide text-xs sm:text-sm">
                        2. Incident Executive Summary
                      </h3>
                    </div>

                    <button
                      onClick={() => {
                        if (activeSecs?.section2_summary) {
                          navigator.clipboard.writeText(ensureString(activeSecs.section2_summary));
                          setCopiedSummary(true);
                          setTimeout(() => setCopiedSummary(false), 2000);
                        }
                      }}
                      className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedSummary ? 'Summary Copied!' : 'Copy Summary'}</span>
                    </button>
                  </div>

                  {isEditing ? (
                    <textarea
                      rows={4}
                      value={ensureString(sections.section2_summary)}
                      onChange={(e) => handleSectionChange('section2_summary', e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  ) : (
                    <div className="p-3 bg-white dark:bg-slate-900/90 border border-indigo-100 dark:border-slate-800 rounded-xl whitespace-pre-line text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                      {ensureString(activeSecs.section2_summary)}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="font-extrabold text-indigo-900 dark:text-indigo-300 uppercase tracking-wide">
                    3. Incident Timeline
                  </h3>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={ensureString(sections.section3_timeline)}
                      onChange={(e) => handleSectionChange('section3_timeline', e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl whitespace-pre-line text-slate-700 dark:text-slate-300">
                      {ensureString(activeSecs.section3_timeline)}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="font-extrabold text-indigo-900 dark:text-indigo-300 uppercase tracking-wide">
                    4. Platform / Account Information
                  </h3>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={ensureString(sections.section4_platform_account)}
                      onChange={(e) => handleSectionChange('section4_platform_account', e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl whitespace-pre-line text-slate-700 dark:text-slate-300">
                      {ensureString(activeSecs.section4_platform_account)}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="font-extrabold text-indigo-900 dark:text-indigo-300 uppercase tracking-wide">
                    5. Detailed Description
                  </h3>
                  {isEditing ? (
                    <textarea
                      rows={4}
                      value={ensureString(sections.section5_detailed_description)}
                      onChange={(e) => handleSectionChange('section5_detailed_description', e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl whitespace-pre-line text-slate-700 dark:text-slate-300">
                      {ensureString(activeSecs.section5_detailed_description)}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="font-extrabold text-indigo-900 dark:text-indigo-300 uppercase tracking-wide">
                    6. Threat / Harm Information
                  </h3>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={ensureString(sections.section6_threat_harm)}
                      onChange={(e) => handleSectionChange('section6_threat_harm', e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl whitespace-pre-line text-slate-700 dark:text-slate-300">
                      {ensureString(activeSecs.section6_threat_harm)}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="font-extrabold text-indigo-900 dark:text-indigo-300 uppercase tracking-wide">
                    7. Financial Information
                  </h3>
                  {isEditing ? (
                    <textarea
                      rows={2}
                      value={ensureString(sections.section7_financial_info)}
                      onChange={(e) => handleSectionChange('section7_financial_info', e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl whitespace-pre-line text-slate-700 dark:text-slate-300">
                      {ensureString(activeSecs.section7_financial_info)}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="font-extrabold text-indigo-900 dark:text-indigo-300 uppercase tracking-wide">
                    8. Evidence Inventory
                  </h3>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={ensureString(sections.section8_evidence_inventory)}
                      onChange={(e) => handleSectionChange('section8_evidence_inventory', e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl whitespace-pre-line text-slate-700 dark:text-slate-300">
                      {ensureString(activeSecs.section8_evidence_inventory)}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="font-extrabold text-indigo-900 dark:text-indigo-300 uppercase tracking-wide">
                    9. Actions Already Taken
                  </h3>
                  {isEditing ? (
                    <textarea
                      rows={2}
                      value={ensureString(sections.section9_actions_taken)}
                      onChange={(e) => handleSectionChange('section9_actions_taken', e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl whitespace-pre-line text-slate-700 dark:text-slate-300">
                      {ensureString(activeSecs.section9_actions_taken)}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="font-extrabold text-indigo-900 dark:text-indigo-300 uppercase tracking-wide">
                    10. Requested Assistance
                  </h3>
                  {isEditing ? (
                    <textarea
                      rows={2}
                      value={ensureString(sections.section10_requested_assistance)}
                      onChange={(e) => handleSectionChange('section10_requested_assistance', e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl whitespace-pre-line text-slate-700 dark:text-slate-300">
                      {ensureString(activeSecs.section10_requested_assistance)}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="font-extrabold text-indigo-900 dark:text-indigo-300 uppercase tracking-wide">
                    11. Missing Information
                  </h3>
                  {isEditing ? (
                    <textarea
                      rows={2}
                      value={ensureString(sections.section11_missing_info)}
                      onChange={(e) => handleSectionChange('section11_missing_info', e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl whitespace-pre-line text-slate-700 dark:text-slate-300">
                      {ensureString(activeSecs.section11_missing_info)}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Direct Police Report Download Action Card */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-700/80 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-600/80 text-emerald-300 text-xs font-bold">
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Court & Police Compliant • Vault Preserved</span>
              </div>
              <h3 className="text-lg font-black text-white">
                Official Police Investigation Report (PDF & Vault)
              </h3>
              <p className="text-xs text-indigo-200/80 leading-relaxed max-w-xl">
                Generates a multi-page PDF compliant with Section 63 BSA 2023 / Section 65B(4) IEA, including cryptographic evidence registry, SHA-256 hashes, framing metadata, and jurisdictional police stations. Saved securely in the Evidence Vault.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={handleManualSaveToVault}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold rounded-2xl text-xs border border-teal-500/40 shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                title="Save current report snapshot to the Evidence Vault"
              >
                <FolderLock className="w-4 h-4 text-teal-400" />
                <span>{justSavedToVault ? 'Saved to Vault ✓' : 'Save to Vault'}</span>
              </button>

              {onNavigateToVault && (
                <button
                  onClick={onNavigateToVault}
                  className="px-3.5 py-3 bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 font-bold rounded-2xl text-xs border border-indigo-600/40 transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Open Evidence Vault to view all items and reports"
                >
                  <Folder className="w-4 h-4 text-indigo-300" />
                  <span>View in Vault</span>
                </button>
              )}

              <button
                onClick={handleExportPDF}
                className="px-5 py-3.5 bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-300 hover:to-emerald-400 text-slate-950 font-black rounded-2xl text-xs shadow-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-950" />
                <span>Download Police Report (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
