# Lab architecture (lab/index.html)

One HTML file. Order inside: `<head>` with Google Fonts and one `<style>` block (CSS tokens at the top, light and dark themes), the top bar (tabs + sim speed bar), 8 `<section class="lab" id="lab-<tab>">` blocks, then one `<script>` with every module.

Line numbers drift. Grep for the names below.

## Tabs and modules

| Tab (hash) | Section id | Module(s) | Viz hook (redrawn each frame) |
|---|---|---|---|
| 1 GitHub teamwork (`#gitflow`) | `lab-gitflow` | `GT` (git demo), `GX` (three places, org map, PR loop), wrapped as `GITTAB` | none |
| 2 Java basics (`#java`) | `lab-java` | `JV` (anatomy, cards), `JV2` (project map `#jv-map`, import address `#jv-addr`, decoder, build line, error clinic, variable boxes `#jv-vbox`, blueprint `#jv-blueprint`), wrapped as `JAVATAB` | none |
| 3 OpMode lifecycle (`#lifecycle`) | `lab-lifecycle` | `LC` | `DG.lifecycle()`, plus `DG.timeline()` on show |
| 4 Drive modes (`#mecanum`) | `lab-mecanum` | `MC` | `DG.driveVec()` |
| 5 One loop, no sleep (`#oneloop`) | `lab-oneloop` | `OL` | `DG.stateMachine()` |
| 6 Feedback: launcher (`#feedback`) | `lab-feedback` | `FB` | `DG.loops()` (block diagrams) |
| 7 PID control (`#pid`) | `lab-pid` | `PIDLAB` | `PIDVIZ.loop()` + `PIDVIZ.minis()` |
| 8 Encoders in auto (`#encoders`) | `lab-encoders` | `EN` | `DG.encoder()` |

Element ids use the module prefix: `pid-*`, `fb-*`, `jv-*`, `mc-*`, `gx-*`, `gt-*`, `en-*`, `lc-*`, `ol-*`, `ts-*` (time bar).

The `/* LAB n: ... */` banner comments in the script use an old numbering (for example "LAB 6: IMU TURN" sits above `PIDLAB`). Trust the module names, not those numbers.

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

## Shared helpers

- `$`, `$$`: query helpers. `esc()`: HTML escape. `chip(text, cls)`: status chip (`ok`, `warn`, `bad`, `run`).
- `fit(canvas)`: sizes a canvas to its CSS box with devicePixelRatio, returns `{ctx, w, h}` and clears it. The canvas `height` attribute sets the CSS height.
- `text(ctx, s, x, y, {size, weight, color, align, mono})`: canvas text. Mono by default.
- `drawRobot`, `arrow`, `alpha(hex, a)`, `clamp`, `throttle(ms)`.
- `renderCode(el, lines)`: Java code panel with highlighting. `markLines` highlights lines.
- `SV`: theme-aware SVG builder (`SV.box`, `SV.ar` arrows, `SV.tx`, `SV.circ`, `SV.defs`, `SV.set(el, w, h, s)`, `SV.col(name)`).
- `P`: palette read from CSS tokens by `readPalette()`.

## TimeChart (charts on tabs 6 and 7)

Defined just above `const FB`. Helpers next to it:
- `HIST_CAP = 30000`, `capHist(arr)`: history arrays keep up to 30k samples (PID samples at 50 Hz, about 10 min).
- `bsearch(arr, t)`: first index with `.t >= t`. Every history entry has a `.t` in sim seconds.
- `drawSeries(ctx, arr, t0, t1, X, Y, get, color, width, dash, jump)`: draws one series with min/max decimation per pixel column. `get(p)` returns a number or null (null breaks the line). `jump` breaks the line on big steps (angle wrap).
- `extentOf`, `niceTicks`, `tickLabel`, `dashed`, `bracketH` (time bracket with label).

`TimeChart({bar, canvases, tMin, tNow, onReset, win, wins, fitY, fitToggle, markToggle})` builds the control bar into `bar` and returns:
- `map(canvas, L, pw)` returns `{t0, t1, X}` for the current view and records the layout for mouse hit tests.
- `xaxis(ctx, m, L, pw, top, bot, labelY)`, `overlay(ctx, canvas, top, bot)` (drag selection), `update()` (button states, scrubber).
- `fitY()`, `marks()`, `live()`, `V` (view state: `mode` live / all / fixed, `win`, `t0`, `t1`).

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
| turn | 1.5 deg | P only 0.02/0/0, P too high 0.07/0/0, PD 0.02/0/0.002, PID (tuned) 0.02/0.04/0.002 |
| aim | 3 deg | P only 0.02/0/0, P too high 0.06/0/0, PD (tuned) 0.02/0/0.002, PID worse 0.02/0.04/0.002 |
| lift | 0.3 in | P only 0.1/0/0, P too high 0.35/0/0, PD 0.1/0/0.012, PID (tuned) 0.12/0.25/0.015 |

Sim:
- `controlPass(0.02)` runs at 50 Hz and mirrors the Java `PIDController` class shown in the lab: first pass P only, I-zone (integral builds only while `|kP * error| < 0.35`, reset to 0 outside), derivative on error, output clipped.
- Turn: the Java loop breaks when on target and stopped (`S.done`), output 0.
- Aim: `S.aim.mode` is `off` (button not held), `search` (no target seen: PID reset, fixed output 0.3 toward `lastB`, the last seen bearing sign), `track`, or `locked` (inside tol). The button starts held.
- Physics: rotation has a 0.05 power deadband (friction), `w` follows `u * 300` deg/s with a 0.18 s lag. Lift has gravity 0.18 (0.3 heavy), optional feedforward 0.18.
- Camera: 30 fps frames, 60 ms latency and +/-0.8 deg noise when "Camera noise and delay" is on, 35 deg half field of view. `trueBearing()` uses `atan2(-dx, -dy)`. Positive bearing = target to the left = positive output turns left. In the Java panel the drive call takes `-power` because the drive's turn input is positive to the right.
- `S.hist` entries every 0.02 s: `{t, e, sp, me, p, i, d, o, mv}`. `mv` marks samples where the target moved (strafing or dragging), which disables markers.
- `S.steps`: one entry per new target (`newTarget()`): `{t0, sp, start, app}`.

Response markers (`response(step, tEnd)`): first non-null error `e0`, progress `p = 1 - e / e0`. Dead time at p >= 0.05, rise time from p 0.1 to 0.9, peak and overshoot from max p, settling band +/-max(tol, 2% of e0) held for 0.4 s, steady-state error as the mean error of the last 0.5 s after 1.5 s. Moves smaller than 2 x tol show no markers. Levels on the plot: turn and lift `sp - (1 - p) * e0`, aim `(1 - p) * e0`. The markers use the last move that started before the right edge of the view, so scrolling back shows older moves.

`PIDLAB.get()` returns `{app, target, meas, err, c, hist, t, t0, integral, gains, on, aimMode, done}` for `PIDVIZ`.

`PIDVIZ.loop()` draws the control loop SVG `#pid-loop` (viewBox 1040 x 280). Term boxes show `gain x input = term` live, dashed when a term is switched off, "not running" when the PID is skipped. `PIDVIZ.minis()` draws the integral (area under error since the last reset, last 6 s) and derivative (slope over the last 2 s) mini charts.

## Testing

`tests/smoke.js` drives the page with Playwright from `file://`. Modules are not on `window`, so tests read the DOM (chips, aria-pressed, table text). Add a check there for each new behavior.
