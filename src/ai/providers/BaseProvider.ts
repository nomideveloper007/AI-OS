import { AIChatRequest, AIChatResponse, AIStreamChunk, AIHealthCheckResult } from '../core/types';
import { AIModel } from '../models/ModelCapabilities';

export abstract class BaseProvider {
  public abstract readonly id: string;
  public abstract readonly name: string;
  public abstract isConnected: boolean;

  public abstract initialize(): Promise<void>;
  public abstract connect(): Promise<void>;
  public abstract disconnect(): Promise<void>;
  public abstract chat(request: AIChatRequest): Promise<AIChatResponse>;
  public abstract stream(request: AIChatRequest, onChunk: (chunk: AIStreamChunk) => void): Promise<AIChatResponse>;
  public abstract listModels(): Promise<AIModel[]>;
  public abstract healthCheck(): Promise<AIHealthCheckResult>;
}
