import React, { useState } from 'react';
import { useLocale } from '../context/LocaleContext';
import {
  Phone,
  Landmark,
  Globe,
  ShieldCheck,
  ExternalLink,
  FileText,
  AlertTriangle,
  Lock,
  ChevronRight,
} from 'lucide-react';

export const ReportingGuideScreen: React.FC = () => {
  const { region } = useLocale();
  const [activeTab, setActiveTab] = useState<'1930' | 'platforms' | 'police' | 'prep'>('1930');

  const platformGuides = [
    {
      name: 'Instagram & Facebook (Meta)',
      url: 'https://help.instagram.com',
      takedownTool: 'StopNCII.org',
      steps: [
        'Tap the three dots (...) on the top right of the post or profile.',
        'Select "Report" -> Choose specific reason (Harassment, Impersonation, Nudity/NCII).',
        'For intimate media, visit StopNCII.org to generate a cryptographic hash before reporting.',
      ],
    },
    {
      name: 'WhatsApp',
      url: 'https://www.whatsapp.com/contact',
      takedownTool: 'In-app Report & Block',
      steps: [
        'Open chat -> Tap contact name -> Scroll down and select "Report Contact".',
        'Check "Block contact and delete chat" AFTER exporting or screenshotting chat logs.',
        'For financial extortion via WhatsApp calls, record numbers and UTR details for 1930.',
      ],
    },
    {
      name: 'X (formerly Twitter)',
      url: 'https://help.x.com/en/safety-and-security',
      takedownTool: 'X Safety Center',
      steps: [
        'Click (...) on tweet or profile -> Select "Report @username".',
        'Select "It\'s harassing or abusive" or "Private information shared (Doxxing)".',
      ],
    },
    {
      name: 'YouTube / Google',
      url: 'https://support.google.com/youtube/answer/2802027',
      takedownTool: 'Google PII Removal',
      steps: [
        'Click (...) under video -> Flag video.',
        'To remove search results containing personal ID/photos, submit Google Search PII Removal Request.',
      ],
    },
  ];

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-semibold border border-amber-200 dark:border-amber-900/60">
          <Landmark className="w-3.5 h-3.5 text-amber-600" />
          <span>Verified Official Channels</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Official Reporting Guide
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
          Verified step-by-step procedures to file complaints with official national cybercrime portals, platform moderation teams, and law enforcement.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('1930')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === '1930'
              ? 'bg-indigo-900 text-teal-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          National Cybercrime Portal & 1930
        </button>
        <button
          onClick={() => setActiveTab('platforms')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'platforms'
              ? 'bg-indigo-900 text-teal-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Platform Takedown Guides
        </button>
        <button
          onClick={() => setActiveTab('police')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'police'
              ? 'bg-indigo-900 text-teal-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Filing Police FIR
        </button>
        <button
          onClick={() => setActiveTab('prep')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'prep'
              ? 'bg-indigo-900 text-teal-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          What Evidence to Prepare
        </button>
      </div>

      {/* TAB 1: 1930 National Cybercrime Portal */}
      {activeTab === '1930' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 rounded-2xl text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60">
              <Phone className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                National Cybercrime Financial Fraud Helpline: {region.cybercrimeHelpline}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Official Government of India portal for reporting financial cyber fraud, online harassment, and women/child-related digital crimes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Financial Cyber Fraud (Golden Hour)</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                If money was fraudulently debited via UPI, bank transfer, or scam link within the last 2 hours, calling 1930 enables law enforcement to trigger bank-level hold requests to freeze stolen funds in suspect recipient accounts.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Women & Child Cybercrime Portal</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Allows anonymous or registered reporting of intimate image abuse, morphing, child exploitation, and cyberstalking directly at cybercrime.gov.in.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap gap-3">
            <a
              href={region.cybercrimePortal}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-sm inline-flex items-center gap-2"
            >
              <span>Visit Official Cybercrime Portal</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}

      {/* TAB 2: Platform Takedowns */}
      {activeTab === 'platforms' && (
        <div className="space-y-4">
          {platformGuides.map((p, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{p.name}</h3>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline inline-flex items-center gap-1"
                >
                  <span>Help Center</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {p.steps.map((st, sIdx) => (
                  <li key={sIdx} className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span>{st}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Police FIR */}
      {activeTab === 'police' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Filing a Formal Police FIR / Complaint
          </h2>
          <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <p>
              Under Indian law (Section 154 CrPC / Bharatiya Nagarik Suraksha Sanhita), any victim of a cognizable offense has the legal right to file a First Information Report (FIR) or written complaint at the nearest police station or dedicated Cyber Police Cell.
            </p>
            <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 font-medium">
              Zero FIR Provision: If an offense occurred outside your local jurisdiction, police stations are legally obligated to register a "Zero FIR" and transfer it to the concerned police station.
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Evidence Prep */}
      {activeTab === 'prep' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            What Information & Evidence to Prepare
          </h2>
          <ul className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <li className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl font-medium">
              1. Full uncropped screenshots showing URL bar, account handle, and system clock.
            </li>
            <li className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl font-medium">
              2. Transaction details (12-digit UTR number, UPI ID, Bank statement excerpt) if money was transferred.
            </li>
            <li className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl font-medium">
              3. Project UNMUTED AI-Generated Factual Incident Report exported in PDF format.
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};
