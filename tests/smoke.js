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
  // element shots hide the sticky top bar: a tall section scrolls under it, and it covered the PID I and D mini charts (#19)
  const shot = (loc, name) => loc.screenshot({ path: path.join(SHOTS, name), style: ".topbar{visibility:hidden !important}" });
  // Save PNG on a chart bar: returns the file name and the PNG size read from its IHDR
  const pngOf = async bar => {
    const [dl] = await Promise.all([pg.waitForEvent("download"), pg.click(bar + " .tc-png")]);
    const png = fs.readFileSync(await dl.path());
    return { name: dl.suggestedFilename(), isPng: png.slice(1, 4).toString() === "PNG", w: png.readUInt32BE(16), h: png.readUInt32BE(20) };
  };
  // every string drawn with fillText on a canvas, by canvas id (#19: canvas marker labels get assertions)
  const drawnOn = (id, n) => pg.evaluate(([id, n]) => (window.__drawn && window.__drawn[id] || []).slice(-n), [id, n]);
  const hookDrawn = () => pg.evaluate(() => { if (window.__drawn) return; window.__drawn = {}; const f = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (s) { const a = window.__drawn[this.canvas.id] || (window.__drawn[this.canvas.id] = []); a.push(String(s)); if (a.length > 2000) a.splice(0, 1000); return f.apply(this, arguments); }; });
  const respRows = () => pg.evaluate(() => [...document.querySelectorAll("#pid-resp tr")].slice(1)
    .map(r => r.children[0].textContent.split(" (")[0] + "=" + r.children[1].textContent).join("; "));

  // ---- cross-tab references name the right tab ----
  const src = fs.readFileSync(path.resolve(__dirname, "..", "lab", "index.html"), "utf8");
  check(src.includes("runs PIDF on the hub: F = kF x target speed (tab 6)") && src.includes("PID class from tab 7"), "launcher and PID references name tabs 6 and 7");

  // ---- tab order: opens on Java, digits read 1 to 8 in the plan's order ----
  await pg.goto(URL); await pg.waitForTimeout(300);
  check((await pg.$eval("section.lab.on", s => s.id)) === "lab-java", "the lab opens on Java basics");
  check(await pg.evaluate(() => document.body.classList.contains("autohide")), "auto-hide is on by default");
  await pg.evaluate(() => localStorage.setItem("ftc-lab-autohide", "off")); await pg.reload(); await pg.waitForTimeout(300);   // the checks below click the full menu
  const nav = await pg.$$eval("nav.tabs a", as => as.map(a => a.querySelector(".n").textContent + ":" + a.dataset.tab).join(" "));
  check(nav === "1:java 2:lifecycle 3:gitflow 4:mecanum 5:oneloop 6:feedback 7:pid 8:encoders", "tab bar reads 1 Java ... 8 Encoders in the teaching order: " + nav);
  const cards = await pg.$$eval("nav.jtopics .jt", bs => bs.map(b => b.dataset.jt).join(" "));
  check(cards === "anatomy classes vars private inherit decide loops scope words imports errors modules", "twelve Java cards in reading order, Loops after Decisions, Lists off the nav: " + cards);
  check(src.includes('"import com.qualcomm.robotcore.hardware.DcMotorEx;"') && !src.includes("imu.resetYaw();   // driver"), "words card Robot.java imports DcMotorEx and field-centric calls robot.resetHeading()");

  // ---- tab buttons work when the page opens as a data: URL (blocks hash navigation) ----
  const dp = await b.newPage();
  dp.on("pageerror", e => errs.push(e.message));
  await dp.goto("data:text/html;charset=utf-8," + encodeURIComponent(src));
  await dp.mouse.move(600, 12); await dp.waitForTimeout(200); await dp.click('nav.tabs a[data-tab="pid"]'); await dp.waitForTimeout(200);   // auto-hide on: point at the folded line, then pick a tab
  check((await dp.$eval("section.lab.on", s => s.id)) === "lab-pid", "tab button switches tabs on a data: URL page");
  await dp.close();

  // ---- team scoreboard: keys, buttons, persistence, toggle ----
  await pg.goto(URL + "#java"); await pg.waitForTimeout(300);
  await pg.click("#tm-reset"); await pg.click("#tm-reset");
  await pg.keyboard.press("3");
  await pg.click('.team[data-i="2"] button[data-d="1"]');
  check((await pg.textContent('.team[data-i="2"] b')) === "2" && !!(await pg.$('.team[data-i="2"].lead')), "key 3 and + give team 3 two points and the lead");
  await pg.reload(); await pg.waitForTimeout(300);
  check((await pg.textContent('.team[data-i="2"] b')) === "2", "scores survive a reload");
  await pg.click("#tm-reset"); await pg.click("#tm-reset");
  check((await pg.textContent('.team[data-i="2"] b')) === "0", "Reset scores clears the board");
  await pg.click("#tm-toggle");
  check(!(await pg.isVisible("#teambar")), "Teams button hides the scoreboard");
  await pg.click("#tm-toggle");

  // ==== area whole: ligatures, summary-click guard, two-click reset ====
  check((await pg.$eval("pre.code", p => getComputedStyle(p).fontFeatureSettings)).includes('"calt" 0'), "code panels draw no ligatures");
  await pg.click("#lab-java details.ask .q");
  await pg.click("#lab-java details.ask .tag");
  check(!(await pg.$eval("#lab-java details.ask", d => d.open)), "clicking the question does not reveal the answer");
  await pg.keyboard.press("2");
  await pg.click("#tm-reset");
  check((await pg.textContent("#tm-reset")) === "Click again to clear" && (await pg.textContent('.team[data-i="1"] b')) === "1", "one click on Reset scores only arms it");
  await pg.mouse.move(600, 600);
  check((await pg.textContent("#tm-reset")) === "Reset scores", "moving away disarms Reset scores");
  await pg.click("#tm-reset"); await pg.click("#tm-reset");
  check((await pg.textContent('.team[data-i="1"] b')) === "0", "two clicks on Reset scores clear the board");
  await pg.goto(URL + "#gitflow"); await pg.waitForTimeout(300);
  await pg.evaluate(() => window.scrollTo(0, 1500)); await pg.waitForTimeout(100);   // an instant jump: a wheel scroll animation keeps moving the page after the click
  const scrolledDown = await pg.evaluate(() => scrollY);
  await pg.evaluate(() => document.querySelector('nav.tabs a[data-tab="mecanum"]').click()); await pg.waitForTimeout(200);
  const afterTab = await pg.evaluate(() => [scrollY, document.querySelector("section.lab.on").id]);
  check(scrolledDown > 500 && afterTab[0] === 0, "a tab change opens the new tab at the top, on its goal line and vote (was " + scrolledDown + ", now " + afterTab + ")");
  await pg.mouse.wheel(0, 600); await pg.waitForTimeout(200);
  await pg.evaluate(() => document.documentElement.setAttribute("data-theme", document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark")); await pg.waitForTimeout(300);
  check((await pg.evaluate(() => scrollY)) > 0, "a theme repaint keeps the scroll place");
  await pg.evaluate(() => document.documentElement.removeAttribute("data-theme"));
  await pg.goto(URL + "#java"); await pg.waitForTimeout(300);   // the checks below start on Java
  // ==== end area whole ====

  // ---- Ask the room votes: tally, undo, reveal ----
  const optB = '#lab-java details.ask .opt:nth-child(1)';   // the right answer, A
  await pg.click(optB); await pg.click(optB); await pg.click(optB, { button: "right" });
  check((await pg.textContent(optB + " b")) === "1" && !(await pg.$("#lab-java details.ask[open]")), "a vote click counts, right-click undoes, and the answer stays hidden");
  check((await pg.textContent("#lab-java details.ask .vnext")) === "Team 2 votes next", "after one vote the label says Team 2 votes next");
  await pg.click("#lab-java details.ask .opt:nth-child(2)");   // team 2 picks B, the wrong one
  await pg.click("#lab-java details.ask .reveal");
  await pg.waitForSelector("#lab-java details.ask[open]"); await pg.waitForTimeout(50);   // the toggle event that pays the points is queued, not synchronous
  check(!!(await pg.$("#lab-java details.ask[open] .opt.right")) && (await pg.$eval(optB, o => o.classList.contains("right"))), "reveal marks option A as the right answer");
  check((await pg.textContent('.team[data-i="0"] b')) === "1" && (await pg.textContent('.team[data-i="1"] b')) === "0", "reveal pays team 1 (right) and not team 2 (wrong)");
  await pg.click(optB);   // team 3 votes A after the reveal
  check((await pg.textContent('.team[data-i="2"] b')) === "1", "a vote after the reveal scores at once");
  await pg.click(optB, { button: "right" });
  check((await pg.textContent('.team[data-i="2"] b')) === "0" && (await pg.textContent(optB + " b")) === "1", "right-click refunds the last paid vote");
  for (let i = 0; i < 5; i++) await pg.click(optB);
  check((await pg.textContent("#lab-java details.ask .vnext")) === "all 6 teams voted" && (await pg.textContent(optB + " b")) === "5", "a 7th vote is ignored");
  await pg.click("#tm-reset"); await pg.click("#tm-reset");
  check((await pg.textContent(optB + " b")) === "0" && (await pg.textContent('.team[data-i="0"] b')) === "0" && !(await pg.$("#lab-java details.ask[open]")), "Reset clears votes and scores together and hides the answer");
  check((await pg.$$("details.ask .vote")).length === 9, "every Ask the room has a vote");
  check(new Set(await pg.$$eval("details.ask .vote", vs => vs.map(v => v.dataset.right))).size === 3, "Ask the room answers spread over A, B and C");
  check(((await pg.$$eval("p.goal", ps => ps.map(p => p.textContent).join(" "))).match(/Team rule [123]: \w/g) || []).length === 4, "goal lines spell out the team rules they name");
  check((await pg.$$("details.ask .vote .reveal")).length === 9, "Reveal sits at the end of every vote row");

  // ---- the Ask the room block is compact: the first sim starts above the fold on a 1366x768 projector ----
  const fold = await b.newPage({ viewport: { width: 1366, height: 768 } });
  const foldOf = async t => { await fold.goto(URL + "#" + t); await fold.waitForTimeout(300);
    return fold.evaluate(() => { const lh = document.querySelector("section.lab.on .labhead"); return [Math.round(lh.getBoundingClientRect().height), Math.round(lh.nextElementSibling.getBoundingClientRect().top)]; }); };
  for (const t of ["pid", "feedback", "oneloop"]) { const [lh, top] = await foldOf(t);
    check(lh <= 190 && top <= 330, t + ": Ask the room block " + lh + " px, first block starts at " + top + " px"); }
  // ==== area lifecycle: code, message and lit state diagram all above the fold while you press the buttons; votes per press; threads outlive STOP ====
  await fold.goto(URL + "#lifecycle"); await fold.waitForTimeout(300);
  const lcBottom = sel => fold.$eval(sel, e => Math.round(e.getBoundingClientRect().bottom));
  await fold.click("#lc-init"); await fold.waitForTimeout(200);
  check(/Team rule: nothing moves during INIT\. Rule G304\.H is looser/.test(await fold.textContent("#lc-msg")), "lifecycle: the INIT message names the team rule next to G304.H");
  await fold.waitForTimeout(2400);
  check(/Vote before START/.test(await fold.textContent("#lc-msg")), "lifecycle: the wait message asks the vote before START");
  check(/^Rule G304\.H: fully motionless until START\. Team rule: nothing moved during INIT either\.\nLines 6 to 8 ran once/.test(await fold.textContent("#lc-msg")), "lifecycle: the wait message keeps G304.H and the team rule side by side while the room votes");
  const lcSdWait = await fold.textContent("#lc-sd");
  check(lcSdWait.includes("waitForStart()") && !/while loop|stopDrive|50 times/.test(lcSdWait), "lifecycle: in WAIT the state diagram hides the RUN and STOP text, so it does not answer the votes");
  const lcB = [await lcBottom("#lc-code"), await lcBottom("#lc-msg"), await lcBottom("#lc-sd")];
  check(lcB.every(y => y <= 768), "lifecycle at 1366x768: code, message and state diagram end above the fold: " + lcB.join(", "));
  await fold.click("#lc-start"); await fold.waitForTimeout(1200);
  check(/50 times per second \(slowed down here\)/.test(await fold.textContent("#lc-msg")), "lifecycle: the team START message says the highlight is slowed down");
  await fold.click("#lc-stop"); await fold.waitForTimeout(200);
  check((await fold.$eval("#lc-code .ln.hl", e => e.dataset.n)) === "16", "lifecycle: STOP highlights line 16, robot.stopDrive()");
  await fold.waitForTimeout(2400);
  check(/^Line 16 ran once/.test(await fold.textContent("#lc-msg")), "lifecycle: the done message names line 16, the STOP vote's answer");
  check(/stopDrive\(\)/.test(await fold.textContent("#lc-sd")), "lifecycle: after the run the state diagram shows every box's text for the recap");
  const tlText = await fold.$eval("#lc-tl", e => e.textContent);
  check(["START", "STOP: 30 s timer", "STOP: drivers press it", "8 s: pick TeleOp, press INIT"].every(t => tlText.includes(t)) && (tlText.match(/START/g) || []).length === 2, "lifecycle: the match timeline marks a START and a STOP for each OpMode");
  await fold.check('input[name="lcv"][value="bad"]');
  check((await fold.textContent("#lc-file")) === "MainTeleOpAI.java", "lifecycle: the file name follows the class name");
  await fold.click("#lc-init"); await fold.waitForTimeout(200);
  check(/^INIT pressed: lines 7 to 11 start the thread/.test(await fold.textContent("#lc-msg")), "lifecycle: the AI INIT message says lines 7 to 11 start the thread, not line 7 alone");
  await fold.waitForTimeout(2400);
  const lcAiWait = await fold.textContent("#lc-msg");
  check(/^Rule G304\.H broken: init finished and the arm still moves/.test(lcAiWait) && /DISABLED/.test(lcAiWait) && !/Referees call/.test(lcAiWait), "lifecycle: the AI wait message names the G304 penalty (held match or DISABLED), not a referee call");
  check(/<div class="a">C\. The thread starts the arm during INIT\. That already breaks the team rule/.test(src), "lifecycle: the Ask the room answer names the team rule for INIT and G304.H for after init");
  await fold.click("#lc-start"); await fold.waitForTimeout(500);
  await fold.click("#lc-stop"); await fold.waitForTimeout(2400);
  check(/nobody told the thread to stop/.test(await fold.textContent("#lc-msg")) && !(await fold.$eval("#lc-init", e => e.disabled)), "lifecycle: after STOP the thread runs on and INIT is free again");
  await fold.click("#lc-init"); await fold.waitForTimeout(200);
  check((await fold.$$("#lc-code .ln.hl2")).length === 2, "lifecycle: a new INIT does not stop the old thread");
  check(await fold.$eval("#lc-msg", e => /arm moves during INIT\. This already breaks the team rule/.test(e.textContent) && e.classList.contains("bad")), "lifecycle: the AI INIT message names the team rule the arm breaks");
  await fold.check('input[name="lcv"][value="good"]');
  const lcSwitch = await fold.textContent("#lc-msg");
  check(/^Robot Controller app restarted: the AI thread is gone/.test(lcSwitch) && /Vote before INIT/.test(lcSwitch) && (await fold.$$("#lc-code .ln.hl2")).length === 0, "lifecycle: switching back names the app restart that kills the thread, and keeps the INIT vote");
  await fold.screenshot({ path: path.join(SHOTS, "lifecycle-switch.png") });
  check((await lcBottom("#lc-msg")) <= 768, "lifecycle: the restart message ends above the fold at 1366x768");
  const lcPhone = await b.newPage({ viewport: { width: 390, height: 844 } });
  await lcPhone.goto(URL + "#lifecycle"); await lcPhone.waitForTimeout(400);
  const lcN = await lcPhone.evaluate(() => [document.querySelector("#lc-sd").getAttribute("viewBox"), Math.round(document.querySelector("#lc-tl").getBoundingClientRect().width),
    [...document.querySelectorAll("#lc-code .ln")].every(l => l.getBoundingClientRect().height < 24)]);
  check(lcN[0].startsWith("0 0 360") && lcN[1] >= 700 && lcN[2], "lifecycle at 390 px: state diagram is a column, timeline keeps full size, every code line on one numbered row: " + lcN.join(", "));
  await lcPhone.close();
  // ==== end area lifecycle ====
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
  await shot(pg.locator("#lab-java"), "java-words.png");
  // ==== area java-b: Scope, Every word explained, Error clinic ====
  await pg.click('#jv-wfiles button[data-f="MainTeleOp.java"]');
  await pg.click('#jv-wcode .w[data-w="robotcall"]');
  check(/Java follows the dot/.test(await pg.textContent("#jv-wmsg")) && !!(await pg.$('#jv-wcode .w[data-w="runop"]')) && !!(await pg.$('#jv-wcode .w[data-w="hwmap"]')), "robot.drive(), runOpMode() and hardwareMap are clickable words");
  check(!src.includes("Range.clip(axial") && src.includes("max = Math.max(max, 1.0);"), "words card drive() normalizes all 4 wheels instead of clipping one");
  await pg.mouse.move(900, 20);
  await pg.click('.jt[data-jt="scope"]');
  await pg.mouse.move(900, 20);
  for (let i = 0; i < 8; i++) await pg.click("#jv-snext");
  check(/slow mode never turns off/.test(await pg.textContent("#jv-smsg")), "Scope shows the slow-mode latch bug");
  await pg.mouse.move(900, 20);
  await pg.click('.jt[data-jt="errors"]');
  await pg.mouse.move(900, 20);
  check((await pg.textContent("#jv-errlist [data-e='0']")) === "Error 1" && !(await pg.$eval("#jv-decoder", el => el.closest("details").open)), "error buttons hide the diagnosis and the decoder starts closed");
  const firstRight = await pg.$$eval("#jv-echoices .choice", bs => bs.map(b => b.textContent).findIndex(t => /^Import class/.test(t)));
  check(firstRight === 2, "error 1: the right fix is not the top choice");
  await pg.click("#jv-echoices .choice[data-c='2']");
  check(/BUILD SUCCESSFUL/.test(await pg.textContent("#jv-eprob")) && (await pg.textContent("#jv-etitle")) === "1. Missing import", "the right fix builds and names the error");
  await shot(pg.locator("#lab-java"), "java-errors.png");
  await pg.click("#jv-errlist [data-e='1']");
  check(await pg.$eval("#jv-eprob", el => el.innerText.split("\n").some(l => /^\s+symbol: method clip/.test(l)) && el.innerText.split("\n").some(l => /^\s+location: class Range/.test(l))), "error 2 Build text puts symbol and location on their own indented lines");
  check(await pg.$eval('.jpane[data-jp="modules"]', p => { const l = p.querySelector(".legend"), m = p.querySelector("#jv-map"); return !!l && !!(l.compareDocumentPosition(m) & Node.DOCUMENT_POSITION_FOLLOWING); }), "project map legend sits above the map");
  check(await pg.$eval("#jv-buildline", s => { const t = s.querySelectorAll("text"); return t[0].textContent.startsWith("MainTeleOp.java:14") && [...s.querySelectorAll("path")].every(p => +p.getAttribute("d").match(/L[\d.]+ ([\d.]+)/)[1] < +t[1].getAttribute("y") - 20); }), "build line brackets sit under line 1, above the symbol line");
  check(await pg.$eval("#jv-implist", l => !l.closest(".panel").previousElementSibling), "imports list is the first panel, right under the address diagram");
  const phB = await b.newPage({ viewport: { width: 390, height: 844 } });
  await phB.goto(URL + "#java"); await phB.waitForTimeout(300);
  await phB.click('.jt[data-jt="imports"]'); await phB.waitForTimeout(100);
  check((await phB.evaluate(() => document.documentElement.scrollWidth)) <= 390, "390 px: the Imports card does not scroll sideways");
  await phB.close();
  // ==== end area java-b ====

  // ---- @Override tried three ways, and the Decisions card ----
  await pg.click('.jt[data-jt="inherit"]');
  await pg.click('#jv-ovbtns .b[data-ov="1"]');
  check(/does not override or implement/.test(await pg.textContent("#jv-ovprob")), "@Override on a typo fails the build with the javac message");
  await pg.click('#jv-ovbtns .b[data-ov="2"]');
  check(/BUILD SUCCESSFUL/.test(await pg.textContent("#jv-ovprob")) && /never resets|nobody calls/.test(await pg.textContent("#jv-ovmsg")), "Start() without @Override builds and never runs");
  check(/private final Robot robot = new Robot\(\);/.test(await pg.textContent("#jv-ovcode")) && !/matchTimer/.test(await pg.textContent("#jv-ovcode")), "the @Override versions declare robot, so BUILD SUCCESSFUL is true");
  check(/comes from this file, your Robot class, the SDK \(the class you extend or an import\), or Java itself/.test(await pg.textContent("#lab-java .lede")), "the Java lede names the four places a word comes from: this file, Robot, the SDK, Java");
  await pg.click('.jt[data-jt="decide"]');
  const stick = async v => { await pg.$eval("#jv-dstick", (el, v) => { el.value = v; el.dispatchEvent(new Event("input")); }, v); return pg.textContent("#jv-dmsg"); };
  check(/FAST forward/.test(await stick(0.8)) && /skips every/.test(await pg.textContent("#jv-dmsg")), "stick 0.8 runs the first if and skips the rest");
  check(/backward/.test(await stick(-0.4)), "stick -0.4 runs the third branch");
  check(/stopped/.test(await stick(0)) && /else: runs/.test(await pg.textContent("#jv-dcond")), "stick 0 falls to else");
  await pg.click('#jv-swbtns .b[data-s="SPINNING_UP"]');
  check((await pg.getAttribute("#jv-swmsg", "class")).includes("ok"), "switch with break stays in SPINNING_UP");
  await pg.check("#jv-swbrk");
  check(/falls into FEEDING/.test(await pg.textContent("#jv-swmsg")), "forgetting break falls through into FEEDING");
  check(await pg.$$eval("#jv-swcode .ln", ls => { const f = ls.findIndex(l => /case FEEDING/.test(l.textContent)); const fell = ls.slice(f + 1, f + 4); return fell.every(l => l.classList.contains("err") && !l.classList.contains("run")); }), "fall-through lines show red, not green");
  await shot(pg.locator("#lab-java"), "java-decide.png");

  // ---- Ask the room: Hide folds the question, Show brings it back ----
  await pg.click("#lab-java details.ask .ask-x");
  check(!(await pg.isVisible("#lab-java details.ask")) && (await pg.isVisible("#lab-java .ask-show")), "Hide folds the question away");
  await pg.click("#lab-java .ask-show");
  check(await pg.isVisible("#lab-java details.ask"), "Show the question brings it back");

  // ==== area java-a: Java card nav, card switching, cards 0 to 5 ====
  await pg.click('.jt[data-jt="inherit"]');
  await pg.click('#jv-ovbtns .b[data-ov="0"]');
  check((await pg.$eval("#jv-ovprob div:last-child", d => getComputedStyle(d).color)) === "rgb(126, 226, 168)", "BUILD SUCCESSFUL. 0 errors. shows green, not red");
  check(/^4\. extends/.test(await pg.textContent('.jpane[data-jp="inherit"] h3')), "the card heading carries the rail number");
  await pg.evaluate(() => window.scrollTo(0, 900)); await pg.waitForTimeout(100);
  await pg.click('.jt[data-jt="decide"]'); await pg.waitForTimeout(100);
  check((await pg.$eval('.jpane[data-jp="decide"]', p => p.getBoundingClientRect().top)) >= 0, "a card switch from far down the page opens the new card on its heading");
  await pg.evaluate(() => window.scrollTo(0, 0));
  const phone = await b.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
  await phone.goto(URL + "#java"); await phone.waitForTimeout(300);
  await phone.evaluate(() => { if (!document.body.classList.contains("autohide")) document.querySelector("#ah-toggle").click(); });
  check((await phone.$eval('.jt[data-jt="scope"]', b => getComputedStyle(b).color)) !== "rgba(0, 0, 0, 0)", "390 px with auto-hide: the card list shows titles, not blank buttons");
  await phone.tap('.jt[data-jt="scope"]'); await phone.waitForTimeout(100);
  check(await phone.isVisible('.jpane[data-jp="scope"]'), "390 px: a tap on a card title opens that card");
  await phone.close();
  // ==== end area java-a ====

  // ---- Auto-hide: the menu folds to one line, opens on hover, H toggles it ----
  const ahOn = () => pg.evaluate(() => document.body.classList.contains("autohide"));
  const menuOpen = () => pg.evaluate(() => getComputedStyle(document.querySelector(".tbfull")).visibility === "visible");
  if (!(await ahOn())) await pg.keyboard.press("h");
  await pg.mouse.move(600, 600); await pg.waitForTimeout(250);
  check(!(await menuOpen()) && /Java basics/i.test(await pg.textContent("#pk-tab")), "auto-hide folds the menu to one line naming the tab");
  await pg.mouse.move(600, 12); await pg.waitForTimeout(250);
  check(await menuOpen(), "pointing at the folded line opens the menu");
  await pg.click("#ah-toggle"); await pg.mouse.move(600, 600); await pg.waitForTimeout(250);
  check(!(await ahOn()) && (await menuOpen()), "the Auto-hide pin turns it off and the menu stays open");
  await pg.keyboard.press("h"); await pg.waitForTimeout(250);
  check((await ahOn()) && !(await menuOpen()), "key H turns auto-hide back on");
  await pg.keyboard.press("h");   // back to the full menu for the clicks below

  // ---- GitHub tab: terminal commands next to the Android Studio steps ----
  await pg.goto(URL + "#gitflow"); await pg.waitForTimeout(300);
  await pg.click("#gx-edit"); await pg.click("#gx-commit"); await pg.click("#gx-partner"); await pg.click("#gx-push");
  check(/git push\n# ! \[rejected\]/.test(await pg.textContent("#gx-cmd")), "a rejected push shows the git push error in the terminal box");
  await pg.click("#gx-pull");
  check(/^git pull/.test(await pg.textContent("#gx-cmd")), "Pull shows git pull");
  await pg.click("#gx-prnext");
  check(/git switch -c maya\/slow-mode/.test(await pg.textContent("#gx-prcmd")), "the PR loop shows the branch command");
  await pg.click("#gt-next"); await pg.click("#gt-next");
  check(/git commit -m "Add slow mode on left bumper"/.test(await pg.textContent("#gt-cmd")), "the conflict story shows the commit command");
  check((await pg.$$eval("pre.term", els => els.filter(e => e.textContent.trim()).length)) === 3, "all three terminal boxes hold a command");

  // ==== area gitflow: part 1 does not leak the prediction, a rejected push stays red ====
  await pg.click("#gx-reset"); await pg.click("#gx-edit");
  check(await pg.evaluate(() => { const f = document.querySelectorAll("#gx-places .flash"); return f.length === 1 && getComputedStyle(f[0]).animationName === "placeflash"; }), "#23: the three-places flash is a CSS animation, no real-time timer");
  await pg.click("#gx-commit");
  check(await pg.evaluate(() => { const f = document.querySelectorAll("#gx-places .flash"); return f.length === 1 && f[0] === document.querySelectorAll("#gx-places .place")[1]; }), "#23: each press flashes only the box it changed");
  await pg.click("#gx-partner");
  check(/to pull: \?/.test(await pg.textContent("#gx-status")), "after Leo pushes, the laptop does not know the pull count yet");
  check(!/pull/i.test(await pg.textContent("#gx-msg")) && /predict/.test(await pg.textContent("#gx-msg")), "after Leo pushes, the message asks for a prediction and does not hint at a pull");
  await pg.click("#gx-push"); await pg.waitForTimeout(900);
  check(await pg.evaluate(() => document.querySelectorAll("#gx-places .place")[2].classList.contains("reject")), "a rejected push keeps the GitHub box red");
  await pg.click("#gx-pull");
  check(await pg.evaluate(() => !document.querySelector("#gx-places .reject")), "Pull clears the red GitHub box");
  check((await pg.$$eval("#gx-prsteps, #gt-steps", els => els[1].children.length)) === 10 && !(await pg.textContent("#gx-org")).includes("Sync fork"), "conflict story has 10 steps and the org map has no mentor jargon");
  check(/your branch/.test(await pg.textContent("#gx-partner")), "button 3 says Leo pushes to your branch");
  const gf = await b.newPage({ viewport: { width: 1366, height: 768 } });
  await gf.goto(URL + "#gitflow"); await gf.waitForTimeout(300);
  const bare = () => gf.$$eval("#gx-places .ph span, #gx-places .parrow", els => els.every(e => getComputedStyle(e).visibility === "hidden"));
  check(await bare(), "before the first Reveal, the three places show titles only: no commit or push words answer the vote");
  await gf.click("#lab-gitflow .labhead .reveal"); await gf.waitForTimeout(100);
  check(!(await bare()) && (await gf.$$eval("#gx-places .place", els => els.every(e => e.getBoundingClientRect().height === 220))), "Reveal shows the subtitles and arrows, box heights unchanged");
  check(!/conflict/i.test(await gf.$$eval("#lab-gitflow h3.parthead", hs => hs[3].textContent)), "part 4 heading does not answer the conflict vote");
  for (let i = 0; i < 3; i++) await gf.click("#gt-next");
  check(await gf.evaluate(() => { const svg = document.querySelector("#gt-svg"), leo = [...svg.querySelectorAll("path")].find(p => / L/.test(p.getAttribute("d")));
    const m1 = [...svg.querySelectorAll("circle")][2], cx = +m1.getAttribute("cx"), cy = +m1.getAttribute("cy"); let d = 1e9;
    for (let s = 0; s <= leo.getTotalLength(); s++){ const q = leo.getPointAtLength(s); d = Math.min(d, Math.hypot(q.x - cx, q.y - cy)); } return d > 30; }), "Leo's branch leaves main clear of Maya's commit, so it does not seem to grow out of it");
  for (let i = 0; i < 4; i++) await gf.click("#gt-next");
  check(/Teams vote/.test(await gf.textContent("#gt-text")) && !/test/.test(await gf.textContent("#gt-text")), "conflict step 8 asks the room and does not give away the answer");
  check(/team keys/.test(await gf.textContent("#gt-text")) && /Fix the conflict/.test(await gf.textContent("#gt-text")), "step 8 says to score with the team keys and where the sides sit");
  check((await gf.$$eval("#gt-markers .ln", els => els.map(e => e.textContent.trim()))).includes("<<<<<<< HEAD"), "the conflict markers read <<<<<<< HEAD as git writes them");
  await gf.click("#gt-yours"); await gf.click("#gt-next"); await gf.click("#gt-next");
  check(/one commit/.test(await gf.textContent("#gt-text")) && /Pull request #2/.test(await gf.textContent("#gt-text")) && !/History keeps/.test(await gf.textContent("#gt-text")), "step 10 says squash puts one commit on main and the PR keeps both tries");
  check(/Precision \(#2\)/.test(await gf.textContent("#gt-svg")) && /keep 0\.3/.test(await gf.textContent("#gt-svg")) && /Merged/.test(await gf.textContent("#gt-prs")) && /branch -D leo/.test(await gf.textContent("#gt-cmd")), "Accept yours (the plan's path): PR #2 merges 0.3 onto main, and the squash branch goes with -D");
  await gf.click("#gt-back"); await gf.click("#gt-back"); await gf.click("#gt-theirs"); await gf.click("#gt-next"); await gf.click("#gt-next");
  check(/changes nothing/.test(await gf.textContent("#gt-text")) && !/Precision \(#2\)/.test(await gf.textContent("#gt-svg")) && !/Merged/.test(await gf.$$eval("#gt-prs .pr", els => els[1].textContent)) && /Close pull request/.test(await gf.textContent("#gt-as")) && /closed, not merged/.test(await gf.textContent("#gt-title")), "Accept theirs: PR #2 changes nothing, so Leo closes it unmerged and main gets no Precision commit");
  for (let i = 0; i < 5; i++) await gf.click("#gx-prnext");
  check(/Open PR/.test(await gf.textContent("#lab-gitflow")) && /Compare & pull request/.test(await gf.textContent("#gx-prcmd")), "the PR loop reaches Open PR after 5 steps");
  check(!/git push/.test(await gf.textContent("#gx-prcmd")), "the Open PR step does not suggest that push opens the PR");
  await gf.close();
  check(/no Reveal/.test(fs.readFileSync(path.join(__dirname, "..", "docs/course/crash-course-plan.md"), "utf8")) && /no Reveal/.test(fs.readFileSync(path.join(__dirname, "..", "docs/course/run-sheet.md"), "utf8")), "docs: the step 8 conflict vote scores with keys, no Reveal");
  // ==== end area gitflow ====

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
  await hookDrawn(); await pg.waitForTimeout(150);
  const turnLabels = await drawnOn("pid-plot1", 120), turnRows = await respRows();   // read both now: the table and the canvas show the same move
  const lab = re => turnLabels.filter(s => re.test(s)).pop() || "";
  const riseRow = (turnRows.match(/Rise time=([\d.]+) s/) || [])[1], settleRow = (turnRows.match(/Settling time=([\d.]+) s/) || [])[1];
  check(lab(/^10%$/) && lab(/^90%$/) && /^overshoot \d+% = [\d.]+ deg$/.test(lab(/^overshoot/)) && /^delay [\d.]+ s$/.test(lab(/^delay /)),
    "pid canvas: the target vs sensor chart draws the 10%, 90%, overshoot and delay markers: " + [lab(/^overshoot/), lab(/^delay /)].join(", "));
  check(lab(/^rise /) === "rise " + riseRow + " s" && lab(/^settle /) === "settle " + settleRow + " s",
    "pid canvas: the rise and settle brackets match the markers table: " + lab(/^rise /) + ", " + lab(/^settle /));
  await shot(pg.locator("#lab-pid"), "pid-turn.png");

  // ---- lift: F (PIDF) holds the lift with P only, and the loop diagram grows a 4th box with no error arrow ----
  await pg.click('.appbtn[data-app="lift"]'); await pg.waitForTimeout(300);
  await pg.click('[data-ps="P only"]'); await pg.waitForTimeout(3000);
  const liftP = await chips();
  const liftOff = (await drawnOn("pid-plot1", 120)).filter(s => /^offset /.test(s)).pop() || "";
  check(/^offset 1\.[5-9] in$/.test(liftOff), "pid canvas: lift P only marks the steady offset below the target: " + liftOff);
  await pg.$eval("#pid-kf", el => { el.value = 0.18; el.dispatchEvent(new Event("input")); }); await pg.waitForTimeout(3000);
  const liftF = await chips();
  console.log("  lift P only:", liftP, "| with F:", liftF);
  const errOf = s => +(s.match(/error (-?[\d.]+) in/) || [0, 99])[1], outOf = s => +(s.match(/output (-?[\d.]+)/) || [0, 0])[1];
  check(Math.abs(errOf(liftF)) < Math.abs(errOf(liftP)) && Math.abs(errOf(liftF)) < 0.5 && outOf(liftF) > 0.15, "F closes the P-only gap on the lift with no I");
  check((await pg.$eval("#pid-loop", s => s.innerHTML)).includes("no error") && (await pg.textContent("#pid-use")).includes("power = power + 0.18"), "lift shows the F box without an error arrow and the F line in the code");
  await shot(pg.locator("#lab-pid"), "pid-lift-f.png");
  await pg.click('.appbtn[data-app="turn"]'); await pg.waitForTimeout(300);
  check(!(await pg.$eval("#pid-loop", s => s.innerHTML)).includes("no error"), "turn has no F box");
  // ==== area pid: the turn sim matches turnToHeading(): stuck outside 1.5 deg, and a bump after the loop ended is not undone ====
  check(!(await pg.$('[data-ps="P too high"]')) && (await pg.$$eval("#lab-pid .lift-only", els => els.every(e => e.hidden))), "turn has no P too high preset and hides the lift-only legend");
  await pg.click('[data-ps="P only"]'); await pg.click("#pid-cbar .tc-reset"); await pg.waitForTimeout(3500);   // Reset run: from 0 to 90 deg with P only
  const pOnlyChips = await chips(); check(/loop still running: stuck/.test(pOnlyChips), "P only on the turn shows the loop stuck outside the break window: " + pOnlyChips);
  await pg.click('[data-ps="PID (tuned)"]'); await pg.waitForTimeout(3500);
  check(/loop ended: on target/.test(await chips()), "tuned PID ends the turn loop");
  await pg.click("#pid-bump"); await pg.waitForTimeout(1500);
  check(/nothing holds the heading/.test(await chips()), "a bump after the loop ended stays: nothing holds the heading");
  // the D caption reads shrinking from error and slope together: turning 90 to 0 deg, the error is negative and the slope positive
  await pg.click('[data-ps="PID (tuned)"]'); await pg.waitForTimeout(3000);
  await pg.evaluate(() => { window.__der = []; const f = CanvasRenderingContext2D.prototype.fillText; CanvasRenderingContext2D.prototype.fillText = function (s) { if (this.canvas.id === "pid-der") window.__der.push(String(s)); return f.apply(this, arguments); }; });
  await pg.click('[data-tg="0"]'); await pg.waitForTimeout(400);
  const derCap = await pg.evaluate(() => window.__der.filter(s => /^error /.test(s)).pop());
  check(derCap === "error shrinking: D pushes back, a brake", "D caption says shrinking when a negative error moves to 0: " + derCap);
  await pg.click('[data-ps="P only"]'); await pg.waitForTimeout(400);
  const derOff = await pg.evaluate(() => window.__der.filter(s => /^(error |kD |D box)/.test(s)).pop());
  check(derOff === "kD is 0: D adds nothing. Try a PD preset", "D caption says D adds nothing when kD is 0: " + derOff);
  check(!(await pg.textContent("#pid-resp")).includes("Lower kP"), "Overshoot row gives no tuning advice before the votes");
  check(!(await pg.$eval("#pid-howto", el => el.open)), "How to tune starts folded so it does not answer the overshoot votes");
  // ==== end area pid ====

  // ---- auto-aim: each preset, then search after dragging the HIVE out of view ----
  await pg.click('.appbtn[data-app="aim"]');
  for (const ps of ["P only", "P too high", "PD (tuned: no I needed)", "PID: I makes it worse here"]) {
    await pg.click('[data-ps="' + ps + '"]'); await pg.waitForTimeout(3000);
    console.log("  aim " + ps + " | " + (await chips()) + " | " + (await respRows()));
    if (ps === "P too high") check(/still swinging: no steady value/.test(await pg.textContent("#pid-resp")), "P too high reports no steady offset while it still swings");
  }
  const bb = await (await pg.$("#pid-view")).boundingBox();
  await pg.mouse.move(bb.x + bb.width * 0.62, bb.y + 40); await pg.mouse.down();
  await pg.mouse.move(bb.x + 30, bb.y + 150, { steps: 8 }); await pg.mouse.up();
  await pg.waitForTimeout(300);
  // Pause holds the state while the shot is taken, so each picture shows the state its name says
  const aimShot = async (state, name) => { await pg.evaluate(() => window.__setPause(true));
    const ok = new RegExp(state).test(await chips()); if (ok) await shot(pg.locator("#lab-pid"), name);
    await pg.evaluate(() => window.__setPause(false)); return ok; };
  check(await aimShot("SEARCHING", "pid-aim-searching.png"), "aim searches when the HIVE leaves the camera view");
  let locked = false;
  for (let i = 0; i < 12 && !locked; i++) { await pg.waitForTimeout(400); locked = /LOCKED ON/.test(await chips()); }
  check(locked && await aimShot("LOCKED ON", "pid-aim-locked.png"), "aim finds the HIVE again and locks on");
  await pg.click("#pid-hold"); await pg.waitForTimeout(200);
  check(/AIM OFF/.test(await chips()), "releasing the aim button shows AIM OFF");
  await shot(pg.locator("#lab-pid"), "pid-aim.png");

  // ---- chart controls ----
  await pg.click("#pid-cbar .tc-all"); await pg.waitForTimeout(200);
  const c1 = await (await pg.$("#pid-plot1")).boundingBox();
  await pg.mouse.move(c1.x + 100, c1.y + 80); await pg.mouse.down();
  await pg.mouse.move(c1.x + 300, c1.y + 90, { steps: 5 }); await pg.mouse.up();
  await pg.waitForTimeout(200);
  check((await pg.getAttribute("#pid-cbar .tc-live", "aria-pressed")) === "false" &&
        (await pg.getAttribute("#pid-cbar .tc-all", "aria-pressed")) === "false", "drag on the chart zooms in");
  await shot(pg.locator("#lab-pid"), "pid-zoom.png");
  await pg.click("#pid-cbar .tc-pause"); await pg.waitForTimeout(150);
  check((await pg.textContent("#ts-chip")) === "PAUSED", "chart Pause pauses the sim");
  await pg.click("#pid-cbar .tc-play");
  await pg.click("#pid-cbar .tc-reset"); await pg.waitForTimeout(150);
  check((await pg.getAttribute("#pid-cbar .tc-live", "aria-pressed")) === "true", "Reset run returns to live view");

  // ---- launcher chart ----
  await pg.goto(URL + "#feedback"); await pg.waitForTimeout(300);
  check(!/setPower/.test(await pg.textContent("#lab-feedback .goal")), "launcher: the goal leaves the setPower() vote open");
  await pg.click("#fb-cbar .tc-reset");
  let peak = 0, low = Infinity;
  for (let i = 0; i < 30; i++) {
    await pg.waitForTimeout(100);
    const w = +(await pg.textContent("#fb-ready")).match(/closed loop: (\d+)/)[1];
    peak = Math.max(peak, w); low = Math.min(low, w);
  }
  console.log("  launcher closed-loop spin-up: low", low, "peak", peak);
  check(low < 800 && peak > 1100 && peak < 1200, "closed-loop launcher spins up without overshooting the HIVE window");
  // #19: launcher behavior read from the chips. Open loop follows the battery, closed loop holds the HIVE window
  const fbChips = async () => { const t = await pg.textContent("#fb-ready");
    return { o: +t.match(/open loop: (\d+)/)[1], c: +t.match(/closed loop: (\d+)/)[1], ready: /launcherReady\(\) = true/.test(t) }; };
  const inHive = w => w >= 1120 && w <= 1200;
  await pg.click("#fb-feed"); await pg.waitForTimeout(2500);
  const fbFresh = await fbChips();
  await pg.$eval("#fb-v", el => { el.value = 11.8; el.dispatchEvent(new Event("input")); }); await pg.waitForTimeout(2500);
  const fbSag = await fbChips();
  console.log("  launcher 12.5 V:", JSON.stringify(fbFresh), "| 11.8 V:", JSON.stringify(fbSag));
  check(inHive(fbFresh.o) && fbSag.o < 1120 && fbSag.o < fbFresh.o - 40, "launcher: open loop speed falls as the battery sags, out of the HIVE window at 11.8 V: " + fbFresh.o + " -> " + fbSag.o);
  check(inHive(fbFresh.c) && inHive(fbSag.c) && fbSag.ready, "launcher: closed loop holds the HIVE window and launcherReady() at 11.8 V: " + fbFresh.c + " -> " + fbSag.c);
  await pg.click("#fb-feed"); await pg.waitForTimeout(2000);
  const fbScore = await pg.$$eval("#fb-score tr", rs => rs.slice(1).map(r => [...r.children].slice(1, 4).map(td => +td.textContent).join("/")));
  check(fbScore[0] === "1/1/0" && fbScore[1] === "2/0/0", "launcher: the shot at 11.8 V falls short open loop and lands closed loop (in/short/long): " + fbScore.join(" vs "));
  await shot(pg.locator("#lab-feedback"), "feedback.png");

  // ---- one loop: Pause, Resume and Reset run ----
  await pg.goto(URL + "#oneloop"); await pg.waitForTimeout(300);
  await pg.click("#ol-launch"); await pg.waitForTimeout(600);
  await pg.click("#ol-pause"); await pg.waitForTimeout(150);
  check((await pg.textContent("#ol-pause")) === "Resume" && (await pg.textContent("#ts-chip")) === "PAUSED", "one loop Pause pauses and the button says Resume");
  await pg.click("#ol-pause"); await pg.waitForTimeout(150);
  check((await pg.textContent("#ol-pause")) === "Pause", "Resume runs the sim again");
  await pg.click("#ol-reset"); await pg.waitForTimeout(100);
  check(/ 0 in/.test(await pg.textContent("#ol-errA")) && / 0 in/.test(await pg.textContent("#ol-errB")), "Reset run clears the error chips");
  await shot(pg.locator("#lab-oneloop"), "oneloop.png");
  // ==== area oneloop: stuck line in the header, diagram and code B agree ====
  await pg.click("#ol-launch"); await pg.waitForTimeout(400);
  check(/^stuck on line 6: sleep\(1000\)$/.test(await pg.textContent("#ol-stA")), "one loop: the sleep panel names the stuck line during Launch");
  await pg.waitForTimeout(1300);
  check(/sticks ignored 1\.3 s/.test(await pg.textContent("#ol-errA")) && /\bbad\b/.test(await pg.getAttribute("#ol-errA", "class")) && /sticks ignored 0\.0 s/.test(await pg.textContent("#ol-errB")) && /\bok\b/.test(await pg.getAttribute("#ol-errB", "class")), "one loop: the chips score sticks ignored, sleep 1.3 s red, state machine 0.0 s green, at any Launch moment");
  await pg.click("#ol-reset"); await pg.waitForTimeout(100);
  const olIdle = await pg.evaluate(() => document.querySelector("#ol-codeB").textContent.split("case IDLE:")[1].split("break;")[0]);
  check(/robot\.launcherOff\(\)/.test(olIdle) && /launcherOff\(\)/.test(await pg.textContent("#ol-sm")), "one loop: code B IDLE and the diagram both call launcherOff()");
  check(/state machine/.test(await pg.textContent("#lab-oneloop .goal")) && /stopwatch/.test(await pg.textContent("#lab-oneloop h3:has(+ #ol-codeB) small")), "one loop: the goal names the state machine and code B says what feedTimer is");
  check(/feedTimer\.reset\(\)/.test(await pg.textContent("#jv-swcode")) && !(await pg.content()).includes("feedOnce"), "one loop: the tab 1 switch runs the same launcher machine as code B, no feedOnce()");
  // ==== end area oneloop ====

  // ---- encoders: perfect grip lands on the line, slip stops short while the encoder reads 24 in ----
  await pg.goto(URL + "#encoders"); await pg.waitForTimeout(300);
  const enRun = async () => { await pg.click("#en-run"); for (let i = 0; i < 30 && !/driveBusy\(\) went false|tape says/.test(await pg.textContent("#en-msg")); i++) await pg.waitForTimeout(250); return pg.textContent("#en-msg"); };
  check(/stopped on the line/.test(await enRun()), "encoders: perfect grip stops on the line");
  await pg.$eval("#en-slip", el => { el.value = 8; el.dispatchEvent(new Event("input")); });
  await pg.click("#en-strafe");
  check(/wheels slipped/.test(await enRun()) && /yourcodethinks23\.9/.test((await pg.textContent("#en-kv")).replace(/\s+/g, "")), "encoders: slip stops short while the code still thinks 24 in");
  await pg.check("#en-ramp"); await pg.$eval("#en-dia", el => { el.value = "3.27"; el.dispatchEvent(new Event("input")); });
  check(/STRAFE_COUNTS_PER_INCH/.test(await enRun()) && /yourcodethinks23\.9intapemeasure\(real\)2[34]\.\d/.test((await pg.textContent("#en-kv")).replace(/\s+/g, "")), "encoders: a measured 3.27 lands a ramped strafe on the line and names STRAFE_COUNTS_PER_INCH");
  check(/opModeIsActive\(\)/.test(await pg.textContent("#lab-encoders .goal")) && !/wheels slipping/.test(await pg.textContent("#lab-encoders .lede")), "encoders: the goal names the STOP rule, the lede leaves the vote open");
  await pg.$eval("#en-dia", el => { el.value = "4.09"; el.dispatchEvent(new Event("input")); });
  await shot(pg.locator("#lab-encoders"), "encoders.png");

  // ==== area mecanum: Drive modes tab 4 ====
  // MC sits inside the page IIFE, so these checks read the DOM, not MC.get()
  await pg.goto(URL + "#mecanum"); await pg.waitForTimeout(300);
  await pg.check('#lab-mecanum input[value="field"]');
  await pg.click("#mc-turn90");
  await pg.click('#lab-mecanum [data-p="0,-1,0"]'); await pg.waitForTimeout(1000);
  const mcRow = name => pg.$$eval("#mc-table tr", (rs, n) => { const r = rs.find(x => x.children[0].textContent === n); return r ? r.lastElementChild.textContent.trim() : ""; }, name);
  const sent = [];
  for (const n of ["frontLeft", "frontRight", "backLeft", "backRight"]) sent.push(await mcRow(n));
  check(sent.join(" ") === "1.00 -1.00 -1.00 1.00" && (await mcRow("IMU heading")) === "90 deg", "field-centric, facing the left wall, stick up sends the strafe-right pattern: " + sent.join(" "));
  await pg.click('#lab-mecanum [data-p="0,0,0"]'); await pg.click("#mc-reset"); await pg.click("#mc-turn90"); await pg.click("#mc-yaw"); await pg.waitForTimeout(300);
  const zeroNote = () => pg.textContent("#mc-note");
  check(!/IMU zero is off/.test(await zeroNote()), "the wrong-zero warning stays hidden until the robot moves");
  await pg.click('#lab-mecanum [data-p="0,-1,0"]'); await pg.waitForTimeout(800);
  check(/IMU zero is off/.test(await zeroNote()) && (await mcRow("IMU heading")) === "0 deg", "after a reset facing the wall, Forward shows the wrong-zero warning");
  await shot(pg.locator("#lab-mecanum"), "mecanum.png");
  // AUTO uses Pinpoint axes: +X away from the drivers, +Y toward the left wall
  await pg.click('#lab-mecanum [data-p="0,0,0"]'); await pg.click("#mc-reset");
  await pg.check('#lab-mecanum input[value="auto"]'); await pg.waitForTimeout(200);
  const fb = await pg.locator("#mc-field").boundingBox();
  await pg.mouse.click(fb.x + fb.width * 0.35, fb.y + fb.height * 0.15); await pg.waitForTimeout(200);
  const err = (await mcRow("error to point")).split(",").map(Number);
  check(err[0] > 0 && err[1] > 0 && /\d deg/.test(await mcRow("direction angle")), "AUTO: a target ahead and to the left gives errX > 0 and errY > 0, row reads direction angle: " + err);
  // one heading source: the AUTO code, card and math table name the Pinpoint heading, the same one the pose uses
  const mcAuto = (await pg.textContent("#mc-code")) + (await pg.textContent('#mc-uses [data-m="auto"]'));
  check(/One heading source/.test(mcAuto) && /robot\.getPose\(\)/.test(mcAuto) && /deg$/.test(await mcRow("Pinpoint heading")) && (await mcRow("IMU heading")) === "", "AUTO: code, card and math table use one heading source, the Pinpoint heading");
  // fix-mecanum: the rotation panel names Pinpoint in AUTO, the compass leaves the field on a 1366 px projector
  await hookDrawn(); await pg.waitForTimeout(150);
  check((await drawnOn("mc-vec", 20)).includes("To the target, robot at Pinpoint heading"), "AUTO: the rotation panel reads robot at Pinpoint heading");
  const fg = await pg.evaluate(() => { const c = document.querySelector("#mc-field"), w = c.getBoundingClientRect().width, h = c.getBoundingClientRect().height, side = Math.min(w - 16, h - 40); return { w, side, ox: (w - side) / 2 }; });
  const compassX = await pg.evaluate(() => { let x = null; const f = CanvasRenderingContext2D.prototype.fillText; CanvasRenderingContext2D.prototype.fillText = function (s, X) { if (this.canvas.id === "mc-field" && /^heading /.test(s)) x = X; return f.apply(this, arguments); }; return new Promise(r => setTimeout(() => { CanvasRenderingContext2D.prototype.fillText = f; r(x); }, 150)); });
  check(compassX > fg.ox + fg.side, "the compass heading sits right of the field, clear of targets in the top-right corner: x " + Math.round(compassX) + " > field edge " + Math.round(fg.ox + fg.side));
  // fix-mecanum: blue = + and red = - in the wheel view, no wheel-color dots; the chart names the wheels at their power
  await pg.check('#lab-mecanum input[value="robot"]'); await pg.click('#lab-mecanum [data-p="1,0,0"]');
  const arcs = await pg.evaluate(() => { let n = 0; const f = CanvasRenderingContext2D.prototype.arc; CanvasRenderingContext2D.prototype.arc = function () { if (this.canvas.id === "mc-wheels") n++; return f.apply(this, arguments); }; return new Promise(r => setTimeout(() => { CanvasRenderingContext2D.prototype.arc = f; r(n); }, 300)); });
  check(arcs === 0, "the wheel view draws no wheel-color dots, so red only means a negative power: " + arcs + " arcs");
  await pg.waitForTimeout(600);
  const mcNames = await drawnOn("mc-plot", 30);
  check(mcNames.includes("FL BR") && mcNames.includes("FR BL"), "strafe right: the wheel chart names FL BR at +1 and FR BL at -1: " + mcNames.filter(s => /^[FB][LR]/.test(s)).slice(-2).join(" / "));
  await pg.click('#lab-mecanum [data-p="0,0,0"]');
  // ==== end area mecanum ====

  // ==== area encoders: STOP demo booleans, layout on a 1366x768 projector, Robot.java ====
  {
    const en = await b.newPage({ viewport: { width: 1366, height: 768 } });
    en.on("pageerror", e => errs.push("encoders: " + e.message));
    await en.goto(URL + "#encoders"); await en.waitForTimeout(300);
    const kv = async () => (await en.textContent("#en-kv")).replace(/\s+/g, "");
    await en.click("#en-run"); await en.waitForTimeout(300); await en.click("#en-stop"); await en.waitForTimeout(200);
    check(/Clean stop/.test(await en.textContent("#en-msg")) && /driveBusy\(\)trueopModeIsActive\(\)false/.test(await kv()), "encoders: clean STOP shows driveBusy() true, opModeIsActive() false");
    await en.check("#en-bug");
    check(/0\.25x/.test(await en.textContent("#en-msg")), "encoders: the bug toggle tells the mentor to slow the sim");
    await en.click("#en-run"); await en.waitForTimeout(300); await en.click("#en-stop"); await en.waitForTimeout(200);
    const lay = await en.evaluate(() => {
      const wl = [...document.querySelectorAll("#en-code .ln")].find(n => n.textContent.includes("while ("));
      return { msg: document.querySelector("#en-msg").getBoundingClientRect().bottom, span: wl.getBoundingClientRect().bottom - document.querySelector("#en-canvas").getBoundingClientRect().top, room: innerHeight - document.querySelector(".topbar").getBoundingClientRect().bottom };
    });
    check(/driveBusy\(\) stays true/.test(await en.textContent("#en-msg")) && lay.msg <= 768, "encoders: the bug message sits above the fold at 1366x768 (" + Math.round(lay.msg) + " px)");
    check(lay.span <= lay.room, "encoders: robot, booleans and the red while line fit on one screen (" + Math.round(lay.span) + " of " + Math.round(lay.room) + " px)");
    check(/setTargetPosition/.test(await en.textContent("#en-robot-code")) && !src.includes("rampTimer.reset"), "encoders: Robot.java shows setTargetPosition, the ramp code compiles as shown");
    // turnToHeading exercise (issue 28): sim time, break window, hidden answer, same Java as tab 7
    check(await en.$eval("#en-tt-code", el => el.hidden && getComputedStyle(el).display === "none"), "encoders: the turnToHeading answer starts hidden");
    await en.evaluate(() => window.__setPause(true));
    await en.click("#en-tt-run"); await en.waitForTimeout(600);
    check(/hub drives 24 in/.test(await en.textContent("#en-tt-msg")), "encoders: the drive + turn run waits while the sim is paused");
    await en.evaluate(() => window.__setPause(false));
    for (let i = 0; i < 40 && !/Break after/.test(await en.textContent("#en-tt-msg")); i++) await en.waitForTimeout(200);
    const ttChips = (await en.textContent("#en-tt-chips")).replace(/\s+/g, "");
    check(/Break after \d\.\d s/.test(await en.textContent("#en-tt-msg")) && ttChips.includes("|error|<1.5:true") && ttChips.includes("|rate|<5:true"), "encoders: turnToHeading(90) breaks inside the 1.5 deg window and stopped: " + ttChips);
    await en.click("#en-tt-show");
    const ttCode = await en.$eval("#en-tt-code", el => el.hidden ? "" : [...el.querySelectorAll(".ln")].map(n => n.textContent.trim()));
    check(ttCode.includes("driveInches(24, 0.5);") && ttCode.includes("turnToHeading(90);                       // the new line") && (await en.textContent("#en-tt-show")) === "Hide the answer", "encoders: Show the answer reveals the drive then turnToHeading(90)");
    await en.goto(URL + "#pid"); await en.waitForTimeout(300);
    const pidTurn = await en.$$eval("#pid-use .ln", ns => ns.map(n => n.textContent.trim()));
    const method = pidTurn.slice(pidTurn.findIndex(l => l.startsWith("private void turnToHeading")));
    check(method.length > 8 && method.every(l => ttCode.includes(l)), "encoders: the exercise answer prints the same turnToHeading() lines as the tab 7 turn job");
    await en.close();
  }
  // ==== end area encoders ====

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
  check(/>feeder<\/text>/.test(csSrc) && csSrc.includes(">feederOn()</text>") && csSrc.includes(">feederOff()</text>"), "cheat sheet: Robot.java box lists the feeder and feederOn()/feederOff()");
  check(csSrc.includes(">rightBumperWasPressed()</text>") && csSrc.includes(">then feedTimer.reset()</text>") && csSrc.includes(">then feederOff()</text>") && csSrc.includes(">launcherOff()</text>") && !/cancel, back to IDLE/.test(csSrc), "cheat sheet: launcher state machine matches tab 5 code B, no cancel arc");
  check(/fully motionless: rule G304\.H/.test(csSrc) && /team rule, stricter: nothing moves in INIT/.test(csSrc), "cheat sheet: G304.H and the stricter team rule labeled apart");
  check(fit.every(f => f.overflow.length === 0), "no diagram label runs past its figure: " + fit.flatMap(f => f.overflow).join(" | "));
  // day-of docs match the lab: the 8 parts of card 0, the conflict markers of tab 3, colored labels print in color, the PR flowchart arrows stay off the boxes
  const regKeys = [...src.matchAll(/\{k: "(\w+)", c: "--\w+", l: \[/g)].map(m => m[1]);
  const csParts = await cs.evaluate(() => [...document.querySelector(".fig svg").querySelectorAll("text.b")].map(t => t.textContent).filter(t => !/^\d$/.test(t)));
  check(regKeys.slice(0, 8).join() === "package,imports,annotation,class,fields,method,locals,calls" && csParts.join() === regKeys.slice(0, 8).join(), "cheat sheet: the 8 parts carry the names of lab card 0: " + csParts.join());
  check(src.includes('"<<<<<<< HEAD"') && src.includes('">>>>>>> origin/main"') && csSrc.includes("&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD") && csSrc.includes("&gt;&gt;&gt;&gt;&gt;&gt;&gt; origin/main</text>"), "cheat sheet: conflict markers read HEAD and origin/main, as tab 3 and git show them");
  const csLook = await cs.evaluate(() => {
    const red = document.querySelector('svg text[fill="#cf3535"]'), svg = [...document.querySelectorAll("svg")].find(s => /Approved\?/.test(s.textContent));
    const hit = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
    const fix = svg.querySelector("rect.rd").getBoundingClientRect(), arrows = [...svg.querySelectorAll("path.ag, path.ar")].filter(p => !p.getAttribute("d").startsWith("M298"));
    return { red: getComputedStyle(red).fill, crossed: arrows.filter(p => hit(p.getBoundingClientRect(), fix)).map(p => p.getAttribute("d")) };
  });
  check(csLook.red === "rgb(207, 53, 53)" && csLook.crossed.length === 0, "cheat sheet: red labels print red, no arrow runs through the Fix, commit, push box: " + JSON.stringify(csLook));
  await cs.close();

  // ==== area feedback: smoke checks for the feedback teaching fixes go below this line ====
  await pg.goto(URL + "#feedback"); await pg.waitForTimeout(300);
  const fbUi = await pg.evaluate(() => ({
    primary: document.querySelector("#lab-feedback .b.primary").id,
    resetGone: !document.querySelector("#fb-reset"),
    hitCell: !!document.querySelector("#fb-score td.hit"),
    lede: document.querySelector("#lab-feedback .lede").textContent,
    code: document.querySelector("#fb-codeB").textContent,
    blocks: document.querySelector("#fb-blocks").textContent
  }));
  check(fbUi.primary === "fb-match" && fbUi.resetGone, "feedback: the match is the primary button and Reset run is the only reset");
  check(fbUi.hitCell && /Yellow/.test(fbUi.lede) && /ticks per second/.test(fbUi.lede), "feedback: lede names the yellow line and defines ticks per second, IN HIVE reads green");
  check(/Robot\.java/.test(fbUi.code) && (fbUi.blocks.match(/battery/g) || []).length === 2 && /ticks\/s/.test(fbUi.blocks), "feedback: code panels name Robot.java, both block diagrams feel the battery");
  const fbMore = await pg.evaluate(() => ({
    codeA: document.querySelector("#fb-codeA").textContent,
    note: (document.querySelector("#fb-ready-note") || {}).textContent || ""
  }));
  check(!/battery/i.test(fbMore.codeA) && /no sensor/.test(fbMore.codeA), "feedback: open-loop code comment does not answer the battery vote");
  check(/launcherOn\(\)/.test(fbMore.note) && /launcherReady\(\)/.test(fbMore.note) && /40 ticks\/s of 1160/.test(fbMore.note) && /tab 5/.test(fbMore.note), "feedback: note under the chips ties launcherReady() to Robot.java and the tab 5 state machine");
  // marker labels never sit on a curve: draw with markers off, then count curve and shot-dot pixels inside each label box
  {
    const fbBoxes = () => pg.evaluate(() => window.__fbLabels || []);
    const underLabels = async () => {
      const bx = await fbBoxes();
      await pg.click("#fb-cbar .tc-marks"); await pg.waitForTimeout(120);
      const hits = await pg.evaluate(bx => {
        const cv = document.querySelector("#fb-plot"), d = window.devicePixelRatio || 1, ctx = cv.getContext("2d"), css = getComputedStyle(document.documentElement);
        const cols = ["--pollen", "--accent", "--red"].map(v => { const n = parseInt(css.getPropertyValue(v).trim().slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; });
        return bx.map(b => { const px = ctx.getImageData(Math.round(b.x0 * d), Math.round(b.y0 * d), Math.max(1, Math.round((b.x1 - b.x0) * d)), Math.max(1, Math.round((b.y1 - b.y0) * d))).data; let c = 0;
          for (let i = 0; i < px.length; i += 4) if (px[i + 3] > 200 && cols.some(w => Math.abs(px[i] - w[0]) < 30 && Math.abs(px[i + 1] - w[1]) < 30 && Math.abs(px[i + 2] - w[2]) < 30)) c++;
          return { s: b.s, c, tag: b.y0 < 26 && b.x1 > cv.clientWidth - 56 }; });
      }, bx);
      await pg.click("#fb-cbar .tc-marks"); await pg.waitForTimeout(120);
      return hits;
    };
    const run = async (sec) => { await pg.evaluate(() => window.__setPause(false)); await pg.waitForTimeout(sec * 500); await pg.evaluate(() => window.__setPause(true)); await pg.waitForTimeout(120); };   // 2x sim speed
    const both = async name => {   // the same paused moment on the projector and on a phone
      const out = [];
      for (const vp of [{ width: 1366, height: 768 }, { width: 390, height: 844 }]) {
        await pg.setViewportSize(vp); await pg.waitForTimeout(150);
        const h = await underLabels();
        out.push(vp.width + ": " + h.map(x => x.s + "=" + x.c + (x.tag ? " ON TAG" : "")).join(", "));
        check(h.length >= 3 && h.some(x => x.s === "HIVE window") && h.every(x => x.c === 0 && !x.tag), "feedback: marker and HIVE labels sit clear of the curves, dots and the LIVE tag, " + name + " at " + vp.width + " px: " + out[out.length - 1]);
      }
      await pg.setViewportSize({ width: 1366, height: 900 });
    };
    await pg.$eval("#ts-slider", el => { el.value = 1000; el.dispatchEvent(new Event("input")); });
    for (const v of [11.8, 13.6]) {
      await pg.$eval("#fb-v", (el, v) => { el.value = v; el.dispatchEvent(new Event("input")); }, v);
      await pg.click("#fb-cbar .tc-reset"); await run(3.5);
      await pg.click("#fb-feed"); await run(1.5);
      await both("pause on the dip at " + v + " V");
    }
    await pg.click("#fb-cbar .tc-reset"); await run(0.5);
    await pg.click("#fb-match"); await run(33);
    await both("after the match");
    await pg.click("#fb-cbar .tc-all"); await pg.waitForTimeout(100);
    await both("after the match, Show all");
    // the plan's answer key for the match prediction: C, closed loop by a lot (near 50% vs 100%)
    const rates = await pg.$$eval("#fb-score tr", trs => trs.slice(1).map(tr => parseInt(tr.lastElementChild.textContent, 10)));
    check(rates[0] >= 40 && rates[0] <= 60 && rates[1] === 100 && /Right answer C: the lab ends near 50%/.test(fs.readFileSync(path.resolve(__dirname, "..", "docs", "course", "crash-course-plan.md"), "utf8")), "feedback: the 2-minute match ends near 50% vs 100%, as the plan's answer key says: " + rates.join(" vs "));
    // P + I + D box: F and the fix add up to the motor power on screen
    const sum = (await pg.textContent("#fb-blocks")).match(/F = kF x target([\d.]+) power.*fixes error: ([+-][\d.]+).*?power ([\d.]+)/);
    check(sum && Math.abs(+sum[1] + +sum[2] - +sum[3]) < 1e-9, "feedback: block diagram F + fix = motor power: " + (sum ? sum.slice(1).join(" ") : "no match"));
    // phone: block diagrams keep full-size labels and scroll in their panel, the score table shows Hit rate
    await pg.setViewportSize({ width: 390, height: 844 }); await pg.waitForTimeout(200);
    const fbPhone = await pg.evaluate(() => ({ blocks: document.querySelector("#fb-blocks").getBoundingClientRect().width, score: document.querySelector("#fb-score").scrollWidth, box: document.querySelector("#fb-score").parentElement.clientWidth, page: document.documentElement.scrollWidth }));
    check(fbPhone.blocks >= 830 && fbPhone.score <= fbPhone.box && fbPhone.page <= 390, "feedback: at 390 px the block diagrams keep 830 px, the score table fits, no page scroll: " + JSON.stringify(fbPhone));
    await pg.setViewportSize({ width: 1366, height: 900 });
    await pg.evaluate(() => window.__setPause(false)); await pg.click('#ts-ticks span[data-v="1"]');
  }
  // ==== end area feedback ====

  // ==== area docs: G304.H rule text vs team rule, course docs agree with the manual and the plan ====
  await pg.goto(URL + "#java"); await pg.waitForTimeout(300);
  await pg.mouse.move(900, 20);
  await pg.click('.jt[data-jt="words"]');
  await pg.click('#jv-wfiles button[data-f="MainTeleOp.java"]');
  await pg.click('#jv-wcode .w[data-w="waitforstart"]');
  const wfsMsg = await pg.textContent("#jv-wmsg");
  check(/once init finishes, the robot stays fully motionless/.test(wfsMsg) && /team rule is stricter/.test(wfsMsg), "docs: waitForStart() word quotes G304.H and labels no movement in INIT as the team rule");
  check(!/the robot sits still after INIT/.test(src), "docs: AI version answer no longer says G304.H covers INIT");
  const doc = f => fs.readFileSync(path.resolve(__dirname, "..", "docs", "course", f), "utf8");
  const ref = doc("ftc-reference-2026-27.md"), plan = doc("crash-course-plan.md"), gw = doc("github-team-workflow.md"), std = doc("team-coding-standard.md");
  check(/TU08/.test(ref) && !/TU07 dated|new in TU07|Practice-only|\[Verify wording\]|\[Verify R704\]/.test(ref) && /FTControl Panels/.test(ref) && /PARK 5, in AUTO and again in TELEOP/.test(ref), "docs: reference cites TU08, R704.D off at the venue, PARK in TELEOP");
  check(ref.split("\n").filter(l => /\[Verify\]/.test(l) && !/still marked/.test(l)).length === 1 && /\[Verify\] FTC robot code/.test(ref) &&/2026-award-deadlines-approaching/.test(ref), "docs: reference keeps one [Verify], on AI robot code, and cites the 2026 FIRST post");
  check(/fully motionless following completion of OpMode initialization/.test(ref + plan + gw + std) && !/no movement: rule G304\.H/.test(plan), "docs: plan, reference, workflow and standard quote G304.H and call no movement in INIT a team rule");
  check(/Right answers: INIT A \(lines 6 to 8, then wait at line 9\), START C \(lines 10 to 14, over and over\), STOP A \(line 16/.test(plan) && !/tab 2 vote is fresh for Module 2/.test(plan) && /manual-11 \(G304, G305, G401-G404\)/.test(ref), "docs: plan gives the Module 2 prediction letters, does not re-run the tab 2 vote, and the reference cites manual-11 for G304");
  check(/loses LEAVE/.test(plan) && !/from Module 6 for turns/.test(plan) && /from lab tab 7 \(the PID turn job\)/.test(plan), "docs: plan says a wall park loses LEAVE and points turnToHeading at lab tab 7");
  check(/On the Crash Course day \(Module 3, lab tab 3, 20 min\)/.test(gw) && /Maya sets the slow-mode value to 0\.4, Leo sets the same line to 0\.3/.test(gw) && /team-roster\.md/.test(gw) && /team-roster\.md/.test(plan), "docs: GitHub drills split the projector day from the hands-on session and match the plan's roster drill");
  check(/`\? :` to pick one of two values/.test(std) && src.includes("turn = lastBearing > 0 ? -0.3 : 0.3;") && !/\| Interfaces, abstract classes, generics \|/.test(std) && src.includes("List<Double> shots = new ArrayList<>();"), "docs: standard allows List<Type> and one-level ternary, and the lab Java matches");
  // ==== end area docs ====

  // ==== area charts ====
  {
    // count pixels near a palette color inside a box of a canvas (dpr 1 in this browser)
    const near = (sel, varName, box) => pg.evaluate(([sel, varName, box]) => {
      const cv = document.querySelector(sel), d = window.devicePixelRatio || 1;
      const hex = getComputedStyle(document.documentElement).getPropertyValue(varName).trim().slice(1), n = parseInt(hex, 16);
      const want = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
      const x0 = Math.round((box ? box[0] : 0) * d), y0 = Math.round((box ? box[1] : 0) * d);
      const w = box ? Math.round((box[2] - box[0]) * d) : cv.width, h = box ? Math.round((box[3] - box[1]) * d) : cv.height;
      const px = cv.getContext("2d").getImageData(x0, y0, w, h).data;
      let c = 0; for (let i = 0; i < px.length; i += 4) if (px[i + 3] > 200 && Math.abs(px[i] - want[0]) < 30 && Math.abs(px[i + 1] - want[1]) < 30 && Math.abs(px[i + 2] - want[2]) < 30) c++;
      return c;
    }, [sel, varName, box]);
    // #9: the yellow open-loop line runs right through the HIVE window label at 13.1 V (1216 ticks/s). The label keeps a plate.
    await pg.goto(URL + "#feedback"); await pg.waitForTimeout(300);
    await pg.$eval("#fb-v", el => { el.value = 13.1; el.dispatchEvent(new Event("input")); });
    await pg.selectOption("#fb-cbar .tc-win", "5");
    await pg.$eval("#ts-slider", el => { el.value = 1000; el.dispatchEvent(new Event("input")); });
    await pg.click("#fb-cbar .tc-reset"); await pg.waitForTimeout(4500);   // 9 s of sim: the 5 s window shows only the steady part
    const hive = (await pg.evaluate(() => window.__fbLabels || [])).find(x => x.s === "HIVE window");   // the label moves off the curve, so read where it went
    const onLabel = hive ? await near("#fb-plot", "--pollen", [hive.x0 + 3, hive.y0 + 2, hive.x1 - 3, hive.y1 - 2]) : -1;
    check(onLabel === 0, "charts #9: no yellow curve pixels inside the HIVE window label (" + onLabel + ")");
    await pg.click("#fb-burst"); await pg.waitForTimeout(1200);
    await shot(pg.locator("#lab-feedback"), "feedback-fire3.png");
    await pg.click('#ts-ticks span[data-v="1"]');
    // #26: one Save PNG per chart, a real PNG with a title strip above the chart
    check((await pg.$$("#fb-cbar .tc-png, #pid-cbar .tc-png, #mc-cbar .tc-png")).length === 3, "charts #26: tabs 4, 6 and 7 each have a Save PNG button");
    const [dl] = await Promise.all([pg.waitForEvent("download"), pg.click("#fb-cbar .tc-png")]);
    const png = fs.readFileSync(await dl.path());
    const cvBox = await pg.$eval("#fb-plot", c => [c.width, c.height]);
    const pw = png.readUInt32BE(16), ph = png.readUInt32BE(20);
    check(/^ftc-launcher-speed.*\.png$/.test(dl.suggestedFilename()) && png.slice(1, 4).toString() === "PNG" && pw > cvBox[0] && ph > cvBox[1] + 30,
      "charts #26: Save PNG downloads " + dl.suggestedFilename() + " " + pw + "x" + ph + " (chart " + cvBox.join("x") + ") with room for the title");
    check(/^Saved ftc-/.test(await pg.textContent("#fb-cbar .tc-msg")), "charts #26: the bar says the file was saved");
    // a sandboxed frame without allow-downloads: the download fails quietly, so the bar shows the picture to right-click instead
    const sb = await b.newPage({ viewport: { width: 1366, height: 900 } });
    sb.on("pageerror", e => errs.push("sandbox: " + e.message));
    await sb.setContent('<iframe sandbox="allow-scripts" style="width:1300px;height:880px" srcdoc="' + src.replace(/&/g, "&amp;").replace(/"/g, "&quot;") + '"></iframe>');
    await sb.waitForTimeout(800);
    const fr = sb.frames()[1];
    await fr.evaluate(() => document.querySelector('nav.tabs a[data-tab="feedback"]').click()); await sb.waitForTimeout(500);
    await fr.evaluate(() => document.querySelector("#fb-cbar .tc-png").click()); await sb.waitForTimeout(500);
    const sbState = await fr.evaluate(() => ({ img: !!document.querySelector(".tc-pngbox img[src^='data:image/png']"), msg: document.querySelector("#fb-cbar .tc-msg").textContent }));
    check(sbState.img && /Save image as/.test(sbState.msg), "charts #26: inside a sandboxed frame Save PNG shows the picture and says how to save it: " + sbState.msg);
    await sb.close();
    // #27: wheel powers over time on the mecanum tab, same chart controls
    await pg.goto(URL + "#mecanum"); await pg.waitForTimeout(300);
    await pg.check('#lab-mecanum input[value="robot"]');
    await pg.click("#mc-cbar .tc-reset");
    await pg.click('#lab-mecanum [data-p="1,0,0"]'); await pg.waitForTimeout(1200);   // strafe right: fl +1, fr -1, bl -1, br +1
    await pg.evaluate(() => { window.__mcs = new Set(); const f = CanvasRenderingContext2D.prototype.stroke; CanvasRenderingContext2D.prototype.stroke = function () { if (this.canvas.id === "mc-plot") window.__mcs.add(String(this.strokeStyle).toLowerCase()); return f.apply(this, arguments); }; });
    await pg.waitForTimeout(200);
    const mcCols = await pg.evaluate(() => ["--accent", "--red", "--pollen", "--ok"].map(v => window.__mcs.has(getComputedStyle(document.documentElement).getPropertyValue(v).trim().toLowerCase())));
    check(mcCols.every(Boolean) && (await near("#mc-plot", "--red")) > 0, "charts #27: the wheel chart draws all four wheels in blue, red, yellow and green: " + mcCols.join(" "));
    check((await pg.getAttribute("#mc-cbar .tc-live", "aria-pressed")) === "true", "charts #27: the wheel chart starts live");
    await pg.locator("#mc-plot").scrollIntoViewIfNeeded();
    const mp = await (await pg.$("#mc-plot")).boundingBox();
    await pg.mouse.move(mp.x + 120, mp.y + 60); await pg.mouse.down(); await pg.mouse.move(mp.x + 300, mp.y + 70, { steps: 5 }); await pg.mouse.up(); await pg.waitForTimeout(150);
    check((await pg.getAttribute("#mc-cbar .tc-live", "aria-pressed")) === "false", "charts #27: drag on the wheel chart zooms in");
    await pg.click("#mc-cbar .tc-pause"); await pg.waitForTimeout(150);
    check((await pg.textContent("#ts-chip")) === "PAUSED", "charts #27: the wheel chart Pause pauses the sim");
    await pg.click("#mc-cbar .tc-play"); await pg.click("#mc-cbar .tc-live");
    const mcPng = await pngOf("#mc-cbar"), mcBox = await pg.$eval("#mc-plot", c => [c.width, c.height]);
    check(mcPng.isPng && /^ftc-mecanum-wheel-powers-over-time-robot-centric/.test(mcPng.name) && mcPng.w > mcBox[0] && mcPng.h > mcBox[1] + 30, "charts #26: the wheel chart Save PNG downloads " + mcPng.name + " " + mcPng.w + "x" + mcPng.h);
    await pg.click('#lab-mecanum [data-p="0,0,0"]');
    await shot(pg.locator("#lab-mecanum"), "mecanum-chart.png");
    const mf = await b.newPage({ viewport: { width: 1366, height: 768 } });
    await mf.goto(URL + "#mecanum"); await mf.waitForTimeout(300);
    const mcTop = await mf.evaluate(() => Math.round(document.querySelector("#lab-mecanum .grid2").getBoundingClientRect().top));
    check(mcTop <= 330, "charts #27: mecanum first sim still starts at " + mcTop + " px on a 1366x768 projector");
    await mf.close();
  }
  // ==== end area charts ====

  // ==== area pid ====
  check(!/\bS\.m\b|function metrics\(/.test(src), "pid: the old metrics() and S.m state are gone");
  await pg.goto(URL + "#pid"); await pg.waitForTimeout(300);
  await pg.click('.appbtn[data-app="turn"]'); await pg.waitForTimeout(300);   // a hash change keeps the job from the aim checks above
  check(await pg.$eval("#pid-dnote", e => e.hidden), "pid: the D spike note hides on the turn job");
  await pg.click('.appbtn[data-app="aim"]'); await pg.waitForTimeout(300);
  check(await pg.$eval("#pid-dnote", e => !e.hidden && /30 new frames/.test(e.textContent) && /50 times/.test(e.textContent)), "pid: on aim, the note under the D chart explains the 30 fps camera vs the 50 Hz loop");
  // PID only on new frames: off by default (the D spike demo), on swaps the code to the vision-session version and still locks on
  const useTxt = () => pg.textContent("#pid-use");
  check(!(await pg.isChecked("#pid-frames")) && !/newFrame/.test(await useTxt()) && /PID only on new frames/.test(await pg.textContent("#pid-dnote")), "pid aim: PID only on new frames starts off, the note names the fix");
  await pg.check("#pid-frames"); await pg.waitForTimeout(200);
  check(/if \(newFrame\)/.test(await useTxt()) && /turn = aimTurn;/.test(await useTxt()), "pid aim: ticked, the code runs update() only on a new frame and holds aimTurn");
  await pg.click('[data-ps="PD (tuned: no I needed)"]');
  let lockedPF = false;
  for (let i = 0; i < 30 && !lockedPF; i++){ await pg.waitForTimeout(200); lockedPF = /LOCKED ON/.test(await chips()); }
  check(lockedPF, "pid aim: with PID only on new frames, PD still locks on");
  await pg.uncheck("#pid-frames"); await pg.waitForTimeout(200);
  check(!/newFrame/.test(await useTxt()), "pid aim: unticked, the every-pass code comes back");
  await pg.click('.appbtn[data-app="lift"]'); await pg.waitForTimeout(300);
  check(await pg.$eval("#pid-ghostkey", e => e.hidden), "pid: no last run before the gains change");
  await pg.click('[data-ps="PD"]'); await pg.waitForTimeout(3500);
  await pg.click('[data-ps="PD + F (tuned)"]'); await pg.waitForTimeout(3500);
  const ghostHead = await pg.$$eval("#pid-resp th", ths => ths.map(t => t.textContent));
  const ghostOff = await pg.$$eval("#pid-resp tr", rs => { const r = rs.find(x => /Steady-state/.test(x.children[0].textContent)); return r ? [r.children[1].textContent, r.children[2].textContent] : []; });
  console.log("  lift PD + F vs last run:", ghostHead.join(" | "), ghostOff.join(" | "));
  check((await pg.textContent("#pid-ghostkey")).includes("last run: PD") && !(await pg.$eval("#pid-ghostkey", e => e.hidden)), "pid: a preset change keeps the last run as a faint line with a legend entry");
  check(ghostHead.includes("Last run: PD") && Math.abs(parseFloat(ghostOff[0])) < 0.3 && parseFloat(ghostOff[1]) > 1.5, "pid: markers table reads lift PD + F next to the last run, PD, which stops short");
  const ghostCol = await pg.$$eval("#pid-resp td.ghost", tds => tds.map(t => t.textContent).join(" | "));
  check(/never reached 90%/.test(ghostCol) && /not settled/.test(ghostCol) && !/cut/.test(ghostCol) && !/\(cut\)/.test(ghostHead.join(" ")), "pid: a stuck move reads 'never reached 90%' and 'not settled' in the Last run column, not cut: " + ghostCol);
  await pg.click('[data-tg="4"]'); await pg.waitForTimeout(500); await pg.click("#pid-bump"); await pg.waitForTimeout(600);
  const cutTxt = await pg.textContent("#pid-resp");
  check(/The bump cut this move/.test(cutTxt) && /This move \(cut\)/.test(cutTxt) && /cut before settling/.test(cutTxt), "pid: a move cut before it settled is labeled cut, with what was measured before the cut");
  const pidPng = await pngOf("#pid-cbar"), pidBox = await pg.$$eval("#pid-plot1, #pid-plot2", cs => cs.map(c => [c.width, c.height]));
  check(pidPng.isPng && pidPng.name === "ftc-pid-lift-to-height-encoder.png" && pidPng.w > pidBox[0][0] && pidPng.h > pidBox[0][1] + pidBox[1][1] + 30, "charts #26: the PID Save PNG downloads " + pidPng.name + " " + pidPng.w + "x" + pidPng.h + ", both charts in one picture");
  await pg.click("#pid-ghostclr"); await pg.waitForTimeout(300);
  check((await pg.$eval("#pid-ghostkey", e => e.hidden)) && (await pg.$$("#pid-resp .ghost")).length === 0, "pid: Clear last run removes the line and the table column");
  await pg.click('.appbtn[data-app="turn"]'); await pg.waitForTimeout(300);
  // ==== end area pid ====

  // ---- phone width ----
  const m = await b.newPage({ viewport: { width: 390, height: 844 } });
  m.on("pageerror", e => errs.push("mobile: " + e.message));
  await m.goto(URL + "#pid"); await m.waitForTimeout(1500);
  check((await m.evaluate(() => document.documentElement.scrollWidth)) <= 390, "no sideways scroll at 390 px");
  await m.screenshot({ path: path.join(SHOTS, "mobile-pid.png") });
  await m.goto(URL + "#gitflow"); await m.waitForTimeout(300);
  const gxPhone = await m.evaluate(() => ({ org: document.querySelector("#gx-org").getBoundingClientRect().width, pr: document.querySelector("#gx-pr").getBoundingClientRect().width, gt: document.querySelector("#gt-svg").getBoundingClientRect().width, page: document.documentElement.scrollWidth }));
  check(gxPhone.org >= 900 && gxPhone.pr >= 880 && gxPhone.gt >= 760 && gxPhone.page <= 390, "tab 3 at 390 px: the diagrams keep full size and scroll inside their panel, no page scroll: " + JSON.stringify(gxPhone));

  // ==== area java ====
  {
    // #45 Loops and arithmetic card: numbered 6 after Decisions, the rest renumbered, steps through a for and a while
    const jp = await b.newPage({ viewport: { width: 1366, height: 768 } });
    jp.on("pageerror", e => errs.push("java: " + e.message));
    await jp.goto(URL + "#java"); await jp.waitForTimeout(300);
    const nums = await jp.$$eval("nav.jtopics .jt span", ss => ss.map(x => x.textContent).join(" "));
    check(nums === "0 1 2 3 4 5 6 7 8 9 10 11" && /Twelve cards/.test(await jp.textContent("#lab-java .lede")), "java: the rail reads 0 to 11 and the lede counts twelve cards: " + nums);
    // #46 card 2: all 6 Will it compile items above the fold at 1366x768 with auto-hide on
    check(await jp.evaluate(() => document.body.classList.contains("autohide")), "java: the fold check runs with auto-hide on");
    await jp.mouse.move(900, 500); await jp.click('.jt[data-jt="vars"]'); await jp.mouse.move(900, 500); await jp.waitForTimeout(150);
    const qb = await jp.$$eval("#jv-compile .cmp", cs => cs.map(c => Math.round(c.getBoundingClientRect().bottom)));
    check(qb.length === 6 && qb.every(y => y > 0 && y <= 768), "java card 2: all 6 quiz items show without scrolling at 1366x768: " + qb.join(", "));
    for (let i = 0; i < 6; i++) await jp.click('#jv-compile [data-q="' + i + '"]');
    const qa = await jp.$$eval("#jv-compile .cmp", cs => cs.map(c => Math.round(c.getBoundingClientRect().bottom)));
    check(qa.every(y => y > 0 && y <= 768) && /^Error: cannot assign a value to final variable MAX_SPEED/.test(await jp.textContent("#jv-q5")), "#46 java card 2: after all 6 Compile presses, every item and its answer still end above 768 px: " + qa.join(", "));
    // error clinic: after an error button, the red Build text, the choices and every verdict show without scrolling
    await jp.mouse.move(900, 500); await jp.click('.jt[data-jt="errors"]'); await jp.mouse.move(900, 500); await jp.waitForTimeout(150);
    const clinic = [];
    for (let i = 0; i < 9; i++) {
      await jp.click("#jv-errlist [data-e='" + i + "']"); await jp.waitForTimeout(50);
      const low = ["#jv-eprob", "#jv-echoices", "#jv-emsg"];
      const n = (await jp.$$("#jv-echoices .choice")).length;
      let worst = 0;
      for (let c = 0; c < n; c++) {   // a right fix drops a line, so the page gets shorter: measure after every choice
        await jp.click("#jv-echoices .choice[data-c='" + c + "']");
        worst = Math.max(worst, ...(await jp.evaluate(s => s.map(q => document.querySelector(q).getBoundingClientRect().bottom), low)));
      }
      clinic.push(Math.round(worst));
    }
    check(clinic.every(y => y <= 768) && (await jp.$eval("#jv-errlist", e => e.getBoundingClientRect().top)) >= 0, "java error clinic at 1366x768: for all 9 errors the Build text, choices and verdict end above the fold: " + clinic.join(", "));
    // Every word explained: the lede names four places, every MainTeleOp word outside package and import lines is clickable, and each says where it comes from
    await jp.mouse.move(900, 500); await jp.click('.jt[data-jt="words"]'); await jp.mouse.move(900, 500); await jp.waitForTimeout(150);
    const bare = await jp.$eval("#jv-wcode", c => [...c.querySelectorAll(".ln")].filter(l => !/^(package|import) /.test(l.textContent)).flatMap(l => {
      const x = l.cloneNode(true); x.querySelectorAll(".w").forEach(w => w.remove());
      return x.textContent.replace(/"[^"]*"/g, "").match(/[A-Za-z_]\w*/g) || [];
    }));
    check(bare.length === 0, "words card: every MainTeleOp word is clickable: " + (bare.join(" ") || "none left"));
    const from = {};
    for (const id of ["robotcls", "lstate", "gp2", "waitforstart", "timer", "public"]) { await jp.click('#jv-wlist button[data-w="' + id + '"]'); from[id] = await jp.textContent("#jv-wmsg b"); }
    check(/Robot\.java/.test(from.robotcls) && /this file/.test(from.lstate) && /OpMode/.test(from.gp2) && /LinearOpMode/.test(from.waitforstart) && /ElapsedTime|this file/.test(from.timer) && /Java itself/.test(from.public), "words card: each word says where it comes from: " + JSON.stringify(from));
    // provenance: the word after gamepad1. or telemetry. belongs to Gamepad or telemetry, not to OpMode
    for (const id of ["bumper", "adddata"]) { await jp.click('#jv-wlist button[data-w="' + id + '"]'); from[id] = await jp.textContent("#jv-wmsg b"); }
    check(/Gamepad class/.test(from.bumper) && /method of telemetry/.test(from.adddata), "words card: left_bumper is a Gamepad field and addData() a telemetry method: " + from.bumper + " | " + from.adddata);
    // Robot.java: drive() and the SDK words a student meets there are clickable, so "Click Robot.java above to find drive()" lands
    await jp.click('#jv-wfiles button[data-f="Robot.java"]');
    const rw = await jp.$$eval("#jv-wcode .w", ws => ws.map(w => w.dataset.w + ":" + w.textContent));
    check(["robotdef:drive", "robotdef:init", "robotdef:launcherReady", "sdktype:DcMotorEx", "sdktype:HardwareMap", "motorcall:setPower", "motorcall:getVelocity", "mathabs:Math.max"].every(x => rw.includes(x)), "words card Robot.java: drive(), DcMotor types, setPower(), getVelocity() and Math.max are clickable");
    const deadChips = [];
    for (const f of ["MainTeleOp.java", "Robot.java", "PIDController.java"]) {
      await jp.click('#jv-wfiles button[data-f="' + f + '"]');
      deadChips.push(...(await jp.$$eval("#jv-wlist button", bs => bs.map(x => x.dataset.w).filter(w => !document.querySelector('#jv-wcode .w[data-w="' + w + '"]')))).map(w => f + ":" + w));
    }
    check(deadChips.length === 0, "words card: every chip under Words in this file underlines a word in the code: " + (deadChips.join(" ") || "none dead"));
    await jp.click('#jv-wfiles button[data-f="Robot.java"]');
    await jp.click('#jv-wcode .w[data-w="robotdef"]');
    check(/Robot\.java: you write/.test(await jp.textContent("#jv-wmsg b")), "words card Robot.java: drive() says it comes from Robot.java");
    await jp.click('#jv-wfiles button[data-f="MainTeleOp.java"]');
    check(/leaves out its body \(abstract\)/.test(await jp.textContent('.jpane[data-jp="inherit"]')) && src.includes("has no body for it (abstract)") && !src.includes("runOpMode() with nothing inside"), "java card 4: runOpMode() in LinearOpMode is abstract, not empty");
    // run sheet and plan: full screen at zoom 100%, the size every fold check here measures
    const rs = fs.readFileSync(path.join(__dirname, "..", "docs", "course", "run-sheet.md"), "utf8"), cp = fs.readFileSync(path.join(__dirname, "..", "docs", "course", "crash-course-plan.md"), "utf8");
    check([rs, cp].every(d => /full screen \(F11\) at zoom 100%/.test(d) && !/zoom 125%, not more/.test(d)), "docs: run sheet and plan set full screen (F11) at zoom 100%, the size of the fold checks");
    // #23: the ElapsedTime objects on card 1 count sim time, so Pause stops them
    await jp.click('.jt[data-jt="classes"]'); await jp.mouse.move(900, 500); await jp.waitForTimeout(400);
    const objT = () => jp.$$eval("#jv-objs [data-oi]", es => es.map(e => +e.textContent));
    await jp.evaluate(() => window.__setPause(true)); await jp.waitForTimeout(100);
    const t1 = await objT(); await jp.waitForTimeout(600); const t2 = await objT();
    await jp.evaluate(() => window.__setPause(false)); await jp.waitForTimeout(600); const t3 = await objT();
    check(t1.length === 2 && t1.join() === t2.join() && t3[0] > t2[0], "#23: the ElapsedTime card follows Pause: " + t1.join() + " / " + t2.join() + " / " + t3.join());
    await jp.click('.jt[data-jt="loops"]'); await jp.mouse.move(900, 500); await jp.waitForTimeout(150);
    check(/^6\. Loops/.test(await jp.textContent('.jpane[data-jp="loops"] h3')), "java loops: the card heading carries rail number 6");
    const vars = () => jp.$$eval("#jv-lpvars .vbox", vs => vs.map(v => { const n = v.querySelector("b").textContent; return n + "=" + v.textContent.slice(n.length); }).join(" "));
    const next = async n => { for (let i = 0; i < n; i++) await jp.click("#jv-lpnext"); };
    await next(5);
    const v5 = await vars();
    check(v5 === "power=0.5 wheels=4 motors i=1" && (await jp.$$("#jv-lptable tr")).length === 3 && /frontRight/.test(await jp.textContent("#jv-lpmsg")), "java loops: for pass 2 shows i = 1 and frontRight: " + v5);
    await next(5);
    check(/4 < 4 is false/.test(await jp.textContent("#jv-lpmsg")) && (await jp.$$("#jv-lptable tr")).length === 5, "java loops: the for ends when i reaches 4, after 4 passes");
    await next(1);
    check(!/i=/.test(await vars()) && /i is gone/.test(await jp.textContent("#jv-lpmsg")) && (await jp.$eval("#jv-lpnext", x => x.disabled)), "java loops: after the for, i is gone and Next stops");
    await jp.click('#jv-lppick [data-lp="while"]'); await next(12);
    const vw = await vars();
    check(vw === "balls=0 shots=3" && /Shots: 3/.test(await jp.textContent("#jv-lpmsg")), "java loops: the while counts 3 balls down to 0: " + vw);
    await jp.check("#jv-lpforget"); await next(11);
    check((await vars()) === "balls=3 shots=3" && /never ends/.test(await jp.textContent("#jv-lpmsg")) && /\bbad\b/.test(await jp.getAttribute("#jv-lpmsg", "class")) && /forgotten/.test(await jp.textContent("#jv-lpcode")), "java loops: forgetting balls-- loops forever, shown red");
    await jp.click('#jv-arquiz [data-ar="2"]'); await jp.click('#jv-arquiz [data-ar="3"]'); await jp.click('#jv-arquiz [data-ar="5"]');
    check(/^half is 2, not 2\.5/.test(await jp.textContent("#jv-ar2")) && /^half is 2\.0/.test(await jp.textContent("#jv-ar3")) && /^heading is 10/.test(await jp.textContent("#jv-ar5")), "java loops: Run shows the integer-division trap and % wrap-around");
    await jp.close();
    // #44 one feeder API: the plan's Robot.java owns feederOn()/feederOff() and its state machine calls them for real
    const plan = fs.readFileSync(path.resolve(__dirname, "..", "docs", "course", "crash-course-plan.md"), "utf8");
    check(plan.includes('feeder = hardwareMap.get(CRServo.class, "feeder");') && plan.includes("public void feederOn() {") && plan.includes("public void feederOff() {") && !plan.includes("// robot.feederOn()") && !plan.includes("// robot.feederOff()"), "plan: Robot.java has the feeder and the state machine calls feederOn() and feederOff()");
    const docsSrc = ["cheatsheet.html", "homework.md", "team-coding-standard.md", "crash-course-plan.md"].map(f => fs.readFileSync(path.resolve(__dirname, "..", "docs", "course", f), "utf8")).join("\n");
    // follow-up docs: linked from the plan and the reference, one set of Robot.java names, one heading source, R704.D as the reference reads
    const course = f => fs.readFileSync(path.resolve(__dirname, "..", "docs", "course", f), "utf8");
    const refDoc = course("ftc-reference-2026-27.md"), odo = course("follow-up/odometry.md"), pathDoc = course("follow-up/path-following.md"), ctrl = course("follow-up/control-award.md"), vis = course("follow-up/vision.md");
    check(["vision", "odometry", "path-following", "control-award"].every(n => plan.includes("follow-up/" + n + ".md")) && refDoc.includes("follow-up/path-following.md") && refDoc.includes("follow-up/vision.md"), "docs: the plan and the reference link the 4 follow-up docs");
    check(!/poseX\(|poseY\(|poseHeadingDegrees|driveFieldPinpoint/.test(odo + pathDoc) && pathDoc.includes("robot.getPose()") && odo.includes("return pinpoint.getHeading(AngleUnit.DEGREES);"), "docs: odometry and path following share Robot.java names and one heading source");
    check(!/R704 bars third-party tools in matches/.test(ctrl) && !/\[Verify\] each lab chart shows a Save PNG/.test(ctrl) && ctrl.includes("R704.D") && pathDoc.includes("R704.D"), "docs: control award and path following read R704.D as the reference does, Save PNG described as built");
    check(/robot\.updatePose\(\);\s+\/\/ fresh Pinpoint heading for the error below/.test(odo) && !/MainTeleOp still drives field-centric|Press A: the heading reads 0/.test(odo), "docs: odometry updates the Pinpoint in turnToHeading() and checks MainTeleOp as the plan writes it (robot-centric)");
    check(!pathDoc.includes("DRIVE_GAIN") && pathDoc.includes("drivePID.update(distance)") && pathDoc.includes("new PIDController(0.02, 0, 0.002)") && odo.includes("new PIDController(0.02, 0, 0.002)"), "docs: path following stops on the tuned drive PID and heading gains from odometry");
    check(ctrl.includes("no external feedback in TeleOp") && ctrl.includes("Fire 3 fast") && plan.includes("as its own `STRAFE_COUNTS_PER_INCH`"), "docs: control award vote names TeleOp, the Fire 3 fast label, the plan keeps 4.09 and a strafe constant");
    check(vis.includes("if (newFrame)") && vis.includes("PID only on new frames") && src.includes("PID only on new frames"), "docs: vision and the lab teach the same aim code, PID only on new frames");
    check(course("team-coding-standard.md").includes("`DcMotor[] wheels") && src.includes("DcMotor[] wheels"), "docs: the team standard allows the array the Loops card uses");
    check(!/feedOnce/.test(docsSrc + src) && (src.match(/robot\.feederOn\(\)/g) || []).length >= 3, "no feedOnce() left in the lab or the course docs, and the lab calls robot.feederOn()");
  }
  // ==== end area java ====

  // ==== area fonts: #11 Google Fonts blocked (projector laptop offline), system fallbacks, auto-hide on ====
  {
    const TABS = ["java", "lifecycle", "gitflow", "mecanum", "oneloop", "feedback", "pid", "encoders"];
    for (const [w, h, scheme] of [[1366, 768, "light"], [390, 844, "dark"]]) {
      const ctx = await b.newContext({ viewport: { width: w, height: h }, colorScheme: scheme });
      let blocked = 0;
      await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => { blocked++; return r.abort(); });
      const fp = await ctx.newPage();
      fp.on("pageerror", e => errs.push("fonts blocked: " + e.message));
      const res = [];
      for (const t of TABS) {
        await fp.goto(URL + "#" + t); await fp.waitForTimeout(250);
        res.push(await fp.evaluate(t => { const lh = document.querySelector("section.lab.on .labhead");
          return { t, top: Math.round(lh.nextElementSibling.getBoundingClientRect().top), sw: document.documentElement.scrollWidth }; }, t));
      }
      if (w === 1366) await fp.screenshot({ path: path.join(SHOTS, "fonts-blocked-oneloop.png") });
      const bad = res.filter(r => r.sw > w || (w === 1366 && r.top > 330));
      check(blocked > 0 && bad.length === 0, "#11 fonts blocked, " + w + " px " + scheme + ": every tab " + (w === 1366 ? "starts its first block above 330 px and " : "") + "has no sideways scroll" + (bad.length ? ": " + JSON.stringify(bad) : ""));
      await ctx.close();
    }
  }
  // ==== end area fonts ====

  check(errs.length === 0, "no page errors" + (errs.length ? ": " + errs.join(" | ") : ""));
  await b.close();
  console.log(failures ? failures + " check(s) failed" : "all checks passed");
  process.exit(failures ? 1 : 0);
})();
