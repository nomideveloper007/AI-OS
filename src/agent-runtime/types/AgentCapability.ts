export type AgentRuntimeCapability =
  | 'Website Scan'
  | 'Read Reports'
  | 'Generate Prompt'
  | 'Analyze Data'
  | 'Write Content'
  | 'Send Email'
  | 'Read Database'
  | 'Load Memory'
  | 'Call AI Engine'
  | 'Report Progress';

export const AGENT_RUNTIME_CAPABILITIES: AgentRuntimeCapability[] = [
  'Website Scan',
  'Read Reports',
  'Generate Prompt',
  'Analyze Data',
  'Write Content',
  'Send Email',
  'Read Database',
  'Load Memory',
  'Call AI Engine',
  'Report Progress',
];
