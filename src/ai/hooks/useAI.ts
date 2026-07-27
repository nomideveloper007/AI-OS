import { useState, useEffect } from 'react';
import { AIEngine } from '../core/AIEngine';
import { AIChatRequest, AIChatResponse, AIHealthCheckResult } from '../core/types';
import { AILogger, LogEntry } from '../utils/Logger';
import { AIConfig } from '../config/AIConfig';

export function useAI() {
  const [engine] = useState(() => AIEngine.getInstance());
  const [logger] = useState(() => AILogger.getInstance());
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [healthStatus, setHealthStatus] = useState<AIHealthCheckResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setLogs(logger.getLogs());
    const unsubscribe = logger.subscribe((entry) => {
      setLogs((prev) => [entry, ...prev.slice(0, 100)]);
    });

    // Run health checks
    engine.healthCheck().then(setHealthStatus);

    return () => unsubscribe();
  }, [engine, logger]);

  const generateResponse = async (promptText: string, modelId?: string): Promise<AIChatResponse> => {
    setIsProcessing(true);
    try {
      const request: AIChatRequest = {
        modelId,
        messages: [
          {
            id: `msg-${Date.now()}`,
            role: 'user',
            content: promptText,
            timestamp: new Date().toISOString()
          }
        ]
      };

      const response = await engine.chat(request);
      return response;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    engine,
    manager: engine.getManager(),
    logs,
    healthStatus,
    isProcessing,
    generateResponse,
    clearLogs: () => {
      logger.clearLogs();
      setLogs([]);
    }
  };
}
