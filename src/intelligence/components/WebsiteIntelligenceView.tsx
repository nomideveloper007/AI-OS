import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WebsiteIntelligenceEngine } from '../core/WebsiteIntelligenceEngine';
import type { WebsiteContext } from '../types/WebsiteContext';
import { WebsiteHealthCard } from './WebsiteHealthCard';
import { WebsiteScoreCard } from './WebsiteScoreCard';
import { WebsiteInsightCard } from './WebsiteInsightCard';
import { WebsiteRiskCard } from './WebsiteRiskCard';
import { WebsiteOpportunityCard } from './WebsiteOpportunityCard';
import {
  Brain,
  Play,
  RefreshCw,
  CheckCircle2,
  Clock,
  History,
  Server,
  FileText,
} from 'lucide-react';

export const WebsiteIntelligenceView: React.FC = () => {
  const { websites, scans, getScansForWebsite } = useApp();
  const engine = useMemo(() => WebsiteIntelligenceEngine.getInstance(), []);

  const [selectedWebsiteId, setSelectedWebsiteId] = useState(
    () => websites[0]?.id || ''
  );
  const [context, setContext] = useState<WebsiteContext | null>(() => {
    const first = websites[0]?.id;
    return first ? engine.getLatestContext(first) || null : null;
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const selectedWebsite = websites.find((w) => w.id === selectedWebsiteId);
  const websiteScans = selectedWebsiteId ? getScansForWebsite(selectedWebsiteId) : [];
  const history = selectedWebsiteId ? engine.getHistory(selectedWebsiteId) : [];
  const comparison = selectedWebsiteId ? engine.compareLatest(selectedWebsiteId) : null;

  const handleAnalyze = () => {
    if (!selectedWebsiteId) return;
    setIsAnalyzing(true);
    setMessage(null);

    try {
      const website = websites.find((w) => w.id === selectedWebsiteId);
      const result = engine.analyzeLatestScan(scans, selectedWebsiteId, website);
      if (!result) {
        setMessage('No scanner results found for this website. Run a Website Scan first.');
        setContext(null);
      } else {
        setContext(result);
        setMessage(`Intelligence built from scan ${result.scanId}.`);
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectWebsite = (id: string) => {
    setSelectedWebsiteId(id);
    setContext(engine.getLatestContext(id) || null);
    setMessage(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] flex-shrink-0 shadow-2xs">
            <Brain className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-extrabold text-slate-900">Website Intelligence</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Scanner → Structure
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Transforms scanner results into structured knowledge for agents, reports, and workflows. No AI calls.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedWebsiteId}
            onChange={(e) => handleSelectWebsite(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
          >
            {websites.length === 0 && <option value="">No websites</option>}
            {websites.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.domain})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing || !selectedWebsiteId || websiteScans.length === 0}
            className="px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs transition-all shadow-sm cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            {isAnalyzing ? 'Analyzing…' : 'Build Intelligence'}
          </button>
        </div>
      </div>

      {message && (
        <div className="px-4 py-3 rounded-xl bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-800">
          {message}
        </div>
      )}

      {!selectedWebsite && (
        <div className="p-8 rounded-2xl bg-white border border-slate-200/80 text-center text-xs text-slate-400 font-semibold">
          Add a website and run a scan first.
        </div>
      )}

      {selectedWebsite && websiteScans.length === 0 && (
        <div className="p-8 rounded-2xl bg-white border border-slate-200/80 text-center text-xs text-slate-500 font-semibold">
          No scanner results for <span className="font-extrabold text-slate-800">{selectedWebsite.domain}</span>.
          Open Websites → run a scan, then return here.
        </div>
      )}

      {context && (
        <>
          {/* Summary + Health + Scores */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4">
              <WebsiteHealthCard
                scores={context.scores}
                domain={context.domain}
                analyzedAt={context.analyzedAt}
              />
            </div>

            <div className="lg:col-span-5 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <FileText className="w-4 h-4 text-[#4F46E5]" />
                <h3 className="font-extrabold text-slate-900 text-sm">Website Summary</h3>
              </div>
              <p className="text-xs font-extrabold text-slate-900">{context.summary.headline}</p>
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                {context.summary.overview}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Strengths</p>
                  <ul className="space-y-1">
                    {context.summary.strengths.map((s) => (
                      <li key={s} className="text-[11px] text-emerald-700 font-medium">• {s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Weaknesses</p>
                  <ul className="space-y-1">
                    {context.summary.weaknesses.map((w) => (
                      <li key={w} className="text-[11px] text-rose-700 font-medium">• {w}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {context.summary.priorityActions.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Priority Actions</p>
                  <ul className="space-y-1">
                    {context.summary.priorityActions.map((a) => (
                      <li key={a} className="text-[11px] text-indigo-700 font-semibold">→ {a}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="lg:col-span-3">
              <WebsiteScoreCard scores={context.scores} />
            </div>
          </div>

          {/* Profile strip */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
              <Server className="w-4 h-4 text-[#4F46E5]" />
              <h3 className="font-extrabold text-slate-900 text-sm">Website Profile</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
              {[
                ['Framework', context.profile.framework],
                ['CMS', context.profile.cms || '—'],
                ['Pages', String(context.profile.pageCount)],
                ['Load Time', `${context.profile.loadingTimeMs} ms`],
                ['Broken Links', String(context.profile.brokenLinks)],
                ['Missing ALT', String(context.profile.imagesMissingAlt)],
                ['HTTPS', context.profile.httpsEnabled ? 'Yes' : 'No'],
                ['Mobile', context.profile.mobileFriendly ? 'Yes' : 'No'],
                ['Robots', context.profile.hasRobots ? 'Yes' : 'No'],
                ['Sitemap', context.profile.hasSitemap ? 'Yes' : 'No'],
                ['OpenGraph', context.profile.hasOpenGraph ? 'Yes' : 'No'],
                ['Stack', context.profile.technologyStack.slice(0, 2).join(', ') || '—'],
              ].map(([label, value]) => (
                <div key={label} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <p className="text-[10px] font-bold text-slate-400">{label}</p>
                  <p className="font-extrabold text-slate-900 mt-0.5 truncate">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Insights / Risks / Opportunities */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <WebsiteInsightCard insights={context.insights} />
            <WebsiteRiskCard risks={context.risks} />
            <WebsiteOpportunityCard opportunities={context.opportunities} />
          </div>

          {/* Timeline + History */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Clock className="w-4 h-4 text-[#4F46E5]" />
                <h3 className="font-extrabold text-slate-900 text-sm">Timeline</h3>
              </div>
              {history.length === 0 ? (
                <p className="text-xs text-slate-400 font-medium py-4 text-center">No snapshots yet.</p>
              ) : (
                <div className="space-y-2">
                  {history.slice(0, 8).map((snap, idx) => (
                    <div
                      key={snap.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs"
                    >
                      <div className="w-2 h-2 rounded-full bg-[#4F46E5] flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-extrabold text-slate-900">
                          Health {snap.overallHealth}/100
                          {idx === 0 ? ' · Latest' : ''}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {new Date(snap.createdAt).toLocaleString()} · scan {snap.scanId}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">
                        {snap.insightCount}i · {snap.riskCount}r · {snap.opportunityCount}o
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <History className="w-4 h-4 text-[#4F46E5]" />
                <h3 className="font-extrabold text-slate-900 text-sm">History Comparison</h3>
              </div>
              {!comparison ? (
                <p className="text-xs text-slate-400 font-medium py-4 text-center">
                  Run Build Intelligence at least twice to compare snapshots.
                </p>
              ) : (
                <div className="space-y-3 text-xs">
                  <p className="font-semibold text-slate-700">
                    Overall delta:{' '}
                    <span
                      className={`font-extrabold ${
                        comparison.overallDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {comparison.overallDelta >= 0 ? '+' : ''}
                      {comparison.overallDelta}
                    </span>{' '}
                    ({comparison.previous.overallHealth} → {comparison.current.overallHealth})
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(comparison.scoreDeltas).map(([key, delta]) => (
                      <div key={key} className="p-2 rounded-lg bg-slate-50 border border-slate-200/60">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{key}</p>
                        <p
                          className={`font-extrabold ${
                            (delta as number) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {(delta as number) >= 0 ? '+' : ''}
                          {delta as number}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
