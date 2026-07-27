import { useState, useEffect, useCallback } from 'react';
import { AIEngine } from '../core/AIEngine';
import { AIChatRequest, AIChatResponse, AIHealthCheckResult, AIStreamChunk } from '../core/types';
import { AILogger, LogEntry } from '../utils/Logger';
import { ExecutionLog, ExecutionRecord } from '../utils/ExecutionLog';
import { AIConfig } from '../config/AIConfig';
import { ProviderError } from '../errors/ProviderError';

export interface GenerateOptions {
  modelId?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  onChunk?: (chunk: AIStreamChunk, accumulated: string) => void;
}

export function useAI() {
  const [engine] = useState(() => AIEngine.getInstance());
  const [logger] = useState(() => AILogger.getInstance());
  const [executionLog] = useState(() => ExecutionLog.getInstance());
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [executions, setExecutions] = useState<ExecutionRecord[]>([]);
  const [healthStatus, setHealthStatus] = useState<AIHealthCheckResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastError, setLastError] = useState<{ code: string; message: string } | null>(null);

  useEffect(() => {
    // Ensure production OmniRoute provider is bound (avoids stale HMR mock gateway responses)
    engine.getManager().providers.ensureOmniRouteProduction();

    setLogs(logger.getLogs());
    setExecutions(executionLog.getRecords());

    const unsubLogs = logger.subscribe((entry) => {
      setLogs((prev) => [entry, ...prev.slice(0, 100)]);
    });
    const unsubExec = executionLog.subscribe((record) => {
      setExecutions((prev) => [record, ...prev.slice(0, 100)]);
    });

    engine.healthCheck().then(setHealthStatus);

    return () => {
      unsubLogs();
      unsubExec();
    };
  }, [engine, logger, executionLog]);

  const buildRequest = useCallback((promptText: string, options?: GenerateOptions): AIChatRequest => {
    const cfg = AIConfig.getInstance().getConfig();
    return {
      modelId: options?.modelId || cfg.defaultModelId,
      temperature: options?.temperature ?? cfg.temperature,
      maxTokens: options?.maxTokens ?? cfg.maxTokens,
      stream: options?.stream ?? cfg.enableStreaming,
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: 'user',
          content: promptText,
          timestamp: new Date().toISOString(),
        },
      ],
    };
  }, []);

  const generateResponse = useCallback(
    async (promptText: string, modelIdOrOptions?: string | GenerateOptions): Promise<AIChatResponse> => {
      const options: GenerateOptions =
        typeof modelIdOrOptions === 'string'
          ? { modelId: modelIdOrOptions }
          : modelIdOrOptions || {};

      setIsProcessing(true);
      setLastError(null);

      try {
        const request = buildRequest(promptText, options);
        const shouldStream = options.stream ?? AIConfig.getInstance().getConfig().enableStreaming;

        if (shouldStream) {
          let accumulated = '';
          const response = await engine.stream(request, (chunk) => {
            accumulated += chunk.delta.content || '';
            options.onChunk?.(chunk, accumulated);
          });
          return response;
        }

        return await engine.chat(request);
      } catch (err) {
        const code = err instanceof ProviderError ? err.code : 'AI_ENGINE_ERROR';
        const message = err instanceof Error ? err.message : String(err);
        setLastError({ code, message });
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    [engine, buildRequest]
  );

  return {
    engine,
    manager: engine.getManager(),
    logs,
    executions,
    healthStatus,
    isProcessing,
    lastError,
    generateResponse,
    clearLogs: () => {
      logger.clearLogs();
      setLogs([]);
    },
    clearExecutions: () => {
      executionLog.clear();
      setExecutions([]);
    },
    refreshHealth: () => engine.healthCheck().then(setHealthStatus),
  };
}
