import { JWT } from "google-auth-library";
import type { Board, Film, Job, Rates } from "./engine";
import { FIELDS, TAB } from "./defaults";
import type { Bootstrap, Client, QuoteSummary, Settings } from "./defaults";
import type { DocketStore } from "./store";

/**
 * Google Sheets backend. Same six tabs and the same column order as the
 * Apps Script version, so the existing sheet keeps working unchanged.
 *
 * Auth: a service account (DOCKET_SA_EMAIL / DOCKET_SA_KEY) that the sheet
 * owner has shared the spreadsheet with as Editor.
 */
const API = "https://sheets.googleapis.com/v4/spreadsheets";
type Row = (string | number)[];

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

export class SheetsStore implements DocketStore {
  private id = env("DOCKET_SHEET_ID");
  private jwt = new JWT({
    email: env("DOCKET_SA_EMAIL"),
    key: env("DOCKET_SA_KEY").replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  private sheetIds: Record<string, number> | null = null;

  private async req<T>(path: string, init?: RequestInit): Promise<T> {
    const { token } = await this.jwt.getAccessToken();
    const r = await fetch(`${API}/${this.id}${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(init?.headers || {}) },
      cache: "no-store",
    });
    if (!r.ok) {
      const text = await r.text();
      throw new Error(`Sheets API ${r.status}: ${text.slice(0, 300)}`);
    }
    return (await r.json()) as T;
  }

  private async values(range: string): Promise<Row[]> {
    const r = await this.req<{ values?: Row[] }>(`/values/${encodeURIComponent(range)}?valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING`);
    return r.values ?? [];
  }
  private async update(range: string, values: Row[]) {
    await this.req(`/values/${encodeURIComponent(range)}?valueInputOption=RAW`, {
      method: "PUT",
      body: JSON.stringify({ range, majorDimension: "ROWS", values }),
    });
  }
  private async clear(range: string) {
    await this.req(`/values/${encodeURIComponent(range)}:clear`, { method: "POST", body: "{}" });
  }
  private async sheetId(name: string): Promise<number> {
    if (!this.sheetIds) {
      const meta = await this.req<{ sheets: { properties: { sheetId: number; title: string } }[] }>("?fields=sheets.properties");
      this.sheetIds = Object.fromEntries(meta.sheets.map((s) => [s.properties.title, s.properties.sheetId]));
    }
    const id = this.sheetIds[name];
    if (id === undefined) throw new Error(`Storage tab "${name}" is missing. Run "Set up / repair storage" in the sheet.`);
    return id;
  }

  /* ---- kv / table helpers (Settings, Rates, Boards, Films, Clients) ---- */
  private async kvRead(tab: string): Promise<Record<string, string | number>> {
    const rows = await this.values(`${tab}!A2:B`);
    const o: Record<string, string | number> = {};
    for (const r of rows) if (String(r[0] ?? "").trim()) o[String(r[0]).trim()] = r[1] ?? "";
    return o;
  }
  private async kvWrite(tab: string, obj: Record<string, unknown>) {
    const rows: Row[] = Object.keys(obj).map((k) => [k, obj[k] as string | number]);
    if (!rows.length) return;
    await this.clear(`${tab}!A2:B`);
    await this.update(`${tab}!A2:B${rows.length + 1}`, rows);
  }
  private async tableRead<T>(tab: string): Promise<T[]> {
    const rows = await this.values(`${tab}!A1:Z`);
    if (rows.length < 2) return [];
    const head = rows[0].map((h) => String(h).trim());
    return rows
      .slice(1)
      .filter((r) => String(r[0] ?? "").trim() !== "")
      .map((r) => {
        const o: Record<string, unknown> = {};
        head.forEach((h, i) => (o[h] = r[i] ?? ""));
        return o as T;
      });
  }
  private async tableWrite(tab: string, headers: string[], rows: Row[]) {
    await this.clear(`${tab}!A1:Z`);
    await this.update(`${tab}!A1:${String.fromCharCode(64 + headers.length)}${rows.length + 1}`, [headers, ...rows]);
  }

  /* ---- Quotes ---- */
  private async quotesTable(): Promise<{ head: string[]; rows: Row[] }> {
    const rows = await this.values(`${TAB.QUOTES}!A1:ZZ`);
    const head = (rows[0] ?? []).map((h) => String(h).trim()).filter((h) => h !== "");
    return { head, rows: rows.slice(1) };
  }
  private async migrateHeader(head: string[]): Promise<string[]> {
    const missing = FIELDS.filter((f) => !head.includes(f));
    if (!missing.length) return head;
    const next = [...head, ...missing];
    await this.update(`${TAB.QUOTES}!A1:${colName(next.length)}1`, [next]);
    return next;
  }
  private toSummary(head: string[], r: Row): QuoteSummary {
    const o: Record<string, unknown> = {};
    head.forEach((h, j) => (o[h] = r[j]));
    return {
      quote_no: String(o.quote_no || ""),
      date: dstr(o.date),
      status: String(o.status || ""),
      client_name: String(o.client_name || ""),
      product: String(o.product || ""),
      qty: Number(o.qty || 0),
      ddp: Number(o.ddp || 0),
    };
  }

  async bootstrap(): Promise<Bootstrap> {
    const [settings, rates, boards, films, clients, quotes] = await Promise.all([
      this.kvRead(TAB.SET),
      this.kvRead(TAB.RATES),
      this.tableRead<Board>(TAB.BOARDS),
      this.tableRead<Film>(TAB.FILMS),
      this.tableRead<Client>(TAB.CLIENTS),
      this.listQuotes(),
    ]);
    return { settings, rates, boards, films, clients, quotes };
  }
  async listQuotes(): Promise<QuoteSummary[]> {
    const { head, rows } = await this.quotesTable();
    const out: QuoteSummary[] = [];
    for (let i = rows.length - 1; i >= 0; i--) {
      if (!rows[i][0]) continue;
      out.push(this.toSummary(head, rows[i]));
    }
    return out;
  }
  async loadQuote(no: string) {
    const { head, rows } = await this.quotesTable();
    const r = rows.find((row) => String(row[0] ?? "").trim() === String(no).trim());
    if (!r) return null;
    const o: Record<string, unknown> = {};
    head.forEach((h, j) => (o[h] = h === "date" ? dstr(r[j]) : (r[j] ?? "")));
    return o;
  }
  async saveQuote(job: Job) {
    let { head } = await this.quotesTable();
    head = await this.migrateHeader(head);
    if (!job.quote_no) {
      const set = await this.kvRead(TAB.SET);
      const n = Number(set.quote_next || 1);
      job.quote_no = String(set.quote_prefix || "QT-") + String(n).padStart(3, "0");
      set.quote_next = n + 1;
      await this.kvWrite(TAB.SET, set);
    }
    const j = job as unknown as Record<string, unknown>;
    const row: Row = head.map((k) => {
      const v = j[k];
      if (k === "overrides" || k === "vendors") return v && typeof v === "object" ? JSON.stringify(v) : String(v ?? "");
      if (Array.isArray(v)) return v.join("|");
      return v === undefined || v === null ? "" : (v as string | number);
    });
    const { rows } = await this.quotesTable();
    const idx = rows.findIndex((r) => String(r[0] ?? "").trim() === job.quote_no.trim());
    const target = idx >= 0 ? idx + 2 : rows.length + 2;
    await this.update(`${TAB.QUOTES}!A${target}:${colName(head.length)}${target}`, [row]);
    return { quote_no: job.quote_no, updated: idx >= 0, quotes: await this.listQuotes() };
  }
  async deleteQuote(no: string) {
    const { rows } = await this.quotesTable();
    const idx = rows.findIndex((r) => String(r[0] ?? "").trim() === String(no).trim());
    if (idx >= 0) {
      const sheetId = await this.sheetId(TAB.QUOTES);
      await this.req(":batchUpdate", {
        method: "POST",
        body: JSON.stringify({
          requests: [{ deleteDimension: { range: { sheetId, dimension: "ROWS", startIndex: idx + 1, endIndex: idx + 2 } } }],
        }),
      });
    }
    return this.listQuotes();
  }
  async nextPiNumber() {
    const set = await this.kvRead(TAB.SET);
    const n = Number(set.pi_next || 1);
    const no = String(set.pi_prefix || "PI-") + String(n).padStart(3, "0");
    set.pi_next = n + 1;
    await this.kvWrite(TAB.SET, set);
    return no;
  }
  async saveSettings(obj: Settings) {
    const cur = await this.kvRead(TAB.SET);
    for (const k of Object.keys(obj)) {
      if (k === "quote_next" || k === "pi_next") continue; // counters only move via saveCounters
      cur[k] = obj[k];
    }
    await this.kvWrite(TAB.SET, cur);
    return cur;
  }
  async saveCounters(obj: { quote_next?: number; pi_next?: number }) {
    const cur = await this.kvRead(TAB.SET);
    if (obj.quote_next !== undefined) cur.quote_next = Number(obj.quote_next) || 1;
    if (obj.pi_next !== undefined) cur.pi_next = Number(obj.pi_next) || 1;
    await this.kvWrite(TAB.SET, cur);
    return { quote_next: Number(cur.quote_next), pi_next: Number(cur.pi_next) };
  }
  async saveRates(p: { rates?: Rates; boards?: Board[]; films?: Film[] }) {
    if (p.rates) await this.kvWrite(TAB.RATES, p.rates as Record<string, unknown>);
    if (p.boards) {
      await this.tableWrite(TAB.BOARDS, ["name", "pkr_per_kg", "note"], p.boards.map((b) => [b.name, Number(b.pkr_per_kg) || 0, b.note || ""]));
    }
    if (p.films) {
      await this.tableWrite(TAB.FILMS, ["name", "pkr_per_sqin", "note"], p.films.map((f) => [f.name, Number(f.pkr_per_sqin) || 0, f.note || ""]));
    }
    const [rates, boards, films] = await Promise.all([this.kvRead(TAB.RATES), this.tableRead<Board>(TAB.BOARDS), this.tableRead<Film>(TAB.FILMS)]);
    return { rates, boards, films };
  }
  async saveClient(c: Client) {
    const rows = await this.values(`${TAB.CLIENTS}!A2:A`);
    const names = rows.map((r) => String(r[0] ?? "").trim());
    const idx = names.indexOf(String(c.name).trim());
    const target = idx >= 0 ? idx + 2 : rows.length + 2;
    await this.update(`${TAB.CLIENTS}!A${target}:E${target}`, [[c.name || "", c.contact || "", c.country || "", c.email || "", c.address || ""]]);
    return this.tableRead<Client>(TAB.CLIENTS);
  }
}

function dstr(v: unknown): string {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  const s = String(v ?? "");
  // Sheets may hand back "2026-09-05 00:00:00" or a serial; keep the date part
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : s;
}

function colName(n: number): string {
  let s = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}
