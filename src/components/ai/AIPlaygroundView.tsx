import React, { useState } from 'react';
import { useAI } from '../../ai/hooks/useAI';
import { useConversation } from '../../ai/hooks/useConversation';
import { ModelRegistry } from '../../ai/models/ModelRegistry';
import { AIConfig } from '../../ai/config/AIConfig';
import { AIChatResponse } from '../../ai/core/types';
import { 
  Zap, 
  Play, 
  Sliders, 
  Cpu, 
  Clock, 
  FileText, 
  Terminal, 
  RotateCcw, 
  Trash2,
  CheckCircle2,
  Server,
  Activity,
  Code,
  Copy,
  Check
} from 'lucide-react';

interface HistoryItem {
  id: string;
  conversationId: string;
  prompt: string;
  response: string;
  modelId: string;
  providerId: string;
  durationMs: number;
  tokens: number;
  timestamp: string;
}

export const AIPlaygroundView: React.FC = () => {
  const { engine, manager, generateResponse, isProcessing } = useAI();
  const { activeSession } = useConversation();
  const configInstance = AIConfig.getInstance();
  const [config, setConfig] = useState(() => configInstance.getConfig());

  const [promptInput, setPromptInput] = useState('Analyze website performance and provide 3 technical optimization strategies for Next.js SSR apps.');
  const [selectedModelId, setSelectedModelId] = useState(config.defaultModelId);
  const [temperature, setTemperature] = useState(config.temperature);
  const [maxTokens, setMaxTokens] = useState(config.maxTokens);
  const [enableStreaming, setEnableStreaming] = useState(config.enableStreaming);

  const [lastResponse, setLastResponse] = useState<AIChatResponse | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copied, setCopied] = useState(false);

  const models = ModelRegistry.getInstance().getAllModels();
  const activeModel = models.find((m) => m.id === selectedModelId) || models[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim() || isProcessing) return;

    // Update config transiently for playground execution
    configInstance.updateConfig({
      temperature,
      maxTokens,
      enableStreaming
    });

    const startTime = Date.now();
    try {
      const res = await generateResponse(promptInput, selectedModelId);
      setLastResponse(res);

      if (res && res.choices[0]?.message?.content) {
        const item: HistoryItem = {
          id: `hist-${Date.now()}`,
          conversationId: activeSession?.id || `conv-${Date.now()}`,
          prompt: promptInput,
          response: res.choices[0].message.content,
          modelId: res.modelId,
          providerId: res.providerId,
          durationMs: res.durationMs || (Date.now() - startTime),
          tokens: res.usage.totalTokens,
          timestamp: new Date().toLocaleTimeString()
        };
        setHistory((prev) => [item, ...prev]);
      }
    } catch (err: any) {
      manager.logger.error(`Playground request error: ${err.message}`, 'AIPlayground');
    }
  };

  const handleCopyResponse = () => {
    if (lastResponse?.choices[0]?.message?.content) {
      navigator.clipboard.writeText(lastResponse.choices[0].message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] flex-shrink-0 shadow-2xs">
            <Zap className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-extrabold text-slate-900">AI Engine Playground</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                OmniRoute Gateway Ready
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Interactive testbed for model routing, token usage, latency analysis, and prompt generation.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Parameters + Playground + Response */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Model & Generation Parameters (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4 text-xs">
            <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#4F46E5]" />
              <h2 className="font-extrabold text-slate-900 text-sm">Model Parameters</h2>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Model</label>
              <select
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
                <span className="font-extrabold text-[#4F46E5]">{temperature}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-[#4F46E5]"
              />
              <p className="text-[10px] text-slate-400 mt-1">Lower values are deterministic; higher values creative.</p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Max Tokens</label>
              <input
                type="number"
                min="256"
                max="4096"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value, 10) || 2048)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900">Token Streaming</p>
                <p className="text-[10px] text-slate-400 font-medium">Real-time delta streaming</p>
              </div>
              <input
                type="checkbox"
                checked={enableStreaming}
                onChange={(e) => setEnableStreaming(e.target.checked)}
                className="w-4 h-4 text-[#4F46E5] accent-[#4F46E5] cursor-pointer"
              />
            </div>
          </div>

          {/* Active Model Capabilities Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3 text-xs">
            <h3 className="font-extrabold text-slate-900 border-b border-slate-100 pb-2">Active Model Info</h3>
            <p className="font-extrabold text-slate-800">{activeModel.name}</p>
            <p className="text-slate-500 font-medium leading-relaxed">{activeModel.description}</p>

            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-center">
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/60">
                <p className="text-[10px] font-bold text-slate-400">Context Window</p>
                <p className="font-extrabold text-slate-900 mt-0.5">{activeModel.capabilities.contextWindow.toLocaleString()} tokens</p>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/60">
                <p className="text-[10px] font-bold text-slate-400">Provider</p>
                <p className="font-extrabold text-[#4F46E5] mt-0.5 uppercase">{activeModel.provider}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Prompt Execution & Output Viewer (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Playground Form */}
          <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-extrabold text-slate-900">Prompt Sandbox</h2>
              <span className="text-xs font-mono font-bold text-slate-400">
                Session: {activeSession?.id || 'conv-default'}
              </span>
            </div>

            <div>
              <textarea
                rows={4}
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Enter prompt instruction for AI Engine..."
                className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
              ></textarea>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPromptInput('')}
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Prompt
              </button>

              <button
                type="submit"
                disabled={isProcessing || !promptInput.trim()}
                className="px-5 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs transition-all shadow-sm cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" />
                {isProcessing ? 'Executing Model...' : 'Execute Prompt'}
              </button>
            </div>
          </form>

          {/* Response & Metrics Viewer */}
          {lastResponse && (
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-5 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-[#4F46E5]" />
                  <h3 className="text-sm font-extrabold text-slate-900">AI Response Output</h3>
                </div>

                <button
                  onClick={handleCopyResponse}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy Content'}
                </button>
              </div>

              {/* Execution Metrics Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <p className="text-[10px] font-bold text-slate-400">Total Tokens</p>
                  <p className="font-extrabold text-slate-900 mt-0.5">{lastResponse.usage.totalTokens} tokens</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">({lastResponse.usage.promptTokens} in / {lastResponse.usage.completionTokens} out)</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <p className="text-[10px] font-bold text-slate-400">Latency / Execution Time</p>
                  <p className="font-extrabold text-indigo-600 mt-0.5">{lastResponse.durationMs} ms</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <p className="text-[10px] font-bold text-slate-400">Provider & Model</p>
                  <p className="font-extrabold text-slate-900 mt-0.5 truncate">{lastResponse.providerId} / {lastResponse.modelId}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <p className="text-[10px] font-bold text-slate-400">Response Status</p>
                  <p className="font-extrabold text-emerald-600 mt-0.5">200 OK (stop)</p>
                </div>
              </div>

              {/* Content Textarea */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 leading-relaxed whitespace-pre-wrap font-mono">
                {lastResponse.choices[0]?.message?.content}
              </div>
            </div>
          )}

          {/* Local Chat History List */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Local Playground History</h3>
                <p className="text-xs text-slate-400 font-medium">Recent executions, latency logs, and token metrics</p>
              </div>

              {history.length > 0 && (
                <button
                  onClick={() => setHistory([])}
                  className="text-xs font-bold text-slate-400 hover:text-rose-600 cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear History
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <p className="text-xs font-semibold text-slate-400 text-center py-6">No playground execution history yet.</p>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-700">
                      <span className="font-mono text-indigo-600">{item.modelId} ({item.providerId})</span>
                      <span className="text-[10px] text-slate-400">{item.timestamp} • {item.durationMs}ms • {item.tokens} tokens</span>
                    </div>
                    <p className="font-bold text-slate-900">Q: {item.prompt}</p>
                    <p className="text-slate-600 font-medium line-clamp-2 bg-white p-2.5 rounded-lg border border-slate-100">{item.response}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
