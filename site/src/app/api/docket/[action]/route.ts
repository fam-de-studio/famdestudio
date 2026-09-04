import { NextResponse } from "next/server";
import { currentAdmin } from "@/lib/auth";
import { getStore } from "@/lib/docket/store";
import { jobFromRecord } from "@/lib/docket/defaults";

export const dynamic = "force-dynamic";

/**
 * One endpoint per Apps Script function, behind Google sign-in:
 *   GET  /api/docket/bootstrap
 *   GET  /api/docket/quote?no=QT-2026-001
 *   POST /api/docket/quote          { job }
 *   POST /api/docket/delete-quote   { no }
 *   POST /api/docket/pi-number
 *   POST /api/docket/settings       { settings }
 *   POST /api/docket/counters       { quote_next, pi_next }
 *   POST /api/docket/rates          { rates, boards, films }
 *   POST /api/docket/client         { client }
 */
type Ctx = { params: Promise<{ action: string }> };

async function guard() {
  const admin = await currentAdmin();
  return admin ? null : NextResponse.json({ error: "Sign in required" }, { status: 401 });
}

function fail(e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  return NextResponse.json({ error: msg }, { status: 500 });
}

export async function GET(req: Request, { params }: Ctx) {
  const denied = await guard();
  if (denied) return denied;
  const { action } = await params;
  try {
    const store = await getStore();
    if (action === "bootstrap") return NextResponse.json(await store.bootstrap());
    if (action === "quote") {
      const no = new URL(req.url).searchParams.get("no") ?? "";
      const rec = await store.loadQuote(no);
      return NextResponse.json(rec ? jobFromRecord(rec) : null);
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 404 });
  } catch (e) {
    return fail(e);
  }
}

export async function POST(req: Request, { params }: Ctx) {
  const denied = await guard();
  if (denied) return denied;
  const { action } = await params;
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  try {
    const store = await getStore();
    switch (action) {
      case "quote":
        return NextResponse.json(await store.saveQuote(jobFromRecord((body.job as Record<string, unknown>) ?? {})));
      case "delete-quote":
        return NextResponse.json(await store.deleteQuote(String(body.no ?? "")));
      case "pi-number":
        return NextResponse.json({ pi_no: await store.nextPiNumber() });
      case "settings":
        return NextResponse.json(await store.saveSettings((body.settings as Record<string, string | number>) ?? {}));
      case "counters":
        return NextResponse.json(await store.saveCounters(body as { quote_next?: number; pi_next?: number }));
      case "rates":
        return NextResponse.json(await store.saveRates(body as Parameters<typeof store.saveRates>[0]));
      case "client":
        return NextResponse.json(await store.saveClient((body.client as Parameters<typeof store.saveClient>[0]) ?? {}));
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 404 });
    }
  } catch (e) {
    return fail(e);
  }
}
