import React, { useState } from 'react';
import { RESOURCES_DATA } from '../data/resourcesData';
import { ResourceArticle } from '../types';
import {
  BookOpen,
  Search,
  ShieldCheck,
  FileCheck,
  Landmark,
  Sparkles,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export const ResourcesScreen: React.FC = () => {
  const [selectedArticle, setSelectedArticle] = useState<ResourceArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = RESOURCES_DATA.map((cat) => ({
    ...cat,
    articles: cat.articles.filter(
      (art) =>
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.summary.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((cat) => cat.articles.length > 0);

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Safety Knowledgebase</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Digital Safety Resources
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
          Practical guides on account security, evidence standards, deepfake protection, and cyber harassment defense.
        </p>

        {/* Search Input */}
        <div className="relative max-w-md pt-2">
          <Search className="absolute left-3.5 top-5 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guides (e.g. 2FA, StopNCII, screenshots)..."
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Article Detail View or Categories Grid */}
      {selectedArticle ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
          <button
            onClick={() => setSelectedArticle(null)}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            ← Back to all resource guides
          </button>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {selectedArticle.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              {selectedArticle.summary}
            </p>
          </div>

          <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60 whitespace-pre-line text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {selectedArticle.content}
          </div>

          {selectedArticle.steps && selectedArticle.steps.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Action Steps:
              </h3>
              <ol className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {selectedArticle.steps.map((st, idx) => (
                  <li key={idx} className="flex items-start gap-3 bg-indigo-50/50 dark:bg-indigo-950/30 p-3 rounded-xl border border-indigo-100/50 dark:border-indigo-900/40">
                    <span className="font-bold text-indigo-600 shrink-0">{idx + 1}.</span>
                    <span>{st}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {selectedArticle.links && (
            <div className="pt-2 flex flex-wrap gap-2">
              {selectedArticle.links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs"
                >
                  <span>{link.label}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredCategories.map((cat) => (
            <div key={cat.id} className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                {cat.title}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cat.articles.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => setSelectedArticle(art)}
                    className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700 hover:border-indigo-400 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-2 group"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {art.title}
                      </h3>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {art.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
