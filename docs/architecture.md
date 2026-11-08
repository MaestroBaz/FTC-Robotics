# Lab architecture (lab/index.html)

One HTML file. Order inside: `<head>` with Google Fonts and one `<style>` block (CSS tokens at the top, light and dark themes), the top bar (tabs + sim speed bar), 8 `<section class="lab" id="lab-<tab>">` blocks, then one `<script>` with every module.

Line numbers drift. Grep for the names below.

## Tabs and modules

| Tab (hash) | Section id | Module(s) | Viz hook (redrawn each frame) |
|---|---|---|---|
| 1 Java basics (`#java`) | `lab-java` | `JV` (anatomy, cards, Loops card: `LP` steps a `for` over `DcMotor[] wheels` or a `while` over balls, `#jv-lpforget` drops the line that changes the loop variable), `JV2` (project map `#jv-map`, import address `#jv-addr`, decoder, build line, error clinic, variable boxes `#jv-vbox`, blueprint `#jv-blueprint`, @Override demo `OV` in `#jv-ovcode`, Decisions card: if/else `DCODE` on `#jv-dstick`, logic toggles, `SW` switch with the break toggle `#jv-swbrk`), wrapped as `JAVATAB` | none |
| 2 OpMode lifecycle (`#lifecycle`) | `lab-lifecycle` | `LC` | `DG.lifecycle()`, plus `DG.timeline()` on show |
| 3 GitHub teamwork (`#gitflow`) | `lab-gitflow` | `GT` (git demo), `GX` (three places, org map, PR loop), wrapped as `GITTAB` | none |
| 4 Drive modes (`#mecanum`) | `lab-mecanum` | `MC` (drive modes, wheel power chart) | `DG.driveVec()` |
| 5 One loop, no sleep (`#oneloop`) | `lab-oneloop` | `OL` | `DG.stateMachine()` |
| 6 Closed loop: launcher (`#feedback`) | `lab-feedback` | `FB` | `DG.loops()` (block diagrams) |
| 7 PID control (`#pid`) | `lab-pid` | `PIDLAB` | `PIDVIZ.loop()` + `PIDVIZ.minis()` |
| 8 Encoders (later) (`#encoders`) | `lab-encoders` | `EN`, with `TT` inside (turnToHeading exercise) | `DG.encoder()` |

Element ids use the module prefix: `pid-*`, `fb-*`, `jv-*`, `mc-*`, `gx-*`, `gt-*`, `en-*`, `lc-*`, `ol-*`, `ts-*` (time bar).

The banner comments in the script name the tab number, the tab title and the module, for example `/* TAB 7: PID CONTROL (PIDLAB: turn, aim, lift) */`. Grep `TAB 7:` to land on a tab's code.

## Module contract

Each module is an IIFE that returns at least `{tick(dt), show()}`. Some add `get()` (state for the viz hooks) and `chart` (its TimeChart).

```
const LABS = {gitflow: GITTAB, java: JAVATAB, lifecycle: LC, mecanum: MC, oneloop: OL, feedback: FB, pid: PIDLAB, encoders: EN};
const VIZ  = {lifecycle: () => DG.lifecycle(), ..., pid: () => { PIDVIZ.loop(); PIDVIZ.minis(); }};
```

`route(id)` takes a tab id (default: `location.hash`), shows one section, calls `show()`, and forces a first draw of the SVG diagrams. Only the current tab ticks. Tab links call `route()` from a click handler and set the hash with `history.pushState` inside try/catch, because a page opened as a `data:` URL blocks hash navigation.

## Time and the frame loop

```
const TIME = {scale: 1, paused: false, sim: 0, step: 0, q: []};
function after(sec, fn)   // run fn after sec of SIMULATED time
```

`frame()` at the end of the script:
- real dt is capped at 0.05 s.
- paused: advance only by `TIME.step` (the Step button adds 0.1 s), max 1/60 s per frame.
- running: `sd = dt * TIME.scale`.
- runs due `after()` callbacks, then calls `LABS[current].tick()` in chunks of at most 1/30 s (2x speed gives up to 3 ticks per frame), then the VIZ hook.
- if the theme changed (`P.ink` differs), calls `route(current)` to repaint.

Speed control: `setScale(v)` clamps to 0.05..2 and snaps to the labels 0.05, 0.1, 0.25, 0.5, 1, 2 when within about 5%. The slider maps log10 linearly onto 0..1000. `setPause(p)` is also exposed as `window.__setPause` for the chart bars.

## Rule exceptions

