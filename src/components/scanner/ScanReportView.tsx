import React, { useState } from 'react';
import { WebsiteScanResult } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Globe, 
  ExternalLink, 
  Server, 
  ShieldCheck, 
  ShieldAlert, 
  Layers, 
  FileText, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Code, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  ArrowLeft,
  FileCode,
  Lock,
  Search,
  Tag
} from 'lucide-react';

interface ScanReportViewProps {
  scan: WebsiteScanResult;
  onClose: () => void;
}

export const ScanReportView: React.FC<ScanReportViewProps> = ({ scan, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'pages' | 'metadata' | 'headings' | 'images' | 'links' | 'files' | 'security' | 'performance'>('overview');

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'N/A';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return isoString;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const isFailed = scan.status === 'failed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-5xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              isFailed ? 'bg-rose-50 border border-rose-100 text-rose-600' : 'bg-emerald-50 border border-emerald-100 text-emerald-600'
            }`}>
              {isFailed ? <ShieldAlert className="w-6 h-6 stroke-[2]" /> : <Globe className="w-6 h-6 stroke-[2]" />}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-extrabold text-slate-900 truncate">
                  Technical Scan Report
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  isFailed ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}>
                  {isFailed ? 'Scan Failed' : '200 OK'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold truncate mt-0.5">
                {scan.domain} • Scanned {formatDate(scan.scan_date)} ({scan.duration_ms}ms)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Failed Banner if scan failed */}
        {isFailed && (
          <div className="p-4 bg-rose-50 border-b border-rose-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 space-y-0.5">
              <p className="font-bold text-rose-700">Scan Error Code: {scan.error_type || 'HTTP Error'}</p>
              <p className="text-slate-600">{scan.error_message || 'Could not establish connection to the specified target host.'}</p>
            </div>
          </div>
        )}

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-5 py-2.5 border-b border-slate-200 bg-slate-50/30 overflow-x-auto custom-scrollbar">
          {[
            { id: 'overview', label: 'Overview', icon: Server },
            { id: 'pages', label: `Pages (${scan.pages?.length || 0})`, icon: FileText },
            { id: 'metadata', label: 'Metadata', icon: Tag },
            { id: 'headings', label: `Headings (${scan.headings?.totalCount || 0})`, icon: FileCode },
            { id: 'images', label: `Images (${scan.images?.totalCount || 0})`, icon: ImageIcon },
            { id: 'links', label: `Links (${(scan.links?.internalCount || 0) + (scan.links?.externalCount || 0)})`, icon: LinkIcon },
            { id: 'files', label: 'Assets & Files', icon: Code },
            { id: 'security', label: 'Security', icon: Lock },
            { id: 'performance', label: 'Performance', icon: Zap },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-[#4F46E5] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Technical Profile Grid */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900">Technical Profile</h3>
                  <span className="text-xs font-semibold text-slate-400 font-mono">ID: {scan.id}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
                  <div>
                    <p className="font-bold text-slate-400">Website Title</p>
                    <p className="font-extrabold text-slate-900 mt-1">{scan.technical?.title || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-400">Homepage URL</p>
                    <a href={scan.technical?.homepageUrl} target="_blank" rel="noreferrer" className="font-bold text-[#2563EB] hover:underline mt-1 flex items-center gap-1 truncate">
                      {scan.technical?.homepageUrl || scan.domain}
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </div>
                  <div>
                    <p className="font-bold text-slate-400">Final URL (Redirected)</p>
                    <p className="font-semibold text-slate-800 mt-1 truncate">{scan.technical?.finalUrl || scan.domain}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-400">Domain</p>
                    <p className="font-extrabold text-slate-900 mt-1">{scan.technical?.domain || scan.domain}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-400">Protocol</p>
                    <span className="inline-block px-2.5 py-0.5 rounded-full font-extrabold text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 mt-1">
                      {scan.technical?.protocol || 'HTTPS'}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-400">HTTP Status Code</p>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full font-extrabold text-[11px] mt-1 ${
                      scan.technical?.statusCode === 200 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {scan.technical?.statusCode || (isFailed ? 'Error' : 200)}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-400">Server Software</p>
                    <p className="font-semibold text-slate-800 mt-1">{scan.technical?.server || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-400">Framework / Tech Stack</p>
                    <p className="font-semibold text-slate-800 mt-1">{scan.technical?.framework || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-400">Language / Charset</p>
                    <p className="font-semibold text-slate-800 mt-1">{scan.technical?.language || 'en'} ({scan.technical?.charset || 'UTF-8'})</p>
                  </div>
                </div>
              </div>

              {/* Quick Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center space-y-1">
                  <p className="text-xs font-bold text-slate-400">Pages Discovered</p>
                  <p className="text-xl font-extrabold text-slate-900">{scan.pages?.length || 0}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center space-y-1">
                  <p className="text-xs font-bold text-slate-400">Total Images</p>
                  <p className="text-xl font-extrabold text-slate-900">{scan.images?.totalCount || 0}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center space-y-1">
                  <p className="text-xs font-bold text-slate-400">Headings Count</p>
                  <p className="text-xl font-extrabold text-slate-900">{scan.headings?.totalCount || 0}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center space-y-1">
                  <p className="text-xs font-bold text-slate-400">Load Time</p>
                  <p className="text-xl font-extrabold text-indigo-600">{scan.performance?.loadTimeMs || 0}ms</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PAGES */}
          {activeTab === 'pages' && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900">Discovered Pages Inventory</h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-extrabold text-slate-600">
                    <tr>
                      <th className="p-3">Path</th>
                      <th className="p-3">Title</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Type</th>
                      <th className="p-3 text-right">Load Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {scan.pages?.map((page) => (
                      <tr key={page.id} className="hover:bg-slate-50/60">
                        <td className="p-3 font-mono font-bold text-slate-900">{page.path}</td>
                        <td className="p-3 font-semibold text-slate-700">{page.title}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            page.statusCode === 200 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {page.statusCode}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-slate-500">{page.type}</td>
                        <td className="p-3 text-right font-bold text-slate-700">{page.loadTimeMs}ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: METADATA */}
          {activeTab === 'metadata' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">Standard HTML Meta Tags</h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <p className="font-bold text-slate-400">Meta Title</p>
                    <p className="font-extrabold text-slate-900 mt-0.5">{scan.meta?.title || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-400">Meta Description</p>
                    <p className="font-medium text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 mt-0.5">
                      {scan.meta?.description || 'No meta description provided.'}
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-400 mb-1">Keywords</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {scan.meta?.keywords?.map((kw, i) => (
                        <span key={i} className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold">
                          {kw}
                        </span>
                      )) || <span className="text-slate-400">None</span>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <p className="font-bold text-slate-400">Canonical URL</p>
                      <p className="font-semibold text-slate-800 mt-0.5">{scan.meta?.canonicalUrl || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-400">Robots Meta Tag</p>
                      <p className="font-mono text-slate-800 mt-0.5">{scan.meta?.robotsMeta || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Open Graph & Twitter Social Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-indigo-600" />
                    Open Graph (Facebook / LinkedIn)
                  </h4>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                    <p><span className="font-bold text-slate-400">og:title:</span> {scan.meta?.ogTitle || 'N/A'}</p>
                    <p><span className="font-bold text-slate-400">og:description:</span> {scan.meta?.ogDescription || 'N/A'}</p>
                    <p><span className="font-bold text-slate-400">og:type:</span> {scan.meta?.ogType || 'website'}</p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <LinkIcon className="w-4 h-4 text-sky-600" />
                    Twitter Card Tags
                  </h4>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                    <p><span className="font-bold text-slate-400">twitter:card:</span> {scan.meta?.twitterCard || 'N/A'}</p>
                    <p><span className="font-bold text-slate-400">twitter:title:</span> {scan.meta?.twitterTitle || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: HEADINGS */}
          {activeTab === 'headings' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900">Total Headings Collected</span>
                <span className="text-base font-extrabold text-[#4F46E5]">{scan.headings?.totalCount || 0}</span>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                  <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-900 text-white rounded-md text-[11px]">H1</span>
                    Heading Level 1 Tags ({scan.headings?.h1?.length || 0})
                  </h4>
                  <ul className="list-disc list-inside text-xs font-semibold text-slate-700 space-y-1">
                    {scan.headings?.h1?.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                  <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md text-[11px]">H2</span>
                    Heading Level 2 Tags ({scan.headings?.h2?.length || 0})
                  </h4>
                  <ul className="list-disc list-inside text-xs font-medium text-slate-700 space-y-1">
                    {scan.headings?.h2?.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: IMAGES */}
          {activeTab === 'images' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <p className="text-xs font-bold text-slate-400">Total Images</p>
                  <p className="text-xl font-extrabold text-slate-900 mt-1">{scan.images?.totalCount || 0}</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                  <p className="text-xs font-bold text-emerald-600">With ALT Text</p>
                  <p className="text-xl font-extrabold text-emerald-700 mt-1">{scan.images?.withAltCount || 0}</p>
                </div>
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-center">
                  <p className="text-xs font-bold text-rose-600">Missing ALT Text</p>
                  <p className="text-xl font-extrabold text-rose-700 mt-1">{scan.images?.missingAltCount || 0}</p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-extrabold text-slate-600">
                    <tr>
                      <th className="p-3">Source URL</th>
                      <th className="p-3">ALT Attribute</th>
                      <th className="p-3">Dimensions</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {scan.images?.list?.map((img, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="p-3 font-mono text-slate-800 truncate max-w-xs">{img.src}</td>
                        <td className="p-3 font-semibold text-slate-700">{img.alt || <span className="text-rose-500 font-bold italic">Missing ALT</span>}</td>
                        <td className="p-3 font-semibold text-slate-500">{img.width && img.height ? `${img.width} × ${img.height}` : 'Auto'}</td>
                        <td className="p-3 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            !img.missingAlt ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {!img.missingAlt ? 'Valid ALT' : 'Needs ALT'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: LINKS */}
          {activeTab === 'links' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <p className="text-xs font-bold text-slate-400">Internal Links</p>
                  <p className="text-xl font-extrabold text-slate-900 mt-1">{scan.links?.internalCount || 0}</p>
                </div>
                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-center">
                  <p className="text-xs font-bold text-indigo-600">External Links</p>
                  <p className="text-xl font-extrabold text-[#4F46E5] mt-1">{scan.links?.externalCount || 0}</p>
                </div>
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-center">
                  <p className="text-xs font-bold text-rose-600">Broken Links</p>
                  <p className="text-xl font-extrabold text-rose-700 mt-1">{scan.links?.brokenCount || 0}</p>
                </div>
              </div>

              {scan.links?.brokenLinks && scan.links.brokenLinks.length > 0 && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    Detected Broken Links
                  </h4>
                  <ul className="text-xs text-slate-700 space-y-1">
                    {scan.links.brokenLinks.map((lk, i) => (
                      <li key={i} className="flex items-center justify-between font-mono bg-white p-2 rounded-lg border border-rose-100">
                        <span>{lk.url}</span>
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-700 font-bold rounded-md">HTTP 404</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: FILES */}
          {activeTab === 'files' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900">robots.txt</span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      scan.files?.robotsTxt?.found ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {scan.files?.robotsTxt?.found ? 'Found' : 'Not Found'}
                    </span>
                  </div>
                  <p className="font-mono text-slate-500 truncate">{scan.files?.robotsTxt?.path}</p>
                  {scan.files?.robotsTxt?.content && (
                    <pre className="p-3 bg-slate-900 text-slate-100 font-mono text-[11px] rounded-xl overflow-x-auto max-h-36">
                      {scan.files.robotsTxt.content}
                    </pre>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900">sitemap.xml</span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      scan.files?.sitemapXml?.found ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {scan.files?.sitemapXml?.found ? 'Found' : 'Not Found'}
                    </span>
                  </div>
                  <p className="font-mono text-slate-500 truncate">{scan.files?.sitemapXml?.path}</p>
                  <p className="font-bold text-slate-700">Discovered URLs in Index: {scan.files?.sitemapXml?.urlCount || 0}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-6 text-xs">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-slate-900">Security Encryption & Headers Audit</h3>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-extrabold rounded-full border border-emerald-200">
                    HTTPS Active ({scan.security?.tlsVersion || 'TLS v1.3'})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: 'Strict-Transport-Security (HSTS)', active: scan.security?.headers?.hsts },
                    { label: 'X-Frame-Options (Clickjacking Protection)', active: scan.security?.headers?.xFrameOptions },
                    { label: 'X-Content-Type-Options (MIME Sniffing)', active: scan.security?.headers?.xContentTypeOptions },
                    { label: 'Content-Security-Policy (CSP)', active: scan.security?.headers?.csp },
                    { label: 'Referrer-Policy Header', active: scan.security?.headers?.referrerPolicy },
                  ].map((hdr, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <span className="font-bold text-slate-700">{hdr.label}</span>
                      {hdr.active ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500 stroke-[2.5]" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: PERFORMANCE */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-xs font-bold text-slate-400">HTML Document Size</p>
                  <p className="text-lg font-extrabold text-slate-900 mt-1">{formatBytes(scan.performance?.htmlSizeBytes || 0)}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-xs font-bold text-slate-400">CSS Assets</p>
                  <p className="text-lg font-extrabold text-slate-900 mt-1">{scan.performance?.cssFilesCount || 0} ({formatBytes(scan.performance?.cssSizeBytes || 0)})</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-xs font-bold text-slate-400">JS Scripts</p>
                  <p className="text-lg font-extrabold text-slate-900 mt-1">{scan.performance?.jsFilesCount || 0} ({formatBytes(scan.performance?.jsSizeBytes || 0)})</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-xs font-bold text-slate-400">Images Total</p>
                  <p className="text-lg font-extrabold text-slate-900 mt-1">{scan.performance?.imageCount || 0} ({formatBytes(scan.performance?.imageSizeBytes || 0)})</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400">
            Raw scanner record saved to workspace database.
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
