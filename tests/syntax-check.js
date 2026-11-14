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
console.log(blocks.length + " script block(s), " + lines.length + " lines, " + (bad ? bad + " problem(s)" : "ok"));
process.exit(bad ? 1 : 0);
