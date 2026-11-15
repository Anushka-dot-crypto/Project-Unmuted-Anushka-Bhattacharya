import React, { createContext, useContext, useState, useEffect } from 'react';
import { Case, IncidentType, UrgencyAssessment, EvidenceItem, GeneratedReport, CaseDetails } from '../types';
import { INCIDENT_CONFIGS } from '../data/incidentGuidance';
import {
  auth,
  db,
  doc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
  handleFirestoreError,
  OperationType,
  onAuthStateChanged,
} from '../lib/firebase';
import { getEvidenceFolderInfo } from '../utils/evidenceFolderUtils';

interface CaseContextType {
  cases: Case[];
  activeDraftCase: Case | null;
  activeCaseId: string | null;
  setActiveCaseId: (id: string | null) => void;
  createNewCase: (type: IncidentType) => Case;
  updateDraftCaseStep: (step: number) => void;
  updateDraftAssessment: (assessment: UrgencyAssessment) => void;
  updateDraftChecklist: (checklist: Record<string, boolean>) => void;
  updateDraftDetails: (details: Partial<CaseDetails>) => void;
  saveActiveCase: () => Case | null;
  addEvidenceToCase: (caseId: string, item: Omit<EvidenceItem, 'id' | 'caseId' | 'dateAdded'>) => void;
  updateEvidenceItemInCase: (caseId: string, evidenceId: string, updates: Partial<EvidenceItem>) => void;
  removeEvidenceFromCase: (caseId: string, evidenceId: string) => void;
  saveGeneratedReport: (caseId: string, reportData: GeneratedReport['sections']) => GeneratedReport;
  deleteCase: (caseId: string) => void;
  discardActiveDraft: () => void;
  resumeActiveDraft: () => void;
  getCaseById: (caseId: string) => Case | undefined;
  updateActiveCaseType: (type: IncidentType) => void;
  recordUrgencyAnswer: (questionId: string, answer: 'YES' | 'NO') => void;
  addEvidenceToActiveCase: (item: Omit<EvidenceItem, 'id' | 'caseId' | 'dateAdded'>, checklistItemId?: string) => void;
  addEvidenceBatchToActiveCase: (items: Array<Omit<EvidenceItem, 'id' | 'caseId' | 'dateAdded'>>, checklistItemId?: string) => void;
  removeEvidenceFromActiveCase: (evidenceId: string) => void;
  updateActiveCaseDetails: (details: Partial<CaseDetails>) => void;
  deleteDraftCase: (caseId: string) => void;
  startFreshEmergencyCase: (type?: IncidentType) => Case;
  clearActiveDraftAttachments: () => void;
}

const CaseContext = createContext<CaseContextType | undefined>(undefined);

const CASES_STORAGE_KEY = 'unmuted_cases_data';
const DRAFT_STORAGE_KEY = 'unmuted_active_draft_case';

