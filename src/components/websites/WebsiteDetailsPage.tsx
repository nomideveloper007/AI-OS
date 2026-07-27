import React, { useState } from 'react';
import { WebsiteItem, WebsiteScanResult } from '../../types';
import { useApp } from '../../context/AppContext';
import { ScanProgressModal } from '../scanner/ScanProgressModal';
import { ScanReportView } from '../scanner/ScanReportView';
import { ScanErrorModal } from '../scanner/ScanErrorModal';
import { 
  ArrowLeft, 
  Globe, 
  Star, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Copy, 
  Calendar, 
  Clock, 
  Info, 
  Search, 
  Bot, 
  Activity, 
  BarChart3, 
  CheckSquare, 
  ShieldCheck, 
  Zap,
  Play,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ChevronRight
} from 'lucide-react';

interface WebsiteDetailsPageProps {
  website: WebsiteItem;
  onBack: () => void;
}

export const WebsiteDetailsPage: React.FC<WebsiteDetailsPageProps> = ({ website, onBack }) => {
  const { 
    setEditingWebsite, 
    setDeletingWebsite, 
    duplicateWebsiteItem, 
    toggleFavoriteWebsite,
    getScansForWebsite,
    deleteScan
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'scanner' | 'agents' | 'health' | 'seo' | 'analytics' | 'tasks' | 'approvals' | 'activity'>('overview');
  const [imgError, setImgError] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [selectedScanReport, setSelectedScanReport] = useState<WebsiteScanResult | null>(null);

  if (!website) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
        <p className="text-sm font-bold text-slate-700">Website details not found.</p>
        <button 
          onClick={onBack}
          className="px-4 py-2 bg-[#4F46E5] text-white rounded-xl font-bold text-xs cursor-pointer"
        >
          Back to Websites
        </button>
      </div>
    );
  }

  const websiteScans = getScansForWebsite(website.id);
  const latestScan = websiteScans[0] || null;

  const domain = website.domain || (website.url ? website.url.replace(/^https?:\/\//, '').split('/')[0] : 'example.com');
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'N/A';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString || 'N/A';
    }
  };

  const getFrameworkColor = (framework?: string) => {
    if (!framework) return 'bg-slate-100 text-slate-700 border-slate-200';
    switch (framework) {
      case 'Next.js':
        return 'bg-slate-900 text-white';
      case 'React':
        return 'bg-sky-100 text-sky-700 border-sky-200';
      case 'Laravel':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'WordPress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Vue':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Angular':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Node.js':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const placeholderTabs = [
    { id: 'scanner', label: `Website Scanner (${websiteScans.length})`, icon: Search },
    { id: 'agents', label: 'AI Agents', icon: Bot },
    { id: 'health', label: 'Website Health', icon: Activity },
    { id: 'seo', label: 'SEO Report', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: Zap },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'approvals', label: 'Approvals', icon: ShieldCheck },
    { id: 'activity', label: 'Activity', icon: Clock },
  ];

  const websiteName = website.name || 'Untitled Website';
  const websiteUrl = website.url || `https://${domain}`;
  const websiteCategory = website.category || 'SaaS';
  const websiteFramework = website.framework || 'Next.js';
  const websiteStatus = website.status || 'Active';
  const websiteFavorite = Boolean(website.favorite);

  return (
    <div className="space-y-6">
      {/* Back Button & Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          Back to Websites
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => duplicateWebsiteItem(website.id)}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5 text-slate-400" />
            Duplicate
          </button>
          <button
            onClick={() => setEditingWebsite(website)}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-400" />
            Edit
          </button>
          <button
            onClick={() => setDeletingWebsite(website)}
            className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 font-bold text-xs hover:bg-rose-100 transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            Delete
          </button>
        </div>
      </div>

      {/* Main Website Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 p-3 flex items-center justify-center flex-shrink-0 relative overflow-hidden shadow-2xs">
            {!imgError ? (
              <img 
                src={faviconUrl} 
                alt={websiteName} 
                onError={() => setImgError(true)}
                className="w-full h-full object-contain"
              />
            ) : (
              <Globe className="w-8 h-8 text-[#4F46E5]" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-extrabold text-slate-900">{websiteName}</h1>
              <button 
                onClick={() => toggleFavoriteWebsite(website.id)}
                className="text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
                title={websiteFavorite ? "Remove favorite" : "Mark as favorite"}
              >
                <Star className={`w-5 h-5 ${websiteFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
              </button>
            </div>

            <a 
              href={websiteUrl} 
              target="_blank" 
              rel="noreferrer"
              className="text-xs font-semibold text-[#2563EB] flex items-center gap-1 hover:underline mt-1"
            >
              {websiteUrl}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getFrameworkColor(websiteFramework)}`}>
            {websiteFramework}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
            {websiteCategory}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            websiteStatus === 'Active' ? 'bg-[#ECFDF5] text-[#059669] border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
          }`}>
            {websiteStatus}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-[#EEF2FF] text-[#4F46E5] shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Info className="w-4 h-4" />
          Overview & Info
        </button>

        {placeholderTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-[#EEF2FF] text-[#4F46E5] shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4 text-slate-400" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-extrabold text-slate-900">General Information</h2>
              <p className="text-xs text-slate-400 font-medium">Core configuration parameters for {websiteName}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold text-slate-400">Website Name</p>
                <p className="text-sm font-extrabold text-slate-900 mt-1">{websiteName}</p>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400">Domain Name</p>
                <p className="text-sm font-extrabold text-slate-900 mt-1">{domain}</p>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400">Framework</p>
                <p className="text-sm font-extrabold text-slate-900 mt-1">{websiteFramework}</p>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400">Category</p>
                <p className="text-sm font-extrabold text-slate-900 mt-1">{websiteCategory}</p>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400">Status</p>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold mt-1 ${
                  websiteStatus === 'Active' ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-slate-100 text-slate-600'
                }`}>
                  {websiteStatus}
                </span>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400">Favorite Status</p>
                <p className="text-sm font-extrabold text-slate-900 mt-1">
                  {websiteFavorite ? '⭐ Favorited' : 'Standard'}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-400 mb-1">Description</p>
              <p className="text-xs font-medium text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                {website.description || 'No description provided for this website.'}
              </p>
            </div>

            <div className="pt-2">
              <p className="text-xs font-bold text-slate-400 mb-1">Notes</p>
              <p className="text-xs font-medium text-slate-700 leading-relaxed bg-amber-50/50 p-3.5 rounded-xl border border-amber-100">
                {website.notes || 'No operational notes attached.'}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-extrabold text-slate-900">Timeline & History</h2>
                <p className="text-xs text-slate-400 font-medium">Audit timestamps</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400">Created Date</p>
                    <p className="text-xs font-extrabold text-slate-800 mt-0.5">{formatDate(website.created_at || website.connectedDate)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400">Last Updated</p>
                    <p className="text-xs font-extrabold text-slate-800 mt-0.5">{formatDate(website.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: WEBSITE SCANNER ENGINE */}
      {activeTab === 'scanner' && (
        <div className="space-y-6">
          {/* Header Action Banner */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] flex-shrink-0">
                <Search className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Website Scanner Engine</h2>
                <p className="text-xs text-slate-500 font-medium">
                  Collect technical headers, meta tags, discovered pages, images, links, and security configuration.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsErrorModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer whitespace-nowrap self-start md:self-auto"
            >
              <Play className="w-4 h-4 fill-current" />
              Scan Website
            </button>
          </div>

          {/* Latest Scan Overview Card */}
          {latestScan ? (
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-slate-900">Latest Scan Summary</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    latestScan.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {latestScan.status === 'completed' ? 'Completed' : 'Scan Failed'}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedScanReport(latestScan)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  View Scan Report
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <p className="font-bold text-slate-400">Scan Timestamp</p>
                  <p className="font-extrabold text-slate-900 mt-1">{formatDate(latestScan.scan_date)}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-400">Scan Duration</p>
                  <p className="font-extrabold text-slate-900 mt-1">{latestScan.duration_ms} ms</p>
                </div>
                <div>
                  <p className="font-bold text-slate-400">Pages Discovered</p>
                  <p className="font-extrabold text-slate-900 mt-1">{latestScan.pages?.length || 0} pages</p>
                </div>
                <div>
                  <p className="font-bold text-slate-400">Security Audit</p>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 mt-1">
                    {latestScan.security?.httpsEnabled ? 'HTTPS Enabled' : 'HTTP Only'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <Search className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-600">No scan results found for this website.</p>
              <button
                onClick={() => setIsErrorModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#4F46E5] text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Run First Scan
              </button>
            </div>
          )}

          {/* Scan History Table */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Scan History Database</h3>
                <p className="text-xs text-slate-400 font-medium">Historical scan executions for {domain}</p>
              </div>
              <span className="text-xs font-bold text-slate-400">{websiteScans.length} Total Records</span>
            </div>

            {websiteScans.length > 0 ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-extrabold text-slate-600">
                    <tr>
                      <th className="p-3">Scan ID</th>
                      <th className="p-3">Scan Date</th>
                      <th className="p-3">Duration</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Pages</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {websiteScans.map((sc) => (
                      <tr key={sc.id} className="hover:bg-slate-50/60">
                        <td className="p-3 font-mono font-bold text-slate-900">{sc.id}</td>
                        <td className="p-3 font-semibold text-slate-700">{formatDate(sc.scan_date)}</td>
                        <td className="p-3 font-bold text-slate-700">{sc.duration_ms} ms</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            sc.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {sc.status === 'completed' ? 'Completed' : 'Failed'}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-slate-700">{sc.pages?.length || 0}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedScanReport(sc)}
                              className="px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
                            >
                              View Report
                            </button>
                            <button
                              onClick={() => deleteScan(sc.id)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              title="Delete Scan Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs font-semibold text-slate-400 text-center py-4">No scan history recorded.</p>
            )}
          </div>
        </div>
      )}

      {/* OTHER PLACEHOLDER TABS */}
      {activeTab !== 'overview' && activeTab !== 'scanner' && (
        <div className="p-12 text-center bg-white border border-slate-200/80 rounded-2xl shadow-2xs space-y-4 my-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] mx-auto">
            <Zap className="w-8 h-8 stroke-[1.75]" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-slate-900 capitalize">
              {placeholderTabs.find(t => t.id === activeTab)?.label}
            </h3>
            <p className="text-xs font-bold text-slate-500 max-w-md mx-auto">
              This module will be available in a future update.
            </p>
          </div>
        </div>
      )}

      {/* Scanner Progress Modal */}
      <ScanProgressModal />

      {/* Execution Mode / Error Simulation Modal */}
      <ScanErrorModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        website={website}
      />

      {/* Full Scan Report Modal */}
      {selectedScanReport && (
        <ScanReportView
          scan={selectedScanReport}
          onClose={() => setSelectedScanReport(null)}
        />
      )}
    </div>
  );
};
