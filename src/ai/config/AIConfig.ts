import { DEFAULT_PROVIDER_ID, DEFAULT_MODEL_ID, DEFAULT_TIMEOUT_MS, DEFAULT_MAX_RETRIES } from './constants';

export interface AIConfigOptions {
  defaultProviderId: string;
  defaultModelId: string;
  timeoutMs: number;
  maxRetries: number;
  enableStreaming: boolean;
  enableLogging: boolean;
  debugMode: boolean;
  omniRouteBaseUrl: string;
  omniRouteApiKey: string;
  temperature: number;
  maxTokens: number;
}

const STORAGE_KEY = 'aios.omniroute.config';

function readEnv(name: string): string | undefined {
  // Vite browser/runtime env (VITE_* only)
  try {
    const meta = import.meta as ImportMeta & { env?: Record<string, string | undefined> };
    const fromVite = meta.env?.[name];
    if (typeof fromVite === 'string' && fromVite.length > 0) return fromVite;
  } catch {
    // ignore — non-Vite contexts
  }

  if (typeof process !== 'undefined' && process.env?.[name]) {
    return process.env[name];
  }
  return undefined;
}

const LEGACY_MODEL_ALIASES: Record<string, string> = {
  'omniroute-auto': DEFAULT_MODEL_ID,
  'omniroute': DEFAULT_MODEL_ID,
  'OmniRoute Smart Router Model': DEFAULT_MODEL_ID,
};

function migratePersisted(parsed: Partial<AIConfigOptions>): Partial<AIConfigOptions> {
  const next = { ...parsed };

  if (next.defaultModelId && LEGACY_MODEL_ALIASES[next.defaultModelId]) {
    next.defaultModelId = LEGACY_MODEL_ALIASES[next.defaultModelId];
  }

  // Old cloud placeholder / missing proxy path → local Vite proxy
  if (
    !next.omniRouteBaseUrl ||
    next.omniRouteBaseUrl.includes('api.omniroute.ai') ||
    next.omniRouteBaseUrl === 'https://api.omniroute.ai/v1'
  ) {
    next.omniRouteBaseUrl = '/omniroute/v1';
  }

  if (!next.defaultProviderId || next.defaultProviderId === 'mock') {
    next.defaultProviderId = DEFAULT_PROVIDER_ID;
  }

  return next;
}

function loadPersisted(): Partial<AIConfigOptions> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<AIConfigOptions>;
    if (!parsed || typeof parsed !== 'object') return {};
    const migrated = migratePersisted(parsed);
    // Persist migration so Playground stops selecting legacy mock models
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, ...migrated }));
    return migrated;
  } catch {
    return {};
  }
}

export class AIConfig {
  private static instance: AIConfig;
  private options: AIConfigOptions;

  private constructor() {
    const envBaseUrl =
      readEnv('VITE_OMNIROUTE_BASE_URL') ||
      readEnv('OMNIROUTE_BASE_URL') ||
      '/omniroute/v1';
    const envApiKey =
      readEnv('VITE_OMNIROUTE_API_KEY') ||
      readEnv('OMNIROUTE_API_KEY') ||
      '';
    const envModel =
      readEnv('VITE_DEFAULT_MODEL') ||
      readEnv('DEFAULT_MODEL') ||
      DEFAULT_MODEL_ID;
    const envTimeout = Number(
      readEnv('VITE_REQUEST_TIMEOUT') || readEnv('REQUEST_TIMEOUT') || DEFAULT_TIMEOUT_MS
    );

    const persisted = loadPersisted();

    this.options = {
      defaultProviderId: persisted.defaultProviderId || DEFAULT_PROVIDER_ID,
      defaultModelId: persisted.defaultModelId || envModel,
      timeoutMs: persisted.timeoutMs || (Number.isFinite(envTimeout) ? envTimeout : DEFAULT_TIMEOUT_MS),
      maxRetries: persisted.maxRetries ?? DEFAULT_MAX_RETRIES,
      enableStreaming: persisted.enableStreaming ?? true,
      enableLogging: persisted.enableLogging ?? true,
      debugMode: persisted.debugMode ?? true,
      omniRouteBaseUrl: persisted.omniRouteBaseUrl || envBaseUrl,
      omniRouteApiKey: persisted.omniRouteApiKey ?? envApiKey,
      temperature: persisted.temperature ?? 0.7,
      maxTokens: persisted.maxTokens ?? 2048,
    };
  }

  public static getInstance(): AIConfig {
    if (!AIConfig.instance) {
      AIConfig.instance = new AIConfig();
    }
    return AIConfig.instance;
  }

  public getConfig(): AIConfigOptions {
    return { ...this.options };
  }

  public updateConfig(partial: Partial<AIConfigOptions>): void {
    this.options = { ...this.options, ...partial };
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.options));
      } catch {
        // ignore quota / private mode
      }
    }
  }
}
