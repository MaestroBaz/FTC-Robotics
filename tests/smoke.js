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
  check(src.includes("runs PIDF on the hub: F = kF x target speed (tab 6)") && src.includes("PID class from tab 7"), "launcher and PID references name tabs 6 and 7");

  // ---- tab order: opens on Java, digits read 1 to 8 in the plan's order ----
  await pg.goto(URL); await pg.waitForTimeout(300);
  check((await pg.$eval("section.lab.on", s => s.id)) === "lab-java", "the lab opens on Java basics");
  const nav = await pg.$$eval("nav.tabs a", as => as.map(a => a.querySelector(".n").textContent + ":" + a.dataset.tab).join(" "));
  check(nav === "1:java 2:lifecycle 3:gitflow 4:mecanum 5:oneloop 6:feedback 7:pid 8:encoders", "tab bar reads 1 Java ... 8 Encoders in the teaching order: " + nav);
  const cards = await pg.$$eval("nav.jtopics .jt", bs => bs.map(b => b.dataset.jt).join(" "));
  check(cards === "anatomy classes vars private inherit decide scope words imports errors modules", "eleven Java cards in reading order, Lists off the nav: " + cards);
  check(src.includes('"import com.qualcomm.robotcore.hardware.DcMotorEx;"') && !src.includes("imu.resetYaw();   // driver"), "words card Robot.java imports DcMotorEx and field-centric calls robot.resetHeading()");

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
  check((await pg.textContent("#lab-java details.ask .vnext")) === "Team 2 votes next", "after one vote the label says Team 2 votes next");
  await pg.click("#lab-java details.ask .opt:nth-child(1)");   // team 2 picks A, the wrong one
  await pg.click("#lab-java details.ask .reveal");
  await pg.waitForSelector("#lab-java details.ask[open]"); await pg.waitForTimeout(50);   // the toggle event that pays the points is queued, not synchronous
  check(!!(await pg.$("#lab-java details.ask[open] .opt.right")) && (await pg.$eval(optB, o => o.classList.contains("right"))), "reveal marks option B as the right answer");
  check((await pg.textContent('.team[data-i="0"] b')) === "1" && (await pg.textContent('.team[data-i="1"] b')) === "0", "reveal pays team 1 (right) and not team 2 (wrong)");
  await pg.click(optB);   // team 3 votes B after the reveal
  check((await pg.textContent('.team[data-i="2"] b')) === "1", "a vote after the reveal scores at once");
  await pg.click(optB, { button: "right" });
  check((await pg.textContent('.team[data-i="2"] b')) === "0" && (await pg.textContent(optB + " b")) === "1", "right-click refunds the last paid vote");
  for (let i = 0; i < 5; i++) await pg.click(optB);
  check((await pg.textContent("#lab-java details.ask .vnext")) === "all 6 teams voted" && (await pg.textContent(optB + " b")) === "5", "a 7th vote is ignored");
  await pg.click("#tm-reset");
  check((await pg.textContent(optB + " b")) === "0" && (await pg.textContent('.team[data-i="0"] b')) === "0", "Reset clears votes and scores together");
  check((await pg.$$("details.ask .vote")).length === 9, "every Ask the room has a vote");
  check((await pg.$$("details.ask .vote .reveal")).length === 9, "Reveal sits at the end of every vote row");

  // ---- the Ask the room block is compact: the first sim starts above the fold on a 1366x768 projector ----
  const fold = await b.newPage({ viewport: { width: 1366, height: 768 } });
  const foldOf = async t => { await fold.goto(URL + "#" + t); await fold.waitForTimeout(300);
    return fold.evaluate(() => { const lh = document.querySelector("section.lab.on .labhead"); return [Math.round(lh.getBoundingClientRect().height), Math.round(lh.nextElementSibling.getBoundingClientRect().top)]; }); };
  for (const t of ["pid", "feedback", "oneloop"]) { const [lh, top] = await foldOf(t);
    check(lh <= 190 && top <= 330, t + ": Ask the room block " + lh + " px, first block starts at " + top + " px"); }
  await fold.close();

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

  // ---- @Override tried three ways, and the Decisions card ----
  await pg.click('.jt[data-jt="inherit"]');
  await pg.click('#jv-ovbtns .b[data-ov="1"]');
  check(/does not override or implement/.test(await pg.textContent("#jv-ovprob")), "@Override on a typo fails the build with the javac message");
  await pg.click('#jv-ovbtns .b[data-ov="2"]');
  check(/BUILD SUCCESSFUL/.test(await pg.textContent("#jv-ovprob")) && /never resets|nobody calls/.test(await pg.textContent("#jv-ovmsg")), "Start() without @Override builds and never runs");
  await pg.click('.jt[data-jt="decide"]');
  const stick = async v => { await pg.$eval("#jv-dstick", (el, v) => { el.value = v; el.dispatchEvent(new Event("input")); }, v); return pg.textContent("#jv-dmsg"); };
  check(/FAST forward/.test(await stick(0.8)) && /skips every/.test(await pg.textContent("#jv-dmsg")), "stick 0.8 runs the first if and skips the rest");
  check(/backward/.test(await stick(-0.4)), "stick -0.4 runs the third branch");
  check(/stopped/.test(await stick(0)) && /else: runs/.test(await pg.textContent("#jv-dcond")), "stick 0 falls to else");
  await pg.click('#jv-swbtns .b[data-s="SPINNING_UP"]');
  check((await pg.getAttribute("#jv-swmsg", "class")).includes("ok"), "switch with break stays in SPINNING_UP");
  await pg.check("#jv-swbrk");
  check(/falls into FEEDING/.test(await pg.textContent("#jv-swmsg")), "forgetting break falls through into FEEDING");
  await pg.locator("#lab-java").screenshot({ path: path.join(SHOTS, "java-decide.png") });

  // ---- Ask the room: Hide folds the question, Show brings it back ----
  await pg.click("#lab-java details.ask .ask-x");
  check(!(await pg.isVisible("#lab-java details.ask")) && (await pg.isVisible("#lab-java .ask-show")), "Hide folds the question away");
  await pg.click("#lab-java .ask-show");
  check(await pg.isVisible("#lab-java details.ask"), "Show the question brings it back");

  // ---- Auto-hide: H toggles, scrolling down hides the bar ----
  const ahOn = () => pg.evaluate(() => document.body.classList.contains("autohide"));
  const was = await ahOn();
  await pg.keyboard.press("h"); check((await ahOn()) !== was, "key H toggles auto-hide");
  if (!(await ahOn())) await pg.click("#ah-toggle");
  await pg.mouse.move(600, 500); await pg.evaluate(() => document.activeElement && document.activeElement.blur());   // focus inside the bar keeps it shown
  await pg.evaluate(() => window.scrollTo(0, 0)); await pg.waitForTimeout(100);
  await pg.mouse.wheel(0, 900); await pg.waitForTimeout(400);
  check(await pg.evaluate(() => document.querySelector(".topbar").classList.contains("away")), "scrolling down hides the top bar");
  await pg.evaluate(() => window.scrollTo(0, 0)); await pg.waitForTimeout(200);

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
  await pg.click('#ts-ticks span[data-v="1"]'); check((await pg.textContent("#ts-val")) === "1x", "clicking the 1 tick returns to 1x");

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

  // ---- lift: F (PIDF) holds the lift with P only, and the loop diagram grows a 4th box with no error arrow ----
  await pg.click('.appbtn[data-app="lift"]'); await pg.waitForTimeout(300);
  await pg.click('[data-ps="P only"]'); await pg.waitForTimeout(3000);
  const liftP = await chips();
  await pg.$eval("#pid-kf", el => { el.value = 0.18; el.dispatchEvent(new Event("input")); }); await pg.waitForTimeout(3000);
  const liftF = await chips();
  console.log("  lift P only:", liftP, "| with F:", liftF);
  const errOf = s => +(s.match(/error (-?[\d.]+) in/) || [0, 99])[1], outOf = s => +(s.match(/output (-?[\d.]+)/) || [0, 0])[1];
  check(Math.abs(errOf(liftF)) < Math.abs(errOf(liftP)) && Math.abs(errOf(liftF)) < 0.5 && outOf(liftF) > 0.15, "F closes the P-only gap on the lift with no I");
  check((await pg.$eval("#pid-loop", s => s.innerHTML)).includes("no error") && (await pg.textContent("#pid-use")).includes("power = power + 0.18"), "lift shows the F box without an error arrow and the F line in the code");
  await pg.locator("#lab-pid").screenshot({ path: path.join(SHOTS, "pid-lift-f.png") });
  await pg.click('.appbtn[data-app="turn"]'); await pg.waitForTimeout(300);
  check(!(await pg.$eval("#pid-loop", s => s.innerHTML)).includes("no error"), "turn has no F box");

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

  // ---- one loop: Pause, Resume and Reset run ----
  await pg.goto(URL + "#oneloop"); await pg.waitForTimeout(300);
  await pg.click("#ol-launch"); await pg.waitForTimeout(600);
  await pg.click("#ol-pause"); await pg.waitForTimeout(150);
  check((await pg.textContent("#ol-pause")) === "Resume" && (await pg.textContent("#ts-chip")) === "PAUSED", "one loop Pause pauses and the button says Resume");
  await pg.click("#ol-pause"); await pg.waitForTimeout(150);
  check((await pg.textContent("#ol-pause")) === "Pause", "Resume runs the sim again");
  await pg.click("#ol-reset"); await pg.waitForTimeout(100);
  check(/ 0 in/.test(await pg.textContent("#ol-errA")) && / 0 in/.test(await pg.textContent("#ol-errB")), "Reset run clears the error chips");
  await pg.locator("#lab-oneloop").screenshot({ path: path.join(SHOTS, "oneloop.png") });

  // ---- encoders: perfect grip lands on the line, slip stops short while the encoder reads 24 in ----
  await pg.goto(URL + "#encoders"); await pg.waitForTimeout(300);
  const enRun = async () => { await pg.click("#en-run"); for (let i = 0; i < 30 && !/driveBusy\(\) went false|tape says/.test(await pg.textContent("#en-msg")); i++) await pg.waitForTimeout(250); return pg.textContent("#en-msg"); };
  check(/stopped on the line/.test(await enRun()), "encoders: perfect grip stops on the line");
  await pg.$eval("#en-slip", el => { el.value = 8; el.dispatchEvent(new Event("input")); });
  await pg.click("#en-strafe");
  check(/wheels slipped/.test(await enRun()) && /encodersays23\.9/.test((await pg.textContent("#en-kv")).replace(/\s+/g, "")), "encoders: slip stops short while the encoder still reads 24 in");
  await pg.locator("#lab-encoders").screenshot({ path: path.join(SHOTS, "encoders.png") });

  // ---- cheat sheets: two double-sided letter sheets (4 pages), diagram-led, nothing clipped ----
  const cs = await b.newPage();
  await cs.emulateMedia({ media: "print" });
  await cs.goto("file://" + path.resolve(__dirname, "..", "docs", "course", "cheatsheet.html")); await cs.waitForTimeout(300);
  const fit = await cs.evaluate(() => [...document.querySelectorAll(".page")].map(p => {
    const box = p.getBoundingClientRect(), kids = [...p.children], foot = kids[kids.length - 1], body = kids[kids.length - 2];
    const clippedCode = [...p.querySelectorAll("pre")].some(pre => pre.scrollWidth > pre.clientWidth + 1);
    // every SVG text must sit inside its own figure's box: a label that runs past the edge is clipped on paper
    const overflow = [...p.querySelectorAll(".fig svg")].flatMap(svg => {
      const r = svg.getBoundingClientRect();
      return [...svg.querySelectorAll("text")].filter(t => { const b = t.getBoundingClientRect(); return b.right > r.right + 1 || b.left < r.left - 1; }).map(t => t.textContent.slice(0, 30));
    });
    return { fits: body.getBoundingClientRect().bottom + foot.getBoundingClientRect().height <= box.bottom + 1, clippedCode, figures: p.querySelectorAll(".fig svg").length, overflow };
  }));
  check(fit.length === 4 && fit.every(f => f.fits), "cheat sheets: 4 pages, content fits above the footers");
  check(fit.every(f => !f.clippedCode), "no cheat sheet code line is clipped");
  check(fit.every(f => f.figures >= 3), "every cheat sheet page carries at least 3 diagrams");
  const csSrc = fs.readFileSync(path.resolve(__dirname, "..", "docs", "course", "cheatsheet.html"), "utf8");
  check(csSrc.includes("setVelocityPIDFCoefficients") && csSrc.includes("liftPID.update(error) + kF") && csSrc.includes("IMU yaw: +90") && csSrc.includes("imu.resetYaw()"), "cheat sheet names PIDF on the hub, kF in the OpMode, the yaw compass and resetYaw");
  check(fit.every(f => f.overflow.length === 0), "no diagram label runs past its figure: " + fit.flatMap(f => f.overflow).join(" | "));
  await cs.close();

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
