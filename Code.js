/**
 * PRESS DOCKET — backend
 * ----------------------------------------------------------------------
 * The Google Sheet is STORAGE ONLY. No formulas, no working in cells.
 * All the work happens in the HTML app (App.html), which reads and writes
 * through the functions below.
 *
 * Install once:
 *   1. Run setupStorage()      — builds the storage tabs
 *   2. Deploy ▸ New deployment ▸ Web app ▸ Execute as: Me ▸ Access: Only myself
 *   3. Open the web app URL — that is your application.
 */

var TAB = {
  SET: 'Settings',
  RATES: 'Rates',
  BOARDS: 'Boards',
  FILMS: 'Films',
  CLIENTS: 'Clients',
  QUOTES: 'Quotes'
};

/* Every field stored for a quote. Order = column order in the Quotes tab. */
var FIELDS = [
  'quote_no', 'date', 'status', 'pi_no', 'po_ref',
  'client_name', 'client_contact', 'client_country', 'client_email', 'client_address',
  'product', 'style', 'qty',
  'len', 'wid', 'hgt', 'flap', 'flat_w', 'flat_h',
  'board', 'gsm', 'psw', 'psh', 'trim_w', 'trim_h',
  'col_f', 'col_b',
  'lam', 'uv', 'foil', 'foil_area', 'emb', 'emb_area', 'other_pkr', 'extras',
  'die_cost', 'local_tr',
  'pack_pct', 'cbm', 'mode',
  'qty2', 'unit2', 'unit2_auto',
  'validity', 'lead_time', 'transit', 'hs_code', 'cartons', 'notes',
  /* computed, stored so old quotes keep their prices when rates change */
  'ups', 'gross', 'cost_total', 'cost_pc', 'exw', 'freight', 'ddp', 'ddp_pc', 'profit',
  'fx_used', 'margin_used',
  /* v2 broker columns — appended at the end so old rows stay aligned */
  'repeat', 'incoterm', 'duty_pct', 'vat_pct', 'overrides', 'vendors', 'cbm_override'
];

/* Append any missing FIELDS columns to the Quotes header. New columns go at
   the end, so rows written by older versions keep their alignment. */
function migrateQuotesHeader_() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TAB.QUOTES);
  if (!sh || sh.getLastRow() < 1) return;
  var head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0]
    .map(function (h) { return String(h).trim(); })
    .filter(function (h) { return h !== ''; });
  var missing = FIELDS.filter(function (f) { return head.indexOf(f) === -1; });
  if (!missing.length) return;
  sh.getRange(1, head.length + 1, 1, missing.length).setValues([missing]);
  header_(sh, head.length + missing.length);
}

/* ============================ WEB APP ENTRY ============================ */

function doGet() {
  return HtmlService.createHtmlOutputFromFile('App')
    .setTitle('Press Docket')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Press Docket')
    .addItem('Set up / repair storage', 'setupStorage')
    .addItem('Where is my app?', 'showAppUrl')
    .addToUi();
}

function showAppUrl() {
  var url = ScriptApp.getService().getUrl();
  var msg = url
    ? 'Your app is at:<br><br><a href="' + url + '" target="_blank" style="color:#8A6820">' + url + '</a>' +
      '<br><br>Bookmark it. That is where you work — this sheet is only storage.'
    : 'Not deployed yet.<br><br>In the Apps Script editor: <b>Deploy ▸ New deployment ▸ Web app</b>,' +
      ' set <b>Execute as: Me</b> and <b>Who has access: Only myself</b>, then Deploy.';
  SpreadsheetApp.getUi().showModalDialog(
    HtmlService.createHtmlOutput('<div style="font:14px Arial;padding:22px;line-height:1.8">' + msg + '</div>')
      .setWidth(520).setHeight(230), 'Press Docket');
}

/* ============================== STORAGE ============================== */

