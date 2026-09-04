export function n(v: unknown): number {
  const x = parseFloat(String(v));
  return Number.isFinite(x) ? x : 0;
}
export function int(v: unknown): string {
  return Math.round(n(v)).toLocaleString("en-US");
}
export function usd(v: unknown, dp = 2): string {
  return "$" + n(v).toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });
}
export function unitStr(v: unknown): string {
  let s = usd(v, 4);
  if (s.includes(".")) s = s.replace(/0+$/, "").replace(/\.$/, "");
  return s;
}
export function pkr(v: unknown): string {
  return n(v).toLocaleString("en-US", { maximumFractionDigits: 0 });
}
export function prettyDate(iso: unknown): string {
  if (!iso) return "";
  const p = String(iso).split("-");
  if (p.length !== 3) return String(iso);
  const m = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${Number(p[2])} ${m[Number(p[1]) - 1]} ${p[0]}`;
}
export function esc(s: unknown): string {
  return String(s === undefined || s === null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
