import type { WebsiteScanResult } from '../../types';
import type { RawScanRecord } from '../types/RawScan';
import type { ScanSnapshot } from '../types/ScanSnapshot';

const SCAN_KEY = 'aios.scanner.scans';
const RAW_KEY = 'aios.scanner.raw';
const SNAP_KEY = 'aios.scanner.snapshots';
const HISTORY_KEY = 'aios.scanner.history';

function loadArray<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveArray<T>(key: string, items: T[], max: number): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(items.slice(0, max)));
  } catch {
    // ignore quota
  }
}

export class ScanRepository {
  private static instance: ScanRepository;

  public static getInstance(): ScanRepository {
    if (!ScanRepository.instance) ScanRepository.instance = new ScanRepository();
    return ScanRepository.instance;
  }

  public saveProcessed(scan: WebsiteScanResult): WebsiteScanResult {
    const list = this.listProcessed().filter((s) => s.id !== scan.id);
    list.unshift(scan);
    saveArray(SCAN_KEY, list, 100);
    const history = loadArray<string>(HISTORY_KEY);
    history.unshift(scan.id);
    saveArray(HISTORY_KEY, Array.from(new Set(history)), 200);
    return scan;
  }

  public listProcessed(websiteId?: string): WebsiteScanResult[] {
    const all = loadArray<WebsiteScanResult>(SCAN_KEY);
    return websiteId ? all.filter((s) => s.website_id === websiteId) : all;
  }

  public getProcessed(id: string): WebsiteScanResult | undefined {
    return this.listProcessed().find((s) => s.id === id);
  }

  public saveRaw(raw: RawScanRecord): RawScanRecord {
    const list = loadArray<RawScanRecord>(RAW_KEY).filter((r) => r.id !== raw.id);
    list.unshift(raw);
    // Trim HTML bodies for older raw records to save space
    const trimmed = list.slice(0, 40).map((r, idx) =>
      idx === 0
        ? r
        : {
            ...r,
            homepage: { ...r.homepage, body: (r.homepage.body || '').slice(0, 50_000) },
          }
    );
    saveArray(RAW_KEY, trimmed, 40);
    return raw;
  }

  public listRaw(websiteId?: string): RawScanRecord[] {
    const all = loadArray<RawScanRecord>(RAW_KEY);
    return websiteId ? all.filter((r) => r.websiteId === websiteId) : all;
  }

  public saveSnapshot(snap: ScanSnapshot): ScanSnapshot {
    const list = loadArray<ScanSnapshot>(SNAP_KEY).filter((s) => s.id !== snap.id);
    list.unshift(snap);
    saveArray(SNAP_KEY, list, 150);
    return snap;
  }

  public listSnapshots(websiteId?: string): ScanSnapshot[] {
    const all = loadArray<ScanSnapshot>(SNAP_KEY);
    return websiteId ? all.filter((s) => s.websiteId === websiteId) : all;
  }

  public listHistoryIds(): string[] {
    return loadArray<string>(HISTORY_KEY);
  }
}
