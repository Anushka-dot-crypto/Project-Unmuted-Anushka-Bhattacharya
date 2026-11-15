export type IncidentType =
  | 'blackmail'
  | 'deepfake'
  | 'cyberstalking'
  | 'account_hacked'
  | 'threats'
  | 'child_safety'
  | 'other';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number | null;
  timestamp: number;
  formattedAddress?: string;
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  jurisdictionCell?: string;
}

export type PasscodeMode = 'biometric_and_code' | 'code_only' | 'pin' | 'pattern' | 'duo';

export interface User {
  id: string;
  name: string;
  email: string;
  isGuest: boolean;
  language: string;
  region: string;
  theme: 'light' | 'dark';
  passcodeMode?: PasscodeMode;
  sixDigitPasscode?: string; // 6-digit security passcode (default "123456")
  decoySixDigitPasscode?: string; // Duress / Panic 6-digit passcode (default "999999")
  fourLetterCode?: string; // Legacy fallback
  patternCode?: string; // Factor 1: e.g. "1-2-3-6-9"
  pinCode?: string;     // Factor 2 or primary PIN: e.g. "1234"
  decoyPinCode?: string; // Duress / Panic PIN
  decoyFourLetterCode?: string; // Duress / Panic 4-letter code e.g. "AWAY"
  autoLockMinutes?: number;
  isEmailVerified?: boolean;
  verificationToken?: string;
  verificationSentAt?: number;
  recoveryCode?: string;
  faceBiometricRegistered?: boolean;
}
export interface DeepfakeForensicCategoryScore {
  score: number; // 0-100 (0 = authentic, 100 = manipulated)
  status: 'SAFE' | 'SUSPICIOUS' | 'ANOMALOUS' | 'INCONCLUSIVE';
  label: string;
  finding: string;
  evidence: string;
}

export interface DeepfakeAnalysisResult {
  imageUrl?: string;
  verdict: 'AUTHENTIC_GENUINE' | 'POTENTIAL_MANIPULATION' | 'SYNTHETIC_AI_GENERATED' | 'FACE_SWAP_MANIPULATION' | 'UNABLE_TO_DETERMINE';
  confidenceScore: number; // 0 to 100
  authenticityScore: number; // 0-100: probability of being genuine real camera capture
  deepfakeRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  summaryHeadline: string;
  detailedFindings: string;
  indicators: string[];
  positiveAuthenticitySignals: string[];
  datasetCorrelations: string[];
  categories: {
    facialAnatomy: DeepfakeForensicCategoryScore;
    lightingPhysics: DeepfakeForensicCategoryScore;
    textureAndNoise: DeepfakeForensicCategoryScore;
    boundaryAndSeams: DeepfakeForensicCategoryScore;
    contextConsistency: DeepfakeForensicCategoryScore;
  };
  cropWarning?: string;
  legalAdmissibilityVerdict: string;
  recommendedAction: string;
  analyzedAt: string;
  calibrationMode?: 'BALANCED' | 'STRICT_LEGAL' | 'SENSITIVE';
}

export interface UrgencyQuestion {
  id: string;
  question: string;
  subtext?: string;
  riskIfYes: RiskLevel;
}

export interface UrgencyAssessment {
  answers: Record<string, 'YES' | 'NO' | 'NOT_SURE'>;
  riskLevel: RiskLevel;
  explanation: string;
  completedAt: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  category: 'primary' | 'secondary' | 'legal';
}

export interface CropFlagInfo {
  isOverCropped: boolean;
  severity: 'CRITICAL' | 'WARNING' | 'SAFE';
  confidence: number;
  cropAreaPercent: number;
  missingElements: string[];
  flagReason: string;
  forensicImpact: string;
  recommendation: string;
  analyzedAt?: string;
  detectedUrls?: string[];
  detectedTags?: string[];
  detectedImportantData?: string[];
  croppedAlerts?: {
    croppedUrls?: boolean;
    croppedTags?: boolean;
    croppedImportantData?: boolean;
    details?: string[];
  };
}

export interface EvidenceItem {
  id: string;
  caseId: string;
  type: 'screenshot' | 'image' | 'video' | 'document' | 'url' | 'note' | 'account_info' | 'message';
  title: string;
  description: string;
  dateAdded: string;
  originalDate?: string;
  fileUrl?: string;
  uncroppedFileUrl?: string;
  isCropped?: boolean;
  cropFlag?: CropFlagInfo;
  fileSize?: string;
  fileName?: string;
  hash?: string;
  url?: string;
  checklistId?: string;
  tags?: string[];
  folderId?: string;
  folderName?: string;
}

export interface CaseDetails {
  platform: string;
  username: string;
  profileUrl: string;
  incidentDate: string;
  description: string;
  threatsReceived: string;
  paymentDemands: string;
  actionsTaken: string[];
  requestedAssistance: string;
  suspectHandles?: string;
  gpsLocation?: GPSLocation;
}

export interface ReportSections {
  section1_case_info: string;
  section2_summary: string;
  section3_timeline: string;
  section4_platform_account: string;
  section5_detailed_description: string;
  section6_threat_harm: string;
  section7_financial_info: string;
  section8_evidence_inventory: string;
  section9_actions_taken: string;
  section10_requested_assistance: string;
  section11_missing_info: string;
}

export interface GeneratedReport {
  id: string;
  caseId: string;
  version: number;
  createdAt: string;
  status: 'IN_PROGRESS' | 'REPORT_DRAFT' | 'REVIEW_REQUIRED' | 'COMPLETED';
  sections: ReportSections;
  notes?: string;
}

export interface Case {
  id: string;
  incidentType: IncidentType;
  title: string;
  createdAt: string;
  lastUpdated: string;
  currentStep: number;
  isCompleted: boolean;
  status?: 'draft' | 'completed';
  urgencyAnswers?: Record<string, 'YES' | 'NO'>;
  urgencyAssessment?: UrgencyAssessment;
  evidenceChecklist?: Record<string, boolean>;
  evidenceItems: EvidenceItem[];
  details: CaseDetails;
  report?: GeneratedReport;
  reportHistory: GeneratedReport[];
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag?: string;
}

export interface Region {
  code: string;
  name: string;
  cybercrimeHelpline: string;
  cybercrimePortal: string;
  emergencyNumber: string;
  policePortal: string;
}

export interface ResourceCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  articles: ResourceArticle[];
}

export interface ResourceArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  steps: string[];
  links?: { label: string; url: string }[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
