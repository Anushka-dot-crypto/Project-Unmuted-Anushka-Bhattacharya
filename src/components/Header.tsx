import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Sparkles,
  MapPin,
  Home,
  Bot,
  FolderLock,
  Cloud,
  LogOut,
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenVault?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const { firebaseUser, signInWithGoogle, logout } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    const res = await signInWithGoogle();
    setIsSigningIn(false);
    if (!res.success && res.error) {
      setAuthError(res.error);
      setTimeout(() => setAuthError(null), 4000);
    }
  };

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      activeColor: 'bg-indigo-600 text-white shadow-sm',
    },
    {
      id: 'emergency',
      label: 'Emergency',
      icon: Shield,
      activeColor: 'bg-rose-600 text-white font-extrabold shadow-sm ring-1 ring-rose-400',
      isEmergency: true,
    },
    {
      id: 'companion',
      label: 'AI Companion',
      icon: Bot,
      activeColor: 'bg-purple-600 text-white shadow-sm',
    },
    {
      id: 'vault',
      label: 'Vault',
      icon: FolderLock,
      activeColor: 'bg-teal-600 text-slate-950 font-black shadow-sm',
    },
    {
      id: 'deepfake',
      label: 'Deepfake',
      icon: Sparkles,
      activeColor: 'bg-indigo-600 text-white shadow-sm',
    },
    {
      id: 'location',
      label: 'Nearby Help',
      icon: MapPin,
      activeColor: 'bg-emerald-600 text-white shadow-sm',
    },
  ];

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5">
          {/* Top Line on Mobile and Tablet: Branding on left, Cloud Sync on right */}
          <div className="flex items-center justify-between gap-2">
            {/* Logo & Branding */}
            <div
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity shrink-0"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white shadow-md text-sm sm:text-base">
                U
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-black tracking-wide leading-none text-white">
                  Project UNMUTED
                </h1>
                <p className="text-[10px] text-indigo-300 font-medium hidden sm:block leading-tight mt-0.5">
                  Privacy-First Digital Safety & Evidence Vault
                </p>
              </div>
            </div>

            {/* Cloud Sync & Auth Button on Mobile and Tablet */}
            <div className="flex items-center gap-2 lg:hidden">
              {firebaseUser ? (
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1 px-2 py-1 bg-indigo-950/80 border border-indigo-700/80 rounded-lg text-[10px] font-bold text-indigo-300">
                    <Cloud className="w-3 h-3 text-indigo-400" />
                    <span className="truncate max-w-[85px] sm:max-w-[130px]">
                      {firebaseUser.displayName?.split(' ')[0] || firebaseUser.email?.split('@')[0] || 'Synced'}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="p-1.5 bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 rounded-lg border border-slate-700 text-xs font-bold transition-all"
                    title="Sign out from Cloud"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isSigningIn}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 shadow-sm shrink-0"
                  title="Sync Cases to Cloud with Google"
                >
                  <Cloud className="w-3 h-3" />
                  <span>{isSigningIn ? '...' : 'Cloud Backup'}</span>
                </button>
              )}

              {authError && (
                <span className="text-[9px] text-rose-400 max-w-[90px] truncate" title={authError}>
                  {authError}
                </span>
              )}
            </div>
          </div>

          {/* Navigation Items (Visible & Accessible on Mobile, Tablet & Laptop) */}
          <nav
            aria-label="Main Navigation"
            className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-0.5 bg-slate-950/90 sm:bg-slate-950 p-1 rounded-xl sm:rounded-2xl border border-slate-800/90 w-full lg:w-auto justify-start sm:justify-center"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? item.activeColor
                      : item.isEmergency
                      ? 'text-rose-400 hover:text-rose-300 hover:bg-rose-950/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls for Desktop/Laptop */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {firebaseUser ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-950/70 border border-indigo-700/80 rounded-xl text-[11px] font-bold text-indigo-300">
                  <Cloud className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="truncate max-w-[120px]">
                    {firebaseUser.displayName || firebaseUser.email || 'Cloud Synced'}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 rounded-xl border border-slate-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title="Sign out from Firebase"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline text-[11px]">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="Sync Cases to Cloud with Google"
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>{isSigningIn ? 'Connecting...' : 'Cloud Backup'}</span>
              </button>
            )}

            {authError && (
              <span className="text-[10px] text-rose-400 max-w-[140px] truncate" title={authError}>
                {authError}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