function setupStorage() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  migrateQuotesHeader_();

  kvSheet_(ss, TAB.SET, ['key', 'value'], [
    ['company', 'Meridian Print & Pack'],
    ['tagline', 'Decorative Print Specialists · Lahore'],
    ['address', '12-C Gulberg III, Lahore 54660, Pakistan'],
    ['email', 'hello@meridianprintpack.com'],
    ['phone', '+92 300 0000000'],
    ['whatsapp', '+92 300 0000000'],
    ['ntn', '0000000-0'],
    ['rep_name', 'Mehboob Ahmed'],
    ['rep_role', 'Director — Production'],
    ['bank_benef', 'Meridian Print & Pack'],
    ['bank_name', ''],
    ['bank_branch', ''],
    ['bank_iban', ''],
    ['bank_swift', ''],
    ['bank_payoneer', 'USD / GBP / EUR receiving account — on request'],
    ['quote_prefix', 'QT-2026-'],
    ['quote_next', 1],
    ['pi_prefix', 'PI-2026-'],
    ['pi_next', 1]
  ]);

  kvSheet_(ss, TAB.RATES, ['key', 'value'], [
    ['plate', 1200], ['print', 900], ['proof', 3500],
    ['uv_setup', 3000], ['uv_run', 3.5],
    ['foil_block', 45], ['foil_run', 2.5],
    ['emb_block', 60], ['emb_run', 2],
    ['dc_run', 1800], ['paste', 2.5], ['pack', 1.5],
    ['waste', 0.07], ['setup_sheets', 200],
    ['fx', 285], ['margin', 0.4],
    ['fr_dhl', 9], ['fr_air', 5.5], ['fr_sea', 180],
    ['docs', 120], ['bank_pct', 0.02]
  ]);

  tableSheet_(ss, TAB.BOARDS, ['name', 'pkr_per_kg', 'note'], [
    ['Art Card (C1S)', 420, 'General cartons, cosmetics, food sleeves'],
    ['SBS / Ivory Board', 520, 'Premium white-back — cosmetics, chocolate'],
    ['Kraft (Natural Brown)', 320, 'Organic positioning — candles, soap'],
    ['Duplex Grey Back', 300, 'Budget cartons, inner packs'],
    ['Textured / Specialty', 900, 'Rigid box wraps, luxury sleeves'],
    ['Metalized Board', 780, 'Silver / gold base for metallic printing'],
    ['Greyboard (rigid base)', 260, 'Rigid box chipboard core']
  ]);

  tableSheet_(ss, TAB.FILMS, ['name', 'pkr_per_sqin', 'note'], [
    ['None', 0, 'No lamination'],
    ['Gloss BOPP', 0.012, 'Cheapest, high shine'],
    ['Matte BOPP', 0.015, 'Premium base — required under drip-off'],
    ['Soft Touch / Velvet', 0.045, 'Luxury feel — best upsell'],
    ['Metalized / MetPET', 0.055, 'Mirror metallic base'],
    ['Holographic', 0.065, 'Rainbow effect — vape, confectionery'],
    ['Anti-Scuff Matte', 0.022, 'Matte that resists finger marks']
  ]);

  tableSheet_(ss, TAB.CLIENTS, ['name', 'contact', 'country', 'email', 'address'], [
    ['Aurelia Skincare Ltd', 'Hannah Vance, Founder', 'Bristol, United Kingdom',
      'hannah@aureliaskincare.co.uk', 'Unit 4, Feeder Road, Bristol BS2 0SB']
  ]);

  var q = ss.getSheetByName(TAB.QUOTES);
  if (!q) {
    q = ss.insertSheet(TAB.QUOTES);
    q.getRange(1, 1, 1, FIELDS.length).setValues([FIELDS]);
    header_(q, FIELDS.length);
  }

  ['Sheet1', 'Sheet 1'].forEach(function (n) {
    var s = ss.getSheetByName(n);
    if (s && s.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(s);
  });

  SpreadsheetApp.getUi().alert('Storage ready',
    'Six tabs created. Do not type in them directly — use the app.\n\n' +
    'Next: Deploy ▸ New deployment ▸ Web app (Execute as: Me · Access: Only myself), ' +
    'then open the URL. That is your application.',
    SpreadsheetApp.getUi().ButtonSet.OK);
}

function header_(sh, cols) {
  sh.getRange(1, 1, 1, cols)
    .setBackground('#171A18').setFontColor('#FFFFFF')
    .setFontFamily('Roboto Mono').setFontSize(9).setFontWeight('bold');
  sh.setFrozenRows(1);
}

function kvSheet_(ss, name, headers, defaults) {
  var sh = ss.getSheetByName(name);
  if (sh && sh.getLastRow() > 1) return;              // never overwrite real data
  if (!sh) sh = ss.insertSheet(name);
  sh.clear();
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  sh.getRange(2, 1, defaults.length, 2).setValues(defaults);
  header_(sh, headers.length);
  sh.setColumnWidth(1, 160);
  sh.setColumnWidth(2, 420);
}

