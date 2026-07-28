import { supabase } from './supabaseClient';

export const SYNC_KEYS = [
  'aios.agentruntime.agents',
  'aios.agentruntime.executions',
  'aios.agentruntime.messages',
  'aios.agentruntime.heartbeats',
  'aios.scanner.scans',
  'aios.execution.log',
  'aios.config',
  'aios.seo.history',
  'aios.seo.reports',
  'aios.seo.tasks',
  'aios.planning.history',
  'aios.intelligence.insights',
  'aios.intelligence.snapshots',
  'aios.intelligence.context',
  'aios.collaboration.sessions',
  'aios.taskengine.tasks',
  'aios.taskengine.executions',
  'aios.taskengine.queue',
  'aios.orchestrator.missions',
  'aios.orchestrator.mission_history',
  'aios.omniroute.config',
  'aios.websites'
];

const originalSetItem = typeof window !== 'undefined' ? window.localStorage.setItem : null;
const originalRemoveItem = typeof window !== 'undefined' ? window.localStorage.removeItem : null;

// Monkey patch localStorage to sync changes to Supabase
if (typeof window !== 'undefined' && supabase && originalSetItem && originalRemoveItem) {
  window.localStorage.setItem = function (key: string, value: string) {
    originalSetItem.apply(this, [key, value]);
    if (SYNC_KEYS.includes(key)) {
      void saveToCloud(key, value);
    }
  };

  window.localStorage.removeItem = function (key: string) {
    originalRemoveItem.apply(this, [key]);
    if (SYNC_KEYS.includes(key)) {
      void deleteFromCloud(key);
    }
  };
}

async function saveToCloud(key: string, value: string) {
  if (!supabase) return;
  try {
    let parsedValue;
    try {
      parsedValue = JSON.parse(value);
    } catch {
      parsedValue = value;
    }

    const { error } = await supabase
      .from('ai_os_storage')
      .upsert({
        key,
        value: parsedValue,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error(`[Supabase Sync] Error saving key "${key}":`, error.message);
    } else {
      console.log(`[Supabase Sync] Saved key "${key}" to cloud.`);
    }
  } catch (err) {
    console.error(`[Supabase Sync] Unexpected error saving key "${key}":`, err);
  }
}

async function deleteFromCloud(key: string) {
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from('ai_os_storage')
      .delete()
      .eq('key', key);

    if (error) {
      console.error(`[Supabase Sync] Error deleting key "${key}":`, error.message);
    } else {
      console.log(`[Supabase Sync] Deleted key "${key}" from cloud.`);
    }
  } catch (err) {
    console.error(`[Supabase Sync] Unexpected error deleting key "${key}":`, err);
  }
}

export async function syncAllFromCloud() {
  if (!supabase || typeof window === 'undefined' || !originalSetItem) return;
  console.log('[Supabase Sync] Starting cloud sync...');
  try {
    const { data, error } = await supabase
      .from('ai_os_storage')
      .select('key, value');

    if (error) {
      console.error('[Supabase Sync] Sync failed:', error.message);
      return;
    }

    if (data && data.length > 0) {
      for (const row of data) {
        const valStr = typeof row.value === 'string' ? row.value : JSON.stringify(row.value);
        originalSetItem.call(window.localStorage, row.key, valStr);
      }
      console.log(`[Supabase Sync] Sync completed. Restored ${data.length} keys from cloud.`);
    } else {
      console.log('[Supabase Sync] No keys found in cloud storage.');
    }
  } catch (err) {
    console.error('[Supabase Sync] Unexpected sync error:', err);
  }
}
