/**
 * Daily accent colour.
 *
 * The whole site reads its accent from the `--color-yellow` token, so swapping
 * that one variable recolours buttons, ribbons, outlines and the preloader bar.
 * One colour per calendar day, picked from ACCENTS by the visitor's local date.
 */
export const ACCENTS = [
  "#f5c518", // yellow (original)
  "#02fa44", // green
  "#028bfa", // blue
  "#b84dff", // purple (lightened so dark text on it passes AA)
  "#fa029f", // pink
  "#fa0202", // red
  "#03fcb6", // teal
] as const;

/**
 * Runs inline in <head> before first paint. Kept as a string so it needs no
 * hydration and cannot flash the default yellow.
 * `?accent=N` forces colour N for previewing.
 */
export const accentScript = `(function(){try{var a=${JSON.stringify(ACCENTS)};var d=new Date();var n=Math.floor((d.getTime()-d.getTimezoneOffset()*6e4)/864e5);var m=/[?&]accent=([0-9]+)/.exec(location.search);var i=m?+m[1]:n;var c=a[((i%a.length)+a.length)%a.length];document.documentElement.style.setProperty('--color-yellow',c);var t=document.querySelector('meta[name="theme-color"]');if(t)t.setAttribute('content',c);}catch(e){}})();`;