`npm run check` (`tests/syntax-check.js`) enforces the time and color rules with a static scan. The exceptions below are the whole allowlist. Add to the list in the scan and here, with the reason, or fix the code.

Time:
- No `setTimeout` or `setInterval` anywhere in the script. Sim behavior uses `after(sec, fn)`. A UI effect uses CSS: the GitHub tab three-places flash is the `placeflash` keyframe animation, and `render()` clears `st.flash` so the next render draws no flash.
- `performance.now()` sits in two places only. The frame loop reads it: real time is the source of `dt`. `throttle(ms)` reads it: it caps how often a diagram redraws, a CPU cost, not sim behavior. Pause and the speed slider still freeze the values the diagram draws.
- Reset scores disarms on mouse leave and blur, not on a timer.
- The ElapsedTime objects on Java card 1 count `TIME.sim`, so Pause and the speed slider apply.

Color:
- Hex colors sit only in the CSS token definitions (`--bg`, `--ink`, ...) and in two fixed-dark mock panels: `.dhub` (the Driver Hub screen) and `.ide-problems` (the Android Studio build output, classes `pe`, `pk`, `iok`, `iwarn`, `ix`). Both mocks look the same in either theme on purpose, as the real screens do.
- Text on a token fill (primary and danger buttons, part numbers, the variable-box type labels) uses `--surface` / `P.surface`: white in light, dark on the brighter dark-theme fills.

Fonts: the Google Fonts load from the network. Offline, the fallbacks take over: Arial Narrow for the display font (about 1.2x wider than Barlow Condensed, so some h2 titles wrap to two lines), the system sans and Menlo or Consolas (within 2% of the Google widths). The smoke test blocks the fonts and checks the 330 px fold and sideways scroll on every tab. Without Arial Narrow (Windows without Office) the display font falls to plain Arial, about 1.5x wider: with auto-hide off the tab row wraps to two rows and some tabs push the first block past 330 px. Auto-hide on (the default) keeps every tab under 330 px.

## Shared helpers

- `$`, `$$`: query helpers. `esc()`: HTML escape. `chip(text, cls)`: status chip (`ok`, `warn`, `bad`, `run`).
- `fit(canvas)`: sizes a canvas to its CSS box with devicePixelRatio, returns `{ctx, w, h}` and clears it. The canvas `height` attribute sets the CSS height.
- `text(ctx, s, x, y, {size, weight, color, align, mono})`: canvas text. Mono by default.
- `drawRobot`, `arrow`, `alpha(hex, a)`, `clamp`, `throttle(ms)`.
- `renderCode(el, lines)`: Java code panel with highlighting. `markLines` highlights lines.
- `SV`: theme-aware SVG builder (`SV.box`, `SV.ar` arrows, `SV.tx`, `SV.circ`, `SV.defs`, `SV.set(el, w, h, s)`, `SV.col(name)`).
- Diagram type scale: `SV.tx` never writes a font size under `SV.MIN` (12 viewBox units), and `SV.set` caps the rendered width at `w * SV.MAXSCALE` (1.25), centered. A diagram never scales its text past 1.25x, so text on every tab lands between 12 and 20 px. Draw boxes before their labels, so a label never hides under a box.
- `P`: palette read from CSS tokens by `readPalette()`.

## TimeChart (charts on tabs 4, 6 and 7)

Defined just above `const FB`. Helpers next to it:
- `HIST_CAP = 30000`, `capHist(arr)`: history arrays keep up to 30k samples (PID samples at 50 Hz, about 10 min).
- `bsearch(arr, t)`: first index with `.t >= t`. Every history entry has a `.t` in sim seconds.
- `drawSeries(ctx, arr, t0, t1, X, Y, get, color, width, dash, jump)`: draws one series with min/max decimation per pixel column. `get(p)` returns a number or null (null breaks the line). `jump` breaks the line on big steps (angle wrap).
- `extentOf`, `niceTicks`, `tickLabel`, `dashed`, `bracketH` (time bracket with label).

`TimeChart({bar, canvases, title, tMin, tNow, onReset, win, wins, fitY, fitToggle, markToggle})` builds the control bar into `bar` and returns:
- `map(canvas, L, pw)` returns `{t0, t1, X}` for the current view and records the layout for mouse hit tests.
- `xaxis(ctx, m, L, pw, top, bot, labelY)`, `overlay(ctx, canvas, top, bot)` (drag selection), `update()` (button states, scrubber).
- `fitY()`, `marks()`, `live()`, `V` (view state: `mode` live / all / fixed, `win`, `t0`, `t1`).

