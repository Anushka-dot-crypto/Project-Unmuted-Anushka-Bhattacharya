import React from 'react';
import { useLocale } from '../context/LocaleContext';
import {
  Shield,
  Phone,
  Bot,
  AlertCircle,
  Lock,
  MapPin,
  PhoneCall,
  HeartPulse,
  Zap,
} from 'lucide-react';

interface HomeDashboardProps {
  onStartEmergency: () => void;
  onNavigate: (tab: string) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onStartEmergency,
  onNavigate,
}) => {
  const { region } = useLocale();

  return (
    <div className="space-y-8 pb-12">
      {/* 🚨 1. EMERGENCY BUTTON ON TOP (USER MANDATE) */}
      <div
        className="bg-gradient-to-br from-rose-950 via-slate-900 to-rose-900 border-2 border-rose-600/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-white relative overflow-hidden space-y-6 transition-all"
      >
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Emergency Utility Bar */}
        <div className="flex items-center justify-between gap-3 border-b border-rose-800/60 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-black tracking-wider uppercase text-rose-300">
              Immediate Crisis SOS Station
            </span>
          </div>
          <span className="text-[11px] font-bold text-rose-300/90 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-rose-400" />
            <span>Emergency Response Active</span>
          </span>
        </div>

        {/* Main Emergency Button & Call-to-Action */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-2">
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-900/80 border border-rose-500/60 text-rose-200 text-xs font-bold">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>CRITICAL: DON'T DELETE ANYTHING FROM YOUR DEVICE YET</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white leading-tight">
              DIGITAL EMERGENCY BUTTON
            </h1>

            <p className="text-xs sm:text-sm text-rose-100/90 font-medium leading-relaxed">
              Facing active blackmail, sextortion threats, deepfakes, or harassment? Press SOS for immediate emergency protocol guidance, evidence preservation, and police report generation.
            </p>
          </div>

          {/* Big Actionable Button */}
          <div className="shrink-0 flex flex-col items-center gap-2">
            <div className="relative">
              <div className="absolute -inset-4 bg-rose-500/30 rounded-full blur-xl animate-pulse" />
              <button
                onClick={onStartEmergency}
                className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-rose-700 via-rose-600 to-indigo-800 hover:from-rose-600 hover:to-indigo-700 text-white flex flex-col items-center justify-center shadow-2xl border-4 border-rose-300/40 transition-all transform hover:scale-105 active:scale-95 group cursor-pointer"
              >
                <Shield className="w-12 h-12 text-white group-hover:scale-110 transition-transform mb-1" />
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-100">
                  PRESS SOS
                </span>
              </button>
            </div>
            <span className="text-[11px] font-bold text-rose-200">Instant Crisis Assistant</span>
          </div>
        </div>

        {/* Direct One-Tap Emergency Helplines Bar */}
        <div className="pt-2 border-t border-rose-800/60">
          <div className="text-[11px] font-bold uppercase tracking-wider text-rose-300 mb-2.5 flex items-center gap-1.5">
            <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
            <span>24/7 Verified Emergency Hotlines (Tap to Call Immediately):</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <a
              href="tel:1930"
              className="p-3 bg-slate-900/90 hover:bg-slate-800 border border-rose-600/60 hover:border-rose-400 rounded-2xl flex flex-col justify-between transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-rose-300">Cyber Crime</span>
                <Phone className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-base font-black text-white mt-1">1930</div>
              <span className="text-[10px] text-slate-400">National Cyber Helpline</span>
            </a>

            <a
              href="tel:112"
              className="p-3 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-indigo-400 rounded-2xl flex flex-col justify-between transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-indigo-300">All Emergencies</span>
                <Phone className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-base font-black text-white mt-1">112</div>
              <span className="text-[10px] text-slate-400">Police / Ambulance / Fire</span>
            </a>

            <a
              href="tel:1091"
              className="p-3 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-purple-400 rounded-2xl flex flex-col justify-between transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-purple-300">Women Helpline</span>
                <Phone className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-base font-black text-white mt-1">1091</div>
              <span className="text-[10px] text-slate-400">Harassment & Safety</span>
            </a>

            <a
              href="tel:14416"
              className="p-3 bg-slate-900/90 hover:bg-slate-800 border border-emerald-600/60 hover:border-emerald-400 rounded-2xl flex flex-col justify-between transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-emerald-300">Mental Health</span>
                <HeartPulse className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-base font-black text-white mt-1">14416</div>
              <span className="text-[10px] text-slate-400">Tele-MANAS (24x7 Toll Free)</span>
            </a>
          </div>
        </div>
      </div>

      {/* 📖 2. INTRODUCTION PAGE BELOW EMERGENCY BUTTON (USER MANDATE) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white p-8 sm:p-10 shadow-xl border border-indigo-800/80 space-y-6">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-800/80 border border-indigo-700/80 text-teal-300 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5 text-teal-400" />
            <span>Welcome to Project UNMUTED</span>
            <span className="opacity-60">• 100% Anonymous & Confidential</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            You're Safe Here.
          </h2>

          <p className="text-indigo-200 text-sm sm:text-base leading-relaxed font-normal">
            Project UNMUTED is a survivor-first digital safety sanctuary designed to shield individuals from cyber extortion, non-consensual deepfakes, sextortion, and online intimidation. 
            We provide immediate panic containment, forensic evidence quarantine, and police-ready legal reports without storing any identifying data on remote servers.
          </p>

          {/* Pillars of Project UNMUTED */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="p-4 bg-indigo-900/60 rounded-2xl border border-indigo-800/80 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h3 className="text-xs font-extrabold text-white">No Login / 100% Anonymous</h3>
              <p className="text-[11px] text-indigo-200/80 leading-relaxed">
                Zero sign-up walls. No email or Device required. All data remains encrypted on your local Device.
              </p>
            </div>

            <div className="p-4 bg-indigo-900/60 rounded-2xl border border-indigo-800/80 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h3 className="text-xs font-extrabold text-white">Section 63 BSA Custody</h3>
              <p className="text-[11px] text-indigo-200/80 leading-relaxed">
                Preserves timestamps, SHA-256 hashes, and uncropped originals required for court admissibility.
              </p>
            </div>

            <div className="p-4 bg-indigo-900/60 rounded-2xl border border-indigo-800/80 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h3 className="text-xs font-extrabold text-white">Police Investigation Report</h3>
              <p className="text-[11px] text-indigo-200/80 leading-relaxed">
                Generates a formal, printable complaint report with cryptographic evidence logs and Sec 63 BSA certificate.
              </p>
            </div>
          </div>

          {/* Quick Context Indicators */}
          <div className="flex flex-wrap items-center gap-4 pt-3 text-xs text-indigo-300 border-t border-indigo-800/60">
            <div className="flex items-center gap-1.5 bg-indigo-900/60 px-3 py-1.5 rounded-lg border border-indigo-800">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Region: <strong className="text-white">{region.name}</strong></span>
            </div>

            <div className="flex items-center gap-1.5 bg-indigo-900/60 px-3 py-1.5 rounded-lg border border-indigo-800">
              <Phone className="w-3.5 h-3.5 text-rose-400" />
              <span>Cyber Helpline: <strong className="text-white">1930</strong></span>
            </div>

            <div className="flex items-center gap-1.5 bg-indigo-900/60 px-3 py-1.5 rounded-lg border border-indigo-800">
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              <span>AI Safety Companion: <strong className="text-white">Active 24/7</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
