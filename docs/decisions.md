# Decisions and the reasons behind them

## Course design

| Decision | Reason |
|---|---|
| Archive the AI-written code on `archive/ai-code-2026` and rewrite simply | Students could not explain threads, inheritance chains or modules. Judges interview students, not code. |
| Team rule: merge only code you explain line by line | FIRST allows AI with credit (CM 6.2, FIRST AI blog). Banning AI does not work. Review enforces understanding. |
| Android Studio, not OnBot Java or Blocks | The Git and pull-request workflow needs it. |
| GitHub first (Module 1), then every exercise ends in a commit and PR | Practice Git all day instead of one lecture. |
| GitHub organization with separate code and CAD repos, no submodules | Submodules stall students. Onshape already versions CAD, so the CAD repo holds links, exports, BOM and decisions. |
| New code repo each season, forked from FtcRobotController | The SDK changes every September. gm0 recommends it. |
| Demo-driven format: ask the room, show the lab, code-along, one robot moment | No time for each student to test on the robot. A clean build is the room's test. |
| Code model: FIRST's `RobotHardware` sample and the REV Starter Bot | One plain hardware class, private motors, public actions, one loop. |
| One flat `teamcode` folder | Subfolders change `package` lines and add imports students do not need yet. |
| `List` and our own `PIDController` class allowed | Needed for detections and reusable control. Everything else in the "avoid" table needs mentor approval. |
| No threads, state machines with `ElapsedTime` | gm0: hardware calls share one lock per hub. Threads add latency, hide crashes, and break G304.H (motionless after INIT). |
| Camera setup out of scope, auto-aim code takes a bearing number | BIOBUZZ has no randomization, so vision matters for aiming only. The code builds without a camera. VisionPortal is a follow-up session. |
| Encoder AUTO (tab 8) moved to a follow-up session | Java basics, drive modes and PID filled the day. |
| Field-centric drive taught as TeleOp | It reads driver sticks. AUTO uses the same rotation math on odometry coordinates. |
| PID with an I-zone instead of an integral cap | A cap still lets I pile up during long moves. The I-zone (`|kP * error| < 0.35`) stops windup and stays simple. |
| Aim presets show PD as the tuned answer and PID as worse | Camera data is late and noisy. Teaches that not every job needs all three terms. |
| Search turn toward the last seen bearing when the target is lost | Without it the robot sits still when the HIVE leaves the view, which looked like a broken PID. |

## Lab engineering

| Decision | Reason |
|---|---|
| One self-contained HTML file, vanilla JS, canvas + SVG | Runs from disk on any projector laptop. Publishes as one artifact. No build tools. |
| Simulated time for every animation | One speed slider and Pause control every demo, so the mentor slows down and explains. |
| Log-scale speed slider 0.05x to 2x | Baz wanted to slow demos a lot. Log scale gives fine control at the slow end. |
| Full chart history with zoom instead of a fixed window | Baz wanted to scroll back and zoom into one part of a run. |
| Plain mouse wheel scrolls the page, Shift/Ctrl + wheel act on the chart | The lab is a long page. Hijacking the wheel traps the scroll on a projector. |
| Response markers with standard names plus a plain-words table | Students learn the real terms (rise time, settling time, steady-state error) and what each means for scoring. "Response time" is flagged as ambiguous. |
| Colors only through CSS tokens | Light and dark themes stay correct. |
| Plain ASCII in all content | Baz's style rule. Also avoids encoding issues in code panels. |
