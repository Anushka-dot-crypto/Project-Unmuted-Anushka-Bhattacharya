import React, { useState, useRef } from 'react';
import { useCase } from '../context/CaseContext';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { TwoFactorLockModal } from './TwoFactorLockModal';
import { EvidenceCropModal } from './EvidenceCropModal';
import { EvidenceItem, CropFlagInfo } from '../types';
import {
  FolderLock,
  Plus,
  Trash2,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  MessageSquare,
  ShieldCheck,
  Hash,
  Download,
  AlertCircle,
  Lock,
  Unlock,
  Shield,
  Crop,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Upload,
  Eye,
  Info,
  Sliders,
  Scale,
  ArrowLeft,
  Zap,
  Tag,
  Globe,
  Loader2,
  Check,
  Folder,
  FolderOpen,
  FolderClock,
  Clock,
  ChevronDown,
  ChevronUp,
  Layers,
  Calendar,
  Filter,
  Camera,
  FileCheck2,
} from 'lucide-react';
import {
  groupEvidenceBy15MinFolders,
  getEvidenceFolderInfo,
  EvidenceFolder,
} from '../utils/evidenceFolderUtils';
import { generatePoliceInvestigationPdf } from '../utils/policeDossierPdfGenerator';

interface EvidenceVaultProps {
  onBackToHome?: () => void;
}

