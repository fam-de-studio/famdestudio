import type { Calc, Job } from "@/lib/docket/engine";
import { finishList } from "@/lib/docket/engine";
import { DEFAULT_SETTINGS, type Settings } from "@/lib/docket/defaults";
import { esc, int, prettyDate, unitStr, usd, n } from "./format";

/**
 * Quotation and proforma invoice as HTML strings. Ported unchanged from the
 * original App.html so the printed documents look exactly as before. Every
 * value passes through esc().
 */
type Meta = { contactline: string; rows: [string, string][] };

function S(settings: Settings, k: string): string {
  const v = settings[k];
  return esc(v !== undefined && v !== "" ? v : (DEFAULT_SETTINGS[k] ?? ""));
}

function masthead(settings: Settings, title: string, meta: Meta): string {
  let h =
    '<i class="reg reg-tl"></i><i class="reg reg-tr"></i><i class="reg reg-bl"></i><i class="reg reg-br"></i>' +
    '<header class="mast"><div>' +
    '<h1 class="wordmark">' + S(settings, "company") + "</h1>" +
    '<div class="tagline">' + S(settings, "tagline") + "</div>" +
    '<div class="issuer">' + S(settings, "address") + "<br>" + meta.contactline + "</div>" +
    '</div><div class="dt"><h2>' + esc(title) + '</h2><dl class="meta">';
  for (const r of meta.rows) h += "<dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd>";
  return h + "</dl></div></header>";
}

function spec(label: string, value: unknown, cls?: string): string {
  return "<div" + (cls ? ' class="' + cls + '"' : "") + "><dt>" + esc(label) + "</dt><dd>" + esc(value || "—") + "</dd></div>";
}
function term(label: string, value: string): string {
  return "<div><dt>" + esc(label) + "</dt><dd>" + value + "</dd></div>";
}
function bank(l: string, v: string): string {
  return "<div><span>" + esc(l) + "</span><span>" + (v || "—") + "</span></div>";
}
/** Join only the lines that actually have content. */
function lines(arr: unknown[]): string {
  const out = arr.filter((x) => String(x || "").trim() !== "").map(esc);
  return out.length ? out.join("<br>") : "&nbsp;";
}

export function renderQuote(job: Job, m: Calc, settings: Settings): string {
  const fin = finishList(job);
  let h = masthead(settings, "Quotation", {
    contactline: S(settings, "email") + " &nbsp;·&nbsp; " + S(settings, "phone"),
    rows: [["Ref", job.quote_no || "—"], ["Date", prettyDate(job.date)], ["Valid", job.validity], ["Currency", "USD"]],
  });

  h +=
    '<div class="hrb"></div><section class="two">' +
    '<div><p class="eyebrow">Prepared for</p><p class="pname">' + esc(job.client_name || "—") + "</p>" +
    '<div class="pline">' + lines([job.client_contact, job.client_country, job.client_email]) + "</div></div>" +
    '<div><p class="eyebrow">Your contact</p><p class="pname">' + S(settings, "rep_name") + "</p>" +
    '<div class="pline">' + S(settings, "rep_role") + "<br>WhatsApp " + S(settings, "whatsapp") +
    "<br>Replies within one working day</div></div></section>";

  h +=
    '<div class="hr"></div><p class="eyebrow">Specification</p><dl class="spec">' +
    spec("Product", job.product, "w2") + spec("Box style", job.style) +
    spec("Closed size", int(job.len) + " × " + int(job.wid) + " × " + int(job.hgt) + " mm") +
    spec("Board", job.board + " " + int(job.gsm) + " gsm") +
    spec("Printing", int(job.col_f) + " colour outside / " + int(job.col_b) + " colour inside") +
    spec("Lamination", job.lam) +
    spec("Cutting & forming", "Die cut, creased, side-seam glued") +
    spec("Packing", "Flat-packed, lined export cartons") +
    (job.repeat === "Yes" ? spec("Order type", "Repeat order — tooling retained from your previous run") : "") +
    spec("Artwork", "Print-ready PDF supplied by client · dieline supplied by us, free of charge", "w3") +
    "</dl>";

  h +=
    '<div class="hr"></div><p class="eyebrow">Decorative finishes included</p><div class="chips">' +
    (fin.length ? fin.map((f) => '<span class="chip">' + esc(f) + "</span>").join("") : '<span class="pline">Standard finish — no decorative process</span>') +
    "</div>";

  h +=
    '<div class="hr"></div><p class="eyebrow">Commercial — ' + (job.incoterm === "DDP" ? "delivered duty paid" : "delivered to your address") + "</p>" +
    '<div class="comm">' +
    '<dl class="fig"><dt>Quantity</dt><dd>' + int(job.qty) + " pcs</dd></dl>" +
    '<dl class="fig"><dt>Unit price · ' + esc(job.incoterm || "DAP") + "</dt><dd>" + unitStr(m.ddpPc) + "</dd></dl>" +
    '<dl class="fig tot"><dt>Total order value</dt><dd>' + usd(m.ddp, 0) + "</dd></dl>" +
    '</div><div class="tier"><div class="l">Option B — volume</div>' +
    '<div class="m">' + int(job.qty2) + " pcs @ " + unitStr(m.unit2) + "</div>" +
    '<div class="r">' + usd(m.total2, 0) + "</div></div>" +
    '<p class="note">Tooling and press make-ready are the same at either quantity, so the second run is ' +
    "always the cheaper one. The cutting die and foil block are one-time charges and are stored here " +
    "for your repeat orders.</p>";

  h +=
    '<div class="pgbreak"></div>' +
    '<div class="hr"></div><p class="eyebrow">Terms</p><dl class="terms">' +
    term("Incoterm", job.incoterm === "DDP"
      ? "DDP — delivered duty paid. Freight, duty and VAT are inside the unit price. No further charges on arrival."
      : "DAP — delivered to your address, freight included. Import duty and VAT, if any, are payable by the buyer; your courier collects them if they apply.") +
    term("Lead time", esc(job.lead_time) + " working days from written artwork approval and receipt of advance.") +
    term("Freight", esc(job.mode) + " — transit " + esc(job.transit) + " days.") +
    term("Payment", "50% with the purchase order, 50% against dispatch photographs before the shipment is handed over.") +
    term("Approval", "Digital proof issued for written approval before plates are made. Physical pre-production sample on request.") +
    term("Tolerance", "Delivered quantity may vary ±5%; invoicing is adjusted to the quantity actually delivered.") +
    term("Artwork format", "Print-ready PDF, CMYK, 3 mm bleed, fonts outlined. Foil and spot UV as separate 100% black layers.") +
    term("Validity", "Prices hold for " + esc(job.validity) + " and assume the USD rate current at the date of issue.") +
    "</dl>";

  h +=
    '<div class="close"><p>We produce decorative print — foil, drip-off, metalized and soft-touch — ' +
    "for small premium brands. Send us your logo file and we will return a 3D visual on the exact " +
    "dieline above, at no cost and with no obligation.</p>" +
    '<div class="sign"><div class="l"></div><span>Authorised signature</span></div></div>';

  return h;
}

