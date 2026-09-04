import type { Board, Film, Job, Rates } from "./engine";
import type { Bootstrap, Client, QuoteSummary, Settings } from "./defaults";

/**
 * Storage contract shared by the Google Sheets backend and the local file
 * backend. Mirrors the Apps Script API one-to-one.
 */
export interface DocketStore {
  bootstrap(): Promise<Bootstrap>;
  listQuotes(): Promise<QuoteSummary[]>;
  loadQuote(no: string): Promise<Record<string, unknown> | null>;
  saveQuote(job: Job): Promise<{ quote_no: string; updated: boolean; quotes: QuoteSummary[] }>;
  deleteQuote(no: string): Promise<QuoteSummary[]>;
  nextPiNumber(): Promise<string>;
  saveSettings(obj: Settings): Promise<Settings>;
  saveCounters(obj: { quote_next?: number; pi_next?: number }): Promise<{ quote_next: number; pi_next: number }>;
  saveRates(p: { rates?: Rates; boards?: Board[]; films?: Film[] }): Promise<{ rates: Rates; boards: Board[]; films: Film[] }>;
  saveClient(c: Client): Promise<Client[]>;
}

let cached: DocketStore | null = null;

/** Sheets when DOCKET_SHEET_ID is configured, otherwise a local JSON file (dev). */
export async function getStore(): Promise<DocketStore> {
  if (cached) return cached;
  if (process.env.DOCKET_SHEET_ID) {
    const { SheetsStore } = await import("./sheets");
    cached = new SheetsStore();
  } else {
    if (process.env.NODE_ENV === "production" && !process.env.DOCKET_ALLOW_FILE_STORE) {
      throw new Error("DOCKET_SHEET_ID is not set. Configure the Google Sheet before using the docket in production.");
    }
    const { FileStore } = await import("./file-store");
    cached = new FileStore();
  }
  return cached;
}