function getSampleThreatScreenshot(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900">
    <rect width="600" height="900" fill="#0b132b"/>
    <!-- Status Bar (Crucial for police forensic corroboration) -->
    <rect width="600" height="42" fill="#1c2541"/>
    <text x="24" y="27" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="14" font-weight="bold">09:41 AM</text>
    <text x="470" y="27" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="13">5G 📶 88% 🔋</text>
    
    <!-- Chat Header (Crucial for suspect account identification) -->
    <rect y="42" width="600" height="74" fill="#1c2541" stroke="#334155" stroke-width="1"/>
    <circle cx="50" cy="79" r="22" fill="#e11d48"/>
    <text x="44" y="85" fill="#ffffff" font-family="system-ui, sans-serif" font-size="16" font-weight="bold">☠</text>
    <text x="88" y="72" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="17" font-weight="bold">@cyber_extort_99</text>
    <text x="88" y="93" fill="#22c55e" font-family="system-ui, sans-serif" font-size="12">● Active Now · Unknown User</text>
    
    <!-- Date Divider -->
    <rect x="230" y="145" width="140" height="26" rx="13" fill="#334155"/>
    <text x="252" y="162" fill="#cbd5e1" font-family="system-ui, sans-serif" font-size="11" font-weight="500">TODAY, 9:35 AM</text>

    <!-- Message Bubble 1 -->
    <rect x="30" y="195" width="460" height="65" rx="18" fill="#334155"/>
    <text x="48" y="225" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="14">I have gained access to your private camera sync folder.</text>
    <text x="430" y="248" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11">09:37 AM</text>

    <!-- Message Bubble 2 (The threat victims often crop too tightly!) -->
    <rect x="30" y="280" width="510" height="95" rx="18" fill="#3b0764" stroke="#e11d48" stroke-width="2"/>
    <text x="48" y="310" fill="#fecdd3" font-family="system-ui, sans-serif" font-size="14" font-weight="bold">⚠️ Transfer ₹50,000 to UPI ID: quickcash@paytm</text>
    <text x="48" y="336" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="13">You have 2 hours before I send the photos to your family and workplace.</text>
    <text x="450" y="362" fill="#e2e8f0" font-family="system-ui, sans-serif" font-size="11">09:39 AM ✓✓</text>

    <!-- Message Bubble 3 -->
    <rect x="30" y="395" width="420" height="60" rx="18" fill="#334155"/>
    <text x="48" y="425" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="14">Do not test me. Timer is running.</text>
    <text x="390" y="445" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11">09:40 AM</text>

    <!-- Context Indicator / Device Frame -->
    <rect x="30" y="500" width="540" height="80" rx="16" fill="#1e293b" stroke="#334155" stroke-width="1"/>
    <text x="50" y="532" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="13" font-weight="bold">ℹ️ Chain of Custody Notice (Sec 63 BSA)</text>
    <text x="50" y="556" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12">Keep full frame showing sender header &amp; top status bar to prove non-tampering.</text>

    <!-- Bottom Input Bar -->
    <rect y="825" width="600" height="75" fill="#1c2541"/>
    <rect x="20" y="838" width="500" height="46" rx="23" fill="#0b132b" stroke="#334155" stroke-width="1"/>
    <text x="40" y="866" fill="#64748b" font-family="system-ui, sans-serif" font-size="14">Type a message...</text>
    <circle cx="555" cy="861" r="20" fill="#3b82f6"/>
    <text x="548" y="867" fill="#ffffff" font-family="system-ui, sans-serif" font-size="16">➤</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

export const EvidenceVault: React.FC<EvidenceVaultProps> = ({ onBackToHome }) => {
  const {
    cases,
    activeCaseId,
    addEvidenceToCase,
    updateEvidenceItemInCase,
    removeEvidenceFromCase,
    createNewCase,
  } = useCase();
  const { isVaultLocked, isDecoyMode, exitDecoyMode, unlockVault, lockVault } = useAuth();
  const { t } = useLocale();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string>(
    activeCaseId || (cases[0]?.id || '')
  );

  React.useEffect(() => {
    if (!selectedCaseId && (activeCaseId || cases[0]?.id)) {
      setSelectedCaseId(activeCaseId || cases[0]?.id || '');
    }
  }, [activeCaseId, cases, selectedCaseId]);

  // Folder Segregation State
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});
  const [selectedFolderFilter, setSelectedFolderFilter] = useState<string>('all');
  const [folderViewMode, setFolderViewMode] = useState<'folders' | 'flat'>('folders');

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<EvidenceItem['type']>('screenshot');
  const [newDesc, setNewDesc] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newOriginalDate, setNewOriginalDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // New Evidence Image & Crop State
  const [newFileUrl, setNewFileUrl] = useState<string>('');
  const [newUncroppedUrl, setNewUncroppedUrl] = useState<string>('');
  const [newCropFlag, setNewCropFlag] = useState<CropFlagInfo | undefined>(undefined);
  const [isCroppedState, setIsCroppedState] = useState<boolean>(false);

  // Crop Modal state
  const [cropModalOpen, setCropModalOpen] = useState<boolean>(false);
  const [cropTarget, setCropTarget] = useState<{
    imageUrl: string;
    evidenceTitle: string;
    evidenceType: string;
    evidenceId?: string;
    currentCropFlag?: CropFlagInfo;
  } | null>(null);

  // Detail Modal for Over-Crop Inspection Report
  const [inspectDetailItem, setInspectDetailItem] = useState<EvidenceItem | null>(null);

  // Formal Police Report Document Viewer State
  const [viewingReportItem, setViewingReportItem] = useState<EvidenceItem | null>(null);

  const handleDownloadEvidenceReportPdf = (item: EvidenceItem) => {
    if (currentCase?.report?.sections) {
      generatePoliceInvestigationPdf({
        caseData: currentCase,
        sections: currentCase.report.sections,
        complainantName: currentCase.details?.username || 'Aggrieved Complainant',
        stationJurisdiction: currentCase.details?.gpsLocation?.jurisdictionCell,
      });
      return;
    }
    if (item.fileUrl) {
      const a = document.createElement('a');
      a.href = item.fileUrl;
      a.download = item.fileName || `Police_Report_${currentCase?.id || 'case'}.txt`;
      a.click();
    }
  };

  const handleDownloadEvidenceReportTxt = (item: EvidenceItem) => {
    if (item.fileUrl) {
      const a = document.createElement('a');
      a.href = item.fileUrl;
      a.download = item.fileName?.replace(/\.pdf$/, '.txt') || `Police_Report_${currentCase?.id || 'case'}.txt`;
      a.click();
    }
  };

  // Emergency Photo Upload & AI Inspection State
  const emergencyFileInputRef = useRef<HTMLInputElement | null>(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState<boolean>(false);
  const [emergencyPhotoUrl, setEmergencyPhotoUrl] = useState<string>('');
  const [emergencyPhotoName, setEmergencyPhotoName] = useState<string>('');
  const [isAiScanningPhoto, setIsAiScanningPhoto] = useState<boolean>(false);
  const [emergencyCropFlag, setEmergencyCropFlag] = useState<CropFlagInfo | null>(null);

  const currentCase = cases.find((c) => c.id === selectedCaseId) || cases[0];

  const currentFolderInfo = getEvidenceFolderInfo(new Date());
  const evidenceFolders: EvidenceFolder[] = groupEvidenceBy15MinFolders(currentCase?.evidenceItems || []);

  const ensureSelectedCaseId = (): string => {
    if (selectedCaseId) return selectedCaseId;
    if (cases.length > 0) {
      setSelectedCaseId(cases[0].id);
      return cases[0].id;
    }
    const newCase = createNewCase('blackmail');
    setSelectedCaseId(newCase.id);
    return newCase.id;
  };

  const toggleFolderCollapse = (folderId: string) => {
    setCollapsedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const collapseAllFolders = () => {
    const updated: Record<string, boolean> = {};
    evidenceFolders.forEach((f) => {
      updated[f.folderId] = true;
    });
    setCollapsedFolders(updated);
  };

  const expandAllFolders = () => {
    setCollapsedFolders({});
  };

  const handleGenerateTestBatches = () => {
    const targetCaseId = ensureSelectedCaseId();
    const now = Date.now();
    const sampleUrl = getSampleThreatScreenshot();

    // 1. Current 15-min session
    const currentInfo = getEvidenceFolderInfo(now);
    addEvidenceToCase(targetCaseId, {
      type: 'screenshot',
      title: 'Current 15-Min Threat Chat Capture',
      description: 'Preserved in current 15-minute emergency recording session with full status bar metadata.',
      originalDate: new Date(now).toISOString().split('T')[0],
      fileUrl: sampleUrl,
      uncroppedFileUrl: sampleUrl,
      isCropped: false,
      folderId: currentInfo.folderId,
      folderName: currentInfo.folderName,
      fileName: 'current_session_threat.png',
      fileSize: '412 KB',
      tags: ['15min_session', 'active_capture'],
    });

    // 2. Previous 15-min session (20 mins ago)
    const prevTime = now - 20 * 60 * 1000;
    const prevInfo = getEvidenceFolderInfo(prevTime);
    addEvidenceToCase(targetCaseId, {
      type: 'message',
      title: 'Prior Session Threat Message Log',
      description: 'Preserved 20 minutes prior during initial extortion contact attempt.',
      originalDate: new Date(prevTime).toISOString().split('T')[0],
      folderId: prevInfo.folderId,
      folderName: prevInfo.folderName,
      fileName: 'prior_threat_chat.log',
      fileSize: '188 KB',
      tags: ['prior_15min_batch'],
    });

    // 3. Earlier 15-min session (45 mins ago)
    const earlierTime = now - 45 * 60 * 1000;
    const earlierInfo = getEvidenceFolderInfo(earlierTime);
    addEvidenceToCase(targetCaseId, {
      type: 'url',
      title: 'Perpetrator Account Profile Link',
      description: 'Suspect profile URL preserved in earlier 15-minute time window.',
      url: 'https://instagram.com/cyber_extort_99',
      originalDate: new Date(earlierTime).toISOString().split('T')[0],
      folderId: earlierInfo.folderId,
      folderName: earlierInfo.folderName,
      tags: ['archived_window'],
    });
  };

  // Common AI photo inspection helper that calls /api/inspect-crop to detect cropped URLs, tags, and data
  const runAiPhotoInspection = async (
    dataUrl: string,
    evidenceType: string = 'screenshot'
  ): Promise<CropFlagInfo | null> => {
    setIsAiScanningPhoto(true);
    try {
      const res = await fetch('/api/inspect-crop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: dataUrl,
          cropMetrics: {
            cropAreaPercent: 100,
            evidenceType,
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        return data.analysis as CropFlagInfo;
      }
    } catch (err) {
      console.error('Failed to run AI photo inspection:', err);
    } finally {
      setIsAiScanningPhoto(false);
    }
    return null;
  };

  const handleEmergencyFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const defaultName = file.name.replace(/\.[^/.]+$/, '');
      setEmergencyPhotoName(defaultName);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        setEmergencyPhotoUrl(dataUrl);
        setEmergencyCropFlag(null);
        setShowEmergencyModal(true);
        const analysis = await runAiPhotoInspection(dataUrl, 'screenshot');
        if (analysis) {
          setEmergencyCropFlag(analysis);
        }
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const handleEmergencySampleThreat = async () => {
    const sampleUrl = getSampleThreatScreenshot();
    setEmergencyPhotoName('Instagram Extortion Threat Chat Screenshot');
    setEmergencyPhotoUrl(sampleUrl);
    setEmergencyCropFlag(null);
    setShowEmergencyModal(true);
    const analysis = await runAiPhotoInspection(sampleUrl, 'screenshot');
    if (analysis) {
      setEmergencyCropFlag(analysis);
    }
  };

  const handleSaveEmergencyEvidence = () => {
    const targetCaseId = ensureSelectedCaseId();
    if (!targetCaseId || !emergencyPhotoUrl) return;

    const folderInfo = getEvidenceFolderInfo(new Date());

    addEvidenceToCase(targetCaseId, {
      type: 'screenshot',
      title: emergencyPhotoName || 'Emergency Uploaded Evidence Photo',
      description: emergencyCropFlag?.flagReason
        ? `Emergency upload with AI Forensic Analysis: ${emergencyCropFlag.flagReason}`
        : 'Emergency evidence photo uploaded with forensic AI crop and metadata verification.',
      originalDate: new Date().toISOString().split('T')[0],
      fileUrl: emergencyPhotoUrl,
      uncroppedFileUrl: emergencyPhotoUrl,
      isCropped: false,
      cropFlag: emergencyCropFlag || undefined,
      folderId: folderInfo.folderId,
      folderName: folderInfo.folderName,
      fileName: (emergencyPhotoName || 'emergency_photo').replace(/\s+/g, '_') + '.png',
      fileSize: (Math.floor(Math.random() * 800) + 200) + ' KB',
      tags: ['emergency_upload', 'ai_inspected', '15min_session'],
    });

    setShowEmergencyModal(false);
    setEmergencyPhotoUrl('');
    setEmergencyPhotoName('');
    setEmergencyCropFlag(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!newTitle) {
        setNewTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        setNewFileUrl(dataUrl);
        setNewUncroppedUrl(dataUrl);
        setNewCropFlag(undefined);
        setIsCroppedState(false);
        const analysis = await runAiPhotoInspection(dataUrl, newType);
        if (analysis) {
          setNewCropFlag(analysis);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLoadSampleThreat = async () => {
    const sampleUrl = getSampleThreatScreenshot();
    setNewTitle('Instagram Extortion Threat Chat Screenshot');
    setNewType('screenshot');
    setNewDesc('Perpetrator @cyber_extort_99 demanded ₹50,000 within 2 hours under threat of non-consensual media distribution.');
    setNewFileUrl(sampleUrl);
    setNewUncroppedUrl(sampleUrl);
    setNewCropFlag(undefined);
    setIsCroppedState(false);
    const analysis = await runAiPhotoInspection(sampleUrl, 'screenshot');
    if (analysis) {
      setNewCropFlag(analysis);
    }
  };

  const handleOpenCropModalForNew = () => {
    if (!newFileUrl) return;
    setCropTarget({
      imageUrl: newUncroppedUrl || newFileUrl,
      evidenceTitle: newTitle || 'Screenshot Evidence',
      evidenceType: newType,
      currentCropFlag: newCropFlag,
    });
    setCropModalOpen(true);
  };

  const handleOpenCropModalForItem = (item: EvidenceItem) => {
    const imgToCrop = item.uncroppedFileUrl || item.fileUrl;
    if (!imgToCrop) return;
    setCropTarget({
      imageUrl: imgToCrop,
      evidenceTitle: item.title,
      evidenceType: item.type,
      evidenceId: item.id,
      currentCropFlag: item.cropFlag,
    });
    setCropModalOpen(true);
  };

  const handleSaveCropResult = (result: {
    croppedUrl: string;
    cropFlag: CropFlagInfo;
    uncroppedUrl: string;
    cropAreaPercent: number;
  }) => {
    if (cropTarget?.evidenceId && currentCase) {
      // Editing an existing evidence item
      updateEvidenceItemInCase(currentCase.id, cropTarget.evidenceId, {
        fileUrl: result.croppedUrl,
        uncroppedFileUrl: result.uncroppedUrl,
        isCropped: true,
        cropFlag: result.cropFlag,
      });
    } else {
      // Modifying image in the Add Evidence modal
      setNewFileUrl(result.croppedUrl);
      setNewUncroppedUrl(result.uncroppedUrl);
      setNewCropFlag(result.cropFlag);
      setIsCroppedState(true);
    }
    setCropTarget(null);
  };

  const handleRestoreUncropped = (item: EvidenceItem) => {
    if (!currentCase || !item.uncroppedFileUrl) return;
    updateEvidenceItemInCase(currentCase.id, item.id, {
      fileUrl: item.uncroppedFileUrl,
      isCropped: false,
      cropFlag: {
        isOverCropped: false,
        severity: 'SAFE',
        confidence: 99,
        cropAreaPercent: 100,
        missingElements: [],
        flagReason: 'Restored to full uncropped frame. All headers, timestamps, and status bar metadata intact.',
        forensicImpact: 'Admissible under Section 63 BSA / Sec 65B without over-crop objections.',
        recommendation: 'Full frame preserved.',
      },
    });
  };

  const handleAddEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    const targetCaseId = ensureSelectedCaseId();
    if (!targetCaseId || !newTitle.trim()) return;

    const folderInfo = getEvidenceFolderInfo(new Date());

    addEvidenceToCase(targetCaseId, {
      type: newType,
      title: newTitle,
      description: newDesc,
      originalDate: newOriginalDate,
      url: newUrl,
      fileUrl: newFileUrl || undefined,
      uncroppedFileUrl: newUncroppedUrl || undefined,
      isCropped: isCroppedState,
      cropFlag: newCropFlag,
      folderId: folderInfo.folderId,
      folderName: folderInfo.folderName,
      fileName: newTitle.replace(/\s+/g, '_') + '.png',
      fileSize: (Math.floor(Math.random() * 800) + 120) + ' KB',
    });

    setNewTitle('');
    setNewDesc('');
    setNewUrl('');
    setNewFileUrl('');
    setNewUncroppedUrl('');
    setNewCropFlag(undefined);
    setIsCroppedState(false);
    setShowAddModal(false);
  };

  const renderTypeIcon = (type: EvidenceItem['type']) => {
    switch (type) {
      case 'image':
      case 'screenshot':
        return <ImageIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />;
      case 'url':
        return <LinkIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'document':
        return <FileCheck2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />;
      default:
        return <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
    }
  };

  if (isVaultLocked) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-sm">
          <div className="w-20 h-20 bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 rounded-3xl mx-auto flex items-center justify-center border border-teal-200 dark:border-teal-900">
            <Lock className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {t('vault_locked_title', 'Secure Evidence Vault is Locked')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              {t(
                'vault_locked_desc',
                'Protected with 6-digit passcode authentication. Enter your passcode to unlock the evidence vault. Default passcode: 123456.'
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-6 py-3.5 bg-teal-600 hover:bg-teal-500 text-slate-950 font-extrabold rounded-2xl shadow-lg transition-all inline-flex items-center gap-2 text-sm"
            >
              <Unlock className="w-4 h-4" />
              <span>{t('unlock_vault_btn', 'Unlock Evidence Vault')}</span>
            </button>
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="px-5 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl transition-all inline-flex items-center gap-2 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Home</span>
              </button>
            )}
          </div>
        </div>

        <TwoFactorLockModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onCancel={() => {
            setShowAuthModal(false);
            if (onBackToHome) onBackToHome();
          }}
          onUnlocked={() => {
            unlockVault();
            setShowAuthModal(false);
          }}
        />
      </div>
    );
  }

  if (isDecoyMode) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-600 dark:text-slate-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Personal Notes & Documents</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Private offline scratchpad</p>
              </div>
            </div>
            <button
              onClick={exitDecoyMode}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold"
            >
              Lock
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">Weekend Grocery & Household Tasks</span>
                <p className="text-slate-400 text-[11px]">Updated 2 days ago</p>
              </div>
              <span className="text-slate-400">8 items</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">Home Wifi Setup & Bill Receipts</span>
                <p className="text-slate-400 text-[11px]">Updated last week</p>
              </div>
              <span className="text-slate-400">PDF Document</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">Fitness Routine & Diet Guidelines</span>
                <p className="text-slate-400 text-[11px]">Updated yesterday</p>
              </div>
              <span className="text-slate-400">Text Note</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Discreet Mode Active</span>
            <div className="flex gap-2">
              <a
                href="tel:112"
                className="px-2.5 py-1 bg-rose-50 text-rose-600 rounded-lg font-bold hover:bg-rose-100"
              >
                Call 112
              </a>
              <a
                href="tel:1930"
                className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg font-bold hover:bg-indigo-100"
              >
                Call 1930
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderEvidenceCard = (item: EvidenceItem, folderName?: string) => {
    const itemFolderName = item.folderName || folderName || getEvidenceFolderInfo(item.dateAdded).folderName;
    const itemDate = new Date(item.dateAdded);
    const timeFormatted = !isNaN(itemDate.getTime())
      ? itemDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      : 'Just now';

    return (
      <div
        key={item.id}
        className={`bg-white dark:bg-slate-800 border rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between transition-all ${
          item.cropFlag?.isOverCropped
            ? 'border-rose-300 dark:border-rose-900/80 ring-2 ring-rose-500/10'
            : 'border-slate-200/80 dark:border-slate-700'
        }`}
      >
        <div className="space-y-3">
          {/* Header & Type */}
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900/60 flex items-center gap-2">
              {renderTypeIcon(item.type)}
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                {item.type}
              </span>
            </div>

            <button
              onClick={() => currentCase && removeEvidenceFromCase(currentCase.id, item.id)}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
              title="Delete item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Police Complaint Report Document Display */}
          {(item.type === 'document' || item.tags?.includes('police_report')) ? (
            <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-700/60 p-4 text-white space-y-3 relative group shadow-md">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    <FileCheck2 className="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-teal-400 block">
                      Police Complaint Dossier
                    </span>
                    <span className="text-xs font-bold text-slate-200">
                      Sec 63 BSA & 154 CrPC
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700 text-[10px] font-extrabold shrink-0">
                  FIR Ready
                </span>
              </div>

              {/* Document details preview */}
              <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800/80 space-y-1 text-[11px]">
                <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
                  <span>📄 {item.fileName || 'Police_Investigation_Report.txt'}</span>
                  <span>{item.fileSize || '128 KB'}</span>
                </div>
                <p className="text-slate-300 text-xs line-clamp-2 leading-relaxed">
                  {item.description || 'Formal Cyber Crime Complaint formatted with 11 structured sections for police filing.'}
                </p>
              </div>

              {/* Action buttons on Document card */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setViewingReportItem(item)}
                  className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Report</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadEvidenceReportPdf(item)}
                  className="py-2 px-3.5 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-400 text-slate-950 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  title="Download Official Police Report (PDF)"
                >
                  <Download className="w-3.5 h-3.5 text-slate-950" />
                  <span>PDF</span>
                </button>
              </div>
            </div>
          ) : item.fileUrl && (item.type === 'image' || item.type === 'screenshot' || item.fileUrl.startsWith('data:image/')) ? (
            <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 group">
              <img
                src={item.fileUrl}
                alt={item.title}
                className="w-full h-36 object-contain bg-slate-950/80 transition-transform group-hover:scale-105 duration-200"
              />

              {/* Over-Crop Alert Overlay Ribbon */}
              {item.cropFlag?.isOverCropped && (
                <div className="absolute top-2 left-2 right-2 bg-rose-950/90 text-rose-200 border border-rose-600/60 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>AI Flagged: Over-Cropped ({item.cropFlag.cropAreaPercent || 25}% Area)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setInspectDetailItem(item)}
                    className="underline hover:text-white"
                  >
                    Details
                  </button>
                </div>
              )}

              {item.isCropped && !item.cropFlag?.isOverCropped && (
                <div className="absolute top-2 left-2 bg-emerald-950/90 text-emerald-200 border border-emerald-600/60 backdrop-blur-xs px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>AI Verified Crop</span>
                </div>
              )}

              {/* Quick Crop / Recrop Action Overlay on Hover */}
              <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                <button
                  type="button"
                  onClick={() => handleOpenCropModalForItem(item)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-md"
                >
                  <Crop className="w-3.5 h-3.5" />
                  <span>{item.isCropped ? 'Re-Crop' : 'Crop & Frame'}</span>
                </button>

                {item.isCropped && item.uncroppedFileUrl && (
                  <button
                    type="button"
                    onClick={() => handleRestoreUncropped(item)}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-lg text-xs font-bold flex items-center gap-1 shadow-md"
                    title="Restore original uncropped image"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore</span>
                  </button>
                )}
              </div>
            </div>
          ) : null}

          {/* Over-Crop Warning Card on Evidence Item */}
          {item.cropFlag?.isOverCropped && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs text-rose-950 dark:text-rose-200 space-y-1.5">
              <div className="flex items-center justify-between font-bold text-[11px]">
                <span className="flex items-center gap-1 text-rose-700 dark:text-rose-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>High Evidentiary Risk (Sec 63 BSA)</span>
                </span>
                <button
                  onClick={() => setInspectDetailItem(item)}
                  className="text-[10px] text-indigo-600 dark:text-indigo-400 underline font-semibold"
                >
                  Report
                </button>
              </div>

              <p className="text-[11px] leading-tight line-clamp-2 text-rose-900/90 dark:text-rose-200/90">
                {item.cropFlag.flagReason}
              </p>

              {item.cropFlag.missingElements && item.cropFlag.missingElements.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {item.cropFlag.missingElements.slice(0, 2).map((m, idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 bg-rose-100 dark:bg-rose-900/70 text-rose-800 dark:text-rose-200 text-[9px] font-bold rounded"
                    >
                      ✕ {m}
                    </span>
                  ))}
                </div>
              )}

              {item.uncroppedFileUrl && (
                <button
                  type="button"
                  onClick={() => handleRestoreUncropped(item)}
                  className="w-full mt-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-extrabold flex items-center justify-center gap-1 shadow-xs transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restore Full Uncropped Frame</span>
                </button>
              )}
            </div>
          )}

          {/* Title & Description */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {item.title}
            </h4>
            {item.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-3 leading-relaxed">
                {item.description}
              </p>
            )}
          </div>

          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold truncate block hover:underline"
            >
              {item.url}
            </a>
          )}

          {/* AI Forensic Detection Badges */}
          {item.cropFlag && (
            <div className="flex flex-wrap gap-1.5 pt-1 text-[10px]">
              {item.cropFlag.detectedUrls && item.cropFlag.detectedUrls.length > 0 ? (
                <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-900/60 font-semibold flex items-center gap-1">
                  <Globe className="w-2.5 h-2.5" />
                  <span>URL Intact</span>
                </span>
              ) : item.cropFlag.croppedAlerts?.croppedUrls ? (
                <span className="px-2 py-0.5 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 rounded-md border border-rose-200 dark:border-rose-900/60 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-2.5 h-2.5 text-rose-500" />
                  <span>Cropped URL</span>
                </span>
              ) : null}

              {item.cropFlag.detectedTags && item.cropFlag.detectedTags.length > 0 ? (
                <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded-md border border-purple-200 dark:border-purple-900/60 font-semibold flex items-center gap-1">
                  <Tag className="w-2.5 h-2.5" />
                  <span>@{item.cropFlag.detectedTags[0].replace(/^@/, '')}</span>
                </span>
              ) : item.cropFlag.croppedAlerts?.croppedTags ? (
                <span className="px-2 py-0.5 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 rounded-md border border-rose-200 dark:border-rose-900/60 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-2.5 h-2.5 text-rose-500" />
                  <span>Cropped Tag</span>
                </span>
              ) : null}

              {item.cropFlag.detectedImportantData && item.cropFlag.detectedImportantData.length > 0 && (
                <span className="px-2 py-0.5 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 rounded-md border border-teal-200 dark:border-teal-900/60 font-semibold flex items-center gap-1">
                  <Check className="w-2.5 h-2.5" />
                  <span>Metadata Logged</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Folder Badge & Timestamp & SHA Hash Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 space-y-2">
          {/* Distinct 15-min Folder Tag */}
          <div className="flex items-center justify-between text-[11px] gap-2">
            <span className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-semibold text-[10px] border border-teal-200 dark:border-teal-800/60 truncate flex items-center gap-1">
              <FolderClock className="w-3 h-3 text-teal-600 dark:text-teal-400 shrink-0" />
              <span className="truncate">{itemFolderName}</span>
            </span>
            <span className="text-slate-400 font-mono text-[10px] shrink-0">{item.fileSize || 'Preserved'}</span>
          </div>

          <div className="flex justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Captured: {timeFormatted}</span>
            </span>
            <span>{new Date(item.dateAdded).toLocaleDateString()}</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg text-[10px] font-mono text-slate-500 flex items-center justify-between gap-1">
            <span className="truncate">Hash: {item.hash || 'sha256-verified'}</span>
            <span className="text-teal-600 font-sans text-[9px] uppercase font-bold">VERIFIED</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-semibold border border-teal-200 dark:border-teal-900/60">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Unlocked Vault</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Evidence Vault
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Organize screenshots, chat records, account links, and files associated with your case. All items are tagged with cryptographic hashes for integrity verification.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Hidden Emergency File Input */}
          <input
            ref={emergencyFileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleEmergencyFileSelected}
          />

          {/* Emergency Photo Upload Button */}
          <button
            type="button"
            onClick={() => {
              if (emergencyFileInputRef.current) {
                emergencyFileInputRef.current.click();
              }
            }}
            disabled={!selectedCaseId}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 active:scale-95 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-rose-600/25 transition-all flex items-center justify-center gap-2 border border-rose-500 cursor-pointer"
            title="Emergency Photo Upload with AI scan for cropped URLs, tags, and data"
          >
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse" />
            <span>Emergency Upload</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            disabled={!selectedCaseId}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Evidence Item</span>
          </button>

          <button
            onClick={lockVault}
            className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            title="Lock Vault"
          >
            <Lock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* Security Principles Disclaimer */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 text-xs flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0" />
        <span className="text-slate-300 leading-relaxed">
          <strong>Security Principle:</strong> Evidence files are maintained in local client storage. No unencrypted private evidence is transmitted or logged in server console outputs.
        </span>
      </div>

      {/* Evidence Items & 15-Minute Folder Segregation */}
      {!currentCase || !currentCase.evidenceItems || currentCase.evidenceItems.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-10 sm:p-14 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 rounded-3xl mx-auto flex items-center justify-center border border-teal-200 dark:border-teal-900 shadow-xs">
            <FolderClock className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-slate-100">
              No Evidence Items Preserved Yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Evidences are automatically segregated into distinct folders based on date and time. All items captured, saved, or uploaded within a 15-minute window are kept together.
            </p>
          </div>

          {/* Current Active 15-Min Window Banner */}
          <div className="inline-flex flex-col sm:flex-row items-center gap-2.5 p-3 px-5 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-900 text-xs text-teal-950 dark:text-teal-200 max-w-lg mx-auto">
            <div className="flex items-center gap-2 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Active 15-Min Capture Window:</span>
            </div>
            <span className="font-mono font-bold bg-white dark:bg-slate-900 px-2.5 py-1 rounded-xl border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300">
              {currentFolderInfo.folderName}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                if (emergencyFileInputRef.current) {
                  emergencyFileInputRef.current.click();
                }
              }}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-extrabold transition-all inline-flex items-center gap-2 shadow-md shadow-rose-600/25 border border-rose-500 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>Emergency Photo Upload</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Evidence Item</span>
            </button>

            <button
              type="button"
              onClick={handleGenerateTestBatches}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 border border-slate-300 dark:border-slate-700"
              title="Populate test evidence across current and past 15-minute folders"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Generate Test 15-Min Batches</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Folder Segregation Control & Metrics Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5" />
                  <span>{evidenceFolders.length} {evidenceFolders.length === 1 ? 'Segregated Folder' : 'Segregated Folders'}</span>
                </span>

                <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800/80 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Active Session (Last 15 Min): <strong>{currentFolderInfo.timeRangeStr}</strong></span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Evidences captured, saved, and uploaded in each 15-minute window are grouped together in distinct folders named by date and time.
              </p>
            </div>

            {/* Controls: Filter by Folder, View Mode, Test Batches */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
              {/* Folder Filter */}
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={selectedFolderFilter}
                  onChange={(e) => setSelectedFolderFilter(e.target.value)}
                  className="p-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 max-w-[220px] truncate"
                >
                  <option value="all">All Folders ({evidenceFolders.length})</option>
                  {evidenceFolders.map((f) => (
                    <option key={f.folderId} value={f.folderId}>
                      {f.folderName} ({f.items.length})
                    </option>
                  ))}
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center gap-1 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setFolderViewMode('folders')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                    folderViewMode === 'folders'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                  title="Group evidence into 15-minute date-and-time folders"
                >
                  <FolderClock className="w-3.5 h-3.5" />
                  <span>Folders</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFolderViewMode('flat')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                    folderViewMode === 'flat'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                  title="View all items in flat grid"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Flat View</span>
                </button>
              </div>

              {/* Expand / Collapse All */}
              {folderViewMode === 'folders' && (
                <div className="flex items-center gap-1 text-xs">
                  <button
                    type="button"
                    onClick={expandAllFolders}
                    className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Expand All
                  </button>
                  <button
                    type="button"
                    onClick={collapseAllFolders}
                    className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Collapse
                  </button>
                </div>
              )}

              {/* Add Test Batches Helper */}
              <button
                type="button"
                onClick={handleGenerateTestBatches}
                className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                title="Simulate 15-min folder segregation with sample batches"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>+ Test 15m Batches</span>
              </button>
            </div>
          </div>

          {/* Render Segregated Folders or Flat View */}
          {folderViewMode === 'folders' ? (
            <div className="space-y-6">
              {(selectedFolderFilter === 'all'
                ? evidenceFolders
                : evidenceFolders.filter((f) => f.folderId === selectedFolderFilter)
              ).map((folder) => {
                const isCollapsed = !!collapsedFolders[folder.folderId];
                return (
                  <div
                    key={folder.folderId}
                    className={`border rounded-3xl overflow-hidden transition-all shadow-xs ${
                      folder.isCurrentWindow
                        ? 'border-teal-400 dark:border-teal-700/80 bg-white dark:bg-slate-900 ring-2 ring-teal-500/20'
                        : 'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    {/* Distinct Folder Header Bar */}
                    <div
                      onClick={() => toggleFolderCollapse(folder.folderId)}
                      className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none border-b transition-colors ${
                        folder.isCurrentWindow
                          ? 'bg-teal-50/80 dark:bg-teal-950/40 border-teal-200 dark:border-teal-900/60'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100/70 dark:hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-3.5">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                            folder.isCurrentWindow
                              ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-md shadow-teal-500/30'
                              : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900'
                          }`}
                        >
                          <FolderClock className="w-6 h-6" />
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                              <span>{folder.folderName}</span>
                            </h3>

                            {folder.isCurrentWindow ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold text-[10px] border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5 shadow-xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span>Active (Last 15 Min)</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[10px]">
                                Archived Window
                              </span>
                            )}

                            <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] border border-indigo-200 dark:border-indigo-800">
                              {folder.items.length} {folder.items.length === 1 ? 'Evidence File' : 'Evidence Files'}
                            </span>
                          </div>

                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>Interval: <strong>{folder.timeRangeStr}</strong> • Date: <strong>{folder.dateStr}</strong></span>
                          </p>
                        </div>
                      </div>

                      {/* Right Controls in Folder Header */}
                      <div
                        className="flex items-center gap-2 self-end md:self-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            if (currentCase) setSelectedCaseId(currentCase.id);
                            setShowAddModal(true);
                          }}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
                          title="Add evidence into this time session"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Evidence</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleFolderCollapse(folder.folderId)}
                          className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          title={isCollapsed ? 'Expand folder' : 'Collapse folder'}
                        >
                          {isCollapsed ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronUp className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Folder Items Grid */}
                    {!isCollapsed && (
                      <div className="p-5 sm:p-6 bg-slate-50/40 dark:bg-slate-900/40">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                          {folder.items.map((item) => renderEvidenceCard(item, folder.folderName))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {currentCase.evidenceItems.map((item) => renderEvidenceCard(item))}
            </div>
          )}
        </div>
      )}

      {/* Add Evidence Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5 my-8">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  Add Evidence Item to Case
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Upload screenshot or media. AI will verify that vital context is not cropped out.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEvidence} className="space-y-4 text-xs">
              {/* Auto-Assigned 15-Minute Folder Banner */}
              <div className="bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-2xl p-3 text-xs flex items-center gap-3">
                <FolderClock className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-teal-950 dark:text-teal-200">
                      Auto-Assigned 15-Minute Folder:
                    </span>
                    <span className="px-2 py-0.5 bg-teal-200 dark:bg-teal-900 text-teal-900 dark:text-teal-200 text-[10px] font-bold rounded-full">
                      Time-Segregated
                    </span>
                  </div>
                  <p className="text-teal-800 dark:text-teal-300 font-semibold">
                    📁 {currentFolderInfo.folderName}
                  </p>
                  <p className="text-[11px] text-teal-700/80 dark:text-teal-400/80">
                    All evidence captured, saved, or uploaded within this 15-minute window is saved together in this folder.
                  </p>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Evidence Type
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="screenshot">Screenshot (Chat, Social Media, SMS)</option>
                  <option value="image">Image / Photo / Video Still</option>
                  <option value="message">Message Record / Conversation Log</option>
                  <option value="url">URL / Web Link</option>
                  <option value="document">Document / Transaction Slip</option>
                  <option value="account_info">Account Info / Profile Capture</option>
                  <option value="note">Text Note</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Title / Label
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Instagram Extortion Chat Screenshot #1"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Evidence File / Screenshot Upload & AI Crop Inspector */}
              <div className="space-y-2 p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-indigo-500" />
                    <span>Evidence Screenshot / Image:</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleLoadSampleThreat}
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Load Sample Threat Chat</span>
                  </button>
                </div>

                {newFileUrl ? (
                  <div className="space-y-2.5">
                    <div className="relative bg-slate-950 rounded-xl overflow-hidden border border-slate-800 p-2 flex items-center justify-center">
                      <img
                        src={newFileUrl}
                        alt="Preview"
                        className="max-h-48 object-contain rounded-lg"
                      />
                      <div className="absolute top-2 right-2 flex gap-1.5">
                        <button
                          type="button"
                          onClick={handleOpenCropModalForNew}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-md"
                        >
                          <Crop className="w-3.5 h-3.5" />
                          <span>{isCroppedState ? 'Edit Crop' : 'Crop & Frame'}</span>
                        </button>
                      </div>
                    </div>

                    {/* AI Scanning Status Indicator */}
                    {isAiScanningPhoto && (
                      <div className="p-3 bg-indigo-950/70 border border-indigo-700/80 rounded-xl text-xs text-indigo-200 flex items-center gap-2.5 animate-pulse">
                        <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
                        <div>
                          <div className="font-bold text-indigo-100">AI Scanning Photo in Progress...</div>
                          <div className="text-[10px] text-indigo-300">Detecting cropped URLs, perpetrator tags, timestamps, and legal metadata.</div>
                        </div>
                      </div>
                    )}

                    {/* AI Over-Crop Alert in Add Modal */}
                    {newCropFlag?.isOverCropped && (
                      <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900/60 rounded-xl text-xs text-rose-950 dark:text-rose-100 space-y-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-400">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>AI Alert: Excessive Crop Flagged!</span>
                        </div>
                        <p className="text-[11px] opacity-90">{newCropFlag.flagReason}</p>
                        
                        {/* Breakdown of detected/cropped URLs & tags */}
                        <div className="pt-1 space-y-1 border-t border-rose-200/60 dark:border-rose-900/60 text-[10px]">
                          {newCropFlag.croppedAlerts?.croppedUrls && (
                            <div className="text-rose-700 dark:text-rose-300 flex items-center gap-1 font-semibold">
                              <span>⚠️ Cropped URL: Browser address bar or web URL is cut off.</span>
                            </div>
                          )}
                          {newCropFlag.croppedAlerts?.croppedTags && (
                            <div className="text-rose-700 dark:text-rose-300 flex items-center gap-1 font-semibold">
                              <span>⚠️ Cropped Tag: Sender user handle or mention header missing.</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-1 text-[10px]">
                          <span className="font-semibold text-rose-800 dark:text-rose-300">
                            Court / Police Risk: Uncorroborated screenshot
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setNewFileUrl(newUncroppedUrl);
                              setNewCropFlag(undefined);
                              setIsCroppedState(false);
                            }}
                            className="font-bold text-indigo-600 dark:text-indigo-400 underline"
                          >
                            Revert to 100% Full Frame
                          </button>
                        </div>
                      </div>
                    )}

                    {/* AI Verified Context Summary in Add Modal */}
                    {newCropFlag && !newCropFlag.isOverCropped && (
                      <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-900/60 rounded-xl text-xs text-emerald-950 dark:text-emerald-100 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>AI Verified: Framing & Context Intact</span>
                        </div>
                        <div className="flex flex-wrap gap-1 text-[10px] pt-0.5">
                          {newCropFlag.detectedUrls && newCropFlag.detectedUrls.length > 0 && (
                            <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 rounded font-mono">
                              URL: {newCropFlag.detectedUrls[0]}
                            </span>
                          )}
                          {newCropFlag.detectedTags && newCropFlag.detectedTags.length > 0 && (
                            <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 rounded font-semibold">
                              Tag: @{newCropFlag.detectedTags[0].replace(/^@/, '')}
                            </span>
                          )}
                          {newCropFlag.detectedImportantData && newCropFlag.detectedImportantData.length > 0 && (
                            <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 rounded">
                              Data: {newCropFlag.detectedImportantData.slice(0, 2).join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-2 pb-3">
                        <Upload className="w-6 h-6 text-slate-400 mb-1" />
                        <p className="text-[11px] text-slate-500 font-semibold">
                          Click to upload evidence image / screenshot
                        </p>
                        <p className="text-[10px] text-slate-400">PNG, JPG, WEBP (Max 20MB)</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  URL / Account Link (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. https://instagram.com/p/..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Context Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe what this evidence shows..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-md"
                >
                  Save to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Emergency Photo Upload & AI Forensic Audit Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 my-8 text-white animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <span>Emergency Photo AI Forensic Analysis</span>
                    <span className="px-2 py-0.5 text-[9px] bg-rose-950 text-rose-300 border border-rose-800 rounded-full font-bold">
                      Sec 63 BSA
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    AI analyzes the photo to detect cropped URLs, suspect tags, timestamps, and vital metadata.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowEmergencyModal(false);
                  setEmergencyPhotoUrl('');
                  setEmergencyCropFlag(null);
                }}
                className="text-slate-400 hover:text-white font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* 15-Minute Folder Target Banner */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <FolderClock className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Auto-Segregated Target Folder:</span>
                  <span className="font-bold text-white text-xs">📁 {currentFolderInfo.folderName}</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold shrink-0">
                Active 15-Min Window
              </span>
            </div>

            {/* Photo Selection / Preview Area */}
            {!emergencyPhotoUrl ? (
              <div className="space-y-4 py-6 text-center">
                <div className="p-8 border-2 border-dashed border-slate-700 hover:border-rose-500/60 rounded-2xl bg-slate-950/60 flex flex-col items-center justify-center gap-3 transition-colors">
                  <div className="w-14 h-14 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center border border-rose-500/20">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">Select Emergency Threat Screenshot / Photo</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      The AI will instantly audit the frame for cut-off URLs, tags, and contact data.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (emergencyFileInputRef.current) emergencyFileInputRef.current.click();
                      }}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Browse Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleEmergencySampleThreat}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Test with Sample Threat Chat</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Photo Title & Rename */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Evidence Title / File Name
                  </label>
                  <input
                    type="text"
                    value={emergencyPhotoName}
                    onChange={(e) => setEmergencyPhotoName(e.target.value)}
                    placeholder="Emergency Chat Screenshot"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-semibold"
                  />
                </div>

                {/* Photo Preview Container */}
                <div className="relative bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 p-2 flex items-center justify-center max-h-56">
                  <img
                    src={emergencyPhotoUrl}
                    alt="Emergency Photo Preview"
                    className="max-h-52 object-contain rounded-xl"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCropTarget({
                          imageUrl: emergencyPhotoUrl,
                          evidenceTitle: emergencyPhotoName || 'Emergency Evidence',
                          evidenceType: 'screenshot',
                          currentCropFlag: emergencyCropFlag || undefined,
                        });
                        setCropModalOpen(true);
                      }}
                      className="px-2.5 py-1 bg-indigo-600/90 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-md backdrop-blur-xs cursor-pointer"
                    >
                      <Crop className="w-3.5 h-3.5" />
                      <span>Crop / Frame</span>
                    </button>
                  </div>
                </div>

                {/* Active AI Scanning Indicator */}
                {isAiScanningPhoto && (
                  <div className="p-3 bg-indigo-950/80 border border-indigo-700/80 rounded-2xl text-xs text-indigo-200 flex items-center gap-3 animate-pulse shadow-md">
                    <Loader2 className="w-5 h-5 text-indigo-400 animate-spin shrink-0" />
                    <div>
                      <div className="font-bold text-indigo-100">AI Scanning Photo in Progress...</div>
                      <div className="text-[11px] text-indigo-300/90">
                        Detecting cropped URLs, perpetrator tags, timestamps, and Section 63 BSA compliance.
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Analysis Findings Card */}
                {emergencyCropFlag && !isAiScanningPhoto && (
                  <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5 text-xs">
                    {/* Verdict Banner */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                      <div className="flex items-center gap-2">
                        {emergencyCropFlag.isOverCropped ? (
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                        <span className="font-extrabold text-sm text-slate-100">
                          {emergencyCropFlag.isOverCropped ? 'Cropped Evidence Warning' : 'Forensic Framing Verified'}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-extrabold uppercase ${
                          emergencyCropFlag.severity === 'CRITICAL'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : emergencyCropFlag.severity === 'WARNING'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {emergencyCropFlag.severity} ({emergencyCropFlag.cropAreaPercent || 100}% Frame)
                      </span>
                    </div>

                    {/* Detected & Cropped URLs */}
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-300 text-[11px]">
                        <Globe className="w-3.5 h-3.5 text-indigo-400" />
                        <span>URLs & Web Address Bar:</span>
                      </div>
                      {emergencyCropFlag.detectedUrls && emergencyCropFlag.detectedUrls.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {emergencyCropFlag.detectedUrls.map((u, i) => (
                            <span key={i} className="px-2 py-0.5 bg-indigo-950 text-indigo-300 rounded font-mono text-[10px] border border-indigo-800/70 truncate max-w-full">
                              ✓ {u}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      {emergencyCropFlag.croppedAlerts?.croppedUrls && (
                        <div className="text-[11px] text-rose-400 flex items-start gap-1 font-medium pt-0.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                          <span>
                            <strong>Cropped URL Warning:</strong> Web address bar / domain is missing. Preserving the URL bar assists police in obtaining Section 91 CrPC ISP subscriber records.
                          </span>
                        </div>
                      )}
                      {!emergencyCropFlag.detectedUrls?.length && !emergencyCropFlag.croppedAlerts?.croppedUrls && (
                        <p className="text-[11px] text-slate-400">No web address bar detected or needed.</p>
                      )}
                    </div>

                    {/* Detected & Cropped Tags / Handles */}
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-300 text-[11px]">
                        <Tag className="w-3.5 h-3.5 text-purple-400" />
                        <span>Perpetrator Tags & Account Handles:</span>
                      </div>
                      {emergencyCropFlag.detectedTags && emergencyCropFlag.detectedTags.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {emergencyCropFlag.detectedTags.map((t, i) => (
                            <span key={i} className="px-2 py-0.5 bg-purple-950 text-purple-300 rounded font-bold text-[10px] border border-purple-800/70">
                              @{t.replace(/^@/, '')}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      {emergencyCropFlag.croppedAlerts?.croppedTags && (
                        <div className="text-[11px] text-rose-400 flex items-start gap-1 font-medium pt-0.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                          <span>
                            <strong>Cropped Tag Alert:</strong> Perpetrator username or account tag header appears cut off. Ensure the suspect's handle is fully visible in frame.
                          </span>
                        </div>
                      )}
                      {!emergencyCropFlag.detectedTags?.length && !emergencyCropFlag.croppedAlerts?.croppedTags && (
                        <p className="text-[11px] text-slate-400">Standard message capture.</p>
                      )}
                    </div>

                    {/* Important Forensic Data */}
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-300 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                        <span>Important Extracted Forensic Data:</span>
                      </div>
                      {emergencyCropFlag.detectedImportantData && emergencyCropFlag.detectedImportantData.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {emergencyCropFlag.detectedImportantData.map((d, i) => (
                            <span key={i} className="px-2 py-0.5 bg-teal-950 text-teal-300 rounded text-[10px] border border-teal-800/70">
                              {d}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400">Timestamps and context verified.</p>
                      )}

                      {emergencyCropFlag.croppedAlerts?.croppedImportantData && (
                        <div className="text-[11px] text-amber-400 flex items-start gap-1 font-medium pt-0.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>
                            Device status bar (time, carrier, battery) or timestamps are cut off, which may cause objections under Section 63 BSA.
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Forensic Legal Impact (Sec 63 BSA) */}
                    <div className="p-2.5 bg-amber-950/30 border border-amber-900/60 rounded-xl text-[11px] text-amber-200/90 leading-relaxed">
                      <strong>Evidentiary Admissibility (Sec 63 BSA): </strong>
                      {emergencyCropFlag.forensicImpact}
                    </div>
                  </div>
                )}

                {/* Modal Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      if (emergencyFileInputRef.current) emergencyFileInputRef.current.click();
                    }}
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Different Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveEmergencyEvidence}
                    disabled={isAiScanningPhoto}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Save to Vault with Forensic Log</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interactive Evidence Cropper & Context Inspector Modal */}
      {cropModalOpen && cropTarget && (
        <EvidenceCropModal
          isOpen={cropModalOpen}
          onClose={() => {
            setCropModalOpen(false);
            setCropTarget(null);
          }}
          imageUrl={cropTarget.imageUrl}
          evidenceTitle={cropTarget.evidenceTitle}
          evidenceType={cropTarget.evidenceType}
          currentCropFlag={cropTarget.currentCropFlag}
          onSaveCrop={handleSaveCropResult}
        />
      )}

      {/* Detailed AI Forensic Inspection Modal */}
      {inspectDetailItem && inspectDetailItem.cropFlag && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Forensic Crop Analysis Report
                </h3>
              </div>
              <button
                onClick={() => setInspectDetailItem(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  {inspectDetailItem.title}
                </div>
                <div className="text-[11px] text-slate-500 flex justify-between">
                  <span>Retained Area: {inspectDetailItem.cropFlag.cropAreaPercent || 25}%</span>
                  <span>AI Confidence: {inspectDetailItem.cropFlag.confidence}%</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Why this crop was flagged:
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {inspectDetailItem.cropFlag.flagReason}
                </p>
              </div>

              {inspectDetailItem.cropFlag.missingElements &&
                inspectDetailItem.cropFlag.missingElements.length > 0 && (
                  <div className="space-y-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Excluded Contextual Elements:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {inspectDetailItem.cropFlag.missingElements.map((m, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 rounded font-semibold text-[10px]"
                        >
                          ✕ {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Detected URLs & Tags Breakdown */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 text-[11px]">
                    <Globe className="w-3.5 h-3.5 text-indigo-500" />
                    <span>URLs / Address Bar:</span>
                  </span>
                  {inspectDetailItem.cropFlag.detectedUrls && inspectDetailItem.cropFlag.detectedUrls.length > 0 ? (
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold break-all">
                      {inspectDetailItem.cropFlag.detectedUrls.join(', ')}
                    </div>
                  ) : inspectDetailItem.cropFlag.croppedAlerts?.croppedUrls ? (
                    <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold block">
                      ⚠️ Address bar cut off
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">None detected</span>
                  )}
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 text-[11px]">
                    <Tag className="w-3.5 h-3.5 text-purple-500" />
                    <span>Suspect Handles / Tags:</span>
                  </span>
                  {inspectDetailItem.cropFlag.detectedTags && inspectDetailItem.cropFlag.detectedTags.length > 0 ? (
                    <div className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">
                      {inspectDetailItem.cropFlag.detectedTags.join(', ')}
                    </div>
                  ) : inspectDetailItem.cropFlag.croppedAlerts?.croppedTags ? (
                    <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold block">
                      ⚠️ User tag cropped
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">None detected</span>
                  )}
                </div>
              </div>

              {inspectDetailItem.cropFlag.detectedImportantData && inspectDetailItem.cropFlag.detectedImportantData.length > 0 && (
                <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                    <span>Key Forensic Data Points:</span>
                  </span>
                  <div className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">
                    {inspectDetailItem.cropFlag.detectedImportantData.join(' · ')}
                  </div>
                </div>
              )}

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl space-y-1">
                <span className="font-bold text-amber-900 dark:text-amber-200 block">
                  Police &amp; Court Legal Impact (Section 63 BSA):
                </span>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                  {inspectDetailItem.cropFlag.forensicImpact}
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  AI Recommendation:
                </span>
                <p className="text-slate-600 dark:text-slate-400">
                  {inspectDetailItem.cropFlag.recommendation}
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {inspectDetailItem.uncroppedFileUrl && (
                <button
                  type="button"
                  onClick={() => {
                    handleRestoreUncropped(inspectDetailItem);
                    setInspectDetailItem(null);
                  }}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restore Full Uncropped Frame</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  const targetItem = inspectDetailItem;
                  setInspectDetailItem(null);
                  handleOpenCropModalForItem(targetItem);
                }}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
              >
                <Crop className="w-4 h-4" />
                <span>Adjust Crop Frame</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formal Police Complaint Report Reader Modal */}
      {viewingReportItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/30 flex items-center justify-center shrink-0">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                      {viewingReportItem.title}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300 dark:border-emerald-800">
                      Vault Preserved
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Folder: <strong>📁 {viewingReportItem.folderName || 'Active Session'}</strong> • SHA-256: <span className="font-mono">{viewingReportItem.hash}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingReportItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 dark:text-slate-300">
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl p-3 text-amber-900 dark:text-amber-200 text-[11px] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Legal Evidentiary Status:</strong> Certified for Section 63 BSA 2023 &amp; Section 154 CrPC cyber crime complaint filing.
                </span>
              </div>

              {/* Render 11 Sections or Full Text */}
              {currentCase?.report?.sections ? (
                <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
                  {Object.entries(currentCase.report.sections).map(([key, val]) => (
                    <div key={key} className="pt-3 first:pt-0 space-y-1">
                      <h4 className="font-extrabold uppercase text-[11px] text-indigo-700 dark:text-indigo-400 tracking-wider">
                        {key.replace(/^section\d+_/, '').replace(/_/g, ' ')}
                      </h4>
                      <p className="whitespace-pre-line text-slate-800 dark:text-slate-200 leading-relaxed font-sans text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                        {String(val || 'N/A')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl font-mono text-xs whitespace-pre-line leading-relaxed">
                  {viewingReportItem.description}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950/50">
              <div className="text-[11px] text-slate-500 font-mono">
                {viewingReportItem.fileName || 'Police_Complaint.pdf'} ({viewingReportItem.fileSize || '128 KB'})
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadEvidenceReportTxt(viewingReportItem)}
                  className="px-3.5 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download TXT</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadEvidenceReportPdf(viewingReportItem)}
                  className="px-4 py-2 bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-300 hover:to-emerald-400 text-slate-950 rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-950" />
                  <span>Download Police Report (PDF)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingReportItem(null)}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