export function renderPi(job: Job, m: Calc, settings: Settings): string {
  const fin = finishList(job);
  let h = masthead(settings, "Proforma Invoice", {
    contactline: "NTN " + S(settings, "ntn") + " &nbsp;·&nbsp; " + S(settings, "email"),
    rows: [["PI No.", job.pi_no || "—"], ["Date", prettyDate(job.date)], ["Your PO", job.po_ref || "—"], ["Quotation", job.quote_no || "—"]],
  });

  h +=
    '<div class="hrb"></div><section class="two">' +
    '<div><p class="eyebrow">Consignee</p><p class="pname">' + esc(job.client_name || "—") + "</p>" +
    '<div class="pline">' + lines([job.client_contact, job.client_address, job.client_country]) + "</div></div>" +
    '<div><p class="eyebrow">Shipment</p><div class="pline" style="padding-top:8px">' +
    "Incoterm: " + esc(job.incoterm || "DAP") + " " + esc(job.client_country) + "<br>" +
    "Mode: " + esc(job.mode) + "<br>" +
    "Gross weight: " + n(m.kgTotal).toFixed(1) + " kg · " + int(job.cartons) + " export cartons<br>" +
    "Country of origin: Pakistan</div></div></section>";

  h +=
    '<div class="hr"></div><p class="eyebrow">Goods</p><table class="goods"><thead><tr>' +
    '<th style="width:52%">Description</th><th class="r" style="width:14%">Quantity</th>' +
    '<th class="r" style="width:16%">Unit price</th><th class="r" style="width:18%">Amount</th>' +
    "</tr></thead><tbody><tr><td>" + esc(job.product || "—") + " — " + esc(job.style) +
    '<span class="sub">' + esc(job.board) + " " + int(job.gsm) + " gsm · " +
    int(job.col_f) + "C + " + int(job.col_b) + "C" +
    (fin.length ? " · " + fin.map(esc).join(" · ") : "") + "</span>" +
    '<span class="sub">HS Code ' + esc(job.hs_code) + " — folding cartons of non-corrugated paperboard</span>" +
    '</td><td class="n r">' + int(job.qty) + '</td><td class="n r">' + unitStr(m.ddpPc) + "</td>" +
    '<td class="n r">' + usd(m.ddp) + "</td></tr>" +
    "<tr><td>" + (job.repeat === "Yes" ? "Tooling — retained from your previous order" : "Tooling — cutting die and foil block") +
    '<span class="sub">One-time. Retained in our storage; not charged on repeat orders.</span></td>' +
    '<td class="n r">1</td><td class="n r">$0.00</td><td class="n r">$0.00</td></tr>' +
    '<tr><td colspan="3" class="r" style="font-family:var(--f-mono),monospace;font-size:9px;' +
    'letter-spacing:.15em;text-transform:uppercase;color:var(--docbrass);padding-top:16px">' +
    "Total invoice value · " + esc(job.incoterm || "DAP") + '</td><td class="n r" style="font-size:18px;font-weight:600;padding-top:16px">' +
    usd(m.ddp) + "</td></tr></tbody></table>";

  h +=
    '<dl class="pay"><div class="due"><dt>Advance — due now</dt><dd>' + usd(m.ddp / 2) +
    '</dd><span class="w">50% — production starts on receipt</span></div>' +
    "<div><dt>Balance</dt><dd>" + usd(m.ddp - m.ddp / 2) +
    '</dd><span class="w">50% — before dispatch</span></div>' +
    '<div><dt>Payment by</dt><dd style="font-size:13px;line-height:1.5">Bank transfer<br>or Payoneer</dd>' +
    '<span class="w">Reference ' + esc(job.pi_no || "the PI number") + "</span></div></dl>";

  h +=
    '<div class="pgbreak"></div>' +
    '<div class="hr"></div><p class="eyebrow">Payment instructions</p><div class="bank">' +
    bank("Beneficiary", S(settings, "bank_benef")) + bank("Account / IBAN", S(settings, "bank_iban")) +
    bank("Bank", S(settings, "bank_name")) + bank("SWIFT / BIC", S(settings, "bank_swift")) +
    bank("Branch", S(settings, "bank_branch")) + bank("Payoneer", S(settings, "bank_payoneer")) +
    "</div>";

  h +=
    '<div class="hr"></div><p class="eyebrow">Conditions</p><ol class="cond">' +
    "<li>50% advance is required before production begins. This applies to first orders without exception.</li>" +
    "<li>The balance falls due against dispatch photographs, before goods are handed to the carrier.</li>" +
    "<li>Production starts only after written approval of the digital proof.</li>" +
    "<li>Delivered quantity may vary ±5%; the invoice is adjusted to the quantity delivered.</li>" +
    "<li>Tooling remains the property of the exporter and is stored for the buyer's repeat orders.</li>" +
    "<li>Prices are quoted " + esc(job.incoterm || "DAP") + " and hold for " + esc(job.validity) + " from the date of this invoice.</li>" +
    "<li>Title in the goods passes to the buyer on receipt of the final payment.</li></ol>";

  h +=
    '<div class="close"><p>This is a proforma invoice issued for payment and customs pre-clearance. ' +
    "A commercial invoice and packing list accompany the shipment.</p>" +
    '<div class="sign"><div class="l"></div><span>For ' + S(settings, "company") + "</span></div></div>";

  return h;
}

