import React from 'react';
import { useCase } from '../context/CaseContext';
import { useLocale } from '../context/LocaleContext';
import { AlertCircle, Clock, ShieldAlert, Trash2, ArrowRight } from 'lucide-react';

interface ResumeCaseModalProps {
  isOpen: boolean;
  onContinue: () => void;
  onDiscard: () => void;
}

export const ResumeCaseModal: React.FC<ResumeCaseModalProps> = ({
  isOpen,
  onContinue,
  onDiscard,
}) => {
  const { activeDraftCase } = useCase();
  const { t } = useLocale();

  if (!isOpen || !activeDraftCase) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-indigo-100 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t('resume_title', 'Resume your incident?')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              You have an unfinished emergency workflow draft saved locally on your device.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-700 dark:text-slate-200">
            <span className="font-semibold text-indigo-700 dark:text-indigo-400">
              {activeDraftCase.title}
            </span>
            <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded font-mono">
              {activeDraftCase.id}
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <span>Progress: Step {activeDraftCase.currentStep + 1} of 6</span>
            <span>•</span>
            <span>Risk: {activeDraftCase.urgencyAssessment?.riskLevel || 'Pending'}</span>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onDiscard}
            className="flex-1 py-2.5 px-4 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            {t('btn_discard', 'DISCARD')}
          </button>
          <button
            onClick={onContinue}
            className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md flex items-center justify-center gap-1.5 transition-all"
          >
            {t('btn_continue', 'CONTINUE')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
