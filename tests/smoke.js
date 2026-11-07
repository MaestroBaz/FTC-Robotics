// Smoke test for lab/index.html. Run: npm test (from the repo root).
// Loads every tab, checks for page errors, exercises the speed slider,
// the chart controls, the PID response markers and auto-aim search,
// and writes screenshots to tests/shots/.
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const URL = "file://" + path.resolve(__dirname, "..", "lab", "index.html");
const SHOTS = path.resolve(__dirname, "shots");
fs.mkdirSync(SHOTS, { recursive: true });

let failures = 0;
function check(ok, msg) { console.log((ok ? "PASS " : "FAIL ") + msg); if (!ok) failures++; }

(async () => {
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 1366, height: 900 } });
  const errs = [];
  pg.on("pageerror", e => errs.push(e.message));
  pg.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
  const chips = () => pg.evaluate(() => document.querySelector("#pid-chips").textContent);
  const respRows = () => pg.evaluate(() => [...document.querySelectorAll("#pid-resp tr")].slice(1)
    .map(r => r.children[0].textContent.split(" (")[0] + "=" + r.children[1].textContent).join("; "));

  // ---- cross-tab references name the right tab ----
  const src = fs.readFileSync(path.resolve(__dirname, "..", "lab", "index.html"), "utf8");
  check(src.includes("runs PIDF on the hub (tab 6)") && src.includes("PID class from tab 7"), "launcher and PID references name tabs 6 and 7");

  // ---- tab buttons work when the page opens as a data: URL (blocks hash navigation) ----
  const dp = await b.newPage();
  dp.on("pageerror", e => errs.push(e.message));
  await dp.goto("data:text/html;charset=utf-8," + encodeURIComponent(src));
  await dp.click('nav.tabs a[data-tab="pid"]'); await dp.waitForTimeout(200);
  check((await dp.$eval("section.lab.on", s => s.id)) === "lab-pid", "tab button switches tabs on a data: URL page");
  await dp.close();

  // ---- team scoreboard: keys, buttons, persistence, toggle ----
  await pg.goto(URL + "#java"); await pg.waitForTimeout(300);
  await pg.click("#tm-reset");
  await pg.keyboard.press("3");
  await pg.click('.team[data-i="2"] button[data-d="1"]');
  check((await pg.textContent('.team[data-i="2"] b')) === "2" && !!(await pg.$('.team[data-i="2"].lead')), "key 3 and + give team 3 two points and the lead");
  await pg.reload(); await pg.waitForTimeout(300);
  check((await pg.textContent('.team[data-i="2"] b')) === "2", "scores survive a reload");
  await pg.click("#tm-reset");
  check((await pg.textContent('.team[data-i="2"] b')) === "0", "Reset scores clears the board");
  await pg.click("#tm-toggle");
  check(!(await pg.isVisible("#teambar")), "Teams button hides the scoreboard");
  await pg.click("#tm-toggle");

  // ---- Ask the room votes: tally, undo, reveal ----
  const optB = '#lab-java details.ask .opt:nth-child(2)';
  await pg.click(optB); await pg.click(optB); await pg.click(optB, { button: "right" });
  check((await pg.textContent(optB + " b")) === "1" && !(await pg.$("#lab-java details.ask[open]")), "a vote click counts, right-click undoes, and the answer stays hidden");
  await pg.click("#lab-java details.ask .reveal");
  check(!!(await pg.$("#lab-java details.ask[open] .opt.right")) && (await pg.$eval(optB, o => o.classList.contains("right"))), "reveal marks option B as the right answer");
  check((await pg.$$("details.ask .vote")).length === 9, "every Ask the room has a vote");

  // ---- Every word explained ----
  await pg.click('.jt[data-jt="words"]');
  await pg.click('#jv-wfiles button[data-f="Robot.java"]');
  await pg.click('#jv-wcode .w[data-w="static"]');
  check((await pg.textContent("#jv-wname")) === "static" && /class name/.test(await pg.textContent("#jv-wmsg")), "clicking static explains static");
  await pg.click('#jv-wlist button[data-w="hwget"]');
  check((await pg.$$('#jv-wcode .w.on')).length === 2, "the hardwareMap.get chip finds both lines");
  await pg.click('#jv-wfiles button[data-f="PIDController.java"]');
  check(!!(await pg.$('#jv-wcode .w[data-w="this"]')) && !!(await pg.$('#jv-wcode .w[data-w="ctor"]')), "PIDController shows this. and the constructor");
  await pg.locator("#lab-java").screenshot({ path: path.join(SHOTS, "java-words.png") });

  // ---- GitHub tab: terminal commands next to the Android Studio steps ----
  await pg.goto(URL + "#gitflow"); await pg.waitForTimeout(300);
  await pg.click("#gx-edit"); await pg.click("#gx-commit"); await pg.click("#gx-partner"); await pg.click("#gx-push");
  check(/git push\n# ! \[rejected\]/.test(await pg.textContent("#gx-cmd")), "a rejected push shows the git push error in the terminal box");
  await pg.click("#gx-pull");
  check((await pg.textContent("#gx-cmd")) === "git pull", "Pull shows git pull");
  await pg.click("#gx-prnext");
  check(/git switch -c maya\/slow-mode/.test(await pg.textContent("#gx-prcmd")), "the PR loop shows the branch command");
  await pg.click("#gt-next"); await pg.click("#gt-next");
  check(/git commit -m "Add slow mode on left bumper"/.test(await pg.textContent("#gt-cmd")), "the conflict story shows the commit command");
  check((await pg.$$eval("pre.term", els => els.filter(e => e.textContent.trim()).length)) === 3, "all three terminal boxes hold a command");

  // ---- every tab loads, at 1x and at 2x ----
  const tabs = ["gitflow", "java", "lifecycle", "mecanum", "oneloop", "feedback", "pid", "encoders"];
  for (const t of tabs) { await pg.goto(URL + "#" + t); await pg.waitForTimeout(400); }
  await pg.$eval("#ts-slider", el => { el.value = 1000; el.dispatchEvent(new Event("input")); });
  for (const t of tabs) { await pg.goto(URL + "#" + t); await pg.waitForTimeout(400); }

  // ---- speed slider ----
  await pg.goto(URL + "#pid"); await pg.waitForTimeout(300);
  await pg.$eval("#ts-slider", el => { el.value = 0; el.dispatchEvent(new Event("input")); });
  check((await pg.textContent("#ts-val")) === "0.05x", "slider minimum reads 0.05x");
  await pg.$eval("#ts-slider", el => { el.value = 1000; el.dispatchEvent(new Event("input")); });
  check((await pg.textContent("#ts-val")) === "2x", "slider maximum reads 2x");
  await pg.keyboard.press("["); check((await pg.textContent("#ts-val")) === "1x", "[ steps 2x down to 1x");
  await pg.keyboard.press("["); check((await pg.textContent("#ts-val")) === "0.5x", "[ steps 1x down to 0.5x");
  await pg.click("#ts-1x");

  // ---- PID turn: markers appear ----
  await pg.waitForTimeout(3500);
  const turn = await respRows();
  console.log("  turn P only:", turn);
  check(/Rise time=\d/.test(turn), "turn shows a rise time");
  await pg.click('[data-ps="PID (tuned)"]'); await pg.waitForTimeout(3500);
  const turnPid = await respRows();
  console.log("  turn PID:", turnPid);
  check(/Settling time=\d/.test(turnPid), "tuned turn PID settles");
  await pg.locator("#lab-pid").screenshot({ path: path.join(SHOTS, "pid-turn.png") });

  // ---- auto-aim: each preset, then search after dragging the HIVE out of view ----
  await pg.click('.appbtn[data-app="aim"]');
  for (const ps of ["P only", "P too high", "PD (tuned: no I needed)", "PID: I makes it worse here"]) {
    await pg.click('[data-ps="' + ps + '"]'); await pg.waitForTimeout(3000);
    console.log("  aim " + ps + " | " + (await chips()) + " | " + (await respRows()));
  }
  const bb = await (await pg.$("#pid-view")).boundingBox();
  await pg.mouse.move(bb.x + bb.width * 0.62, bb.y + 40); await pg.mouse.down();
  await pg.mouse.move(bb.x + 30, bb.y + 150, { steps: 8 }); await pg.mouse.up();
  await pg.waitForTimeout(300);
  check(/SEARCHING/.test(await chips()), "aim searches when the HIVE leaves the camera view");
  let locked = false;
  for (let i = 0; i < 12 && !locked; i++) { await pg.waitForTimeout(400); locked = /LOCKED ON/.test(await chips()); }
  check(locked, "aim finds the HIVE again and locks on");
  await pg.click("#pid-hold"); await pg.waitForTimeout(200);
  check(/AIM OFF/.test(await chips()), "releasing the aim button shows AIM OFF");
  await pg.locator("#lab-pid").screenshot({ path: path.join(SHOTS, "pid-aim.png") });

  // ---- chart controls ----
  await pg.click("#pid-cbar .tc-all"); await pg.waitForTimeout(200);
  const c1 = await (await pg.$("#pid-plot1")).boundingBox();
  await pg.mouse.move(c1.x + 100, c1.y + 80); await pg.mouse.down();
  await pg.mouse.move(c1.x + 300, c1.y + 90, { steps: 5 }); await pg.mouse.up();
  await pg.waitForTimeout(200);
  check((await pg.getAttribute("#pid-cbar .tc-live", "aria-pressed")) === "false" &&
        (await pg.getAttribute("#pid-cbar .tc-all", "aria-pressed")) === "false", "drag on the chart zooms in");
  await pg.locator("#lab-pid").screenshot({ path: path.join(SHOTS, "pid-zoom.png") });
  await pg.click("#pid-cbar .tc-pause"); await pg.waitForTimeout(150);
  check((await pg.textContent("#ts-chip")) === "PAUSED", "chart Pause pauses the sim");
  await pg.click("#pid-cbar .tc-play");
  await pg.click("#pid-cbar .tc-reset"); await pg.waitForTimeout(150);
  check((await pg.getAttribute("#pid-cbar .tc-live", "aria-pressed")) === "true", "Reset run returns to live view");

  // ---- launcher chart ----
  await pg.goto(URL + "#feedback"); await pg.waitForTimeout(300);
  await pg.click("#fb-cbar .tc-reset");
  let peak = 0, low = Infinity;
  for (let i = 0; i < 30; i++) {
    await pg.waitForTimeout(100);
    const w = +(await pg.textContent("#fb-ready")).match(/closed loop: (\d+)/)[1];
    peak = Math.max(peak, w); low = Math.min(low, w);
  }
  console.log("  launcher closed-loop spin-up: low", low, "peak", peak);
  check(low < 800 && peak > 1100 && peak < 1200, "closed-loop launcher spins up without overshooting the HIVE window");
  await pg.click("#fb-feed"); await pg.waitForTimeout(2500);
  await pg.$eval("#fb-v", el => { el.value = 11.8; el.dispatchEvent(new Event("input")); }); await pg.waitForTimeout(2500);
  await pg.click("#fb-feed"); await pg.waitForTimeout(2000);
  await pg.locator("#lab-feedback").screenshot({ path: path.join(SHOTS, "feedback.png") });

  // ---- phone width ----
  const m = await b.newPage({ viewport: { width: 390, height: 844 } });
  m.on("pageerror", e => errs.push("mobile: " + e.message));
  await m.goto(URL + "#pid"); await m.waitForTimeout(1500);
  check((await m.evaluate(() => document.documentElement.scrollWidth)) <= 390, "no sideways scroll at 390 px");
  await m.screenshot({ path: path.join(SHOTS, "mobile-pid.png") });

  check(errs.length === 0, "no page errors" + (errs.length ? ": " + errs.join(" | ") : ""));
  await b.close();
  console.log(failures ? failures + " check(s) failed" : "all checks passed");
  process.exit(failures ? 1 : 0);
})();