Save PNG: the last button in every bar. `title` is a string or a function (PID: "PID: " + the job title, tab 4: the drive mode). `savePng()` calls `chartPng(title, sub, canvases)`: one picture on the `P.surface` color with the title, the sim time span of the view, each canvas as drawn (same zoom), and the `.legend` row right after each canvas, read by `legendItems()`. PID saves plot1 and plot2 in one picture. The file name is `ftc-` + the title as a slug. Inside a frame (the published artifact) some browsers block the download without an error, so the bar also shows the picture in `.tc-pngbox` for right-click, Save image as.

Labels on charts: `plate(ctx, s, x, y, o)` paints a block in `P.field` behind a label, `plateText()` draws the plate and the text. Draw both after the curves, so a curve never cuts the letters. `bracketH()` uses `plateText()`.

Interaction: drag on any chart canvas zooms to the selection. Double-click returns to live. Shift + wheel or a horizontal trackpad scroll pans. Ctrl or Alt + wheel zooms at the pointer. Plain wheel scrolls the page on purpose. Canvases sharing one TimeChart share one view (PID plot1 and plot2).

## FB (tab 6, launcher)

- Model: flywheel with `KV = 116` ticks/s per volt, time constant `TAU = 0.35` s. Target 1160, HIVE window 1120-1200.
- Open loop `o.w`: `setPower(0.8)`, speed follows battery voltage `V`.
- Closed loop `c.w`: feedforward at 12 V + P (0.004) + I (0.003, integral clamped to +/-400, I-zone `|0.004 * error| < 0.35` as on the PID tab, so spin-up peaks near 1170, inside the HIVE window).
- Shots (`feed()`) drop each flywheel to 78% and record `{t, k, w, res}`.
- "Run a 2-minute match" drains the battery from 13.6 V to 11.7 V over 30 sim seconds and feeds every 2 s.
- `hist` samples every 0.03 s: `{t, o, c}`.
- `shotMarks()` draws, for the last closed-loop shot in view: dip, the time until the speed is back in the window to stay (0.3 s), and the open-loop offset from 1160 at the right edge.

## PIDLAB (tab 7)

Three jobs in `APPS`: `turn` (IMU heading), `aim` (camera bearing), `lift` (encoder height). Each has title, units, targets, tolerance `tol`, plot range `yr`, output clip, slider ranges and presets.

| Job | tol | Presets (kP, kI, kD) |
|---|---|---|
| turn | 1.5 deg | P only 0.02/0/0, PD 0.02/0/0.002, PID (tuned) 0.02/0.04/0.002 |
| aim | 3 deg | P only 0.02/0/0, P too high 0.06/0/0, PD (tuned: no I needed) 0.02/0/0.002, PID: I makes it worse here 0.02/0.04/0.002 |
| lift | 0.3 in | P only 0.1/0/0, P too high 0.35/0/0, PD 0.1/0/0.012, PID (tuned) 0.12/0.25/0.015, PD + F (tuned) 0.12/0/0.015 with kF 0.18. Lift presets carry a 4th value, kF, and every other lift preset sets kF to 0. |

Sim:
- `controlPass(0.02)` runs at 50 Hz and mirrors the Java `PIDController` class shown in the lab: first pass P only, I-zone (integral builds only while `|kP * error| < 0.35`, reset to 0 outside), derivative on error, output clipped.
- Turn: the Java loop breaks when on target and stopped (`S.done`), output 0.
- Aim: `S.aim.mode` is `off` (button not held), `search` (no target seen: PID reset, fixed output 0.3 toward `lastB`, the last seen bearing sign), `track`, or `locked` (inside tol). The button starts held.
- Aim, "PID only on new frames" (`#pid-frames`, `S.aim.perFrame`, default off): a frame arrival sets `S.aim.fresh`. With the box on, a pass without a fresh frame holds `c.out` and the terms, and the next update uses `dt` = time since the last update (`S.aim.wait`), as the Java class timer does. `renderUse()` swaps the aim code to the `if (newFrame)` version with `aimTurn` held between frames, the same code as `docs/course/follow-up/vision.md` Module 4.
- Physics: rotation has a 0.05 power deadband (friction), `w` follows `u * 300` deg/s with a 0.18 s lag. Lift has gravity 0.18 (0.3 heavy), optional feedforward 0.18.
- Camera: 30 fps frames, 60 ms latency and +/-0.8 deg noise when "Camera noise and delay" is on, 35 deg half field of view. `trueBearing()` uses `atan2(-dx, -dy)`. Positive bearing = target to the left = positive output turns left. In the Java panel the drive call takes `-power` because the drive's turn input is positive to the right.
- `S.hist` entries every 0.02 s: `{t, e, sp, me, p, i, d, o, mv}`. `mv` marks samples where the target moved (strafing or dragging), which disables markers.
- `S.steps`: one entry per new target (`newTarget()`): `{t0, sp, start, app, cfg}`. `cfg` = `cfgNow()`: the gains key and a preset name. A bump sets `tEnd`.
- `S.stuck`: seconds the turn sits outside the 1.5 deg break window without moving (drives the "loop still running: stuck" chip).
- `S.ghost` (compare runs): when `newTarget()` starts a move whose `cfg` differs from the previous move's, `keepGhost()` stores the previous move as `{name, e0, pts: [{dt, e}], r}`. `plot1()` draws the samples faint, scaled onto the marked move (`level(st, r.e0, 1 - e / ghost.e0)`), and `respTable()` adds a "Last run" column from `r`. Legend entry `#pid-ghostkey`, button `#pid-ghostclr`. Cleared on a job switch, kept by Reset run.

