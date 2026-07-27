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
import { useApp } from '../../../context/AppContext';
import { 
  Play, 
  Award, 
  ShieldCheck, 
  CheckSquare, 
  Activity, 
  BarChart3, 
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';

export const CEODashboard: React.FC = () => {
  const { setActiveTab, showToast } = useApp();
  const ceoAgent = CEOAgent.getInstance();
  const [report, setReport] = useState<CEOExecutiveReport | null>(() => ceoAgent.history.getLatestReport() || null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'report' | 'tasks' | 'risks' | 'timeline'>('overview');

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    showToast('CEO Agent reading scanner data & memory...');
    try {
      const newReport = await ceoAgent.runExecutiveAnalysis('tasktomoney.com');
      setReport(newReport);
      showToast('Executive Analysis completed! Tasks submitted for approval.');
    } catch (err: any) {
      showToast(`CEO Analysis Error: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const defaultScores = report?.healthScores || {
    overall: 88,
    website: 90,
    seo: 82,
    performance: 92,
    security: 95,
    content: 80,
    userExperience: 87,
    accessibility: 88
  };

  const defaultRisks = report?.risks || [
    {
      id: 'risk-1',
      title: 'Missing Meta Tags & FAQ Schema',
      severity: 'Medium',
      description: 'Core product pages lack microdata schema markup for rich Google search snippets.',
      mitigationStrategy: 'Deploy JSON-LD schema generator workflow.'
    },
    {
      id: 'risk-2',
      title: 'Uncompressed Image Payload',
      severity: 'Low',
      description: 'Large PNG assets increase mobile network payload.',
      mitigationStrategy: 'Compress PNG assets to WebP format.'
    }
  ];

  const defaultOpportunities = report?.opportunities || [
    {
      id: 'opp-1',
      title: 'SEO Content Expansion & Blog Creation',
      potentialGrowth: '+35% Organic Search Impressions',
      description: 'Publish weekly high-intent SEO technical tutorials.',
      actionPlan: 'Task Growth Marketing Agent to generate content schedule.'
    },
    {
      id: 'opp-2',
      title: 'Internal Linking Optimization',
      potentialGrowth: '+18% Pageviews Per Session',
      description: 'Add contextual cross-links across all site articles.',
      actionPlan: 'Automate internal link graph mapping.'
    }
  ];

  const defaultTasks = report?.tasks || [
    {
      id: 'ceotask-1',
      title: 'Improve Homepage Meta Title & Description',
      description: 'Optimize page title tag to include target primary keywords and craft a compelling 155-character meta description.',
      priority: 'High',
      category: 'SEO',
      estimatedImpact: 'High',
      estimatedDifficulty: 'Easy',
      suggestedAgent: 'SEO Specialist Agent',
      reason: 'Current homepage title lacks target keyword focus for search rankings.',
      status: 'Pending Approval',
      approvalRequired: true
    },
    {
      id: 'ceotask-2',
      title: 'Create Missing FAQ & Support Page',
      description: 'Add a dedicated FAQ section with JSON-LD schema markup to capture long-tail user search queries.',
      priority: 'Medium',
      category: 'Content',
      estimatedImpact: 'High',
      estimatedDifficulty: 'Moderate',
      suggestedAgent: 'Growth Marketing Agent',
      reason: 'Reduces support friction and improves search rich snippet eligibility.',
      status: 'Pending Approval',
      approvalRequired: true
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] text-2xl flex-shrink-0 shadow-2xs">
            👑
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-extrabold text-slate-900">CEO Executive Agent Dashboard</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Advisor Only (Read-Only Safety Lock)
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Chief Executive Officer responsible for analyzing website health, planning improvements, creating tasks, and issuing executive briefings.
            </p>
          </div>
        </div>

        <button
          onClick={handleRunAnalysis}
          disabled={isAnalyzing}
          className="px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-extrabold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 self-start md:self-auto"
        >
          <Play className={`w-4 h-4 fill-current ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'Executing AI Analysis...' : 'Run Executive Analysis'}
        </button>
      </div>

      {/* Health Overview Scorecard */}
      <HealthOverview scores={defaultScores} />

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
          { id: 'report', label: 'Executive Audit Report', icon: FileText },
          { id: 'tasks', label: `Task Recommendations (${defaultTasks.length})`, icon: CheckSquare },
          { id: 'risks', label: `Risk & Growth Audit`, icon: BarChart3 },
          { id: 'timeline', label: 'Analysis Timeline Log', icon: Activity }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
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

      {/* Sub-tab Content Panels */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-6">
            <RiskPanel risks={defaultRisks as any} />
          </div>
          <div className="lg:col-span-6 space-y-6">
            <OpportunityPanel opportunities={defaultOpportunities as any} />
          </div>
        </div>
      )}

      {activeSubTab === 'report' && (
        report ? (
          <ExecutiveReportView report={report} />
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
            <p className="text-sm font-extrabold text-slate-800">No report generated in this session yet.</p>
            <button
              onClick={handleRunAnalysis}
              className="px-4 py-2 rounded-xl bg-[#4F46E5] text-white font-bold text-xs cursor-pointer"
            >
              Run Executive Analysis Now
            </button>
          </div>
        )
      )}

      {activeSubTab === 'tasks' && <TaskRecommendations tasks={defaultTasks} />}

      {activeSubTab === 'risks' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <RiskPanel risks={defaultRisks as any} />
          </div>
          <div className="lg:col-span-6">
            <OpportunityPanel opportunities={defaultOpportunities as any} />
          </div>
        </div>
      )}

      {activeSubTab === 'timeline' && <AnalysisTimeline logs={ceoAgent.logger.getLogs()} />}
    </div>
  );
};
