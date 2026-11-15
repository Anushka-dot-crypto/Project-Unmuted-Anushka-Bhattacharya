import React, { useState, useMemo } from 'react';
import { IncidentType, RiskLevel } from '../types';
import { SituationResource, getSituationResources, ALL_SITUATION_RESOURCES } from '../data/situationResources';
import {
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  LifeBuoy,
  FileCheck2,
  Copy,
  Check,
  Scale,
  Sparkles,
  Share2,
  Lock,
  Globe,
  Radio,
} from 'lucide-react';

interface SituationResourcesSectionProps {
  incidentType: IncidentType;
  incidentTitle?: string;
  riskLevel?: RiskLevel;
  urgencyAnswers?: Record<string, 'YES' | 'NO' | 'NOT_SURE'>;
  platform?: string;
  className?: string;
}

export const SituationResourcesSection: React.FC<SituationResourcesSectionProps> = ({
  incidentType,
  incidentTitle,
  riskLevel = 'HIGH',
  urgencyAnswers = {},
  platform = '',
  className = '',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>(platform || '');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Compute matched resources
  const resources = useMemo(() => {
    return getSituationResources(incidentType, urgencyAnswers, platformFilter);
  }, [incidentType, urgencyAnswers, platformFilter]);

  // Categories count
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: resources.length };
    resources.forEach((r) => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });
    return counts;
  }, [resources]);

  const filteredResources = useMemo(() => {
    if (selectedCategory === 'all') return resources;
    return resources.filter((r) => r.category === selectedCategory);
  }, [resources, selectedCategory]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2200);
  };

  const handleCopyAll = () => {
    const title = incidentTitle || incidentType.toUpperCase();
    const header = `=== EMERGENCY LINKS & RESOURCES: ${title} ===\nRisk Level: ${riskLevel}\nGenerated: ${new Date().toLocaleString()}\n\n`;
    const body = resources
      .map(
        (r, idx) =>
          `${idx + 1}. ${r.title} [${r.categoryLabel}]\n` +
          (r.helplineNumber ? `   Helpline: ${r.helplineNumber}\n` : '') +
          (r.url ? `   Direct Link: ${r.url}\n` : '') +
          `   Instructions: ${r.actionGuidance}\n`
      )
      .join('\n');

    navigator.clipboard.writeText(header + body);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-indigo-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-300">
                <LifeBuoy className="w-4 h-4 text-indigo-400" />
              </span>
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                Situation-Specific Action Links & Emergency Resources
              </h3>
            </div>
            <p className="text-xs text-indigo-200/90 leading-relaxed max-w-2xl">
              Curated verified links, official portals, takedown tools, and 24/7 helplines tailored specifically for{' '}
              <span className="font-bold text-amber-300">{incidentTitle || incidentType}</span>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyAll}
              className="px-3 py-2 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 border border-indigo-400/40 shadow-xs transition-all shrink-0"
              title="Copy all situation links and numbers to clipboard"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAll ? 'All Copied!' : 'Copy All Links'}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Context Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-3 mt-3 border-t border-indigo-700/50 text-[11px]">
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-950/70 text-indigo-200 border border-indigo-700/70 font-semibold flex items-center gap-1">
            <span>Incident:</span>
            <span className="text-white font-bold">{incidentTitle || incidentType}</span>
          </span>

          <span
            className={`px-2.5 py-0.5 rounded-full font-bold border flex items-center gap-1 ${
              riskLevel === 'CRITICAL'
                ? 'bg-rose-900/60 text-rose-200 border-rose-600'
                : riskLevel === 'HIGH'
                ? 'bg-amber-900/60 text-amber-200 border-amber-600'
                : 'bg-emerald-900/60 text-emerald-200 border-emerald-600'
            }`}
          >
            <span>Risk Level:</span>
            <span>{riskLevel}</span>
          </span>

          {platform && (
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700 font-semibold flex items-center gap-1">
              <span>Platform:</span>
              <span className="text-indigo-300 font-bold capitalize">{platform}</span>
            </span>
          )}

          <span className="px-2.5 py-0.5 rounded-full bg-indigo-900/40 text-indigo-200 border border-indigo-800/60 ml-auto font-mono">
            {resources.length} verified avenues
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
            selectedCategory === 'all'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          All Resources ({categoryCounts.all || 0})
        </button>

        {categoryCounts['official_portal'] ? (
          <button
            type="button"
            onClick={() => setSelectedCategory('official_portal')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              selectedCategory === 'official_portal'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Official Portals ({categoryCounts['official_portal']})
          </button>
        ) : null}

        {categoryCounts['takedown_tool'] ? (
          <button
            type="button"
            onClick={() => setSelectedCategory('takedown_tool')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              selectedCategory === 'takedown_tool'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Takedown Tools ({categoryCounts['takedown_tool']})
          </button>
        ) : null}

        {categoryCounts['emergency_helpline'] ? (
          <button
            type="button"
            onClick={() => setSelectedCategory('emergency_helpline')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              selectedCategory === 'emergency_helpline'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Helplines ({categoryCounts['emergency_helpline']})
          </button>
        ) : null}

        {categoryCounts['platform_form'] ? (
          <button
            type="button"
            onClick={() => setSelectedCategory('platform_form')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              selectedCategory === 'platform_form'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Platform Forms ({categoryCounts['platform_form']})
          </button>
        ) : null}

        {categoryCounts['mental_health'] ? (
          <button
            type="button"
            onClick={() => setSelectedCategory('mental_health')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              selectedCategory === 'mental_health'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Crisis & Counseling ({categoryCounts['mental_health']})
          </button>
        ) : null}

        {categoryCounts['legal_support'] ? (
          <button
            type="button"
            onClick={() => setSelectedCategory('legal_support')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              selectedCategory === 'legal_support'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Legal Aid ({categoryCounts['legal_support']})
          </button>
        ) : null}
      </div>

      {/* Platform Quick Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] text-slate-500">
        <span className="font-bold text-slate-600 dark:text-slate-400 shrink-0">Platform Filter:</span>
        {[
          { label: 'All', val: '' },
          { label: 'Instagram', val: 'instagram' },
          { label: 'WhatsApp', val: 'whatsapp' },
          { label: 'Facebook', val: 'facebook' },
          { label: 'Telegram', val: 'telegram' },
          { label: 'Google', val: 'google' },
          { label: 'X (Twitter)', val: 'x' },
          { label: 'Snapchat', val: 'snapchat' },
        ].map((p) => (
          <button
            key={p.val}
            type="button"
            onClick={() => setPlatformFilter(p.val)}
            className={`px-2 py-0.5 rounded-md font-semibold shrink-0 transition-colors ${
              platformFilter === p.val
                ? 'bg-indigo-600 text-white font-bold'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredResources.map((item) => {
          const isHelpline = item.category === 'emergency_helpline' || Boolean(item.helplineNumber);
          const isTakedown = item.category === 'takedown_tool';
          const isGov = item.category === 'official_portal';

          return (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                item.isHighPriority
                  ? 'bg-indigo-50/40 dark:bg-slate-800/90 border-indigo-300 dark:border-indigo-800/80 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="space-y-2">
                {/* Badges & Category Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                        isHelpline
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300'
                          : isTakedown
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300'
                          : isGov
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {item.categoryLabel}
                    </span>

                    {item.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  {item.isHighPriority && (
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
                      <Sparkles className="w-3 h-3" />
                      <span>Recommended</span>
                    </span>
                  )}
                </div>

                {/* Title */}
                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  {item.title}
                </h4>

                {/* Description */}
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.description}
                </p>

                {/* Action Guidance Callout */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-[11px] space-y-1">
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>How to use this resource:</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-normal pl-4">
                    {item.actionGuidance}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Open Official Portal</span>
                      <ExternalLink className="w-3 h-3 opacity-80" />
                    </a>
                  )}

                  {item.helplineNumber && (
                    <a
                      href={`tel:${item.helplineNumber}`}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Radio className="w-3.5 h-3.5 animate-pulse" />
                      <span>Dial {item.helplineNumber}</span>
                    </a>
                  )}
                </div>

                {/* Copy button */}
                <button
                  type="button"
                  onClick={() => handleCopy(item.url || item.helplineNumber || '', item.id)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                  title="Copy link or number"
                >
                  {copiedId === item.id ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredResources.length === 0 && (
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-2">
          <p className="text-xs text-slate-500">No resources found matching this filter.</p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setPlatformFilter('');
            }}
            className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Evidence Vault Interoperability Note */}
      <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl flex items-start gap-3 text-xs text-emerald-950 dark:text-emerald-200">
        <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5 leading-relaxed">
          <span className="font-bold">Using these links with your UNMUTED Evidence Vault:</span>
          <p className="text-[11px] text-emerald-900/90 dark:text-emerald-300">
            When submitting to <strong>cybercrime.gov.in</strong> or platform takedown forms, you will be prompted for proof.
            Your UNMUTED police report includes cryptographic SHA-256 evidence hashes and chronological timestamps accepted by law enforcement.
          </p>
        </div>
      </div>
    </div>
  );
};