/** Gmail compose body, same wording as before. */
export function mailBody(job: Job, m: Calc, settings: Settings): { subject: string; body: string } {
  const first = (job.client_contact || job.client_name || "").split(/[ ,]/)[0];
  const subject = "Quotation " + (job.quote_no || "") + " — " + (job.product || "packaging");
  const body =
    "Hi " + first + ",\n\n" +
    "Quotation attached for " + (job.product || "your packaging") + ".\n\n" +
    "  Quantity    : " + int(job.qty) + " pcs\n" +
    "  Unit price  : " + unitStr(m.ddpPc) + " per box, " + (job.incoterm || "DAP") + " — delivered to your door\n" +
    "  Total       : " + usd(m.ddp, 0) + "\n" +
    "  Lead time   : " + job.lead_time + " working days after artwork approval\n\n" +
    "Two things worth knowing before you decide:\n\n" +
    "1. The cutting die and foil block are one-time charges. Repeat orders are cheaper because that " +
    "tooling is already made.\n\n" +
    "2. At " + int(job.qty2) + " pcs the unit price falls to " + unitStr(m.unit2) +
    ". Setup costs the same either way, so the second thousand is always cheaper than the first.\n\n" +
    "Terms are 50% with the order, 50% before it ships. I will send a digital proof for written " +
    "approval before anything goes on press, and photos of the finished job before dispatch.\n\n" +
    "Happy to adjust the specification if you want to hit a particular price.\n\n" +
    (settings.rep_name || "") + "\n" + (settings.company || "");
  return { subject, body };
}