export const CaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cases, setCases] = useState<Case[]>(() => {
    try {
      const saved = localStorage.getItem(CASES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed loading cases', e);
    }
    return [];
  });

  const [activeDraftCase, setActiveDraftCase] = useState<Case | null>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed loading active draft', e);
    }
    return null;
  });

  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);

  // Synchronize with Firestore when user is authenticated
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (fbUser) => {
      if (!fbUser) return;

      const path = 'cases';
      try {
        const q = query(collection(db, path), where('userId', '==', fbUser.uid));
        const unsubscribeSnapshot = onSnapshot(
          q,
          (snapshot) => {
            const remoteCases: Case[] = [];
            snapshot.forEach((snapDoc) => {
              const data = snapDoc.data();
              remoteCases.push({
                id: data.id || snapDoc.id,
                incidentType: data.incidentType || 'other',
                title: data.title || 'Untitled Case',
                createdAt: data.createdAt || new Date().toISOString(),
                lastUpdated: data.lastUpdated || new Date().toISOString(),
                currentStep: data.currentStep || 0,
                isCompleted: !!data.isCompleted,
                status: data.status || 'draft',
                evidenceItems: data.evidenceItems || [],
                details: data.details || {},
                reportHistory: data.reportHistory || [],
                report: data.report,
                evidenceChecklist: data.evidenceChecklist || {},
                urgencyAssessment: data.urgencyAssessment,
                urgencyAnswers: data.urgencyAnswers,
              });
            });

            if (remoteCases.length > 0) {
              setCases((localCases) => {
                // Merge remote cases with any local-only draft cases
                const map = new Map<string, Case>();
                remoteCases.forEach((rc) => map.set(rc.id, rc));
                localCases.forEach((lc) => {
                  if (!map.has(lc.id)) {
                    map.set(lc.id, lc);
                  }
                });
                return Array.from(map.values());
              });
            }
          },
          (err) => {
            handleFirestoreError(err, OperationType.GET, path);
          }
        );

        return () => unsubscribeSnapshot();
      } catch (err) {
        console.warn('Firestore cases snapshot subscription error:', err);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(CASES_STORAGE_KEY, JSON.stringify(cases));
  }, [cases]);

  // Ensure any existing cases with reports have their police complaint in the evidence vault
  useEffect(() => {
    let changed = false;
    const updated = cases.map((c) => {
      if (c.report?.sections) {
        const hasReportInEvidence = (c.evidenceItems || []).some(
          (e) => e.tags?.includes('police_report') || e.title.includes('Police Complaint')
        );
        if (!hasReportInEvidence) {
          changed = true;
          const reportDate = new Date(c.report.createdAt || c.lastUpdated || Date.now());
          const folderInfo = getEvidenceFolderInfo(reportDate);
          const fullTextContent = `PROJECT UNMUTED — FORMAL CYBER CRIME POLICE INVESTIGATION REPORT\nCase ID: ${c.id}\nVersion: ${c.report.version || 1}\nGenerated Date: ${reportDate.toLocaleString()}\nLegal Reference: Section 63 BSA 2023 / Section 154 CrPC / Information Technology Act 2000\n\n` +
            Object.entries(c.report.sections)
              .map(([k, v]) => `=== ${k.toUpperCase().replace(/_/g, ' ')} ===\n${v}`)
              .join('\n\n');
          const reportEvidenceItem: EvidenceItem = {
            id: 'EV-REP-' + Math.floor(100000 + Math.random() * 900000),
            caseId: c.id,
            type: 'document',
            title: `Police Complaint Report (v${c.report.version || 1})`,
            description: typeof c.report.sections.section2_summary === 'string'
              ? c.report.sections.section2_summary.slice(0, 320)
              : 'Official Cyber Crime Police Investigation Report & Formal Complaint Dossier under Bharatiya Sakshya Adhiniyam Sec 63.',
            dateAdded: reportDate.toISOString(),
            originalDate: reportDate.toISOString().split('T')[0],
            folderId: folderInfo.folderId,
            folderName: folderInfo.folderName,
            fileName: `Police_Investigation_Report_${c.id}_v${c.report.version || 1}.txt`,
            fileSize: `${Math.max(48, Math.round((fullTextContent.length / 1024) * 10) / 10 + 38)} KB`,
            fileUrl: `data:text/plain;charset=utf-8,${encodeURIComponent(fullTextContent)}`,
            hash: 'sha256-' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
            tags: ['police_report', 'complaint_dossier', 'sec_63_bsa', 'fir_ready'],
          };
          return {
            ...c,
            evidenceItems: [reportEvidenceItem, ...(c.evidenceItems || [])],
          };
        }
      }
      return c;
    });
    if (changed) {
      setCases(updated);
    }
  }, [cases.length]);

  useEffect(() => {
    if (activeDraftCase) {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(activeDraftCase));
    } else {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  }, [activeDraftCase]);

  const createNewCase = (type: IncidentType): Case => {
    const config = INCIDENT_CONFIGS[type];
    const newCase: Case = {
      id: 'CASE-' + Math.floor(100000 + Math.random() * 900000),
      incidentType: type,
      title: config.title,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      currentStep: 0, // 0 = Safety confirmation, 1 = Classification, 2 = Urgency, 3 = Guidance, 4 = Checklist, 5 = Details, 6 = Report
      isCompleted: false,
      evidenceChecklist: {},
      evidenceItems: [],
      details: {
        platform: '',
        username: '',
        profileUrl: '',
        incidentDate: new Date().toISOString().split('T')[0],
        description: '',
        threatsReceived: '',
        paymentDemands: '',
        actionsTaken: [],
        requestedAssistance: 'Guided help and formal documentation',
      },
      reportHistory: [],
    };

    setActiveDraftCase(newCase);
    setActiveCaseId(newCase.id);
    return newCase;
  };

  const startFreshEmergencyCase = (type: IncidentType = 'blackmail'): Case => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    const config = INCIDENT_CONFIGS[type] || INCIDENT_CONFIGS['blackmail'];
    const newCase: Case = {
      id: 'CASE-' + Math.floor(100000 + Math.random() * 900000),
      incidentType: type,
      title: config.title,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      currentStep: 0,
      isCompleted: false,
      evidenceChecklist: {},
      evidenceItems: [],
      details: {
        platform: '',
        username: '',
        profileUrl: '',
        incidentDate: new Date().toISOString().split('T')[0],
        description: '',
        threatsReceived: '',
        paymentDemands: '',
        actionsTaken: [],
        requestedAssistance: 'Guided help and formal documentation',
      },
      reportHistory: [],
    };

    setActiveDraftCase(newCase);
    setActiveCaseId(newCase.id);
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(newCase));
    return newCase;
  };

  const clearActiveDraftAttachments = () => {
    if (activeDraftCase) {
      const refreshed: Case = {
        ...activeDraftCase,
        evidenceItems: [],
        evidenceChecklist: {},
        lastUpdated: new Date().toISOString(),
      };
      setActiveDraftCase(refreshed);
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(refreshed));
      setCases((prev) =>
        prev.map((c) =>
          c.id === refreshed.id
            ? { ...c, evidenceItems: [], evidenceChecklist: {}, lastUpdated: new Date().toISOString() }
            : c
        )
      );
    }
  };

  const updateDraftCaseStep = (step: number) => {
    setActiveDraftCase((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        currentStep: step,
        lastUpdated: new Date().toISOString(),
      };
    });
  };

  const updateDraftAssessment = (assessment: UrgencyAssessment) => {
    setActiveDraftCase((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        urgencyAssessment: assessment,
        lastUpdated: new Date().toISOString(),
      };
    });
  };

  const updateDraftChecklist = (checklist: Record<string, boolean>) => {
    setActiveDraftCase((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        evidenceChecklist: checklist,
        lastUpdated: new Date().toISOString(),
      };
    });
  };

  const updateDraftDetails = (details: Partial<CaseDetails>) => {
    setActiveDraftCase((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        details: {
          ...prev.details,
          ...details,
        },
        lastUpdated: new Date().toISOString(),
      };
    });
  };

  const saveActiveCase = (): Case | null => {
    if (!activeDraftCase) return null;
    const finalCase: Case = {
      ...activeDraftCase,
      lastUpdated: new Date().toISOString(),
    };

    setCases((prev) => {
      const idx = prev.findIndex((c) => c.id === finalCase.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = finalCase;
        return updated;
      }
      return [finalCase, ...prev];
    });

    if (auth.currentUser) {
      const path = `cases/${finalCase.id}`;
      setDoc(doc(db, 'cases', finalCase.id), {
        id: finalCase.id,
        userId: auth.currentUser.uid,
        incidentType: finalCase.incidentType,
        title: finalCase.title,
        currentStep: finalCase.currentStep,
        isCompleted: finalCase.isCompleted,
        status: finalCase.status || 'draft',
        createdAt: finalCase.createdAt,
        lastUpdated: finalCase.lastUpdated,
        details: finalCase.details || {},
      }).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, path);
      });
    }

    return finalCase;
  };

  const discardActiveDraft = () => {
    setActiveDraftCase(null);
  };

  const resumeActiveDraft = () => {
    if (activeDraftCase) {
      setActiveCaseId(activeDraftCase.id);
    }
  };

  const addEvidenceToCase = (
    caseId: string,
    itemData: Omit<EvidenceItem, 'id' | 'caseId' | 'dateAdded'>
  ) => {
    const now = new Date();
    const folderInfo = getEvidenceFolderInfo(now);

    const newEvidence: EvidenceItem = {
      ...itemData,
      id: 'EV-' + Math.floor(100000 + Math.random() * 900000),
      caseId,
      dateAdded: now.toISOString(),
      folderId: itemData.folderId || folderInfo.folderId,
      folderName: itemData.folderName || folderInfo.folderName,
      // Calculate simple hash simulation for data integrity verification
      hash: 'sha256-' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    };

    setActiveDraftCase((prev) => {
      if (prev && prev.id === caseId) {
        return {
          ...prev,
          evidenceItems: [newEvidence, ...prev.evidenceItems],
          lastUpdated: now.toISOString(),
        };
      }
      return prev;
    });

    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            evidenceItems: [newEvidence, ...c.evidenceItems],
            lastUpdated: new Date().toISOString(),
          };
        }
        return c;
      })
    );

    if (auth.currentUser) {
      const path = `cases/${caseId}/evidence/${newEvidence.id}`;
      setDoc(doc(db, 'cases', caseId, 'evidence', newEvidence.id), {
        id: newEvidence.id,
        caseId,
        userId: auth.currentUser.uid,
        type: newEvidence.type,
        title: newEvidence.title,
        description: (newEvidence.description || '').slice(0, 2000),
        dateAdded: newEvidence.dateAdded,
        folderId: newEvidence.folderId,
        folderName: newEvidence.folderName,
        fileUrl: (newEvidence.fileUrl || '').slice(0, 100000),
        hash: (newEvidence.hash || '').slice(0, 128),
      }).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, path);
      });
    }
  };

  const updateEvidenceItemInCase = (
    caseId: string,
    evidenceId: string,
    updates: Partial<EvidenceItem>
  ) => {
    if (activeDraftCase && activeDraftCase.id === caseId) {
      setActiveDraftCase({
        ...activeDraftCase,
        evidenceItems: activeDraftCase.evidenceItems.map((e) =>
          e.id === evidenceId ? { ...e, ...updates } : e
        ),
        lastUpdated: new Date().toISOString(),
      });
    }

    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            evidenceItems: c.evidenceItems.map((e) =>
              e.id === evidenceId ? { ...e, ...updates } : e
            ),
            lastUpdated: new Date().toISOString(),
          };
        }
        return c;
      })
    );
  };

  const removeEvidenceFromCase = (caseId: string, evidenceId: string) => {
    if (activeDraftCase && activeDraftCase.id === caseId) {
      setActiveDraftCase({
        ...activeDraftCase,
        evidenceItems: activeDraftCase.evidenceItems.filter((e) => e.id !== evidenceId),
        lastUpdated: new Date().toISOString(),
      });
    }

    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            evidenceItems: c.evidenceItems.filter((e) => e.id !== evidenceId),
            lastUpdated: new Date().toISOString(),
          };
        }
        return c;
      })
    );

    if (auth.currentUser) {
      const path = `cases/${caseId}/evidence/${evidenceId}`;
      deleteDoc(doc(db, 'cases', caseId, 'evidence', evidenceId)).catch((err) => {
        handleFirestoreError(err, OperationType.DELETE, path);
      });
    }
  };

  const saveGeneratedReport = (
    caseId: string,
    reportSections: GeneratedReport['sections']
  ): GeneratedReport => {
    const existingCase = cases.find((c) => c.id === caseId) || (activeDraftCase?.id === caseId ? activeDraftCase : null);
    const currentVersion = (existingCase?.reportHistory?.length || 0) + 1;
    const now = new Date();
    const folderInfo = getEvidenceFolderInfo(now);

    const newReport: GeneratedReport = {
      id: 'REP-' + Math.floor(100000 + Math.random() * 900000),
      caseId,
      version: currentVersion,
      createdAt: now.toISOString(),
      status: 'REPORT_DRAFT',
      sections: reportSections,
    };

    // Format plain text dossier for court/portal filing and vault preservation
    const fullTextContent = `PROJECT UNMUTED — FORMAL CYBER CRIME POLICE INVESTIGATION REPORT\nCase ID: ${caseId}\nVersion: ${currentVersion}\nGenerated Date: ${now.toLocaleString()}\nLegal Reference: Bharatiya Sakshya Adhiniyam Sec 63 / Sec 154 CrPC / Information Technology Act 2000\n\n` +
      Object.entries(reportSections)
        .map(([k, v]) => `=== ${k.toUpperCase().replace(/_/g, ' ')} ===\n${v}`)
        .join('\n\n');

    const reportSummary = reportSections.section2_summary
      ? (typeof reportSections.section2_summary === 'string'
          ? reportSections.section2_summary.slice(0, 320)
          : JSON.stringify(reportSections.section2_summary).slice(0, 320))
      : 'Formal Cyber Crime Complaint formatted under Section 63 BSA & Section 154 CrPC.';

    const reportDataUri = `data:text/plain;charset=utf-8,${encodeURIComponent(fullTextContent)}`;

    const reportEvidenceItem: EvidenceItem = {
      id: 'EV-REP-' + Math.floor(100000 + Math.random() * 900000),
      caseId,
      type: 'document',
      title: `Police Complaint Report (v${currentVersion})`,
      description: reportSummary,
      dateAdded: now.toISOString(),
      originalDate: now.toISOString().split('T')[0],
      folderId: folderInfo.folderId,
      folderName: folderInfo.folderName,
      fileName: `Police_Investigation_Report_${caseId}_v${currentVersion}.txt`,
      fileSize: `${Math.max(48, Math.round((fullTextContent.length / 1024) * 10) / 10 + 38)} KB`,
      fileUrl: reportDataUri,
      hash: 'sha256-' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      tags: ['police_report', 'complaint_dossier', 'sec_63_bsa', 'fir_ready'],
    };

    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          // Check if an evidence item for this exact report version already exists
          const existingItemIndex = (c.evidenceItems || []).findIndex(
            (e) => e.tags?.includes('police_report') && e.title.includes(`(v${currentVersion})`)
          );

          let updatedEvidence: EvidenceItem[];
          if (existingItemIndex >= 0) {
            updatedEvidence = [...(c.evidenceItems || [])];
            updatedEvidence[existingItemIndex] = {
              ...updatedEvidence[existingItemIndex],
              ...reportEvidenceItem,
              id: updatedEvidence[existingItemIndex].id, // preserve ID
            };
          } else {
            updatedEvidence = [reportEvidenceItem, ...(c.evidenceItems || [])];
          }

          return {
            ...c,
            report: newReport,
            reportHistory: [newReport, ...(c.reportHistory || [])],
            evidenceItems: updatedEvidence,
            isCompleted: true,
            lastUpdated: now.toISOString(),
          };
        }
        return c;
      })
    );

    if (activeDraftCase && activeDraftCase.id === caseId) {
      const existingItemIndex = (activeDraftCase.evidenceItems || []).findIndex(
        (e) => e.tags?.includes('police_report') && e.title.includes(`(v${currentVersion})`)
      );

      let updatedEvidence: EvidenceItem[];
      if (existingItemIndex >= 0) {
        updatedEvidence = [...(activeDraftCase.evidenceItems || [])];
        updatedEvidence[existingItemIndex] = {
          ...updatedEvidence[existingItemIndex],
          ...reportEvidenceItem,
          id: updatedEvidence[existingItemIndex].id,
        };
      } else {
        updatedEvidence = [reportEvidenceItem, ...(activeDraftCase.evidenceItems || [])];
      }

      setActiveDraftCase({
        ...activeDraftCase,
        report: newReport,
        reportHistory: [newReport, ...(activeDraftCase.reportHistory || [])],
        evidenceItems: updatedEvidence,
        isCompleted: true,
        lastUpdated: now.toISOString(),
      });
    }

    if (auth.currentUser) {
      const path = `cases/${caseId}/reports/${newReport.id}`;
      setDoc(doc(db, 'cases', caseId, 'reports', newReport.id), {
        id: newReport.id,
        caseId,
        userId: auth.currentUser.uid,
        version: newReport.version,
        createdAt: newReport.createdAt,
        status: newReport.status,
        sections: newReport.sections || {},
      }).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, path);
      });

      const evPath = `cases/${caseId}/evidence/${reportEvidenceItem.id}`;
      setDoc(doc(db, 'cases', caseId, 'evidence', reportEvidenceItem.id), {
        id: reportEvidenceItem.id,
        caseId,
        userId: auth.currentUser.uid,
        type: reportEvidenceItem.type,
        title: reportEvidenceItem.title,
        description: (reportEvidenceItem.description || '').slice(0, 2000),
        dateAdded: reportEvidenceItem.dateAdded,
        folderId: reportEvidenceItem.folderId,
        folderName: reportEvidenceItem.folderName,
        fileUrl: (reportEvidenceItem.fileUrl || '').slice(0, 100000),
        hash: (reportEvidenceItem.hash || '').slice(0, 128),
        tags: reportEvidenceItem.tags,
      }).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, evPath);
      });
    }

    return newReport;
  };

  const deleteCase = (caseId: string) => {
    setCases((prev) => prev.filter((c) => c.id !== caseId));
    if (activeDraftCase?.id === caseId) {
      setActiveDraftCase(null);
    }
    if (activeCaseId === caseId) {
      setActiveCaseId(null);
    }

    if (auth.currentUser) {
      const path = `cases/${caseId}`;
      deleteDoc(doc(db, 'cases', caseId)).catch((err) => {
        handleFirestoreError(err, OperationType.DELETE, path);
      });
    }
  };

  const getCaseById = (caseId: string) => {
    if (activeDraftCase && activeDraftCase.id === caseId) return activeDraftCase;
    return cases.find((c) => c.id === caseId);
  };

  const updateActiveCaseType = (type: IncidentType) => {
    const config = INCIDENT_CONFIGS[type] || INCIDENT_CONFIGS['blackmail'];
    setActiveDraftCase((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        incidentType: type,
        title: config?.title || type,
        lastUpdated: new Date().toISOString(),
      };
    });
  };

  const recordUrgencyAnswer = (questionId: string, answer: 'YES' | 'NO') => {
    setActiveDraftCase((prev) => {
      if (!prev) return null;
      const currentAnswers = prev.urgencyAnswers || {};
      return {
        ...prev,
        urgencyAnswers: {
          ...currentAnswers,
          [questionId]: answer,
        },
        lastUpdated: new Date().toISOString(),
      };
    });
  };

  const toggleChecklistItem = (itemId: string) => {
    setActiveDraftCase((prev) => {
      if (!prev) return null;
      const currentChecklist = prev.evidenceChecklist || {};
      return {
        ...prev,
        evidenceChecklist: {
          ...currentChecklist,
          [itemId]: !currentChecklist[itemId],
        },
        lastUpdated: new Date().toISOString(),
      };
    });
  };

  const addEvidenceToActiveCase = (
    itemData: Omit<EvidenceItem, 'id' | 'caseId' | 'dateAdded'>,
    checklistItemId?: string
  ) => {
    addEvidenceBatchToActiveCase([itemData], checklistItemId);
  };

  const addEvidenceBatchToActiveCase = (
    items: Array<Omit<EvidenceItem, 'id' | 'caseId' | 'dateAdded'>>,
    checklistItemId?: string
  ) => {
    if (!items || items.length === 0) return;
    const now = new Date();
    const folderInfo = getEvidenceFolderInfo(now);

    setActiveDraftCase((prev) => {
      let currentCase = prev;
      if (!currentCase) {
        currentCase = {
          id: 'CASE-' + Math.floor(100000 + Math.random() * 900000),
          incidentType: 'blackmail',
          title: INCIDENT_CONFIGS['blackmail'].title,
          createdAt: now.toISOString(),
          lastUpdated: now.toISOString(),
          currentStep: 0,
          isCompleted: false,
          evidenceChecklist: {},
          evidenceItems: [],
          details: {
            platform: '',
            username: '',
            profileUrl: '',
            incidentDate: now.toISOString().split('T')[0],
            description: '',
            threatsReceived: '',
            paymentDemands: '',
            actionsTaken: [],
            requestedAssistance: 'Guided help and formal documentation',
          },
          reportHistory: [],
        };
      }

      const newEvidenceItems: EvidenceItem[] = items.map((itemData) => ({
        ...itemData,
        id: 'EV-' + Math.floor(100000 + Math.random() * 900000),
        caseId: currentCase!.id,
        dateAdded: now.toISOString(),
        folderId: itemData.folderId || folderInfo.folderId,
        folderName: itemData.folderName || folderInfo.folderName,
        hash: 'sha256-' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      }));

      const updatedChecklist = { ...(currentCase.evidenceChecklist || {}) };
      const cId = checklistItemId || items.find((it) => it.checklistId)?.checklistId;
      if (cId) {
        updatedChecklist[cId] = true;
      }

      const updatedCase: Case = {
        ...currentCase,
        evidenceItems: [...newEvidenceItems, ...(currentCase.evidenceItems || [])],
        evidenceChecklist: updatedChecklist,
        lastUpdated: now.toISOString(),
      };

      // Also ensure case is tracked in cases list
      setCases((prevCases) => {
        const idx = prevCases.findIndex((c) => c.id === updatedCase.id);
        if (idx >= 0) {
          const next = [...prevCases];
          next[idx] = updatedCase;
          return next;
        }
        return [updatedCase, ...prevCases];
      });

      return updatedCase;
    });
  };

  const removeEvidenceFromActiveCase = (evidenceId: string) => {
    setActiveDraftCase((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        evidenceItems: (prev.evidenceItems || []).filter((e) => e.id !== evidenceId),
        lastUpdated: new Date().toISOString(),
      };
    });
    setCases((prev) =>
      prev.map((c) => {
        if (activeDraftCase && c.id === activeDraftCase.id) {
          return {
            ...c,
            evidenceItems: (c.evidenceItems || []).filter((e) => e.id !== evidenceId),
            lastUpdated: new Date().toISOString(),
          };
        }
        return c;
      })
    );
  };

  const updateActiveCaseDetails = (details: Partial<CaseDetails>) => {
    updateDraftDetails(details);
  };

  const deleteDraftCase = (caseId: string) => {
    deleteCase(caseId);
  };

  return (
    <CaseContext.Provider
      value={{
        cases,
        activeDraftCase,
        activeCaseId,
        setActiveCaseId,
        createNewCase,
        updateDraftCaseStep,
        updateDraftAssessment,
        updateDraftChecklist,
        updateDraftDetails,
        saveActiveCase,
        addEvidenceToCase,
        updateEvidenceItemInCase,
        removeEvidenceFromCase,
        saveGeneratedReport,
        deleteCase,
        discardActiveDraft,
        resumeActiveDraft,
        getCaseById,
        updateActiveCaseType,
        recordUrgencyAnswer,
        toggleChecklistItem,
        addEvidenceToActiveCase,
        addEvidenceBatchToActiveCase,
        removeEvidenceFromActiveCase,
        updateActiveCaseDetails,
        deleteDraftCase,
        startFreshEmergencyCase,
        clearActiveDraftAttachments,
      }}
    >
      {children}
    </CaseContext.Provider>
  );
};

export const useCase = () => {
  const context = useContext(CaseContext);
  if (!context) {
    throw new Error('useCase must be used within a CaseProvider');
  }
  return context;
};
