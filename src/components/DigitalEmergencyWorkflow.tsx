import React, { useState, useEffect } from 'react';
import { useCase } from '../context/CaseContext';
import { useLocale } from '../context/LocaleContext';
import { INCIDENT_CONFIGS } from '../data/incidentGuidance';
import { IncidentType, EvidenceItem } from '../types';
import {
  ShieldAlert,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FilePlus,
  Upload,
  Link,
  Trash2,
  Save,
  Shield,
  Eye,
  Image,
  KeyRound,
  Sparkles,
  Zap,
  Check,
  RefreshCw,
  RotateCcw,
  FileText,
  Video,
  Camera,
  ExternalLink,
  Plus,
} from 'lucide-react';

interface DigitalEmergencyWorkflowProps {
  onCompleteWorkflow: (caseId?: string) => void;
  selectedCategoryKey?: string | null;
}

export const DigitalEmergencyWorkflow: React.FC<DigitalEmergencyWorkflowProps> = ({
  onCompleteWorkflow,
  selectedCategoryKey,
}) => {
  const {
    activeDraftCase,
    createNewCase,
    updateActiveCaseType,
    recordUrgencyAnswer,
    toggleChecklistItem,
    addEvidenceToActiveCase,
    addEvidenceBatchToActiveCase,
    removeEvidenceFromActiveCase,
    updateActiveCaseDetails,
    saveActiveCase,
    clearActiveDraftAttachments,
    discardActiveDraft,
  } = useCase();

  const { t } = useLocale();

  const [step, setStep] = useState<number>(selectedCategoryKey ? 2 : 1);
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceDesc, setEvidenceDesc] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [checklistUrls, setChecklistUrls] = useState<Record<string, string>>({});
  const [isUploadingPhotos, setIsUploadingPhotos] = useState<boolean>(false);
  const [uploadToast, setUploadToast] = useState<string | null>(null);

  // Initialize or pick current active case config
  const activeType: IncidentType = activeDraftCase?.incidentType || (selectedCategoryKey as IncidentType) || 'blackmail';
  const config = INCIDENT_CONFIGS[activeType] || INCIDENT_CONFIGS['blackmail'];

  // Core instantaneous file processing engine
  const processAndUploadFiles = async (
    files: FileList | File[],
    checklistItemId?: string,
    checklistItemLabel?: string
  ) => {
    if (!files || files.length === 0) return;
    setIsUploadingPhotos(true);

    try {
      const fileList = Array.from(files);
      const readPromises = fileList.map((file) => {
        return new Promise<Omit<EvidenceItem, 'id' | 'caseId' | 'dateAdded'>>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const fileUrl = event.target?.result as string;
            const isVideo = file.type.startsWith('video');
            const sizeKb = (file.size / 1024).toFixed(1);
            resolve({
              type: isVideo ? 'video' : 'image',
              title: checklistItemLabel ? `${checklistItemLabel} (${file.name})` : file.name,
              description: checklistItemLabel
                ? `Attached under checklist: ${checklistItemLabel} (${sizeKb} KB)`
                : `Instant emergency evidence capture (${sizeKb} KB)`,
              fileUrl,
              fileName: file.name,
              fileSize: `${sizeKb} KB`,
              checklistId: checklistItemId,
              tags: [
                activeType,
                isVideo ? 'video' : 'photo',
                ...(checklistItemId ? [checklistItemId] : []),
                'instant_emergency_upload',
              ],
            });
          };
          reader.onerror = () => {
            console.error('Failed reading file:', file.name);
            resolve({
              type: 'image',
              title: file.name,
              description: 'Emergency evidence item',
              fileName: file.name,
              tags: [activeType, 'instant_emergency_upload'],
            });
          };
          reader.readAsDataURL(file);
        });
      });

      const items = await Promise.all(readPromises);
      addEvidenceBatchToActiveCase(items, checklistItemId);

      setUploadToast(`⚡ ${items.length} photo(s) / evidence uploaded instantly!`);
      setTimeout(() => setUploadToast(null), 3500);
    } catch (err) {
      console.error('Error during instant photo upload:', err);
    } finally {
      setIsUploadingPhotos(false);
    }
  };

  const handleChecklistFileUpload = (
    checklistItemId: string,
    itemLabel: string,
    fileType: 'photo' | 'video',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files ? (Array.from(e.target.files) as File[]) : [];
    e.target.value = '';
    if (files.length > 0) {
      processAndUploadFiles(files, checklistItemId, itemLabel);
    }
  };

  const handleChecklistUrlAdd = (checklistItemId: string, itemLabel: string) => {
    const urlVal = checklistUrls[checklistItemId]?.trim();
    if (!urlVal) return;

    addEvidenceBatchToActiveCase(
      [
        {
          type: 'url',
          title: `${itemLabel} (Link)`,
          description: `URL reference: ${urlVal}`,
          url: urlVal,
          checklistId: checklistItemId,
          tags: [activeType, 'url', checklistItemId],
        },
      ],
      checklistItemId
    );

    setChecklistUrls((prev) => ({ ...prev, [checklistItemId]: '' }));
  };

  const handleRefreshStep4 = () => {
    clearActiveDraftAttachments();
    setChecklistUrls({});
    setEvidenceTitle('');
    setEvidenceDesc('');
    setEvidenceUrl('');
    setEvidenceFile(null);
  };

  // AI Narrative Polisher state
  const [isRefiningNarrative, setIsRefiningNarrative] = useState(false);
  const [narrativeRefinedPreview, setNarrativeRefinedPreview] = useState<string | null>(null);

  // AI Emergency Intake Summary state
  const [isGeneratingEmergencySummary, setIsGeneratingEmergencySummary] = useState(false);
  const [emergencySummaryData, setEmergencySummaryData] = useState<{
    summaryParagraph: string;
    keyPoints?: string[];
    recommendedImmediateAction?: string;
  } | null>(null);

  const handleSelectCategory = (type: IncidentType) => {
    if (activeDraftCase?.id) {
      updateActiveCaseType(type);
    } else {
      createNewCase(type);
    }
    setStep(2); // Direct navigation to Urgency
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? (Array.from(e.target.files) as File[]) : [];
    e.target.value = '';
    if (files.length > 0) {
      processAndUploadFiles(files);
    }
  };

  const handleAddEvidence = () => {
    if (!evidenceTitle) return;

    addEvidenceToActiveCase({
      type: evidenceFile ? (evidenceFile.type.startsWith('video') ? 'video' : 'image') : 'url',
      title: evidenceTitle,
      description: evidenceDesc || 'User attached evidence item',
      fileUrl: evidenceUrl || undefined,
      fileName: evidenceFile?.name || undefined,
      tags: [activeType],
    });

    setEvidenceTitle('');
    setEvidenceDesc('');
    setEvidenceUrl('');
    setEvidenceFile(null);
  };


  const handleRefineNarrative = async () => {
    const rawNarrative = activeDraftCase?.details?.description;
    if (!rawNarrative || rawNarrative.trim().length < 5) return;

    setIsRefiningNarrative(true);
    try {
      const res = await fetch('/api/refine-narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawNarrative,
          incidentType: activeType,
          platform: activeDraftCase?.details?.platform || 'Online platform',
          suspectInfo: activeDraftCase?.details?.username || '',
        }),
      });

      const data = await res.json();
      if (data.success && data.refinedNarrative) {
        setNarrativeRefinedPreview(data.refinedNarrative);
      } else {
        throw new Error('Refinement returned empty');
      }
    } catch (err) {
      console.warn('Using client narrative formatter:', err);
      const dateStr = activeDraftCase?.details?.incidentDate || new Date().toLocaleDateString();
      const platformStr = activeDraftCase?.details?.platform || 'online platform';
      const suspectStr = activeDraftCase?.details?.username || 'unidentified suspect';
      setNarrativeRefinedPreview(
        `On or around ${dateStr}, I was targeted by an individual operating under the handle/identifier "${suspectStr}" on ${platformStr}.\n\nIncident Statement:\n${rawNarrative.trim()}\n\nAll corresponding screenshots, timestamps, and communication logs have been preserved in an unaltered digital vault for formal submission to law enforcement.`
      );
    } finally {
      setIsRefiningNarrative(false);
    }
  };

  const handleApplyRefinedNarrative = () => {
    if (narrativeRefinedPreview) {
      updateActiveCaseDetails({ description: narrativeRefinedPreview });
      setNarrativeRefinedPreview(null);
    }
  };

  const handleGenerateEmergencySummary = async () => {
    setIsGeneratingEmergencySummary(true);
    try {
      const payload = {
        caseData: {
          ...activeDraftCase,
          incidentType: activeType,
          urgencyAnswers: activeDraftCase?.urgencyAnswers || {},
          evidenceItems: activeDraftCase?.evidenceItems || [],
          details: activeDraftCase?.details || {},
        },
      };

      const res = await fetch('/api/generate-emergency-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.summaryParagraph) {
        setEmergencySummaryData({
          summaryParagraph: data.summaryParagraph,
          keyPoints: data.keyPoints,
          recommendedImmediateAction: data.recommendedImmediateAction,
        });
      } else {
        throw new Error('Summary returned empty');
      }
    } catch (err) {
      console.warn('Using deterministic emergency summary builder:', err);
      const dateStr = activeDraftCase?.details?.incidentDate || new Date().toLocaleDateString();
      const platformStr = activeDraftCase?.details?.platform || 'Online platform';
      const suspectStr = activeDraftCase?.details?.username || activeDraftCase?.details?.suspectHandles || 'Unidentified suspect';
      const demandsStr = activeDraftCase?.details?.paymentDemands || 'No financial extortion recorded';
      const threatsStr = activeDraftCase?.details?.threatsReceived || activeDraftCase?.details?.description || 'Active harassment/threats reported';
      const count = activeDraftCase?.evidenceItems?.length || 0;

      setEmergencySummaryData({
        summaryParagraph: `On ${dateStr}, a digital emergency incident categorized under ${activeType.toUpperCase()} occurred via ${platformStr}. The perpetrator associated with handle/identifier "${suspectStr}" engaged in hostile actions: "${threatsStr}". Extortion / Payment demands recorded: "${demandsStr}". A total of ${count} evidence artifact(s) have been secured in the encrypted vault.`,
        keyPoints: [
          `Category & Platform: ${activeType.toUpperCase()} on ${platformStr}`,
          `Perpetrator Identifier: ${suspectStr}`,
          `Threats / Demands: ${threatsStr} (Demands: ${demandsStr})`,
          `Preserved Evidence: ${count} verified item(s)`,
        ],
        recommendedImmediateAction: 'Maintain evidence integrity. Do not transfer funds or delete chat transcripts. Contact 1930 Cyber Helpline.',
      });
    } finally {
      setIsGeneratingEmergencySummary(false);
    }
  };

  const handleFinishAndGenerateReport = () => {
    // Persist case into cases list
    const saved = saveActiveCase();
    const targetCaseId = saved?.id || activeDraftCase?.id;
    discardActiveDraft();
    onCompleteWorkflow(targetCaseId);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner Warning — ALWAYS DISPLAY PROMINENTLY */}
      <div className="bg-rose-600 dark:bg-rose-700 text-white p-5 sm:p-6 rounded-3xl shadow-xl flex items-start gap-4 border-2 border-rose-400">
        <ShieldAlert className="w-8 h-8 text-amber-300 shrink-0 mt-0.5 animate-pulse" />
        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-black tracking-wide uppercase">
            DON'T DELETE ANYTHING FROM YOUR DEVICE YET.
          </h2>
          <p className="text-xs sm:text-sm font-medium text-rose-100 leading-relaxed">
            Deleting messages, images, videos, URLs, or other evidence may make reporting more difficult.
          </p>
        </div>
      </div>



      {/* Workflow Navigation Tracker */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <button
          disabled={step === 1}
          onClick={() => setStep((prev) => Math.max(1, prev - 1))}
          className="disabled:opacity-30 hover:text-indigo-600 flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK</span>
        </button>

        <span className="text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-extrabold">
          Step {step} of 5 —{' '}
          {step === 1 && 'Incident Category'}
          {step === 2 && 'Urgency Assessment'}
          {step === 3 && 'Action Guidance'}
          {step === 4 && 'Attach Evidence'}
          {step === 5 && 'Incident Details & Situation Resources'}
        </span>

        <button
          onClick={() => {
            if (step < 5) setStep((prev) => prev + 1);
            else handleFinishAndGenerateReport();
          }}
          className={`flex items-center gap-1.5 font-extrabold transition-all group cursor-pointer ${
            step === 5
              ? 'px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 shadow-md ring-2 ring-teal-400/40 active:scale-95'
              : 'hover:text-indigo-600 text-indigo-600 dark:text-indigo-400'
          }`}
        >
          <span>{step === 5 ? 'GENERATE REPORT' : 'NEXT'}</span>
          <ArrowRight
            className={`w-4 h-4 transition-transform ${
              step === 5 ? 'animate-arrow-nudge text-slate-950' : 'group-hover:translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* STEP 1 — 6 Merged Emergency Categories */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Select What Type of Digital Emergency Occurred
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Categorized into 6 focused incident response protocols.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.values(INCIDENT_CONFIGS).map((item) => (
              <div
                key={item.type}
                onClick={() => handleSelectCategory(item.type)}
                className={`bg-white dark:bg-slate-900 border-2 rounded-2xl p-5 hover:shadow-lg cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                  activeType === item.type
                    ? 'border-indigo-600 dark:border-indigo-400 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                }`}
              >
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/80 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    {item.type === 'blackmail' && <ShieldAlert className="w-5 h-5" />}
                    {item.type === 'deepfake' && <Image className="w-5 h-5" />}
                    {item.type === 'cyberstalking' && <Eye className="w-5 h-5" />}
                    {item.type === 'account_hacked' && <KeyRound className="w-5 h-5" />}
                    {item.type === 'threats' && <AlertTriangle className="w-5 h-5" />}
                    {item.type === 'child_safety' && <Shield className="w-5 h-5" />}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.shortDesc}</p>
                </div>

                <div className="pt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <span>Start Response</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2 — Quick Urgency Assessment */}
      {step === 2 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
              Selected Protocol: {config.title}
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Quick Urgency Assessment</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Answer these brief questions to assess risk severity and priority.
            </p>
          </div>

          <div className="space-y-4">
            {config.urgencyQuestions.map((q) => {
              const currentAns = activeDraftCase?.urgencyAnswers?.[q.id];
              return (
                <div key={q.id} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-2 border border-slate-200 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{q.question}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{q.subtext}</p>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => recordUrgencyAnswer(q.id, 'YES')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                        currentAns === 'YES'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      YES
                    </button>
                    <button
                      onClick={() => recordUrgencyAnswer(q.id, 'NO')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                        currentAns === 'NO'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      NO
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setStep(3)}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl text-xs shadow-md"
          >
            Continue to Guidance
          </button>
        </div>
      )}

      {/* STEP 3 — Action Guidance */}
      {step === 3 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{config.guidanceSteps.heading}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Core protocol containment steps for {config.title}.
            </p>
          </div>

          {/* Standard Guidance Steps */}
          <div className="space-y-3">
            {config.guidanceSteps.points.map((pt, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{pt}</p>
              </div>
            ))}
          </div>

          {config.guidanceSteps.criticalWarning && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-800 dark:text-amber-200 font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{config.guidanceSteps.criticalWarning}</span>
            </div>
          )}

          <button
            onClick={() => {
              setStep(4);
            }}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Proceed to Step 4: Attach Evidence Items</span>
            {activeDraftCase?.evidenceItems && activeDraftCase.evidenceItems.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-indigo-800 text-white text-[10px]">
                {activeDraftCase.evidenceItems.length} secured
              </span>
            )}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 4 — Evidence Gathering Checklist & Media Upload */}
      {step === 4 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
                  Protocol: {config.title}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 text-[10px] font-bold border border-indigo-300 dark:border-indigo-800 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-indigo-500" />
                  <span>Instant Multi-Photo Upload Active</span>
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Evidence Gathering & Direct Media Attachment
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Photos and screenshots are instantly hashed and stored to your local emergency case.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRefreshStep4}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer border border-slate-200 dark:border-slate-700 shadow-2xs"
                title="Clear all attachments from this draft"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                <span>Reset Evidence</span>
              </button>
            </div>
          </div>

          {/* Real-time Upload Toast */}
          {uploadToast && (
            <div className="p-3 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
              <span>{uploadToast}</span>
            </div>
          )}

          {/* Checklist Items Loop */}
          <div className="space-y-4">
            {config.defaultChecklist.map((item) => {
              const isChecked = !!activeDraftCase?.evidenceChecklist?.[item.id];
              const attachedToThisItem =
                activeDraftCase?.evidenceItems?.filter(
                  (ev) => ev.checklistId === item.id || (ev.tags && ev.tags.includes(item.id))
                ) || [];

              const lower = (item.label + ' ' + item.description).toLowerCase();
              const isVideoNeeded = lower.includes('video') || lower.includes('recording') || lower.includes('call');
              const isUrlNeeded = lower.includes('url') || lower.includes('link') || lower.includes('profile') || lower.includes('handle');
              const isPhotoNeeded = !isVideoNeeded || lower.includes('screenshot') || lower.includes('image') || lower.includes('photo');

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all space-y-3 ${
                    isChecked
                      ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800/80'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {/* Top Item Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleChecklistItem(item.id)}
                        className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                          isChecked
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 bg-white dark:bg-slate-900'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            onClick={() => toggleChecklistItem(item.id)}
                            className={`text-xs sm:text-sm font-bold cursor-pointer ${
                              isChecked
                                ? 'text-slate-900 dark:text-white line-through opacity-80'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {item.label}
                          </span>
                          {/* Necessity Badges */}
                          {isPhotoNeeded && (
                            <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold rounded-md flex items-center gap-1">
                              <Camera className="w-3 h-3" />
                              <span>Photo/SS</span>
                            </span>
                          )}
                          {isVideoNeeded && (
                            <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-[10px] font-bold rounded-md flex items-center gap-1">
                              <Video className="w-3 h-3" />
                              <span>Video</span>
                            </span>
                          )}
                          {isUrlNeeded && (
                            <span className="px-2 py-0.5 bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 text-[10px] font-bold rounded-md flex items-center gap-1">
                              <Link className="w-3 h-3" />
                              <span>URL / Link</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {attachedToThisItem.length > 0 && (
                      <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full text-[10px] font-extrabold shrink-0 border border-emerald-300 dark:border-emerald-800">
                        {attachedToThisItem.length} Attached
                      </span>
                    )}
                  </div>

                  {/* UNDER EACH CHECKLIST: Option to upload URL, photo or video */}
                  <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Photo / Screenshot File Input */}
                      <label className="cursor-pointer px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs">
                        <Camera className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Upload Photo(s)</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => handleChecklistFileUpload(item.id, item.label, 'photo', e)}
                        />
                      </label>

                      {/* Video File Input */}
                      <label className="cursor-pointer px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-purple-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs">
                        <Video className="w-3.5 h-3.5 text-purple-500" />
                        <span>Upload Video(s)</span>
                        <input
                          type="file"
                          accept="video/*"
                          multiple
                          className="hidden"
                          onChange={(e) => handleChecklistFileUpload(item.id, item.label, 'video', e)}
                        />
                      </label>

                      {/* Toggle / Add URL field */}
                      <div className="flex items-center gap-1 flex-1 min-w-[220px]">
                        <input
                          type="url"
                          value={checklistUrls[item.id] || ''}
                          onChange={(e) =>
                            setChecklistUrls((prev) => ({ ...prev, [item.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleChecklistUrlAdd(item.id, item.label);
                            }
                          }}
                          placeholder="Paste URL (https://...)"
                          className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleChecklistUrlAdd(item.id, item.label)}
                          disabled={!checklistUrls[item.id]?.trim()}
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all shrink-0"
                        >
                          <Link className="w-3.5 h-3.5" />
                          <span>Attach Link</span>
                        </button>
                      </div>
                    </div>

                    {/* Attached files preview under this checklist item */}
                    {attachedToThisItem.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Attached Evidence for this Checklist Item:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {attachedToThisItem.map((ev) => (
                            <div
                              key={ev.id}
                              className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl flex items-center justify-between gap-2 text-xs shadow-2xs"
                            >
                              <div className="flex items-center gap-2 overflow-hidden">
                                {ev.fileUrl && ev.type !== 'video' ? (
                                  <img
                                    src={ev.fileUrl}
                                    alt={ev.title}
                                    className="w-8 h-8 rounded-lg object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                                  />
                                ) : ev.type === 'video' ? (
                                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-500 shrink-0">
                                    <Video className="w-4 h-4" />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-500 shrink-0">
                                    <Link className="w-4 h-4" />
                                  </div>
                                )}
                                <div className="truncate">
                                  <p className="font-bold text-slate-900 dark:text-white truncate">
                                    {ev.title}
                                  </p>
                                  {ev.url ? (
                                    <a
                                      href={ev.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-[10px] text-indigo-500 hover:underline truncate block"
                                    >
                                      {ev.url}
                                    </a>
                                  ) : (
                                    <p className="text-[10px] text-slate-400 font-mono truncate">
                                      {ev.hash?.substring(0, 18)}...
                                    </p>
                                  )}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeEvidenceFromActiveCase(ev.id)}
                                className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                                title="Remove file"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Additional Miscellaneous Evidence */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <FilePlus className="w-4 h-4 text-indigo-500" />
                <span>Additional Custom Evidence (Optional)</span>
              </span>
              <span className="text-[11px] text-slate-400">Total in case: {activeDraftCase?.evidenceItems?.length || 0}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  value={evidenceTitle}
                  onChange={(e) => setEvidenceTitle(e.target.value)}
                  placeholder="e.g. Bank SMS / Audio Recording"
                  className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Upload File(s) • Instantly Added
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,application/pdf"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-600 dark:file:bg-indigo-950 dark:file:text-indigo-400 cursor-pointer"
                />
              </div>
            </div>

            {evidenceTitle && (
              <button
                type="button"
                onClick={handleAddEvidence}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Attach Custom Item
              </button>
            )}
          </div>

          <button
            onClick={() => setStep(5)}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Proceed to Step 5: Incident Details & Situation Resources</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 5 — Incident Details & Generative Narrative Polisher */}
      {step === 5 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Incident Details, Summary & Situation Resources
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Collect handles, platform details, demands, and immediately access verified takedown links, official reporting portals, and emergency helplines.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Platform / Service Name
                </label>
                <input
                  type="text"
                  value={activeDraftCase?.details?.platform || ''}
                  onChange={(e) => updateActiveCaseDetails({ platform: e.target.value })}
                  placeholder="e.g. WhatsApp, Instagram, Telegram, X, Email"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Incident Date & Time
                </label>
                <input
                  type="date"
                  value={activeDraftCase?.details?.incidentDate || ''}
                  onChange={(e) => updateActiveCaseDetails({ incidentDate: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Perpetrator Username / Handle / Profile URL / UPI ID
                </label>
                <input
                  type="text"
                  value={activeDraftCase?.details?.username || activeDraftCase?.details?.suspectHandles || ''}
                  onChange={(e) => updateActiveCaseDetails({ username: e.target.value, suspectHandles: e.target.value })}
                  placeholder="e.g. @attacker_handle or https://instagram.com/..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Your Contact Details for Report
                </label>
                <input
                  type="text"
                  value={activeDraftCase?.details?.userContact || ''}
                  onChange={(e) => updateActiveCaseDetails({ userContact: e.target.value })}
                  placeholder="e.g. Email or Device number (optional)"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Extortion / Payment Demands (if applicable)
              </label>
              <input
                type="text"
                value={activeDraftCase?.details?.paymentDemands || ''}
                onChange={(e) => updateActiveCaseDetails({ paymentDemands: e.target.value })}
                placeholder="e.g. Demanded $500 or ₹25,000 via UPI ID badactor@upi within 2 hours"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Detailed Narrative of What Happened
                </label>

                <button
                  type="button"
                  onClick={handleRefineNarrative}
                  disabled={isRefiningNarrative || !activeDraftCase?.details?.description?.trim()}
                  className="px-2.5 py-1 bg-purple-100 dark:bg-purple-950/80 hover:bg-purple-200 dark:hover:bg-purple-900 border border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all disabled:opacity-40"
                >
                  {isRefiningNarrative ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Polishing statement...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-purple-500" />
                      <span>Refine into Formal Statement</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                rows={4}
                value={activeDraftCase?.details?.description || ''}
                onChange={(e) => updateActiveCaseDetails({ description: e.target.value })}
                placeholder="Describe what occurred chronologically, messages received, and any threats made..."
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white leading-relaxed"
              />

              {/* Refined Narrative Preview Box */}
              {narrativeRefinedPreview && (
                <div className="p-3 bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-900/60 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-purple-800 dark:text-purple-300">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      AI Refined Formal Statement:
                    </span>
                    <button
                      onClick={handleApplyRefinedNarrative}
                      className="px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-xs"
                    >
                      <Check className="w-3 h-3" />
                      <span>Accept & Apply</span>
                    </button>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                    {narrativeRefinedPreview}
                  </p>
                </div>
              )}
            </div>

            {/* LIVE EMERGENCY DATA SUMMARY SYNTHESIZER */}
            <div className="p-4 bg-gradient-to-br from-indigo-50/80 to-slate-50 dark:from-indigo-950/40 dark:to-slate-900 border border-indigo-200/80 dark:border-indigo-900/60 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-xs">
                      Emergency Data Incident Summary
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Synthesizes category, threats, platform, handles, demands, and evidence into an instant summary.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateEmergencySummary}
                  disabled={isGeneratingEmergencySummary}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isGeneratingEmergencySummary ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingEmergencySummary ? 'Summarizing...' : 'Summarize Emergency Data'}</span>
                </button>
              </div>

              {emergencySummaryData ? (
                <div className="space-y-3 pt-2 border-t border-indigo-100 dark:border-indigo-900/50">
                  <div className="p-3 bg-white dark:bg-slate-800/90 rounded-xl border border-indigo-100 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs leading-relaxed">
                    <p className="font-medium">{emergencySummaryData.summaryParagraph}</p>
                  </div>

                  {emergencySummaryData.keyPoints && emergencySummaryData.keyPoints.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      {emergencySummaryData.keyPoints.map((pt, idx) => (
                        <div key={idx} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-medium">
                          • {pt}
                        </div>
                      ))}
                    </div>
                  )}

                  {emergencySummaryData.recommendedImmediateAction && (
                    <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-amber-900 dark:text-amber-200 text-[11px] font-bold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{emergencySummaryData.recommendedImmediateAction}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        updateActiveCaseDetails({ description: emergencySummaryData.summaryParagraph });
                      }}
                      className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg font-bold text-xs"
                    >
                      Copy into Narrative Field
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-white/70 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>Click "Summarize Emergency Data" to compile a rapid executive summary from this intake before proceeding.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
