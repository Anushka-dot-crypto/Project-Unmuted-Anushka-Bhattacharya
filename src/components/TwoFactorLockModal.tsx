import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  Unlock,
  ShieldCheck,
  Mail,
  AlertTriangle,
  CheckCircle2,
  Delete,
  ShieldAlert,
  Settings,
  ArrowLeft,
} from 'lucide-react';

interface TwoFactorLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlocked: () => void;
  onCancel?: () => void;
}

export const TwoFactorLockModal: React.FC<TwoFactorLockModalProps> = ({
  isOpen,
  onClose,
  onUnlocked,
  onCancel,
}) => {
  const handleCancel = () => {
    onClose();
    if (onCancel) {
      onCancel();
    }
  };
  const {
    user,
    verifyPasscode,
    updatePasscodeSettings,
    requestSecurityRecoveryCode,
    resetPasscodeViaEmail,
  } = useAuth();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'unlock' | 'settings' | 'recovery'>('unlock');

  // Unlock sequence: 'passcode' -> 'success'
  const [unlockStage, setUnlockStage] = useState<'passcode' | 'success'>('passcode');
  const [passcode, setPasscode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Settings State
  const [newCode, setNewCode] = useState<string>(user?.sixDigitPasscode || '123456');
  const [newDecoyCode, setNewDecoyCode] = useState<string>(user?.decoySixDigitPasscode || '999999');

  // Recovery State
  const [recoveryEmail, setRecoveryEmail] = useState<string>(user?.email || '');
  const [recoveryCode, setRecoveryCode] = useState<string>('');
  const [newCodeAfterRecovery, setNewCodeAfterRecovery] = useState<string>('');
  const [recoverySent, setRecoverySent] = useState<boolean>(false);

  // Reset or initialize state when opening
  useEffect(() => {
    if (isOpen) {
      setUnlockStage('passcode');
      setPasscode('');
      setError(null);
      setSuccess(null);
      setRecoverySent(false);
      setRecoveryCode('');
      setNewCodeAfterRecovery('');
      setNewCode(user?.sixDigitPasscode || '123456');
      setNewDecoyCode(user?.decoySixDigitPasscode || '999999');
      setRecoveryEmail(user?.email || '');
    }
  }, [isOpen, user]);

  // Physical keyboard support for 6-digit number passcode
  useEffect(() => {
    if (!isOpen || activeTab !== 'unlock' || unlockStage !== 'passcode') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        if (passcode.length < 6) {
          const next = (passcode + e.key).slice(0, 6);
          setPasscode(next);
          setError(null);
          if (next.length === 6) {
            handleCheckPasscode(next);
          }
        }
      } else if (e.key === 'Backspace') {
        setPasscode((prev) => prev.slice(0, -1));
        setError(null);
      } else if (e.key === 'Enter') {
        if (passcode.length === 6) {
          handleCheckPasscode(passcode);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeTab, unlockStage, passcode]);

  const handleDigitInput = (digit: string) => {
    setError(null);
    if (digit === 'BACKSPACE') {
      setPasscode((prev) => prev.slice(0, -1));
      return;
    }
    if (digit === 'CLEAR') {
      setPasscode('');
      return;
    }
    if (passcode.length >= 6) return;

    const next = (passcode + digit).slice(0, 6);
    setPasscode(next);
    if (next.length === 6) {
      handleCheckPasscode(next);
    }
  };

  // Consecutive failed attempts counter
  const [consecutiveFailedAttempts, setConsecutiveFailedAttempts] = useState<number>(0);

  const handleCheckPasscode = (codeToCheck: string) => {
    setError(null);
    const clean = codeToCheck.replace(/\D/g, '').trim();
    if (clean.length < 6) {
      setError('Please enter all 6 digits of your security passcode.');
      return;
    }

    const res = verifyPasscode({ sixDigitPasscode: clean });
    if (res.success) {
      setConsecutiveFailedAttempts(0);
      if (res.isDecoy) {
        setSuccess('Coercion Decoy Mode Activated (Vault Protected).');
      } else {
        setSuccess('6-Digit Passcode Authenticated! Access Granted.');
      }
      setUnlockStage('success');
      setTimeout(() => {
        onUnlocked();
        onClose();
      }, 700);
    } else {
      const nextFailures = consecutiveFailedAttempts + 1;
      setPasscode('');
      if (nextFailures >= 5) {
        setConsecutiveFailedAttempts(0);
        setActiveTab('recovery');
        setError('Incorrect 6-digit passcode entered 5 consecutive times. You have been redirected to the Passcode Recovery page.');
      } else {
        setConsecutiveFailedAttempts(nextFailures);
        const remaining = 5 - nextFailures;
        setError(
          `Incorrect 6-digit passcode (Attempt ${nextFailures} of 5). ${remaining} attempt${remaining === 1 ? '' : 's'} remaining before redirect to recovery.`
        );
      }
    }
  };

  const handleSaveSettings = () => {
    const cleanNew = newCode.replace(/\D/g, '').slice(0, 6);
    const cleanDecoy = newDecoyCode.replace(/\D/g, '').slice(0, 6);

    if (cleanNew.length !== 6) {
      setError('Primary passcode must be exactly 6 digits (0–9).');
      return;
    }
    if (cleanDecoy.length !== 6) {
      setError('Decoy passcode must be exactly 6 digits (0–9).');
      return;
    }

    updatePasscodeSettings({
      mode: 'code_only',
      sixDigitPasscode: cleanNew,
      decoySixDigitPasscode: cleanDecoy,
    });

    setSuccess('6-Digit security passcode preferences saved!');
    setTimeout(() => {
      setSuccess(null);
      setActiveTab('unlock');
    }, 1000);
  };

  const handleSendRecoveryEmail = () => {
    if (!recoveryEmail) {
      setError('Please specify your registered email address.');
      return;
    }
    const res = requestSecurityRecoveryCode(recoveryEmail);
    if (res.success) {
      setRecoverySent(true);
      setSuccess(`Recovery confirmation code dispatched to ${recoveryEmail}. For testing, use code: 749201`);
    } else {
      setError(res.error || 'Failed to dispatch recovery code.');
    }
  };

  const handleApplyEmailRecovery = () => {
    if (!recoveryCode) {
      setError('Please input the 6-digit recovery code from your email.');
      return;
    }
    const clean = newCodeAfterRecovery.replace(/\D/g, '').slice(0, 6);
    if (clean.length !== 6) {
      setError('Please enter a new 6-digit passcode (0–9).');
      return;
    }

    const res = resetPasscodeViaEmail(recoveryEmail, recoveryCode, clean);
    if (res.success) {
      setSuccess(`Passcode successfully reset to "${clean}"! Vault unlocked.`);
      setTimeout(() => {
        onUnlocked();
        onClose();
      }, 900);
    } else {
      setError(res.error || 'Failed to reset passcode. Use test code 749201.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 text-white animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-teal-400" />
            <span>Vault Security Passcode</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setError(null);
                setSuccess(null);
                setActiveTab(activeTab === 'settings' ? 'unlock' : 'settings');
              }}
              className={`p-1.5 rounded-lg border transition-colors ${
                activeTab === 'settings'
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title="Passcode Settings & Decoy PIN"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancel}
              className="text-slate-400 hover:text-white font-bold text-base px-1.5"
              title="Cancel and return to home screen"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Feedback alerts */}
        {error && (
          <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-rose-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 1: UNLOCK SCREEN (6-DIGIT PASSCODE) */}
        {/* ============================================================== */}
        {activeTab === 'unlock' && (
          <div className="space-y-4">
            {unlockStage === 'passcode' && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 bg-teal-500/10 text-teal-400 rounded-2xl mx-auto flex items-center justify-center border border-teal-500/20 mb-2">
                    <Lock className="w-6 h-6" />
                  </div>
                  <label className="text-sm font-bold text-slate-200">
                    Enter 6-Digit Security Passcode
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Type 6 digits (default: <strong className="text-teal-300 font-mono">123456</strong>) using the keypad or keyboard.
                  </p>
                </div>

                {/* 6-Digit Box Indicator */}
                <div className="flex justify-center items-center gap-2 sm:gap-2.5 py-2">
                  {[0, 1, 2, 3, 4, 5].map((i) => {
                    const char = passcode[i] || '';
                    const isCurrent = passcode.length === i;
                    return (
                      <div
                        key={i}
                        className={`w-11 h-14 sm:w-12 sm:h-14 rounded-2xl border-2 flex items-center justify-center text-xl font-black font-mono tracking-wider transition-all duration-200 ${
                          char
                            ? 'bg-teal-500/20 border-teal-400 text-teal-300 shadow-md shadow-teal-500/20 scale-105'
                            : isCurrent
                            ? 'bg-slate-950 border-teal-500/70 ring-2 ring-teal-500/30'
                            : 'bg-slate-950 border-slate-700 text-slate-600'
                        }`}
                      >
                        {char ? '●' : '·'}
                      </div>
                    );
                  })}
                </div>

                {consecutiveFailedAttempts > 0 && (
                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-amber-400 font-semibold bg-amber-950/40 border border-amber-800/60 py-1 px-3 rounded-full mx-auto w-fit">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Failed attempts: {consecutiveFailedAttempts}/5 (5 consecutive failures redirect to recovery)</span>
                  </div>
                )}

                {/* Numeric keypad (1-9, Clear, 0, Backspace) */}
                <div className="max-w-xs mx-auto space-y-1.5 pt-1">
                  <div className="grid grid-cols-3 gap-2">
                    {['1', '2', '3'].map((digit) => (
                      <button
                        key={digit}
                        type="button"
                        onClick={() => handleDigitInput(digit)}
                        className="py-3 bg-slate-950 hover:bg-slate-800 active:scale-95 border border-slate-800 rounded-2xl font-mono text-lg font-bold text-white transition-all hover:border-teal-500/50"
                      >
                        {digit}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {['4', '5', '6'].map((digit) => (
                      <button
                        key={digit}
                        type="button"
                        onClick={() => handleDigitInput(digit)}
                        className="py-3 bg-slate-950 hover:bg-slate-800 active:scale-95 border border-slate-800 rounded-2xl font-mono text-lg font-bold text-white transition-all hover:border-teal-500/50"
                      >
                        {digit}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {['7', '8', '9'].map((digit) => (
                      <button
                        key={digit}
                        type="button"
                        onClick={() => handleDigitInput(digit)}
                        className="py-3 bg-slate-950 hover:bg-slate-800 active:scale-95 border border-slate-800 rounded-2xl font-mono text-lg font-bold text-white transition-all hover:border-teal-500/50"
                      >
                        {digit}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleDigitInput('CLEAR')}
                      className="py-3 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-2xl text-xs font-bold transition-all"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDigitInput('0')}
                      className="py-3 bg-slate-950 hover:bg-slate-800 active:scale-95 border border-slate-800 rounded-2xl font-mono text-lg font-bold text-white transition-all hover:border-teal-500/50"
                    >
                      0
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDigitInput('BACKSPACE')}
                      className="py-3 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-2xl flex items-center justify-center transition-all"
                    >
                      <Delete className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Actions row: Cancel to Home & Unlock Button */}
                <div className="flex gap-2.5 mt-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="py-3 px-4 bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-300 hover:text-white font-bold rounded-2xl transition-all text-xs sm:text-sm flex items-center justify-center gap-1.5 shrink-0"
                    title="Cancel and return to home screen"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCheckPasscode(passcode)}
                    disabled={passcode.length !== 6}
                    className="flex-1 py-3 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 active:scale-98 text-slate-950 font-extrabold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>Unlock Vault</span>
                  </button>
                </div>

                {/* Quick Fill Default & Forgot Password Button */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <button
                    type="button"
                    onClick={() => {
                      setPasscode('123456');
                      handleCheckPasscode('123456');
                    }}
                    className="hover:text-teal-300 underline font-mono"
                  >
                    Use Default (123456)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('recovery');
                    }}
                    className="hover:text-indigo-300 underline"
                  >
                    Forgot Passcode?
                  </button>
                </div>

              </div>
            )}

            {/* ---------------- STAGE 2: SUCCESS TRANSITION ---------------- */}
            {unlockStage === 'success' && (
              <div className="py-8 text-center space-y-3">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-3xl mx-auto flex items-center justify-center border border-emerald-500/40 animate-bounce">
                  <Unlock className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-extrabold text-white">Vault Unlocked</h3>
                <p className="text-xs text-slate-400">
                  6-Digit passcode authenticated. Loading sensitive digital evidence...
                </p>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: PASSCODE SETTINGS */}
        {/* ============================================================== */}
        {activeTab === 'settings' && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <div className="font-bold text-sm text-teal-300">Vault Passcode Configuration</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Your evidence vault is protected by a 6-digit numeric passcode.
              </p>

              {/* Primary 6-Digit Passcode */}
              <div className="space-y-1">
                <label className="block text-slate-300 font-bold">
                  Primary 6-Digit Passcode (0–9)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-teal-300 font-mono font-bold tracking-widest text-center text-lg"
                />
                <span className="text-[10px] text-slate-500">
                  Default passcode: 123456
                </span>
              </div>

              {/* Decoy / Duress 6-Digit Passcode */}
              <div className="space-y-1 pt-1">
                <label className="text-amber-400 font-bold flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Decoy / Duress 6-Digit Passcode (Coercion Shield)</span>
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={newDecoyCode}
                  onChange={(e) => setNewDecoyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="999999"
                  className="w-full p-2.5 bg-slate-900 border border-amber-900/60 rounded-xl text-amber-300 font-mono font-bold tracking-widest text-center text-lg"
                />
                <p className="text-[10px] text-slate-500">
                  If forced by an extortionist or attacker to unlock your vault, enter this code to display a harmless note scratchpad.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('unlock')}
                className="w-1/3 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSettings}
                className="w-2/3 py-2.5 bg-teal-600 hover:bg-teal-500 text-slate-950 font-extrabold rounded-xl shadow-md"
              >
                Save 6-Digit Passcode
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: RECOVERY FLOW */}
        {/* ============================================================== */}
        {activeTab === 'recovery' && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <div className="font-bold text-sm text-indigo-300 flex items-center gap-1.5">
                <Mail className="w-4 h-4" />
                <span>Reset 6-Digit Passcode via Registered Email</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                A one-time confirmation code will be sent to verify your registered email address.
              </p>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Registered Email Address</label>
                <input
                  type="email"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  placeholder="victim@example.com"
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>

              {!recoverySent ? (
                <button
                  type="button"
                  onClick={handleSendRecoveryEmail}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send Reset Code to Email</span>
                </button>
              ) : (
                <div className="space-y-3 pt-1">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-slate-300 font-semibold">Email Confirmation Code</label>
                      <span className="text-[10px] text-teal-400 font-mono">Demo: 749201</span>
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      value={recoveryCode}
                      onChange={(e) => setRecoveryCode(e.target.value)}
                      placeholder="749201"
                      className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-center text-sm tracking-widest"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">New 6-Digit Passcode</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={newCodeAfterRecovery}
                      onChange={(e) => setNewCodeAfterRecovery(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="123456"
                      className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-teal-300 font-mono font-bold text-center text-base tracking-widest"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyEmailRecovery}
                    className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-slate-950 font-extrabold rounded-xl shadow-md"
                  >
                    Confirm Reset & Unlock Vault
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleCancel}
                className="w-1/3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl font-bold text-center block text-xs transition-colors"
              >
                Cancel to Home
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('unlock')}
                className="w-2/3 py-2 text-slate-400 hover:text-white underline text-center block text-xs"
              >
                Back to Security Passcode
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