function tableSheet_(ss, name, headers, defaults) {
  var sh = ss.getSheetByName(name);
  if (sh && sh.getLastRow() > 1) return;
  if (!sh) sh = ss.insertSheet(name);
  sh.clear();
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  sh.getRange(2, 1, defaults.length, headers.length).setValues(defaults);
  header_(sh, headers.length);
  sh.setColumnWidth(1, 220);
  sh.setColumnWidth(3, 340);
}

function sh_(name) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sh) throw new Error('Storage tab "' + name + '" is missing. Run Press Docket ▸ Set up / repair storage.');
  return sh;
}

function kvRead_(name) {
  var sh = sh_(name);
  if (sh.getLastRow() < 2) return {};
  var v = sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues();
  var o = {};
  v.forEach(function (r) { if (String(r[0]).trim()) o[String(r[0]).trim()] = r[1]; });
  return o;
}

function kvWrite_(name, obj) {
  var sh = sh_(name);
  var keys = Object.keys(obj);
  if (!keys.length) return;
  var rows = keys.map(function (k) { return [k, obj[k]]; });
  sh.getRange(2, 1, Math.max(sh.getMaxRows() - 1, rows.length), 2).clearContent();
  sh.getRange(2, 1, rows.length, 2).setValues(rows);
}

function tableRead_(name) {
  var sh = sh_(name);
  if (sh.getLastRow() < 2) return [];
  var w = sh.getLastColumn();
  var head = sh.getRange(1, 1, 1, w).getValues()[0];
  return sh.getRange(2, 1, sh.getLastRow() - 1, w).getValues()
    .filter(function (r) { return String(r[0]).trim() !== ''; })
    .map(function (r) {
      var o = {};
      head.forEach(function (h, i) { o[String(h).trim()] = r[i]; });
      return o;
    });
}

function tableWrite_(name, headers, rows) {
  var sh = sh_(name);
  sh.clear();
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  if (rows.length) sh.getRange(2, 1, rows.length, headers.length).setValues(rows);
  header_(sh, headers.length);
  sh.setColumnWidth(1, 220);
  if (headers.length > 2) sh.setColumnWidth(3, 340);
}

/* ============================== API ============================== */

function getBootstrap() {
  return {
    settings: kvRead_(TAB.SET),
    rates: kvRead_(TAB.RATES),
    boards: tableRead_(TAB.BOARDS),
    films: tableRead_(TAB.FILMS),
    clients: tableRead_(TAB.CLIENTS),
    quotes: listQuotes()
  };
}

function listQuotes() {
  var sh = sh_(TAB.QUOTES);
  if (sh.getLastRow() < 2) return [];
  var head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0]
    .map(function (h) { return String(h).trim(); });
  var vals = sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues();
  var out = [];
  for (var i = vals.length - 1; i >= 0; i--) {
    if (!vals[i][0]) continue;
    var o = {};
    head.forEach(function (h, j) { o[h] = vals[i][j]; });
    out.push({
      quote_no: String(o.quote_no || ''),
      date: dstr_(o.date),
      status: String(o.status || ''),
      client_name: String(o.client_name || ''),
      product: String(o.product || ''),
      qty: Number(o.qty || 0),
      ddp: Number(o.ddp || 0)
    });
  }
  return out;
}

function dstr_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  return String(v || '');
}

function loadQuote(no) {
  var sh = sh_(TAB.QUOTES);
  if (sh.getLastRow() < 2) return null;
  var head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0]
    .map(function (h) { return String(h).trim(); });
  var vals = sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues();
  for (var i = 0; i < vals.length; i++) {
    if (String(vals[i][0]).trim() === String(no).trim()) {
      var o = {};
      head.forEach(function (h, j) {
        o[h] = (h === 'date') ? dstr_(vals[i][j]) : vals[i][j];
      });
      if (typeof o.extras === 'string' && o.extras) o.extras = o.extras.split('|');
      else if (!o.extras) o.extras = [];
      ['overrides', 'vendors'].forEach(function (kk) {
        if (typeof o[kk] === 'string' && o[kk]) { try { o[kk] = JSON.parse(o[kk]); } catch (e) { o[kk] = {}; } }
        else if (!o[kk] || typeof o[kk] !== 'object') o[kk] = {};
      });
      return o;
    }
  }
  return null;
}

