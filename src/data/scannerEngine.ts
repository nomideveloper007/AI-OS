import type { WebsiteScanResult } from '../types';

/**
 * Legacy seed scans removed — production scanner stores real results only.
 * Kept export for AppContext bootstrap compatibility.
 */
export const initialScans: WebsiteScanResult[] = [];

/** @deprecated Use SCAN_STEPS from src/scanner */
export { SCAN_STEPS } from '../scanner/core/WebsiteScanner';

/**
 * @deprecated Mock generator removed. Use WebsiteScanner.getInstance().scan(website).
 * Kept as a stub so accidental imports fail loudly at runtime if still called.
 */
export const generateNewScanForWebsite = (): never => {
  throw new Error(
    'generateNewScanForWebsite (mock) has been removed. Use WebsiteScanner.getInstance().scan().'
  );
};
