"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Board, Film, Job, Rates, YesNo } from "@/lib/docket/engine";
import { calc, computeCost, imposition, rateOf, LINE_KEYS, LINE_LABELS } from "@/lib/docket/engine";
import {
  blankJob, jobFromRecord, BOX_STYLES, STATUSES, EXTRA_FINISHES, RATE_META,
  DEFAULT_BOARDS, DEFAULT_FILMS, DEFAULT_RATES, DEFAULT_SETTINGS,
  type Bootstrap, type Client, type QuoteSummary, type Settings,
} from "@/lib/docket/defaults";
import { renderPi, renderQuote, mailBody } from "./documents";
import { int, n, pkr, unitStr, usd } from "./format";

type Db = { settings: Settings; rates: Rates; boards: Board[]; films: Film[]; clients: Client[]; quotes: QuoteSummary[] };
type Modal = null | "open" | "rates" | "settings";

async function api<T>(action: string, body?: unknown, method?: "GET" | "POST"): Promise<T> {
  const r = await fetch(`/api/docket/${action}`, {
    method: method ?? (body === undefined ? "GET" : "POST"),
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((data as { error?: string }).error || `Request failed (${r.status})`);
  return data as T;
}

export function DocketApp({
  user,
  storage,
  devBypass,
}: {
  user: { name: string; email: string };
  storage: "sheet" | "file";
  devBypass: boolean;
}) {
  const [db, setDb] = useState<Db | null>(null);
  const [job, setJob] = useState<Job>(() => blankJob());
  const [doc, setDoc] = useState<"quote" | "pi">("quote");
  const [modal, setModal] = useState<Modal>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toastT = useRef<number | undefined>(undefined);

  const say = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout(toastT.current);
    toastT.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  /* ---- boot ---- */
  useEffect(() => {
    api<Bootstrap>("bootstrap")
      .then((d) => {
        const next: Db = {
          settings: d.settings && Object.keys(d.settings).length ? d.settings : { ...DEFAULT_SETTINGS },
          rates: d.rates && Object.keys(d.rates).length ? d.rates : { ...DEFAULT_RATES },
          boards: d.boards?.length ? d.boards : DEFAULT_BOARDS.map((b) => ({ ...b })),
          films: d.films?.length ? d.films : DEFAULT_FILMS.map((f) => ({ ...f })),
          clients: d.clients ?? [],
          quotes: d.quotes ?? [],
        };
        setDb(next);
        setJob((j) => {
          const c = next.clients[0];
          const withClient = !j.client_name && c ? { ...j, client_name: c.name, client_contact: c.contact || "", client_country: c.country || "", client_email: c.email || "", client_address: c.address || "" } : j;
          return withClient.product ? withClient : { ...withClient, product: "50 ml Serum Carton" };
        });
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const ctx = useMemo(() => (db ? { rates: db.rates, boards: db.boards, films: db.films } : { rates: DEFAULT_RATES, boards: DEFAULT_BOARDS, films: DEFAULT_FILMS }), [db]);
  const m = useMemo(() => calc(job, ctx), [job, ctx]);
  const settings = db?.settings ?? DEFAULT_SETTINGS;
  const quoteHtml = useMemo(() => renderQuote(job, m, settings), [job, m, settings]);
  const piHtml = useMemo(() => renderPi(job, m, settings), [job, m, settings]);

  const set = useCallback(<K extends keyof Job>(k: K, v: Job[K]) => setJob((j) => ({ ...j, [k]: v })), []);
  const toggle = (k: "uv" | "foil" | "emb" | "repeat") => set(k, (job[k] === "Yes" ? "No" : "Yes") as YesNo);

  const fillClient = (name: string) => {
    const c = db?.clients.find((x) => x.name === name);
    setJob((j) => ({ ...j, client_name: name, ...(c ? { client_contact: c.contact || "", client_country: c.country || "", client_email: c.email || "", client_address: c.address || "" } : {}) }));
  };

  /* ---- actions ---- */
  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      say("Error: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setBusy(false);
    }
  };

  const save = () =>
    run(async () => {
      if (!job.client_name) return say("Add a client name first");
      const stamped: Job = {
        ...job,
        ups: m.ups, gross: m.gross,
        cost_total: Math.round(m.total), cost_pc: Number(m.perPc.toFixed(2)),
        exw: Number(m.exw.toFixed(2)), freight: Number(m.freight.toFixed(2)),
        ddp: Number(m.ddp.toFixed(2)), ddp_pc: Number(m.ddpPc.toFixed(4)),
        profit: Number(m.profit.toFixed(2)), unit2: Number(m.unit2.toFixed(4)),
        fx_used: rateOf(ctx, "fx", 285), margin_used: rateOf(ctx, "margin", 0.4),
      };
      const r = await api<{ quote_no: string; updated: boolean; quotes: QuoteSummary[] }>("quote", { job: stamped });
      setJob({ ...stamped, quote_no: r.quote_no });
      setDb((d) => (d ? { ...d, quotes: r.quotes } : d));
      say(r.quote_no + (r.updated ? " updated" : " saved"));
    });

  const openQuote = (no: string) =>
    run(async () => {
      const o = await api<Record<string, unknown> | null>(`quote?no=${encodeURIComponent(no)}`);
      if (!o) return say("Not found");
      setJob(jobFromRecord(o));
      setModal(null);
      say(no + " opened");
    });

  const deleteQuote = (no: string) =>
    run(async () => {
      if (!confirm("Delete " + no + "?")) return;
      const list = await api<QuoteSummary[]>("delete-quote", { no });
      setDb((d) => (d ? { ...d, quotes: list } : d));
      say(no + " deleted");
    });

  const newQuote = () => {
    if (!confirm("Start a new quote? Anything unsaved is lost.")) return;
    setJob(blankJob());
    say("New quote");
  };

  const saveClient = () =>
    run(async () => {
      if (!job.client_name) return say("Add a client name first");
      const c: Client = { name: job.client_name, contact: job.client_contact, country: job.client_country, email: job.client_email, address: job.client_address };
      const list = await api<Client[]>("client", { client: c });
      setDb((d) => (d ? { ...d, clients: list } : d));
      say("Client saved");
    });

  const newPi = () =>
    run(async () => {
      const r = await api<{ pi_no: string }>("pi-number", {});
      set("pi_no", r.pi_no);
      say("PI number " + r.pi_no);
    });

  const autoFlat = () => {
    setJob((j) => ({ ...j, flat_w: 2 * (n(j.len) + n(j.wid)) + n(j.flap), flat_h: n(j.hgt) + 2 * n(j.wid) }));
    say("Flat size calculated");
  };

  const output = (bw: boolean) => {
    const t = document.title;
    const label = doc === "pi" ? job.pi_no || "Proforma-Invoice" : job.quote_no || "Quotation";
    document.title = label + " — " + (job.client_name || "client");
    if (bw) document.documentElement.classList.add("doc-bw");
    say(bw ? "Choose your printer · colour: black & white" : "Choose destination: Save as PDF");
    window.setTimeout(() => {
      window.print();
      window.setTimeout(() => {
        document.documentElement.classList.remove("doc-bw");
        document.title = t;
      }, 900);
    }, 350);
  };

  const mail = () => {
    if (!job.client_email) return say("Add the client email first");
    const { subject, body } = mailBody(job, m, settings);
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(job.client_email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_blank");
    say("Gmail opened — attach the PDF");
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setModal(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const imp = imposition(job);
  const placeholderCompany = !String(settings.company || "").trim();

  return (
    <div className="app">
      <div className="topbar">
        <div className="brand"><b>Press Docket</b></div>
        <div className="docsel" role="tablist">
          <button role="tab" aria-selected={doc === "quote"} onClick={() => setDoc("quote")}>Quotation</button>
          <button role="tab" aria-selected={doc === "pi"} onClick={() => setDoc("pi")}>Proforma Invoice</button>
        </div>
        <div className="spacer" />
        <div className={`state ${db ? (storage === "sheet" ? "live" : "demo") : ""}`} title={user.email}>
          {!db && !error ? "loading…" : error ? "storage error" : storage === "sheet" ? "saving to your sheet" : devBypass ? "dev · local file" : "local file storage"}
        </div>
        <button className="btn" onClick={newQuote}>New</button>
        <button className="btn" onClick={() => setModal("open")}>Open</button>
        <button className="btn" onClick={() => setModal("rates")}>Rates</button>
        <button className="btn" onClick={() => setModal("settings")}>My company</button>
        <button className="btn" onClick={mail}>Email</button>
        <button className="btn" onClick={save} disabled={busy}>Save</button>
        <button className="btn" onClick={() => output(true)} title="Black & white, for paper">Print B&amp;W</button>
        <button className="btn btn-go" onClick={() => output(false)} title="Dark PDF, for sending to the client">PDF</button>
        {!devBypass && (
          <form action="/admin/docket/signout" method="post">
            <button className="btn" type="submit" title={user.email}>Sign out</button>
          </form>
        )}
      </div>

      <div className="main">
        <aside className="panel">
          {error && <div className="callout"><p><b>Storage not ready.</b> {error}</p></div>}
          {placeholderCompany && (
            <div className="callout">
              <p>The documents have no company name yet. Put your name, address and bank details in once — they are remembered.</p>
              <button className="btn" onClick={() => setModal("settings")}>Set up my company</button>
            </div>
          )}

          <Sec title="Client" open>
            <F label="Company">
              <input list="clientlist" value={job.client_name} onChange={(e) => fillClient(e.target.value)} />
              <datalist id="clientlist">{db?.clients.map((c) => <option key={c.name} value={c.name} />)}</datalist>
            </F>
            <F label="Contact person"><input value={job.client_contact} onChange={(e) => set("client_contact", e.target.value)} /></F>
            <F label="City, country"><input value={job.client_country} onChange={(e) => set("client_country", e.target.value)} /></F>
            <F label="Email"><input value={job.client_email} onChange={(e) => set("client_email", e.target.value)} /></F>
            <F label="Delivery address"><input value={job.client_address} onChange={(e) => set("client_address", e.target.value)} /></F>
            <button className="btn self-start" onClick={saveClient}>Save this client to the directory</button>
          </Sec>

          <Sec title="Job" open>
            <F label="Product / job name"><input value={job.product} onChange={(e) => set("product", e.target.value)} /></F>
            <F label="Box style"><Select value={job.style} opts={BOX_STYLES} onChange={(v) => set("style", v)} /></F>
            <F label="Order quantity (pcs)"><Num value={job.qty} onChange={(v) => set("qty", v)} /></F>
            <div className="toggles"><Tg on={job.repeat === "Yes"} onClick={() => toggle("repeat")}>Repeat order — tooling already made</Tg></div>
          </Sec>

          <Sec title="Box size & dieline" open>
            <div className="row3">
              <F label="Length L (mm)"><Num value={job.len} onChange={(v) => set("len", v)} /></F>
              <F label="Width W (mm)"><Num value={job.wid} onChange={(v) => set("wid", v)} /></F>
              <F label="Height H (mm)"><Num value={job.hgt} onChange={(v) => set("hgt", v)} /></F>
            </div>
            <div className="row3">
              <F label="Glue flap"><Num value={job.flap} onChange={(v) => set("flap", v)} /></F>
              <F label="Flat width"><Num value={job.flat_w} onChange={(v) => set("flat_w", v)} /></F>
              <F label="Flat height"><Num value={job.flat_h} onChange={(v) => set("flat_h", v)} /></F>
            </div>
            <button className="btn self-start" onClick={autoFlat}>Calculate flat size from L × W × H</button>
            <div className="hintline">
              Suggested for a tuck end: <b>{int(2 * (n(job.len) + n(job.wid)) + n(job.flap))} × {int(n(job.hgt) + 2 * n(job.wid))} mm</b>. Override for rigid, sleeve or mailer styles.
            </div>
          </Sec>

          <Sec title="Board & press" open>
            <F label="Board type"><Select value={job.board} opts={ctx.boards.map((b) => b.name)} onChange={(v) => set("board", v)} /></F>
            <div className="row3">
              <F label="Board GSM"><Num value={job.gsm} onChange={(v) => set("gsm", v)} /></F>
              <F label="Press sheet W"><Num value={job.psw} onChange={(v) => set("psw", v)} /></F>
              <F label="Press sheet H"><Num value={job.psh} onChange={(v) => set("psh", v)} /></F>
            </div>
            <div className="row2">
              <F label="Trim across width"><Num value={job.trim_w} onChange={(v) => set("trim_w", v)} /></F>
              <F label="Gripper + tail"><Num value={job.trim_h} onChange={(v) => set("trim_h", v)} /></F>
            </div>
            <div className="hintline">
              {imp.ups > 0 ? (
                <>Printable area <b>{int(imp.ew)} × {int(imp.eh)} mm</b> · <b>{imp.ups} ups</b> per sheet · <b>{int(m.gross)}</b> sheets to buy</>
              ) : (
                <>The dieline does not fit this press sheet. Check the flat size.</>
              )}
            </div>
          </Sec>

          <Sec title="Printing" open>
            <div className="row2">
              <F label="Colours front"><Num value={job.col_f} onChange={(v) => set("col_f", v)} /></F>
              <F label="Colours back"><Num value={job.col_b} onChange={(v) => set("col_b", v)} /></F>
            </div>
          </Sec>

          <Sec title="Decorative finishes" open>
            <F label="Lamination / film"><Select value={job.lam} opts={ctx.films.map((f) => f.name)} onChange={(v) => set("lam", v)} /></F>
            <div className="toggles">
              <Tg on={job.uv === "Yes"} onClick={() => toggle("uv")}>Spot UV / drip-off</Tg>
              <Tg on={job.foil === "Yes"} onClick={() => toggle("foil")}>Hot foiling</Tg>
              <Tg on={job.emb === "Yes"} onClick={() => toggle("emb")}>Emboss / deboss</Tg>
            </div>
            <div className="row2">
              <F label="Foil block area (sq.in)"><Num value={job.foil_area} onChange={(v) => set("foil_area", v)} /></F>
              <F label="Emboss block area (sq.in)"><Num value={job.emb_area} onChange={(v) => set("emb_area", v)} /></F>
            </div>
            <F label="Other finishing cost (PKR, whole job)"><Num value={job.other_pkr} onChange={(v) => set("other_pkr", v)} /></F>
            <div className="f"><span className="lbl">Also show on the document</span></div>
            <div className="toggles">
              {EXTRA_FINISHES.map((e) => (
                <Tg key={e} on={job.extras.includes(e)} onClick={() => set("extras", job.extras.includes(e) ? job.extras.filter((x) => x !== e) : [...job.extras, e])}>{e}</Tg>
              ))}
            </div>
          </Sec>

          <Sec title="Tooling">
            <div className="row2">
              <F label="Cutting die (PKR)"><Num value={job.die_cost} onChange={(v) => set("die_cost", v)} /></F>
              <F label="Local transport (PKR)"><Num value={job.local_tr} onChange={(v) => set("local_tr", v)} /></F>
            </div>
          </Sec>

          <Sec title="Cost lines — vendor & override">
            <CostLines job={job} ctxParts={computeCost(job, ctx).parts} onOverride={(k, v) => setJob((j) => { const o = { ...j.overrides }; if (v === "") delete o[k]; else o[k] = n(v); return { ...j, overrides: o }; })} onVendor={(k, v) => setJob((j) => { const o = { ...j.vendors }; if (v === "") delete o[k]; else o[k] = v; return { ...j, vendors: o }; })} />
          </Sec>

          <Sec title="Freight & terms" open>
            <F label="Freight mode"><Select value={job.mode} opts={["DHL Express", "Air Freight", "Sea LCL"]} onChange={(v) => set("mode", v)} /></F>
            <F label="Delivery term"><Select value={job.incoterm} opts={["DAP", "DDP"]} onChange={(v) => set("incoterm", v as "DAP" | "DDP")} /></F>
            <div className="row2">
              <F label="Duty (0.03 = 3%)"><Num value={job.duty_pct} onChange={(v) => set("duty_pct", v)} /></F>
              <F label="VAT (0.20 = 20%)"><Num value={job.vat_pct} onChange={(v) => set("vat_pct", v)} /></F>
            </div>
            <div className="row2">
              <F label="Carton allowance (0.08 = 8%)"><Num value={job.pack_pct} onChange={(v) => set("pack_pct", v)} /></F>
              <F label="CBM override (sea)"><input type="number" step="any" value={job.cbm_override} onChange={(e) => set("cbm_override", e.target.value === "" ? "" : n(e.target.value))} /></F>
            </div>
            <div className="hintline">
              Each box <b>{(m.boxKg * 1000).toFixed(1)} g</b> · shipment <b>{m.kgTotal.toFixed(1)} kg</b> · sea volume <b>{m.cbmAuto.toFixed(2)} CBM</b> · freight <b>{usd(m.freight, 0)}</b>
            </div>
          </Sec>

          <Sec title="Option B — the upsell">
            <F label="Higher quantity (pcs)"><Num value={job.qty2} onChange={(v) => set("qty2", v)} /></F>
            <F label="Price it automatically?"><Select value={job.unit2_auto} opts={["Yes", "No"]} onChange={(v) => set("unit2_auto", v as YesNo)} /></F>
            <F label="Unit price if manual (USD)"><Num value={job.unit2} step="0.0001" onChange={(v) => set("unit2", v)} /></F>
            <div className="hintline">
              Fully recosted at {int(job.qty2)} pcs: <b>{unitStr(m.unit2Auto)}</b> per box
              {m.ddpPc > 0 && <> — <b>{Math.round((1 - m.unit2Auto / m.ddpPc) * 100)}% cheaper</b> than {int(job.qty)} pcs</>}
            </div>
          </Sec>

          <Sec title="Document details">
            <F label="Quotation number"><input value={job.quote_no} placeholder="blank — set when you save" onChange={(e) => set("quote_no", e.target.value)} /></F>
            <F label="Date"><input type="date" value={job.date} onChange={(e) => set("date", e.target.value)} /></F>
            <F label="Status"><Select value={job.status} opts={STATUSES} onChange={(v) => set("status", v)} /></F>
            <div className="row3">
              <F label="Valid for"><input value={job.validity} onChange={(e) => set("validity", e.target.value)} /></F>
              <F label="Lead time (days)"><input value={job.lead_time} onChange={(e) => set("lead_time", e.target.value)} /></F>
              <F label="Transit (days)"><input value={job.transit} onChange={(e) => set("transit", e.target.value)} /></F>
            </div>
            <F label="Proforma invoice number"><input value={job.pi_no} placeholder="blank — set on the PI tab" onChange={(e) => set("pi_no", e.target.value)} /></F>
            <button className="btn self-start" onClick={newPi} disabled={busy}>Give this quote a PI number</button>
            <F label="Client PO reference"><input value={job.po_ref} onChange={(e) => set("po_ref", e.target.value)} /></F>
            <div className="row2">
              <F label="HS code"><input value={job.hs_code} onChange={(e) => set("hs_code", e.target.value)} /></F>
              <F label="Export cartons"><input value={job.cartons} onChange={(e) => set("cartons", n(e.target.value))} /></F>
            </div>
            <F label="Internal notes (never printed)"><textarea value={job.notes} onChange={(e) => set("notes", e.target.value)} /></F>
          </Sec>
        </aside>

        <section className="stage">
          <article className="sheet" hidden={doc !== "quote"} dangerouslySetInnerHTML={{ __html: quoteHtml }} />
          <article className="sheet" hidden={doc !== "pi"} dangerouslySetInnerHTML={{ __html: piHtml }} />
        </section>
      </div>

      <div className="readout">
        <div className="ro"><span>Cost / pc</span><b>{m.perPc.toFixed(2)} PKR</b></div>
        <div className="ro"><span>Ex works / pc</span><b>{unitStr(m.exwPc)}</b></div>
        <div className="ro hero"><span>Landed / pc</span><b>{unitStr(m.ddpPc)}</b></div>
        <div className="ro"><span>Order value</span><b>{usd(m.ddp, 0)}</b></div>
        <div className="ro"><span>Profit</span><b>{usd(m.profit, 0)}</b></div>
        <div className={`ro${m.marginPct < 0.2 ? " warn" : ""}`}><span>Margin on sale</span><b>{(m.marginPct * 100).toFixed(0)}%</b></div>
      </div>

      {modal && (
        <div className="scrim" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            {modal === "open" && <OpenModal quotes={db?.quotes ?? []} onOpen={openQuote} onDelete={deleteQuote} onClose={() => setModal(null)} />}
            {modal === "rates" && db && (
              <RatesModal db={db} onClose={() => setModal(null)} onSave={(p) => run(async () => { const r = await api<{ rates: Rates; boards: Board[]; films: Film[] }>("rates", p); setDb((d) => (d ? { ...d, ...r } : d)); setModal(null); say("Rates saved"); })} />
            )}
            {modal === "settings" && db && (
              <SettingsModal db={db} onClose={() => setModal(null)}
                onSave={(s) => run(async () => { const r = await api<Settings>("settings", { settings: s }); setDb((d) => (d ? { ...d, settings: r } : d)); setModal(null); say("Settings saved"); })}
                onCounters={(c) => run(async () => { const r = await api<{ quote_next: number; pi_next: number }>("counters", c); setDb((d) => (d ? { ...d, settings: { ...d.settings, ...r } } : d)); say("Counters saved"); })}
              />
            )}
          </div>
        </div>
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

/* ---------- small building blocks ---------- */

function Sec({ title, open = false, children }: { title: string; open?: boolean; children: React.ReactNode }) {
  const key = "docket-sec:" + title;
  const ref = useRef<HTMLDetailsElement>(null);
  // Remembered open/closed state lives in the DOM (uncontrolled), not React state.
  useEffect(() => {
    try {
      const v = localStorage.getItem(key);
      if (v !== null && ref.current) ref.current.open = v === "1";
    } catch {}
  }, [key]);
  return (
    <details
      ref={ref}
      className="sec"
      open={open}
      onToggle={(e) => {
        try {
          localStorage.setItem(key, (e.currentTarget as HTMLDetailsElement).open ? "1" : "0");
        } catch {}
      }}
    >
      <summary>{title}</summary>
      <div className="secbody">{children}</div>
    </details>
  );
}
function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="f">
      <span className="lbl">{label}</span>
      {children}
    </label>
  );
}
function Num({ value, onChange, step = "any" }: { value: number; onChange: (v: number) => void; step?: string }) {
  return <input type="number" step={step} value={Number.isFinite(value) ? value : 0} onChange={(e) => onChange(n(e.target.value))} />;
}
function Select({ value, opts, onChange }: { value: string; opts: readonly string[]; onChange: (v: string) => void }) {
  const list = opts.includes(value) || !value ? opts : [value, ...opts];
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {list.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}
function Tg({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" className="tg" aria-pressed={on} onClick={onClick}>{children}</button>;
}

function CostLines({ job, ctxParts, onOverride, onVendor }: { job: Job; ctxParts: Partial<Record<string, number>>; onOverride: (k: string, v: string) => void; onVendor: (k: string, v: string) => void }) {
  return (
    <table className="rtab">
      <thead><tr><th>Line</th><th style={{ width: 90 }}>Auto PKR</th><th style={{ width: 90 }}>Override</th><th>Vendor</th></tr></thead>
      <tbody>
        {LINE_KEYS.map((k) => (
          <tr key={k}>
            <td style={{ fontSize: 12 }}>{LINE_LABELS[k]}</td>
            <td style={{ fontSize: 12, color: "var(--app-dim)" }}>{pkr(ctxParts[k] || 0)}</td>
            <td><input className="n" type="number" step="any" placeholder="auto" value={job.overrides[k] ?? ""} onChange={(e) => onOverride(k, e.target.value)} /></td>
            <td><input placeholder="—" value={job.vendors[k] ?? ""} onChange={(e) => onVendor(k, e.target.value)} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function OpenModal({ quotes, onOpen, onDelete, onClose }: { quotes: QuoteSummary[]; onOpen: (no: string) => void; onDelete: (no: string) => void; onClose: () => void }) {
  return (
    <>
      <header><h3>Saved quotes</h3><div className="spacer" /><button className="btn" onClick={onClose}>Close</button></header>
      <div className="body">
        {quotes.length ? quotes.map((q) => (
          <div key={q.quote_no} className="qrow" onClick={() => onOpen(q.quote_no)}>
            <div className="no">{q.quote_no}</div>
            <div><div className="cl">{q.client_name}</div><div className="pr">{q.product}</div></div>
            <div><div className="v">{usd(q.ddp, 0)}</div><div className="st">{q.status} · {q.date}</div></div>
            <button className="del" title="Delete" onClick={(e) => { e.stopPropagation(); onDelete(q.quote_no); }}>×</button>
          </div>
        )) : <p className="hintline">No saved quotes yet. Fill in a job and press <b>Save</b>.</p>}
      </div>
    </>
  );
}

function RatesModal({ db, onClose, onSave }: { db: Db; onClose: () => void; onSave: (p: { rates: Rates; boards: Board[]; films: Film[] }) => void }) {
  const [rates, setRates] = useState<Rates>({ ...db.rates });
  const [boards, setBoards] = useState<Board[]>(db.boards.map((b) => ({ ...b })));
  const [films, setFilms] = useState<Film[]>(db.films.map((f) => ({ ...f })));
  const rate = (k: string) => { const v = rates[k]; return v === undefined || v === "" || v === null ? DEFAULT_RATES[k] ?? "" : v; };
  return (
    <>
      <header>
        <h3>Rates</h3><div className="spacer" />
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-go" onClick={() => onSave({ rates: Object.fromEntries(Object.entries(rates).map(([k, v]) => [k, n(v)])), boards, films })}>Save rates</button>
      </header>
      <div className="body">
        <p className="hintline">These drive every quote you make from now on. <b>Saved quotes keep the prices they were saved with.</b></p>
        <div className="grp"><h4>Production &amp; commercial</h4>
          <table className="rtab"><tbody>
            {RATE_META.map(([k, label, unit]) => (
              <tr key={k}>
                <td style={{ width: "46%", fontSize: 12 }}>{label}</td>
                <td style={{ width: "22%" }}><input className="n" type="number" step="any" value={String(rate(k))} onChange={(e) => setRates((r) => ({ ...r, [k]: e.target.value }))} /></td>
                <td style={{ fontSize: 10.5, color: "var(--app-dim)" }}>{unit}</td>
              </tr>
            ))}
          </tbody></table>
        </div>
        <div className="grp"><h4>Board / paper — PKR per kg</h4>
          <table className="rtab"><thead><tr><th>Board</th><th style={{ width: 110 }}>PKR/kg</th><th>Note</th></tr></thead><tbody>
            {boards.map((b, i) => (
              <tr key={i}>
                <td><input value={b.name} onChange={(e) => setBoards((x) => x.map((y, j) => (j === i ? { ...y, name: e.target.value } : y)))} /></td>
                <td><input className="n" type="number" step="any" value={String(b.pkr_per_kg)} onChange={(e) => setBoards((x) => x.map((y, j) => (j === i ? { ...y, pkr_per_kg: n(e.target.value) } : y)))} /></td>
                <td><input value={b.note || ""} onChange={(e) => setBoards((x) => x.map((y, j) => (j === i ? { ...y, note: e.target.value } : y)))} /></td>
              </tr>
            ))}
          </tbody></table>
        </div>
        <div className="grp"><h4>Lamination / film — PKR per square inch</h4>
          <table className="rtab"><thead><tr><th>Film</th><th style={{ width: 110 }}>PKR/sq.in</th><th>Note</th></tr></thead><tbody>
            {films.map((f, i) => (
              <tr key={i}>
                <td><input value={f.name} onChange={(e) => setFilms((x) => x.map((y, j) => (j === i ? { ...y, name: e.target.value } : y)))} /></td>
                <td><input className="n" type="number" step="any" value={String(f.pkr_per_sqin)} onChange={(e) => setFilms((x) => x.map((y, j) => (j === i ? { ...y, pkr_per_sqin: n(e.target.value) } : y)))} /></td>
                <td><input value={f.note || ""} onChange={(e) => setFilms((x) => x.map((y, j) => (j === i ? { ...y, note: e.target.value } : y)))} /></td>
              </tr>
            ))}
          </tbody></table>
        </div>
      </div>
    </>
  );
}

const SETTING_GROUPS: [string, [string, string][]][] = [
  ["Company", [["company", "Company name"], ["tagline", "Tagline"], ["address", "Address"], ["email", "Email"], ["phone", "Phone"], ["whatsapp", "WhatsApp"], ["ntn", "NTN / STRN"], ["rep_name", "Your name"], ["rep_role", "Your role"]]],
  ["Bank — shown on the proforma invoice", [["bank_benef", "Beneficiary"], ["bank_name", "Bank"], ["bank_branch", "Branch"], ["bank_iban", "Account / IBAN"], ["bank_swift", "SWIFT / BIC"], ["bank_payoneer", "Payoneer"]]],
  ["Numbering", [["quote_prefix", "Quotation prefix"], ["pi_prefix", "PI prefix"]]],
];

function SettingsModal({ db, onClose, onSave, onCounters }: { db: Db; onClose: () => void; onSave: (s: Settings) => void; onCounters: (c: { quote_next: number; pi_next: number }) => void }) {
  const [s, setS] = useState<Settings>(() => {
    const o: Settings = {};
    for (const [, fields] of SETTING_GROUPS) for (const [k] of fields) o[k] = db.settings[k] !== undefined ? db.settings[k] : (DEFAULT_SETTINGS[k] ?? "");
    return o;
  });
  const [cq, setCq] = useState(String(db.settings.quote_next || 1));
  const [cp, setCp] = useState(String(db.settings.pi_next || 1));
  return (
    <>
      <header>
        <h3>Settings</h3><div className="spacer" />
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-go" onClick={() => onSave(s)}>Save settings</button>
      </header>
      <div className="body">
        {SETTING_GROUPS.map(([title, fields]) => (
          <div className="grp" key={title}><h4>{title}</h4>
            <div style={{ display: "grid", gap: 11 }}>
              {fields.map(([k, label]) => (
                <label className="f" key={k}><span className="lbl">{label}</span><input value={String(s[k] ?? "")} onChange={(e) => setS((x) => ({ ...x, [k]: e.target.value }))} /></label>
              ))}
            </div>
          </div>
        ))}
        <div className="grp"><h4>Counters — change deliberately</h4>
          <div style={{ display: "grid", gap: 11 }}>
            <label className="f"><span className="lbl">Next quotation number</span><input type="number" value={cq} onChange={(e) => setCq(e.target.value)} /></label>
            <label className="f"><span className="lbl">Next PI number</span><input type="number" value={cp} onChange={(e) => setCp(e.target.value)} /></label>
            <button className="btn self-start" onClick={() => onCounters({ quote_next: n(cq), pi_next: n(cp) })}>Save counters only</button>
          </div>
        </div>
      </div>
    </>
  );
}
