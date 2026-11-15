import React, { useState, useRef, useEffect } from 'react';
import { useCase } from '../context/CaseContext';
import { ChatMessage } from '../types';
import {
  Bot,
  Send,
  Shield,
  AlertCircle,
  Sparkles,
  HelpCircle,
  Phone,
  User,
  ShieldAlert,
  Lock,
  Zap,
  PhoneCall,
  HeartPulse,
  Scale,
  Activity,
  AlertTriangle,
  Square,
  Search,
  X,
} from 'lucide-react';

interface EmergencyDirective {
  title: string;
  category: 'SELF_HARM' | 'LEGAL_ADVICE' | 'MEDICAL_ADVICE';
  message: string;
  helplines: Array<{ name: string; number: string; desc: string; tel: string }>;
}

export const AICompanionScreen: React.FC = () => {
  const { activeDraftCase } = useCase();
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [includeCaseContext, setIncludeCaseContext] = useState(false);
  const [activeEmergency, setActiveEmergency] = useState<EmergencyDirective | null>(null);
  const [topicFilter, setTopicFilter] = useState('');

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Clean up abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'assistant',
      text: 'Hello. I am the Project UNMUTED AI Safety Assistant. I am an AI digital safety companion — not a lawyer or doctor. I am here to guide you on evidence preservation, privacy settings, blackmail containment, and official reporting steps.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Smooth scroll to latest incoming token/message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const presetQuestions = [
    'How do I preserve legally valid screenshots with timestamps?',
    'What should I do if someone demands money or crypto on WhatsApp?',
    'How does StopNCII block intimate images without uploading raw files?',
    'How do I report to the 1930 Cyber Helpline & cybercrime.gov.in?',
    'What should I do if an AI deepfake of me is posted online?',
    'How do I lock down my Instagram and WhatsApp privacy settings?',
  ];

  // Client-side quick safety checks for immediate emergency response
  const checkSafetyTriggers = (text: string): EmergencyDirective | null => {
    const lower = text.toLowerCase();
    
    // Self-harm / Suicide
    if (/\b(suicid|kill myself|end my life|end it all|want to die|hang myself|slit my|cut myself|overdose|no reason to live|better off dead|take my own life|can't live like this|jump off|poison myself|feel like dying|wanna die|giving up on life|harm myself)\b/i.test(lower)) {
      return {
        title: 'URGENT: YOU ARE NOT ALONE — PLEASE REACH OUT FOR HELP NOW',
        category: 'SELF_HARM',
        message: 'If you are in distress, feeling overwhelmed, or having thoughts of self-harm, please connect with compassionate, trained professionals right away. You are valued and there is immediate help available 24/7.',
        helplines: [
          { name: 'Tele-MANAS (Mental Health Govt of India)', number: '14416', desc: '24/7 Toll-Free, Multilingual & Confidential', tel: 'tel:14416' },
          { name: 'KIRAN Mental Health Helpline', number: '1800-599-0019', desc: 'Ministry of Social Justice 24x7 crisis line', tel: 'tel:18005990019' },
          { name: 'Vandrevala Foundation Helpline', number: '+91 9999 666 555', desc: 'Free 24/7 Crisis Counseling (Call & WhatsApp)', tel: 'tel:9999666555' },
          { name: 'National Emergency Dispatch', number: '112', desc: 'Immediate Police & Emergency Response', tel: 'tel:112' },
        ],
      };
    }

    // Medical advice
    if (/\b(medical advice|diagnose me|what medicine|what pills|how many pills|prescription for|what drugs should i take|treat my infection|overdosed on|is this medication safe|panic attack medication|sleeping pills to take)\b/i.test(lower)) {
      return {
        title: 'NOTICE: MEDICAL ADVICE RESTRICTION — EMERGENCY HEALTH SERVICES',
        category: 'MEDICAL_ADVICE',
        message: 'I am an AI safety companion and NOT a qualified healthcare professional. I cannot diagnose conditions or prescribe medications. Please contact certified emergency medical professionals immediately.',
        helplines: [
          { name: 'National Emergency Ambulance Service', number: '108', desc: '24/7 Free Emergency Ambulance Dispatch', tel: 'tel:108' },
          { name: 'National Emergency Number', number: '112', desc: 'Single national emergency for medical & police', tel: 'tel:112' },
          { name: 'Tele-MANAS (Psychological Distress Support)', number: '14416', desc: '24/7 Toll-Free acute panic & distress counseling', tel: 'tel:14416' },
        ],
      };
    }

    // Legal advice
    if (/\b(legal advice|represent me|will i go to jail|am i legally guilty|can i sue|should i plead|hire an advocate|be my lawyer|give me legal representation|what is the penalty for me|legal counsel for court)\b/i.test(lower)) {
      return {
        title: 'NOTICE: LEGAL ADVICE RESTRICTION — OFFICIAL FREE LEGAL AID',
        category: 'LEGAL_ADVICE',
        message: 'I am an AI safety tool and NOT an advocate or legal counsel. While I assist you with preserving Section 63 BSA evidence, I cannot represent you or provide legal defense. Please contact official legal aid below.',
        helplines: [
          { name: 'NALSA (National Legal Services Authority)', number: '15100', desc: '24/7 Toll-Free Free Legal Representation for victims', tel: 'tel:15100' },
          { name: 'National Cyber Crime Helpline', number: '1930', desc: 'Official cyber crime police registration', tel: 'tel:1930' },
          { name: 'Women Helpline (Harassment & Protection)', number: '1091', desc: 'Legal aid & protection for women facing cyber threats', tel: 'tel:1091' },
        ],
      };
    }

    return null;
  };

  const handleStopSearch = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);

    setMessages((prev) => {
      // Find if last message is empty placeholder, replace or append note
      const last = prev[prev.length - 1];
      if (last && last.sender === 'assistant' && !last.text.trim()) {
        return prev.map((m) =>
          m.id === last.id
            ? { ...m, text: '⏹️ Search stopped by user. Ask another question or pick a suggested topic.' }
            : m
        );
      }
      return [
        ...prev,
        {
          id: 'm-' + Date.now(),
          sender: 'assistant',
          text: '⏹️ Search stopped by user.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ];
    });
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMsg).trim();
    if (!query) return;

    // Abort previous search if one was pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const userMsg: ChatMessage = {
      id: 'm-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const assistantMsgId = 'm-' + (Date.now() + 1);
    const placeholderMsg: ChatMessage = {
      id: assistantMsgId,
      sender: 'assistant',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Immediately post user message + instant streaming placeholder
    setMessages((prev) => [...prev, userMsg, placeholderMsg]);
    setInputMsg('');
    setLoading(true);

    // Instant safety evaluation
    const immediateSafety = checkSafetyTriggers(query);
    if (immediateSafety) {
      setActiveEmergency(immediateSafety);
    }

    try {
      // 1. Ultra-fast Real-Time Server-Sent Events (SSE) Streaming
      const response = await fetch('/api/companion-chat-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          caseContext: includeCaseContext && activeDraftCase ? activeDraftCase : null,
        }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error('Streaming failed, fallback to standard');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulated = '';
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const dataStr = trimmed.slice(5).trim();
          if (dataStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.isEmergencyAlert && parsed.emergencyData) {
              setActiveEmergency({
                title: parsed.emergencyData.emergencyTitle,
                category: parsed.emergencyData.category,
                message: parsed.emergencyData.emergencyMessage,
                helplines: parsed.emergencyData.helplines.map((h: any) => ({
                  ...h,
                  tel: `tel:${h.number.replace(/[^0-9]/g, '')}`,
                })),
              });
            }

            if (parsed.chunk) {
              accumulated += parsed.chunk;
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantMsgId ? { ...m, text: accumulated } : m))
              );
            } else if (parsed.reply) {
              accumulated = parsed.reply;
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantMsgId ? { ...m, text: accumulated } : m))
              );
            }
          } catch {
            // Buffer fragment
          }
        }
      }

      if (buffer.trim().startsWith('data:')) {
        const dataStr = buffer.trim().slice(5).trim();
        if (dataStr !== '[DONE]') {
          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.chunk) {
              accumulated += parsed.chunk;
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantMsgId ? { ...m, text: accumulated } : m))
              );
            }
          } catch {}
        }
      }

      if (!accumulated.trim() || accumulated.trim().length < 20) {
        throw new Error('Incomplete stream response, using standard fallback');
      }
    } catch (e: any) {
      if (e.name === 'AbortError') {
        return;
      }
      console.warn('Streaming fallback triggered:', e);
      try {
        const fallbackRes = await fetch('/api/companion-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: query,
            caseContext: includeCaseContext && activeDraftCase ? activeDraftCase : null,
          }),
          signal: controller.signal,
        });

        const data = await fallbackRes.json();
        if (data.success && data.reply) {
          if (data.isEmergencyAlert && data.emergencyData) {
            setActiveEmergency({
              title: data.emergencyData.emergencyTitle,
              category: data.emergencyData.category,
              message: data.emergencyData.emergencyMessage,
              helplines: data.emergencyData.helplines.map((h: any) => ({
                ...h,
                tel: `tel:${h.number.replace(/[^0-9]/g, '')}`,
              })),
            });
          }
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantMsgId ? { ...m, text: data.reply } : m))
          );
        } else {
          throw new Error('Fallback failed');
        }
      } catch (fallbackErr: any) {
        if (fallbackErr.name === 'AbortError') return;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  text: 'I am here to guide you step by step. If you are experiencing cyber blackmail or harassment:\n\n1. Do not pay or negotiate.\n2. Preserve all screenshots and chat logs without deleting.\n3. Call 1930 for financial cyber fraud or report at cybercrime.gov.in.\n4. Lock down your social media privacy settings.',
                }
              : m
          )
        );
      }
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
        setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200 dark:border-purple-900">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              AI Safety Companion
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Calm, confidential guidance on digital safety, evidence preservation, and crisis numbers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Functional Stop Search Button in Header when search is active */}
          {loading && (
            <button
              type="button"
              onClick={handleStopSearch}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer animate-pulse"
              title="Stop active search"
              aria-label="Stop active search"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop Search</span>
            </button>
          )}

          {activeDraftCase && (
            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={includeCaseContext}
                onChange={(e) => setIncludeCaseContext(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>Include Active Case Context</span>
            </label>
          )}
        </div>
      </div>

      {/* 🚨 ACTIVE EMERGENCY HOTLINES DIRECTIVE BANNER (WHEN TRIGGERED) */}
      {activeEmergency && (
        <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-900 border-2 border-rose-500 rounded-3xl p-6 shadow-2xl text-white space-y-4 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-rose-800/80 pb-3">
            <div className="flex items-center gap-2 text-rose-300 font-black text-sm uppercase tracking-wide">
              <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
              <span>{activeEmergency.title}</span>
            </div>
            <button
              onClick={() => setActiveEmergency(null)}
              className="text-xs text-slate-400 hover:text-white font-bold"
            >
              Dismiss
            </button>
          </div>

          <p className="text-xs text-rose-100 leading-relaxed font-medium">
            {activeEmergency.message}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {activeEmergency.helplines.map((h, idx) => (
              <a
                key={idx}
                href={h.tel}
                className="p-3 bg-slate-900/90 hover:bg-slate-800 border border-rose-600/70 hover:border-rose-400 rounded-2xl flex items-center justify-between group transition-all"
              >
                <div>
                  <div className="text-[10px] uppercase font-bold text-rose-300">{h.name}</div>
                  <div className="text-base font-black text-white">{h.number}</div>
                  <div className="text-[10px] text-slate-400">{h.desc}</div>
                </div>
                <div className="p-2.5 bg-rose-600 group-hover:bg-rose-500 rounded-xl text-white shadow-sm shrink-0">
                  <PhoneCall className="w-4 h-4" />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Mandatory AI Disclaimers */}
      <div className="bg-slate-900 text-slate-300 p-4 rounded-2xl text-xs space-y-1 border border-slate-800">
        <div className="flex items-center gap-2 text-amber-400 font-bold">
          <AlertCircle className="w-4 h-4" />
          <span>AI Assistant Safety Guidelines & Restrictions</span>
        </div>
        <p className="text-slate-400 leading-relaxed">
          I am an AI assistant — not a human doctor, lawyer, or police officer. If you or someone you know is in immediate physical distress or feeling suicidal, please dial <strong className="text-white">112</strong> or <strong className="text-white">14416 (Tele-MANAS)</strong> immediately.
        </p>
      </div>

      {/* Preset Suggested Questions */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium px-1">
          <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            Suggested Safety Topics
          </span>
          {topicFilter && (
            <button
              type="button"
              onClick={() => setTopicFilter('')}
              className="text-[11px] text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>Clear Filter</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {presetQuestions
            .filter((q) => !topicFilter.trim() || q.toLowerCase().includes(topicFilter.toLowerCase()))
            .map((q, idx) => (
              <button
                key={idx}
                disabled={loading}
                onClick={() => handleSendMessage(q)}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold transition-colors text-left cursor-pointer"
              >
                {q}
              </button>
            ))}
        </div>
      </div>

      {/* Chat Conversation Window */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 min-h-[380px] flex flex-col justify-between">
        <div className="space-y-4 overflow-y-auto max-h-[450px] pr-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl max-w-xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/60 dark:border-slate-700/60'
                }`}
              >
                {!msg.text && msg.sender === 'assistant' && loading ? (
                  <div className="flex items-center gap-2 text-slate-500 py-1">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold ml-1">Streaming guidance...</span>
                  </div>
                ) : (
                  <>
                    {msg.text}
                    {loading && msg.sender === 'assistant' && msg.id === messages[messages.length - 1]?.id && (
                      <span className="inline-block w-1.5 h-3.5 bg-purple-500 ml-1 animate-pulse align-middle" />
                    )}
                  </>
                )}
                {msg.text && (
                  <div
                    className={`text-[9px] mt-2 ${
                      msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Active Search & Streaming Status with Functional Stop Search Button */}
          {loading && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 rounded-2xl shadow-xs animate-in fade-in">
              <div className="flex items-center gap-2.5 text-xs text-purple-700 dark:text-purple-300 font-medium">
                <Sparkles className="w-4 h-4 animate-spin text-purple-600 dark:text-purple-400 shrink-0" />
                <span>AI Safety Companion streaming real-time guidance...</span>
              </div>
              <button
                type="button"
                onClick={handleStopSearch}
                className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer shrink-0"
                title="Stop current search"
                aria-label="Stop current search"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Search</span>
              </button>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Form with Integrated Stop Search Button */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Search safety topics or ask a question (e.g. blackmail, StopNCII, 1930)..."
              className="w-full pl-10 pr-4 py-3 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              disabled={loading}
            />
          </div>

          {loading ? (
            <button
              type="button"
              onClick={handleStopSearch}
              className="flex items-center gap-1.5 px-4 py-3 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer shrink-0 animate-pulse"
              title="Stop active search"
              aria-label="Stop active search"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Stop Search</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!inputMsg.trim()}
              className="flex items-center gap-1.5 px-4 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
              title="Search / Send safety question"
              aria-label="Search / Send safety question"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Search</span>
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