Response markers (`response(step, tEnd)`): first non-null error `e0`, progress `p = 1 - e / e0`. Dead time at p >= 0.05, rise time from p 0.1 to 0.9, peak and overshoot from max p, settling band +/-max(tol, 2% of e0) held for 0.4 s, steady-state error as the mean error of the last 0.5 s after 1.5 s. Moves smaller than 2 x tol show no markers. Levels on the plot: turn and lift `sp - (1 - p) * e0`, aim `(1 - p) * e0`. The markers use the last move that started before the right edge of the view, so scrolling back shows older moves. A move with a finite end (next move or bump) and no settling time returns `cutBy`: the table heads the column "This move (cut)", adds a note row, and writes "cut before 90%" and "cut before settling" in place of numbers the cut hid.

On aim, the D mini chart draws one dot per loop pass and `#pid-dnote` (class `aim-only`) explains the D spikes: 30 camera frames per second against a 50 Hz loop.

`PIDLAB.get()` returns `{app, target, meas, err, c, hist, t, t0, integral, gains, on, aimMode, done}` for `PIDVIZ`. `t0` is the start of the latest move.

`PIDVIZ.loop()` draws the control loop SVG `#pid-loop` (viewBox 1040 x 280). Term boxes show `gain x input = term` live, dashed when a term is switched off, "not running" when the PID is skipped. `PIDVIZ.minis()` draws the integral (area under error since the last reset, last 6 s) and derivative (slope over the last 2 s) mini charts.

`turnJava(ctor)` (above `const EN`) returns the `turnToHeading()` lines. The tab 7 turn job panel and the tab 8 exercise answer print the same lines, so the two never drift apart.

## MC (tab 4, drive modes)

- Modes: `robot`, `field`, `auto` (radio `mcmode`). `CODE[mode]` fills `#mc-code`. The usecards in `#mc-uses` light up for the current mode.
- AUTO: a click on `#mc-field` sets `goal`. The go-to-point code panel and the AUTO card state the team heading rule: one heading source, the Pinpoint heading once fitted (`docs/course/follow-up/odometry.md`).
- Wheel power chart: `hist` samples `{t, fl, fr, bl, br}` every 0.03 s (the sent powers, bug included). `plot()` draws `#mc-plot` through a TimeChart on `#mc-cbar`. Colors come from `WCOL()` (`P.accent`, `P.red`, `P.pollen`, `P.ok`), and line widths step down (7, 5, 3, 1.5) so four equal powers read as one striped band.

## OL (tab 5, one loop)

`#ol-bar` holds Launch, Pause (calls `window.__setPause`, label synced each draw) and Reset run. `reset()` clears only this tab: both robots, loop ticks, states and error chips. Sim speed and Pause stay. Launch is ignored while either robot is mid-launch. `DG.stateMachine()` picks a wide (1000 x 130) or narrow (360 x 380) layout from the SVG's width.

## EN (tab 8, encoders)

`tick()` adds wheel counts at `power * 2400` ticks/s and moves the robot by those counts times `(1 - slip)`. Slip = Floor slip slider (`#en-slip`, 0 to 15%) times 2.5 when strafing, plus 0.35 for the first 0.3 s of an unramped start. Teaching numbers, not measured ones. `#en-ramp` swaps the code panel to the ramped loop and caps power at `0.5 * t / 0.5`. The kv list shows encoder inches next to tape inches and an odometry pod that reads the tape value. The end message names the cause: constants, slip, or both.

