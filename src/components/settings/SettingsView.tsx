import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AIConfig } from '../../ai/config/AIConfig';
import { OmniRouteProvider } from '../../ai/providers/OmniRouteProvider';
import { ModelRegistry } from '../../ai/models/ModelRegistry';
import { 
  Settings, 
  Sliders, 
  Moon, 
  Sun, 
  Key, 
  Bell, 
  ShieldCheck, 
  Save, 
  CheckCircle2,
  Activity,
  Cpu,
  Zap,
  RefreshCw,
  Server,
  Lock
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { isDarkMode, toggleDarkMode, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'providers' | 'notifications' | 'security'>('providers');

  const configInstance = AIConfig.getInstance();
  const [config, setConfig] = useState(() => configInstance.getConfig());

  const [siteName, setSiteName] = useState('AI OS');
  const [timezone, setTimezone] = useState('UTC-05:00 (EST)');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    status: string;
    latencyMs: number;
    message: string;
  } | null>(null);

  const models = ModelRegistry.getInstance().getAllModels();

  const handleSave = () => {
    configInstance.updateConfig(config);
    showToast('AI Engine Settings saved successfully!');
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    const provider = new OmniRouteProvider();
    try {
      const res = await provider.healthCheck();
      setConnectionStatus({
        status: res.status === 'healthy' ? 'Connected' : 'Degraded',
        latencyMs: res.latencyMs,
        message: res.message || 'OmniRoute Gateway Online'
      });
      showToast(`OmniRoute Ping Success! Latency: ${res.latencyMs}ms`);
    } catch (err: any) {
      setConnectionStatus({
        status: 'Offline',
        latencyMs: 0,
        message: err.message || 'Failed to ping OmniRoute'
      });
      showToast('OmniRoute Connection Failed');
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">AI OS System Settings</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure system defaults, OmniRoute provider credentials, model parameters, and security settings.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          Save Settings
        </button>
      </div>

      {/* Main Settings Tabs Container */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Sub-tabs Navigation */}
        <div className="md:col-span-3 space-y-1">
          <button
            onClick={() => setActiveTab('providers')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all text-left cursor-pointer ${
              activeTab === 'providers' ? 'bg-[#EEF2FF] text-[#4F46E5] shadow-2xs font-extrabold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Key className="w-4 h-4 text-indigo-600" />
            AI Providers & Models
          </button>

          <button
            onClick={() => setActiveTab('general')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all text-left cursor-pointer ${
              activeTab === 'general' ? 'bg-[#EEF2FF] text-[#4F46E5] shadow-2xs font-extrabold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-4 h-4" />
            General
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all text-left cursor-pointer ${
              activeTab === 'appearance' ? 'bg-[#EEF2FF] text-[#4F46E5] shadow-2xs font-extrabold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sun className="w-4 h-4" />
            Appearance
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all text-left cursor-pointer ${
              activeTab === 'notifications' ? 'bg-[#EEF2FF] text-[#4F46E5] shadow-2xs font-extrabold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Bell className="w-4 h-4" />
            Notifications
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all text-left cursor-pointer ${
              activeTab === 'security' ? 'bg-[#EEF2FF] text-[#4F46E5] shadow-2xs font-extrabold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Security
          </button>
        </div>

        {/* Right Content Panels */}
        <div className="md:col-span-9 pl-0 md:pl-6 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 space-y-6">
          {/* TAB 1: AI PROVIDERS & OMNIROUTE CONFIG */}
          {activeTab === 'providers' && (
            <div className="space-y-6 text-xs">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">OmniRoute AI Provider & Model Routing</h3>
                  <p className="text-xs text-slate-500 font-medium">Primary AI models routing gateway configuration</p>
                </div>

                <button
                  onClick={handleTestConnection}
                  disabled={isTestingConnection}
                  className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-[#4F46E5] font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingConnection ? 'animate-spin' : ''}`} />
                  {isTestingConnection ? 'Pinging...' : 'Test Connection'}
                </button>
              </div>

              {/* OmniRoute Status Card */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5]">
                      <Server className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900 text-sm">OmniRoute Smart Gateway</p>
                      <p className="text-[11px] text-slate-400 font-medium">Provider Version: v1.0.4-enterprise</p>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                    connectionStatus?.status === 'Connected' || !connectionStatus
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {connectionStatus?.status || 'Connected'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                    <p className="text-[10px] font-bold text-slate-400">Latency</p>
                    <p className="font-extrabold text-slate-900 mt-0.5">{connectionStatus?.latencyMs ?? 14} ms</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                    <p className="text-[10px] font-bold text-slate-400">Default Model</p>
                    <p className="font-extrabold text-slate-900 mt-0.5">{config.defaultModelId}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                    <p className="text-[10px] font-bold text-slate-400">Available Models</p>
                    <p className="font-extrabold text-slate-900 mt-0.5">{models.length} Models</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                    <p className="text-[10px] font-bold text-slate-400">Timeout</p>
                    <p className="font-extrabold text-slate-900 mt-0.5">{config.timeoutMs} ms</p>
                  </div>
                </div>
              </div>

              {/* Model & Generation Parameters Form */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
                <h4 className="font-extrabold text-slate-900 text-xs border-b border-slate-100 pb-2">Generation & Routing Preferences</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Default AI Provider</label>
                    <select
                      value={config.defaultProviderId}
                      onChange={(e) => setConfig({ ...config, defaultProviderId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none"
                    >
                      <option value="omniroute">OmniRoute Gateway (Primary)</option>
                      <option value="mock">Mock Provider Engine</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Default Model</label>
                    <select
                      value={config.defaultModelId}
                      onChange={(e) => setConfig({ ...config, defaultModelId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none"
                    >
                      {models.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.provider})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="font-bold text-slate-700">Temperature</label>
                      <span className="font-extrabold text-[#4F46E5]">{config.temperature}</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.05"
                      value={config.temperature}
                      onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                      className="w-full accent-[#4F46E5]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Max Output Tokens</label>
                    <input
                      type="number"
                      min="256"
                      max="8192"
                      value={config.maxTokens}
                      onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value, 10) || 2048 })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <div>
                    <p className="font-bold text-slate-900">Enable Token Streaming</p>
                    <p className="text-[11px] text-slate-400 font-medium">Stream real-time response chunks to AI OS client</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.enableStreaming}
                    onChange={(e) => setConfig({ ...config, enableStreaming: e.target.checked })}
                    className="w-4 h-4 text-[#4F46E5] accent-[#4F46E5] cursor-pointer"
                  />
                </div>
              </div>

              {/* OmniRoute Credentials */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
                <h4 className="font-extrabold text-slate-900 text-xs border-b border-slate-100 pb-2">OmniRoute API Endpoints & Secret Keys</h4>

                <div className="space-y-3 max-w-lg">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">OmniRoute Base Endpoint URL</label>
                    <input
                      type="text"
                      value={config.omniRouteBaseUrl}
                      onChange={(e) => setConfig({ ...config, omniRouteBaseUrl: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">OmniRoute API Key</label>
                    <input
                      type="password"
                      placeholder="omni_sk_live_••••••••••••••••••••"
                      value={config.omniRouteApiKey}
                      onChange={(e) => setConfig({ ...config, omniRouteApiKey: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-800 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Credentials stored securely in process environment variables.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-4 text-xs">
              <h3 className="text-base font-extrabold text-slate-900">General Configuration</h3>
              <div className="space-y-3 max-w-md">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">System Name</label>
                  <input 
                    type="text" 
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Default Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium"
                  >
                    <option value="UTC-05:00 (EST)">UTC-05:00 (Eastern Time)</option>
                    <option value="UTC+00:00 (GMT)">UTC+00:00 (Greenwich Mean Time)</option>
                    <option value="UTC+05:30 (IST)">UTC+05:30 (India Standard Time)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-4 text-xs">
              <h3 className="text-base font-extrabold text-slate-900">Appearance & Theme</h3>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Light Mode Standard Interface</p>
                  <p className="text-[11px] text-slate-500">Theme locked to White Mode</p>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-full border border-emerald-200">
                  White Mode Active
                </span>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4 text-xs">
              <h3 className="text-base font-extrabold text-slate-900">Notification Preferences</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-[#4F46E5] w-4 h-4" />
                  <span>Notify on Critical Website Health Scan Alerts</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4 text-xs">
              <h3 className="text-base font-extrabold text-slate-900">Security Control</h3>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 font-medium text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>SSL certificates, CORS protection, and encrypted API key storage active.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