function saveQuote(job) {
  migrateQuotesHeader_();
  var sh = sh_(TAB.QUOTES);

  if (!job.quote_no) {
    /* Two open tabs must never mint the same number. */
    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      var set = kvRead_(TAB.SET);
      var n = Number(set.quote_next || 1);
      job.quote_no = String(set.quote_prefix || 'QT-') + ('000' + n).slice(-3);
      set.quote_next = n + 1;
      kvWrite_(TAB.SET, set);
    } finally { lock.releaseLock(); }
  }

  var row = FIELDS.map(function (k) {
    var v = job[k];
    if (k === 'overrides' || k === 'vendors') {
      return (v && typeof v === 'object') ? JSON.stringify(v) : (v || '');
    }
    if (Array.isArray(v)) return v.join('|');
    return (v === undefined || v === null) ? '' : v;
  });

  var nos = sh.getLastRow() > 1
    ? sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().map(function (r) { return String(r[0]).trim(); })
    : [];
  var idx = nos.indexOf(String(job.quote_no).trim());
  var target = idx >= 0 ? idx + 2 : sh.getLastRow() + 1;
  sh.getRange(target, 1, 1, FIELDS.length).setValues([row]);

  return { quote_no: job.quote_no, updated: idx >= 0, quotes: listQuotes() };
}

function nextPiNumber() {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var set = kvRead_(TAB.SET);
    var n = Number(set.pi_next || 1);
    var no = String(set.pi_prefix || 'PI-') + ('000' + n).slice(-3);
    set.pi_next = n + 1;
    kvWrite_(TAB.SET, set);
    return no;
  } finally { lock.releaseLock(); }
}

function saveSettings(obj) {
  var cur = kvRead_(TAB.SET);
  Object.keys(obj).forEach(function (k) {
    /* Counters advance only through saveCounters — a stale settings form must
       never rewind quote numbering. */
    if (k === 'quote_next' || k === 'pi_next') return;
    cur[k] = obj[k];
  });
  kvWrite_(TAB.SET, cur);
  return cur;
}

function saveCounters(obj) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var cur = kvRead_(TAB.SET);
    if (obj.quote_next !== undefined) cur.quote_next = Number(obj.quote_next) || 1;
    if (obj.pi_next !== undefined) cur.pi_next = Number(obj.pi_next) || 1;
    kvWrite_(TAB.SET, cur);
    return { quote_next: cur.quote_next, pi_next: cur.pi_next };
  } finally { lock.releaseLock(); }
}

function saveRates(payload) {
  if (payload.rates) kvWrite_(TAB.RATES, payload.rates);
  if (payload.boards) {
    tableWrite_(TAB.BOARDS, ['name', 'pkr_per_kg', 'note'],
      payload.boards.map(function (b) { return [b.name, Number(b.pkr_per_kg) || 0, b.note || '']; }));
  }
  if (payload.films) {
    tableWrite_(TAB.FILMS, ['name', 'pkr_per_sqin', 'note'],
      payload.films.map(function (f) { return [f.name, Number(f.pkr_per_sqin) || 0, f.note || '']; }));
  }
  return { rates: kvRead_(TAB.RATES), boards: tableRead_(TAB.BOARDS), films: tableRead_(TAB.FILMS) };
}

function saveClient(c) {
  var sh = sh_(TAB.CLIENTS);
  var names = sh.getLastRow() > 1
    ? sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().map(function (r) { return String(r[0]).trim(); })
    : [];
  var idx = names.indexOf(String(c.name).trim());
  var row = [c.name || '', c.contact || '', c.country || '', c.email || '', c.address || ''];
  sh.getRange(idx >= 0 ? idx + 2 : sh.getLastRow() + 1, 1, 1, 5).setValues([row]);
  return tableRead_(TAB.CLIENTS);
}

function deleteQuote(no) {
  var sh = sh_(TAB.QUOTES);
  if (sh.getLastRow() < 2) return listQuotes();
  var nos = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().map(function (r) { return String(r[0]).trim(); });
  var idx = nos.indexOf(String(no).trim());
  if (idx >= 0) sh.deleteRow(idx + 2);
  return listQuotes();
}