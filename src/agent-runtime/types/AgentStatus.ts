export type AgentRuntimeStatus =
  | 'Offline'
  | 'Starting'
  | 'Idle'
  | 'Busy'
  | 'Waiting'
  | 'Paused'
  | 'Completed'
  | 'Error'
  | 'Recovering';

export const AGENT_RUNTIME_STATUSES: AgentRuntimeStatus[] = [
  'Offline',
  'Starting',
  'Idle',
  'Busy',
  'Waiting',
  'Paused',
  'Completed',
  'Error',
  'Recovering',
];
