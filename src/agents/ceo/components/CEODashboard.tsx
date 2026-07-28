import React, { useState } from 'react';
import { CEOAgent } from '../CEOAgent';
import { CEOExecutiveReport } from '../CEOContext';
import { HealthOverview } from './HealthOverview';
import { ExecutiveReportView } from './ExecutiveReport';
import { TaskRecommendations } from './TaskRecommendations';
import { RiskPanel } from './RiskPanel';
import { OpportunityPanel } from './OpportunityPanel';
import { DecisionPanel } from './DecisionPanel';
import { AnalysisTimeline } from './AnalysisTimeline';
import { StrategicPlanningPanel } from './StrategicPlanningPanel';
import { useApp } from '../../../context/AppContext';
import {
  Play,
  ShieldCheck,
  CheckSquare,
  Activity,
  BarChart3,
  FileText,
  Sparkles,
  Map,
  Globe,
  ChevronDown
} from 'lucide-react';

export const CEODashboard: React.FC = () => {
  const { setActiveTab, showToast, websites, selectedWebsiteId, setSelectedWebsiteId } = useApp();
  const ceoAgent = CEOAgent.getInstance();
  const [report, setReport] = useState<CEOExecutiveReport | null>(
    () => ceoAgent.history.getLatestReport() || null
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<
    'overview' | 'strategy' | 'report' | 'tasks' | 'risks' | 'timeline'
  >('overview');

  const selectedWebsite = websites.find((w) => w.id === selectedWebsiteId) || websites[0];
  const targetDomain = selectedWebsite?.domain || 'tasktomoney.com';

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    showToast(`CEO Strategic Planner gathering context for ${targetDomain}...`);
    try {
      const newReport = await ceoAgent.runExecutiveAnalysis(targetDomain);
      setReport(newReport);
      setActiveSubTab('strategy');
      showToast(`Strategic plan ready for ${targetDomain}. Tasks registered for approval.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      showToast(`CEO Planning Error: ${message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const defaultScores = report?.healthScores || {
    overall: 0,
    website: 0,
    seo: 0,
    performance: 0,
    security: 0,
    content: 0,
    userExperience: 0,
    accessibility: 0,
  };

  const defaultRisks = report?.risks || [];
  const defaultOpportunities = report?.opportunities || [];
  const defaultTasks = report?.tasks || [];
  const strategicPlan = report?.strategicPlan || ceoAgent.getLatestStrategicPlan();

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] text-2xl flex-shrink-0 shadow-2xs">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-extrabold text-slate-900">CEO Executive Agent Dashboard</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Strategic Planner (Plan Only)
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Company brain — business health, goals, roadmaps, and prioritized tasks. Execution belongs to Task Engine & AI Employees.
              </p>
            </div>
          </div>

          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-extrabold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 self-start md:self-auto"
          >
            <Play className={`w-4 h-4 fill-current ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Building Strategic Plan...' : `Run Strategic Planning for ${targetDomain}`}
          </button>
        </div>

        {/* Target Website Selection Bar */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/60">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#4F46E5]" />
            <span className="font-extrabold text-slate-800">Target Website for Analysis:</span>
            <span className="font-bold text-[#4F46E5] underline font-mono">{targetDomain}</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[11px] font-bold text-slate-500">Select Website:</label>
            <select
              value={selectedWebsiteId}
              onChange={(e) => setSelectedWebsiteId(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 font-bold text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer shadow-2xs"
            >
              {websites.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.domain})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Health Overview Scorecard */}
      {report ? (
        <HealthOverview scores={defaultScores} />
      ) : (
        <div className="p-4 rounded-2xl bg-white border border-dashed border-slate-200 text-slate-500 font-semibold flex items-center justify-between">
          <span>Run strategic planning for <strong>{targetDomain}</strong> to compute Business Health from Website Intelligence, Memory, and task history.</span>
          <span className="text-xs font-mono font-bold text-[#4F46E5] bg-indigo-50 px-2.5 py-1 rounded-lg">Target: {targetDomain}</span>
        </div>
      )}

      {/* Decision Panel */}
      <DecisionPanel
        onRunAnalysis={handleRunAnalysis}
        isAnalyzing={isAnalyzing}
        onOpenReport={() => setActiveSubTab('report')}
        onOpenTasks={() => setActiveSubTab('tasks')}
        onOpenMemory={() => setActiveTab('memory')}
      />

      {/* Sub-tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-1 overflow-x-auto custom-scrollbar">
        {[
          { id: 'overview', label: 'Executive Overview', icon: Sparkles },
          { id: 'strategy', label: 'Strategy & Roadmap', icon: Map },
          { id: 'report', label: 'Executive Audit Report', icon: FileText },
          { id: 'tasks', label: `Recommended Tasks (${defaultTasks.length})`, icon: CheckSquare },
          { id: 'risks', label: `Risk & Growth Audit`, icon: BarChart3 },
          { id: 'timeline', label: 'Analysis Timeline Log', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as typeof activeSubTab)}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-[#EEF2FF] text-[#4F46E5] shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-6">
            {defaultRisks.length > 0 ? (
              <RiskPanel risks={defaultRisks as never} />
            ) : (
              <EmptyHint text={`Risks for ${targetDomain} appear after strategic planning.`} />
            )}
          </div>
          <div className="lg:col-span-6 space-y-6">
            {defaultOpportunities.length > 0 ? (
              <OpportunityPanel opportunities={defaultOpportunities as never} />
            ) : (
              <EmptyHint text={`Opportunities for ${targetDomain} appear after strategic planning.`} />
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'strategy' &&
        (strategicPlan ? (
          <StrategicPlanningPanel plan={strategicPlan} />
        ) : (
          <EmptyHint text={`No strategic plan for ${targetDomain} yet. Run Strategic Planning to generate goals, roadmap, and priorities.`} />
        ))}

      {activeSubTab === 'report' &&
        (report ? (
          <ExecutiveReportView report={report} />
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
            <p className="text-sm font-extrabold text-slate-800">No report generated for {targetDomain} in this session yet.</p>
            <button
              onClick={handleRunAnalysis}
              className="px-4 py-2 rounded-xl bg-[#4F46E5] text-white font-bold text-xs cursor-pointer"
            >
              Run Strategic Planning for {targetDomain} Now
            </button>
          </div>
        ))}

      {activeSubTab === 'tasks' &&
        (defaultTasks.length > 0 ? (
          <TaskRecommendations tasks={defaultTasks} />
        ) : (
          <EmptyHint text={`Recommended tasks for ${targetDomain} appear after planning (created in Task Engine, not executed).`} />
        ))}

      {activeSubTab === 'risks' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            {defaultRisks.length > 0 ? (
              <RiskPanel risks={defaultRisks as never} />
            ) : (
              <EmptyHint text="No risks yet." />
            )}
          </div>
          <div className="lg:col-span-6">
            {defaultOpportunities.length > 0 ? (
              <OpportunityPanel opportunities={defaultOpportunities as never} />
            ) : (
              <EmptyHint text="No opportunities yet." />
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'timeline' && <AnalysisTimeline logs={ceoAgent.logger.getLogs()} />}
    </div>
  );
};

const EmptyHint: React.FC<{ text: string }> = ({ text }) => (
  <div className="p-6 text-center bg-white rounded-2xl border border-slate-200/80 shadow-2xs text-slate-500 font-semibold">
    {text}
  </div>
);
