// Fast check: parses the inline <script> of lab/index.html and flags non-ASCII characters.
// Run: npm run check
const fs = require("fs");
const path = require("path");
const file = path.resolve(__dirname, "..", "lab", "index.html");
const s = fs.readFileSync(file, "utf8");
let bad = 0;
const blocks = s.match(/<script>([\s\S]*?)<\/script>/g) || [];
blocks.forEach((b, i) => {
  try { new Function(b.replace(/<\/?script>/g, "")); }
  catch (e) { console.log("script block " + i + ": " + e.message); bad++; }
});
const lines = s.split("\n");
lines.forEach((l, i) => {
  const m = l.match(/[^\x00-\x7F]/);
  if (m) { console.log("non-ASCII at line " + (i + 1) + ": U+" + m[0].codePointAt(0).toString(16).toUpperCase()); bad++; }
});
// Engineering rules (docs/architecture.md, "Rule exceptions"):
// - hex colors only in CSS token definitions (--name:#hex) and the fixed-dark mock panels (.dhub, .ide-problems)
// - no setTimeout / setInterval: sim behavior uses after(), UI timing uses CSS or the frame loop
// - real clock reads only in throttle() (redraw rate) and the frame loop (the source of dt)
const HEX = /#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?(?:[0-9a-fA-F]{2})?\b/;
const HEX_OK = /^\s*(?:--[\w-]+:#|\.dhub[\s{.]|\.ide-problems[\s{.])/;
const CLOCK_OK = [/^function throttle\(ms\)/, /^let last = performance\.now\(\), lastInk/];
const scriptStart = lines.findIndex(l => l.trim() === "<script>");
lines.forEach((l, i) => {
  const at = "line " + (i + 1) + ": ";
  if (HEX.test(l.replace(/--[\w-]+:#[0-9a-fA-F]+/g, "")) && !HEX_OK.test(l)) { console.log("hex color outside the tokens at " + at + l.trim().slice(0, 100)); bad++; }
  if (i > scriptStart && /\bset(?:Timeout|Interval)\s*\(/.test(l)) { console.log("real-time timer at " + at + "use after(sec, fn) or a CSS animation"); bad++; }
  if (i > scriptStart && /performance\.now|Date\.now/.test(l) && !CLOCK_OK.some(r => r.test(l))) { console.log("real clock read at " + at + "use TIME.sim"); bad++; }
});
console.log(blocks.length + " script block(s), " + lines.length + " lines, " + (bad ? bad + " problem(s)" : "ok"));
process.exit(bad ? 1 : 0);
