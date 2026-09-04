import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Board, Film, Job, Rates } from "./engine";
import { FIELDS, DEFAULT_BOARDS, DEFAULT_FILMS, DEFAULT_RATES, DEFAULT_SETTINGS } from "./defaults";
import type { Bootstrap, Client, QuoteSummary, Settings } from "./defaults";
import type { DocketStore } from "./store";

type Db = {
  settings: Settings;
  rates: Rates;
  boards: Board[];
  films: Film[];
  clients: Client[];
  quotes: Record<string, unknown>[];
};

const FILE = path.join(process.cwd(), ".data", "docket.json");

/**
 * Local development backend: the same shapes as the sheet, in one JSON file.
 * Never used in production unless DOCKET_ALLOW_FILE_STORE is set.
 */
export class FileStore implements DocketStore {
  private async read(): Promise<Db> {
    try {
      return JSON.parse(await readFile(FILE, "utf8"));
    } catch {
      return {
        settings: { ...DEFAULT_SETTINGS },
        rates: { ...DEFAULT_RATES },
        boards: DEFAULT_BOARDS.map((b) => ({ ...b })),
        films: DEFAULT_FILMS.map((f) => ({ ...f })),
        clients: [],
        quotes: [],
      };
    }
  }
  private async write(db: Db) {
    await mkdir(path.dirname(FILE), { recursive: true });
    await writeFile(FILE, JSON.stringify(db, null, 2));
  }
  private summaries(db: Db): QuoteSummary[] {
    return [...db.quotes].reverse().map((o) => ({
      quote_no: String(o.quote_no || ""),
      date: String(o.date || ""),
      status: String(o.status || ""),
      client_name: String(o.client_name || ""),
      product: String(o.product || ""),
      qty: Number(o.qty || 0),
      ddp: Number(o.ddp || 0),
    }));
  }

  async bootstrap(): Promise<Bootstrap> {
    const db = await this.read();
    return { settings: db.settings, rates: db.rates, boards: db.boards, films: db.films, clients: db.clients, quotes: this.summaries(db) };
  }
  async listQuotes() {
    return this.summaries(await this.read());
  }
  async loadQuote(no: string) {
    const db = await this.read();
    return db.quotes.find((q) => String(q.quote_no).trim() === String(no).trim()) ?? null;
  }
  async saveQuote(job: Job) {
    const db = await this.read();
    if (!job.quote_no) {
      const n = Number(db.settings.quote_next || 1);
      job.quote_no = String(db.settings.quote_prefix || "QT-") + String(n).padStart(3, "0");
      db.settings.quote_next = n + 1;
    }
    const row: Record<string, unknown> = {};
    for (const k of FIELDS) {
      const v = (job as unknown as Record<string, unknown>)[k];
      row[k] = k === "overrides" || k === "vendors" ? JSON.stringify(v ?? {}) : Array.isArray(v) ? v.join("|") : (v ?? "");
    }
    const idx = db.quotes.findIndex((q) => String(q.quote_no).trim() === job.quote_no.trim());
    if (idx >= 0) db.quotes[idx] = row;
    else db.quotes.push(row);
    await this.write(db);
    return { quote_no: job.quote_no, updated: idx >= 0, quotes: this.summaries(db) };
  }
  async deleteQuote(no: string) {
    const db = await this.read();
    db.quotes = db.quotes.filter((q) => String(q.quote_no).trim() !== String(no).trim());
    await this.write(db);
    return this.summaries(db);
  }
  async nextPiNumber() {
    const db = await this.read();
    const n = Number(db.settings.pi_next || 1);
    const no = String(db.settings.pi_prefix || "PI-") + String(n).padStart(3, "0");
    db.settings.pi_next = n + 1;
    await this.write(db);
    return no;
  }
  async saveSettings(obj: Settings) {
    const db = await this.read();
    for (const k of Object.keys(obj)) {
      if (k === "quote_next" || k === "pi_next") continue;
      db.settings[k] = obj[k];
    }
    await this.write(db);
    return db.settings;
  }
  async saveCounters(obj: { quote_next?: number; pi_next?: number }) {
    const db = await this.read();
    if (obj.quote_next !== undefined) db.settings.quote_next = Number(obj.quote_next) || 1;
    if (obj.pi_next !== undefined) db.settings.pi_next = Number(obj.pi_next) || 1;
    await this.write(db);
    return { quote_next: Number(db.settings.quote_next), pi_next: Number(db.settings.pi_next) };
  }
  async saveRates(p: { rates?: Rates; boards?: Board[]; films?: Film[] }) {
    const db = await this.read();
    if (p.rates) db.rates = p.rates;
    if (p.boards) db.boards = p.boards.map((b) => ({ name: b.name, pkr_per_kg: Number(b.pkr_per_kg) || 0, note: b.note || "" }));
    if (p.films) db.films = p.films.map((f) => ({ name: f.name, pkr_per_sqin: Number(f.pkr_per_sqin) || 0, note: f.note || "" }));
    await this.write(db);
    return { rates: db.rates, boards: db.boards, films: db.films };
  }
  async saveClient(c: Client) {
    const db = await this.read();
    const idx = db.clients.findIndex((x) => x.name.trim() === c.name.trim());
    const row = { name: c.name || "", contact: c.contact || "", country: c.country || "", email: c.email || "", address: c.address || "" };
    if (idx >= 0) db.clients[idx] = row;
    else db.clients.push(row);
    await this.write(db);
    return db.clients;
  }
}
