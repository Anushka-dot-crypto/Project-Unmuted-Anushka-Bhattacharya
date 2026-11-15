import React from 'react';
import { useLocale } from '../context/LocaleContext';
import { Settings as SettingsIcon, Sun, Moon, Eye, Type, Globe, MapPin } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { accessibilitySettings, accessibility, updateAccessibility, region } = useLocale();
  const acc = accessibilitySettings || accessibility || {
    theme: 'system',
    highContrast: false,
    fontSize: 'normal',
    reducedMotion: false,
    largeText: false,
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
            <SettingsIcon className="w-5 h-5" />
            <span>Settings & Accessibility</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-sm">
            ✕
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Theme Preference */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-700 dark:text-slate-300">Theme Mode</label>
            <div className="grid grid-cols-3 gap-2">
              {(['light', 'dark', 'system'] as const).map((tMode) => (
                <button
                  key={tMode}
                  onClick={() => updateAccessibility({ theme: tMode })}
                  className={`py-2 px-3 rounded-xl font-bold uppercase transition-all ${
                    acc.theme === tMode
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {tMode}
                </button>
              ))}
            </div>
          </div>

          {/* High Contrast */}
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-600" />
              <span className="font-bold text-slate-700 dark:text-slate-300">High Contrast Mode</span>
            </div>
            <input
              type="checkbox"
              checked={acc.highContrast}
              onChange={(e) => updateAccessibility({ highContrast: e.target.checked })}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
          </div>

          {/* Large Text */}
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-indigo-600" />
              <span className="font-bold text-slate-700 dark:text-slate-300">Large Text Size</span>
            </div>
            <input
              type="checkbox"
              checked={acc.fontSize === 'large' || acc.largeText}
              onChange={(e) => updateAccessibility({ fontSize: e.target.checked ? 'large' : 'normal', largeText: e.target.checked })}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <span className="font-bold text-slate-700 dark:text-slate-300">Reduced Motion</span>
            <input
              type="checkbox"
              checked={acc.reducedMotion}
              onChange={(e) => updateAccessibility({ reducedMotion: e.target.checked })}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
          </div>

          {/* Selected Region info */}
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl space-y-1 text-slate-700 dark:text-slate-300">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                {region.name}
              </span>
              <span className="text-amber-600 font-mono">{region.cybercrimeHelpline}</span>
            </div>
            <p className="text-[10px] text-slate-500">
              Helpline: {region.cybercrimeHelpline} • Cyber Crime Cell: {region.cyberCellContact}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-xs"
        >
          Done
        </button>
      </div>
    </div>
  );
};