`TT` (panel `#en-tt`): the turnToHeading exercise. Run drives 24 in, then turns to 90 deg with the tab 7 turn gains (0.02, 0.04, 0.002), the same I-zone, a 0.6 clip and the break line (error under 1.5 deg AND rate under 5 deg/s). `#en-tt-canvas` draws the top view and the heading error with the break window, stacked on a narrow screen. `#en-tt-chips` shows both halves of the break test. Show the answer reveals `#en-tt-code`: LeaveAndPark plus `turnJava()`, with the running lines marked. `EN.tick()` calls `TT.tick()`.

## GitHub tab terminal boxes

Each step in the PR loop (`PR[]`) and the conflict story (`STEPS[]`) carries a `cmd` field, rendered into `pre.code.term` under the Android Studio line. Part A buttons call `cmd()` with the git command for the press, including the rejected push. The `$ ` prompt comes from CSS, so the text stays plain commands.

## Team game (top bar and every tab)

- `TEAMS`: 6 teams in `#tm-list`, rendered from one immutable array `{name, pts}`. Keys 1 to 6 add a point (global keydown handler), `+` and `-` buttons adjust, the name input renames, `#tm-reset` zeroes, `#tm-toggle` hides the bar. Saved in `localStorage` under `ftc-lab-teams` inside try/catch, so a private window still works for the page's lifetime. The team with the top score gets `.lead`.
- Votes: every `details.ask` holds a `span.vote` with `data-right` and `button.opt` children inside the summary. The enhancer after `TEAMS` adds the letter, a tally `<b>`, and the `right` class. Click adds one, right-click takes one back, both stop the summary toggle. Opening the details (Reveal answer) lights the right option and fades the rest through CSS.
- Ask the room Hide: the enhancer puts a Hide button (`.ask-x`) inside each summary (a closed details renders only its summary) and a `.ask-show` button after the details. Hide adds `.qgone` to the labhead, so the title column takes the full width. Votes and points stay.
- `AUTOHIDE`: `body.autohide` folds the whole header into one 34 px line, `#peek`: the current tab (`#pk-tab`), the sim state (`#pk-time`) and the team scores (`#pk-score`), painted by the hoisted `peekPaint()` from `route()`, the time chip and `TEAMS.render`. `.tbfull` (tabs and control bar) floats over the page and opens on hover (only under `@media (hover:hover)`), on focus inside it, or with `.open` from a tap on the peek line. A tab pick, Escape or a click outside closes it. The pin button `#ah-toggle` sits at the right end of the tab row, key H toggles. `--tbh` holds the bar height for the sticky offsets. While on, the Java card list folds to a 44 px rail of numbers. Saved under `ftc-lab-autohide`, default on.
- Reset scores takes two clicks ("Click again to clear"). No `confirm()`: an artifact iframe can block modals.
- Ask the room answers open only from Reveal: a click on the summary text does not open the block. Right answers are spread over A, B and C.
- `route()` scrolls to the top only when the tab changes, so a theme repaint keeps the place.
- Every tab has a `p.goal` line under its h2. A global rule turns off code ligatures, so `!=` and `>=` show as typed.
- `JVW` (Java tab, "Every word explained" card): three code listings in `FILES`, a word table `W` of `[id, regex source, color class, label, explanation]`, one combined regex `RE`. `lineHtml()` wraps each match in `span.w[data-w]`. Patterns with inner groups must use `(?:...)`, because the match index maps back to `W`. Clicking a word or a chip highlights every match of the word and fills `#jv-wname` and `#jv-wmsg`.

## Testing

`tests/smoke.js` drives the page with Playwright from `file://`. Modules are not on `window`, so tests read the DOM (chips, aria-pressed, table text). Add a check there for each new behavior.

- Canvas labels: `hookDrawn()` wraps `fillText` and keeps the strings per canvas id. `drawnOn(id, n)` returns the last `n`. The PID marker checks compare these labels with the markers table.
- Element shots go through `shot(locator, name)`, which hides `.topbar` for the picture. Without it the sticky bar lands over the middle of a tall section.
- `pngOf(bar)` clicks a bar's Save PNG and returns the file name and PNG size.
- A sim state in a picture: pause with `window.__setPause(true)`, check the chip, take the shot, unpause.
- No `window.__lab` hook (issue 18, decided 2026-11-08): every check above works through the DOM, the canvas hook and `__setPause`.
