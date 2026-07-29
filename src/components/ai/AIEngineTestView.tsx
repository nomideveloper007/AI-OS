import React, { useState } from 'react';
import { useAI } from '../../ai/hooks/useAI';
import { useConversation } from '../../ai/hooks/useConversation';
import { 
  Cpu, 
  Server, 
  Layers, 
  FileCode, 
  MessageSquare, 
  Database, 
  Terminal, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  RefreshCw, 
  Activity, 
  ShieldCheck, 
  Zap, 
  Trash2,
  Lock,
  Code,
  ChevronDown
} from 'lucide-react';
import { MicButton } from '../../assistant/components/MicButton';
import { useSaira } from '../../assistant/hooks/useSaira';

export const AIEngineTestView: React.FC = () => {
  const { manager, logs, healthStatus, isProcessing, generateResponse, clearLogs } = useAI();
  const { messages, tokenCount, sendMessage, clearMessages } = useConversation();
  const { voiceState, startCall } = useSaira();

  const [testPrompt, setTestPrompt] = useState('Analyze website architecture and summarize technical readiness for AI workforce integration.');
  const [selectedModelId, setSelectedModelId] = useState('auto/best-chat');
  const [lastResponseText, setLastResponseText] = useState<string | null>(null);

  const providers = manager.providers.getAllProviders();
  const models = manager.models.getAllModels();
  const templates = manager.prompts.getAllTemplates();
  const memories = manager.memory.getAllMemories();
  const tools = manager.tools.getAllTools();
  const sessions = manager.conversations.getAllSessions();

  const activeModel = manager.models.getModel(selectedModelId) || models[0];
  const activeProvider = activeModel ? manager.providers.getProvider(activeModel.provider) : providers[0];

  const handleRunTest = async () => {
    if (!testPrompt.trim() || isProcessing) return;
    sendMessage(testPrompt, 'user');

    const res = await generateResponse(testPrompt, selectedModelId);
    if (res?.choices[0]?.message?.content) {
      const content = res.choices[0].message.content;
      setLastResponseText(content);
      sendMessage(content, 'assistant');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] flex-shrink-0 shadow-2xs">
            <Cpu className="w-7 h-7 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-extrabold text-slate-900 leading-tight">AI Engine Architecture</h1>
              <span className="px-3 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Architecture Operational
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Enterprise core subsystem facade, model router, prompt manager, provider registry, and memory interfaces.
            </p>
          </div>
        </div>

        <button
          onClick={handleRunTest}
          disabled={isProcessing}
          className="px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 whitespace-nowrap self-start md:self-auto"
        >
          <Play className="w-4 h-4 fill-current" />
          {isProcessing ? 'Processing Request...' : 'Test AI Engine'}
        </button>
      </div>

      {/* Metrics Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">Provider Status</span>
            <Server className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-base font-extrabold text-slate-900 truncate">{activeProvider?.name || 'Mock Provider'}</p>
          <p className="text-[11px] font-bold text-emerald-600">CONNECTED</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">Current Model</span>
            <Cpu className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-base font-extrabold text-slate-900 truncate">{activeModel?.name || 'Mock GPT-4o'}</p>
          <p className="text-[11px] font-bold text-indigo-600">{activeModel?.capabilities.contextWindow.toLocaleString()} tokens</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">Prompts Loaded</span>
            <FileCode className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-xl font-extrabold text-slate-900">{templates.length}</p>
          <p className="text-[11px] font-semibold text-slate-400">Templates Ready</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">Conversations</span>
            <MessageSquare className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-xl font-extrabold text-slate-900">{sessions.length}</p>
          <p className="text-[11px] font-semibold text-slate-400">{tokenCount} tokens est.</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">Memory Status</span>
            <Database className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-xl font-extrabold text-slate-900">{memories.length}</p>
          <p className="text-[11px] font-semibold text-emerald-600">Schema Ready</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">Registered Tools</span>
            <Code className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-xl font-extrabold text-slate-900">{tools.length}</p>
          <p className="text-[11px] font-semibold text-slate-400">Tools Abstracted</p>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Test Playground & Pipeline Execution */}
        <div className="lg:col-span-2 space-y-6">
          {/* Execution Playground */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">AI Engine Test Playground</h3>
                <p className="text-xs text-slate-400 font-medium">
                  {activeModel?.provider === 'omniroute'
                    ? 'Test prompt compilation, model routing, and production gateway execution pipeline'
                    : 'Test prompt compilation, model routing, and mock execution pipeline'}
                </p>
              </div>
              <span className={`px-2.5 py-0.5 font-mono text-[11px] font-bold rounded-full ${
                activeModel?.provider === 'omniroute'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs'
                  : 'bg-slate-100 text-slate-700'
              }`}>
                {activeModel?.provider === 'omniroute' ? 'OmniRoute Gateway' : 'Mock Engine Mode'}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Model</label>
                <select
                  value={selectedModelId}
                  onChange={(e) => setSelectedModelId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.provider}) - {m.capabilities.contextWindow.toLocaleString()} tokens
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Test Prompt Input</label>
                <textarea
                  rows={3}
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400">
                  Estimated Tokens: {tokenCount} tokens
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={clearMessages}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear Chat
                  </button>
                  <div className="flex items-center gap-2">
                    <MicButton voiceState={voiceState} onClick={startCall} className="py-2 px-3" />
                    <button
                      onClick={handleRunTest}
                      disabled={isProcessing}
                      className="px-4 py-1.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Execute Request
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Conversation Log Preview */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h4 className="text-xs font-extrabold text-slate-900">Active Conversation Trajectory</h4>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 max-h-72 overflow-y-auto custom-scrollbar">
                {messages.length === 0 ? (
                  <p className="text-xs font-semibold text-slate-400 text-center py-6">
                    No messages in trajectory yet. Click "Execute Request" above to test.
                  </p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-xl text-xs space-y-1 ${
                        msg.role === 'user'
                          ? 'bg-indigo-50/70 border border-indigo-100 text-slate-800 ml-6'
                          : 'bg-white border border-slate-200 text-slate-900 mr-6 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-extrabold">
                        <span className={msg.role === 'user' ? 'text-[#4F46E5]' : 'text-emerald-600'}>
                          {msg.role.toUpperCase()}
                        </span>
                        <span className="text-slate-400">{msg.timestamp}</span>
                      </div>
                      <p className="font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Model Registry Cards */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900">Registered AI Models Architecture</h3>
              <span className="text-xs font-bold text-slate-400">{models.length} Models Registered</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {models.map((m) => (
                <div key={m.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900">{m.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-[#4F46E5] border border-indigo-100 uppercase">
                      {m.provider}
                    </span>
                  </div>
                  <p className="text-slate-500 font-medium leading-relaxed">{m.description}</p>
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {m.capabilities.supportsVision && <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded text-[10px]">Vision</span>}
                    {m.capabilities.supportsTools && <span className="px-2 py-0.5 bg-sky-50 text-sky-700 font-bold rounded text-[10px]">Tools</span>}
                    {m.capabilities.supportsReasoning && <span className="px-2 py-0.5 bg-purple-50 text-purple-700 font-bold rounded text-[10px]">Reasoning</span>}
                    {m.capabilities.supportsStreaming && <span className="px-2 py-0.5 bg-amber-50 text-amber-700 font-bold rounded text-[10px]">Streaming</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Providers, Prompts & System Terminal Logs */}
        <div className="space-y-6">
          {/* Provider Registry */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900">Available AI Providers</h3>
              <span className="text-xs font-bold text-slate-400">{providers.length} Providers</span>
            </div>

            <div className="space-y-2 text-xs">
              {providers.map((p) => (
                <div key={p.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Server className="w-4 h-4 text-indigo-600" />
                    <div>
                      <p className="font-extrabold text-slate-900">{p.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">ID: {p.id}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    p.isConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {p.isConnected ? 'Active' : 'Standby'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Prompt Templates */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900">Loaded Prompt Templates</h3>
              <span className="text-xs font-bold text-slate-400">{templates.length} Templates</span>
            </div>

            <div className="space-y-2.5 text-xs">
              {templates.map((tpl) => (
                <div key={tpl.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{tpl.name}</span>
                    <span className="px-2 py-0.5 bg-indigo-50 text-[#4F46E5] font-extrabold text-[10px] rounded">
                      v{tpl.version}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    {tpl.variables.map((v) => (
                      <span key={v} className="px-1.5 py-0.5 bg-slate-200 text-slate-700 font-mono text-[10px] rounded">
                        {`{{${v}}}`}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live System Terminal Logs */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-extrabold text-slate-900">AI Engine Event Logs</h3>
              </div>
              <button
                onClick={clearLogs}
                className="text-[11px] font-bold text-slate-400 hover:text-rose-600 cursor-pointer"
              >
                Clear
              </button>
            </div>

            <div className="p-3.5 bg-slate-950 text-slate-100 rounded-xl font-mono text-[11px] space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
              {logs.length === 0 ? (
                <p className="text-slate-500 italic">No events logged yet.</p>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="leading-tight space-x-2">
                    <span className="text-slate-500">{log.timestamp}</span>
                    <span className={`font-bold ${
                      log.level === 'ERROR' ? 'text-rose-400' : log.level === 'WARN' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      [{log.level}]
                    </span>
                    <span className="text-indigo-300">[{log.source}]</span>
                    <span className="text-slate-200">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
