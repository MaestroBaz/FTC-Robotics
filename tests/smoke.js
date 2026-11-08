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
  await pg.mouse.wheel(0, 2000); await pg.waitForTimeout(300);
  const scrolledDown = await pg.evaluate(() => scrollY);
  await pg.evaluate(() => document.querySelector('nav.tabs a[data-tab="mecanum"]').click()); await pg.waitForTimeout(200);
  check(scrolledDown > 500 && (await pg.evaluate(() => scrollY)) === 0, "a tab change opens the new tab at the top, on its goal line and vote (was " + scrolledDown + ")");
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
  await fold.click("#lc-init"); await fold.waitForTimeout(2600);
  check(/Vote before START/.test(await fold.textContent("#lc-msg")), "lifecycle: the wait message asks the vote before START");
  const lcSdWait = await fold.textContent("#lc-sd");
  check(lcSdWait.includes("waitForStart()") && !/while loop|stopDrive|50 times/.test(lcSdWait), "lifecycle: in WAIT the state diagram hides the RUN and STOP text, so it does not answer the votes");
  const lcB = [await lcBottom("#lc-code"), await lcBottom("#lc-msg"), await lcBottom("#lc-sd")];
  check(lcB.every(y => y <= 768), "lifecycle at 1366x768: code, message and state diagram end above the fold: " + lcB.join(", "));
  await fold.click("#lc-start"); await fold.waitForTimeout(1200);
  await fold.click("#lc-stop"); await fold.waitForTimeout(200);
  check((await fold.$eval("#lc-code .ln.hl", e => e.dataset.n)) === "16", "lifecycle: STOP highlights line 16, robot.stopDrive()");
  await fold.waitForTimeout(2400);
  check(/^Line 16 ran once/.test(await fold.textContent("#lc-msg")), "lifecycle: the done message names line 16, the STOP vote's answer");
  check(/stopDrive\(\)/.test(await fold.textContent("#lc-sd")), "lifecycle: after the run the state diagram shows every box's text for the recap");
  const tlText = await fold.$eval("#lc-tl", e => e.textContent);
  check(["START", "STOP: 30 s timer", "STOP: drivers press it", "8 s: pick TeleOp, press INIT"].every(t => tlText.includes(t)) && (tlText.match(/START/g) || []).length === 2, "lifecycle: the match timeline marks a START and a STOP for each OpMode");
  await fold.check('input[name="lcv"][value="bad"]');
  check((await fold.textContent("#lc-file")) === "MainTeleOpAI.java", "lifecycle: the file name follows the class name");
  await fold.click("#lc-init"); await fold.waitForTimeout(2600); await fold.click("#lc-start"); await fold.waitForTimeout(500);
  await fold.click("#lc-stop"); await fold.waitForTimeout(2400);
  check(/nobody told the thread to stop/.test(await fold.textContent("#lc-msg")) && !(await fold.$eval("#lc-init", e => e.disabled)), "lifecycle: after STOP the thread runs on and INIT is free again");
  await fold.click("#lc-init"); await fold.waitForTimeout(200);
  check((await fold.$$("#lc-code .ln.hl2")).length === 2, "lifecycle: a new INIT does not stop the old thread");
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
  await pg.locator("#lab-java").screenshot({ path: path.join(SHOTS, "java-words.png") });
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
  await pg.locator("#lab-java").screenshot({ path: path.join(SHOTS, "java-errors.png") });
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
  check(/three places/.test(await pg.textContent("#lab-java .lede")), "the Java lede names the three places a word comes from");
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
  await pg.locator("#lab-java").screenshot({ path: path.join(SHOTS, "java-decide.png") });

  // ---- Ask the room: Hide folds the question, Show brings it back ----
  await pg.click("#lab-java details.ask .ask-x");
  check(!(await pg.isVisible("#lab-java details.ask")) && (await pg.isVisible("#lab-java .ask-show")), "Hide folds the question away");
  await pg.click("#lab-java .ask-show");
  check(await pg.isVisible("#lab-java details.ask"), "Show the question brings it back");

  // ==== area java-a: Java card nav, card switching, cards 0 to 5 ====
  await pg.click('.jt[data-jt="inherit"]');
  await pg.click('#jv-ovbtns .b[data-ov="0"]');
  check((await pg.$eval("#jv-ovprob div:last-child", d => d.style.color)) === "rgb(126, 226, 168)", "BUILD SUCCESSFUL. 0 errors. shows green, not red");
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
  await pg.click("#gx-reset"); await pg.click("#gx-edit"); await pg.click("#gx-commit"); await pg.click("#gx-partner");
  check(/to pull: \?/.test(await pg.textContent("#gx-status")), "after Leo pushes, the laptop does not know the pull count yet");
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
  await gf.close();
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
  await pg.locator("#lab-encoders").screenshot({ path: path.join(SHOTS, "encoders.png") });

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
  await pg.locator("#lab-mecanum").screenshot({ path: path.join(SHOTS, "mecanum.png") });
  // AUTO uses Pinpoint axes: +X away from the drivers, +Y toward the left wall
  await pg.click('#lab-mecanum [data-p="0,0,0"]'); await pg.click("#mc-reset");
  await pg.check('#lab-mecanum input[value="auto"]'); await pg.waitForTimeout(200);
  const fb = await pg.locator("#mc-field").boundingBox();
  await pg.mouse.click(fb.x + fb.width * 0.35, fb.y + fb.height * 0.15); await pg.waitForTimeout(200);
  const err = (await mcRow("error to point")).split(",").map(Number);
  check(err[0] > 0 && err[1] > 0 && /\d deg/.test(await mcRow("direction angle")), "AUTO: a target ahead and to the left gives errX > 0 and errY > 0, row reads direction angle: " + err);
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
  check(fit.every(f => f.overflow.length === 0), "no diagram label runs past its figure: " + fit.flatMap(f => f.overflow).join(" | "));
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
  check(src.includes("const lx = Math.max(xr - 8, L + 4 + ctx.measureText(lab).width)") && src.includes("ctx.strokeText(lab, lx, ly)"), "feedback: open-loop offset label has a halo and never clips at the y axis");
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
  check(/loses LEAVE/.test(plan) && !/from Module 6 for turns/.test(plan) && /from lab tab 7 \(the PID turn job\)/.test(plan), "docs: plan says a wall park loses LEAVE and points turnToHeading at lab tab 7");
  check(/On the Crash Course day \(Module 3, lab tab 3, 20 min\)/.test(gw) && /Maya sets the slow-mode value to 0\.4, Leo sets the same line to 0\.3/.test(gw) && /team-roster\.md/.test(gw) && /team-roster\.md/.test(plan), "docs: GitHub drills split the projector day from the hands-on session and match the plan's roster drill");
  check(/`\? :` to pick one of two values/.test(std) && src.includes("turn = lastBearing > 0 ? -0.3 : 0.3;") && !/\| Interfaces, abstract classes, generics \|/.test(std) && src.includes("List<Double> shots = new ArrayList<>();"), "docs: standard allows List<Type> and one-level ternary, and the lab Java matches");
  // ==== end area docs ====

  // ---- phone width ----
  const m = await b.newPage({ viewport: { width: 390, height: 844 } });
  m.on("pageerror", e => errs.push("mobile: " + e.message));
  await m.goto(URL + "#pid"); await m.waitForTimeout(1500);
  check((await m.evaluate(() => document.documentElement.scrollWidth)) <= 390, "no sideways scroll at 390 px");
  await m.screenshot({ path: path.join(SHOTS, "mobile-pid.png") });

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
    check(!/feedOnce/.test(docsSrc + src) && (src.match(/robot\.feederOn\(\)/g) || []).length >= 3, "no feedOnce() left in the lab or the course docs, and the lab calls robot.feederOn()");
  }
  // ==== end area java ====

  check(errs.length === 0, "no page errors" + (errs.length ? ": " + errs.join(" | ") : ""));
  await b.close();
  console.log(failures ? failures + " check(s) failed" : "all checks passed");
  process.exit(failures ? 1 : 0);
})();
