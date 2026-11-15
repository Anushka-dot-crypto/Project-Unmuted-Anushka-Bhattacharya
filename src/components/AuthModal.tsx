import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, User, Lock, Mail, ArrowRight, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, login, signup, loginAsGuest, logout, resetPasswordRequest, resetPasswordConfirm, sendVerificationEmail, verifyEmailToken } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset_confirm'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (mode === 'login') {
      const res = login(email, password);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Login failed.');
      }
    } else if (mode === 'signup') {
      const res = signup(email, password, name);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Signup failed.');
      }
    } else if (mode === 'forgot') {
      const res = resetPasswordRequest(email);
      if (res.success) {
        setInfo(`Verification code sent to ${email}. For testing, use verification code: ${res.code}`);
        setMode('reset_confirm');
      } else {
        setError(res.error || 'Failed to process request.');
      }
    } else if (mode === 'reset_confirm') {
      const res = resetPasswordConfirm(email, resetCode, newPassword);
      if (res.success) {
        setInfo('Password reset successfully! Please log in with your new password.');
        setMode('login');
        setPassword('');
      } else {
        setError(res.error || 'Password reset failed.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
            <Shield className="w-5 h-5" />
            <span>Account & Security</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-sm">
            ✕
          </button>
        </div>

        {/* Current Auth Status */}
        {user && !user.isGuest ? (
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{user.name}</h3>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>

            {/* Email Verification Banner & Flow */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2 text-left">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-300">Email Verification</span>
                {user.isEmailVerified ? (
                  <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full font-bold text-[10px] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 rounded-full font-bold text-[10px]">
                    Unverified
                  </span>
                )}
              </div>

              {!user.isEmailVerified && (
                <div className="space-y-2 pt-1">
                  {info && <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">{info}</p>}
                  {error && <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">{error}</p>}

                  <button
                    onClick={() => {
                      const res = sendVerificationEmail();
                      if (res.success) {
                        setInfo(`Verification code sent! For testing, use code: ${res.token}`);
                      } else {
                        setError('Failed to send verification email.');
                      }
                    }}
                    className="w-full py-1.5 bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-bold border border-indigo-200 dark:border-indigo-900"
                  >
                    Send Email Verification Code
                  </button>

                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Enter verification token"
                      id="tokenInput"
                      className="flex-1 p-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-mono"
                    />
                    <button
                      onClick={() => {
                        const input = (document.getElementById('tokenInput') as HTMLInputElement)?.value;
                        if (!input) return;
                        const res = verifyEmailToken(input);
                        if (res.success) {
                          setInfo('Email successfully verified!');
                          setError(null);
                        } else {
                          setError(res.error || 'Invalid token.');
                        }
                      }}
                      className="px-3 py-1.5 bg-teal-600 text-white rounded-lg font-bold text-xs"
                    >
                      Verify
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Sign Out to Guest Mode
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {mode === 'login'
                  ? 'Welcome Back'
                  : mode === 'signup'
                  ? 'Create Private Account'
                  : mode === 'forgot'
                  ? 'Password Recovery'
                  : 'Set New Password'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Protected, privacy-first authentication for Project UNMUTED.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {info && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{info}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              {mode === 'signup' && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Name / Alias</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name or handle"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              )}

              {mode !== 'reset_confirm' && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              )}

              {(mode === 'login' || mode === 'signup') && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Password</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setError(null);
                          setInfo(null);
                          setMode('forgot');
                        }}
                        className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              )}

              {mode === 'reset_confirm' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      required
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="Enter 6-digit code (e.g. 749201)"
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span>
                  {mode === 'login'
                    ? 'Sign In'
                    : mode === 'signup'
                    ? 'Create Account'
                    : mode === 'forgot'
                    ? 'Send Reset Code'
                    : 'Confirm New Password'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-2 text-center text-xs space-y-2">
              <button
                onClick={() => {
                  setError(null);
                  setInfo(null);
                  setMode(mode === 'login' ? 'signup' : 'login');
                }}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
              </button>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    loginAsGuest();
                    onClose();
                  }}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 text-xs font-medium"
                >
                  Continue in Anonymous Guest Mode
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
