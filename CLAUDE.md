# CLAUDE.md

Context for Claude Code. Read this first, then the doc the task points to.

## What this repo is

Baz (Ahmed El-Baz) is the software mentor for a local FIRST Tech Challenge (FTC) team. The team uses REV hardware (Control Hub, Driver Hub) and codes in Java in Android Studio. CAD lives in Onshape. Season: 2026-27, game BIOBUZZ, FTC SDK v12.0.

The students' old code was AI-written and too complex for them (threads, inheritance, modules they did not understand). Baz chose to archive it and have the students rewrite it simply. This repo holds his 3-hour, demo-driven crash course for about 30 students with basic Java, run as a team game on a projector (6 teams, votes on every question, a scoreboard in the lab):

- `lab/index.html`: the interactive projector lab. One self-contained HTML file, 8 tabs. This is the main build artifact and most of the work.
- `docs/course/`: the course plan, homework, team coding standard, GitHub workflow, and the FTC season reference.
- `tests/`: Playwright smoke test and a syntax/ASCII check.

The course format (changed 2026-11-07 for 30 students, 3 hours, no laptops and no robot in the room): every module opens with a team vote, runs on the lab's sims and games on the projector, and scores points. Students type code in a later hands-on session, not on the day.

## Repo map

```
CLAUDE.md                   this file
README.md                   human-facing overview
lab/index.html              the lab (about 5600 lines: CSS, HTML for 8 tabs, one <script>)
docs/architecture.md        how the lab code is built: modules, time loop, charts, PID sim
docs/decisions.md           teaching and technical decisions, with the reason for each
docs/history.md             what was built, request by request
docs/writing-style.md       rules for lab copy and for replies to Baz
docs/agents/                config for the engineering skills: issue tracker, triage labels, domain docs
docs/course/crash-course-plan.md      the session plan, module by module (source of truth for teaching)
docs/course/homework.md               night-before homework (snapshot of the claude.ai doc)
docs/course/run-sheet.md              one printable page: go or no-go gates, prep order, fallbacks
docs/course/vote-cards.html           printable A, B, C cards, one set per team
docs/course/cheatsheet.html           student cheat sheets: 2 double-sided sheets (Java + GitHub, loop/drive + PID), inline SVG diagrams
docs/course/team-coding-standard.md   printed handout: the Java the team uses and avoids
docs/course/github-team-workflow.md   org, repos, branch rules, PR template, drills
docs/course/ftc-reference-2026-27.md  season rules, hardware, SDK, sensors, vision, links
docs/course/follow-up/                plans for the sessions after the Crash Course: vision, odometry, path following, Control Award
tests/smoke.js              Playwright end-to-end checks plus screenshots in tests/shots/
tests/syntax-check.js       parses the inline script, flags non-ASCII characters
```

## Commands

```
npm install                 # installs Playwright
npx playwright install chromium
npm run check               # syntax + ASCII check of lab/index.html (fast, run after every edit)
npm test                    # full smoke test, about 90 s, screenshots in tests/shots/
npm run serve               # serves lab/ at http://localhost:8080
```

Open `lab/index.html` straight from disk to try it. `#pid`, `#feedback` and the other tab ids work as URL hashes.

## How to work on the lab

- Edit `lab/index.html` in place with small, targeted edits. Read the region first. The file is large: grep for the module name (`const PIDLAB = (function(){`) or the element id (`#pid-plot1`) and read around it.
- After each change: `npm run check`, then `npm test`. Look at the screenshots in `tests/shots/` for layout changes. Check light and dark themes and 390 px width when you touch layout.
- Keep the file self-contained: no build step, no external JS, no frameworks. Only Google Fonts load from the network, with system fallbacks.
- Plain ASCII only in the file. No em dashes, en dashes, smart quotes or emoji. `npm run check` enforces it.
- Colors come from CSS tokens (`--ink`, `--accent`, `--ok`, `--red`, `--pollen`, `--muted`, `--line`). In JS use the palette object `P` (canvas) or `SV.col()` (SVG). Never hard-code hex in drawing code, so the dark theme keeps working.
- Every animated module ticks from the one frame loop and uses simulated time (`TIME`), so the speed slider and Pause work everywhere. Never use `setTimeout` or real time for sim behavior. Use `after(sec, fn)`.
- Java shown to students must follow `docs/course/team-coding-standard.md`: one loop, no threads, no sleep in TeleOp, `Robot.java` for hardware, flat `teamcode` folder, FTC SDK v12.0 APIs.

Details in `docs/architecture.md`.

## Where the live versions sit

- Lab, published as a claude.ai artifact: https://claude.ai/artifact/4TYMuabeQX1RxzrJHuUvCW (slug `1c0014a0-253d-4041-8f6c-567cc2c4ba47`, last published version `1794166106-74e2` on 2026-11-08).
- Homework, a claude.ai Docs artifact: https://claude.ai/artifact/Sp91vcA66zYtaZfurQQz7S
- The claude.ai Project "FIRST Tech Challenge (FTC)" holds copies of the 4 course docs under `claude/*.md`.

The repo is now the source of truth for the lab file. To update the artifact, either run Claude with the claude.ai artifacts connector and republish `lab/index.html` to the slug above, or upload the file in a claude.ai chat in the Project. A second option for sharing: GitHub Pages on `lab/` (the file is static).

Until these issues close:
- After any lab change, republish and update the version id above (issue 8 decides where the lab lives).
- After any course doc change, sync the copy in the claude.ai Project (issue 29 decides whether the sync continues).

## Current state (2026-11-08)

The `crash-course-day` git tag marks the final lab for the day (with the theme button), pushed to GitHub on 2026-11-08. `lab-fallback.html` (untracked, repo root) is the same file, made from the tag for the USB stick. Robot and manual checks left from the follow-up docs sit in issue 48.

Done and tested:
- 8 tabs in the plan's teaching order: 1 Java basics (12 cards in reading order: anatomy, classes, types, public/private, extends and @Override, Decisions (if, else, switch), Loops (for the hands-on session), scope, Every word explained, imports, error clinic, project map; Lists off the nav), 2 OpMode lifecycle, 3 GitHub teamwork, 4 Drive modes (robot-centric and field-centric, compass, AUTO), 5 One loop no sleep, 6 Closed loop: launcher, 7 PID control (turn, auto-aim, lift with F: PIDF), 8 Encoders (later) (wheel slip, ramp, a tracking fix ladder, and the turnToHeading exercise). The lab opens on Java.
- Auto-hide (pin at the right end of the tab row, or key H, default on): the header folds into one 34 px line with the tab, the sim state and the scores. Hover, focus or a tap opens the full menu over the page. The Java card list folds to a rail. A Dark or Light button left of the pin, or key T, switches the theme and the pick stays in the browser. Every Ask the room has a Hide button, and its answer opens only from Reveal.
- Every tab has a one-line goal under its title. Ask the room right answers are spread over A, B and C. A teaching review (2026-11-07) passed all 10 areas at 1366x768, dark and 390 px.
- Diagram text: `SV.MIN` 12 and `SV.MAXSCALE` 1.25 keep every SVG label between 12 and 20 px.
- Pinned header: one row of tabs, one row with the sim speed and the six team chips, hints behind the ? button. The Ask the room block is compact (140 to 177 px), so the first sim of every tab starts above 330 px on a 1366x768 projector. The smoke test enforces both.
- Team game: 6-team scoreboard in the top bar (keys 1 to 6, saved in the browser). Ask the room votes come in team order, Team 1 first; Reveal pays a point to every team that chose the right answer; right-click takes the last vote back. Reset scores takes two clicks. Word hunt chips on the Every word explained card.
- Every Java snippet audited against the SDK v12.0 javadoc (2026-11-07): all compile as shown.
- Sim speed slider, log scale 0.05x to 2x, plus Pause, Step 0.1 s, keys P [ ] .
- Charts on tabs 4 (wheel powers), 6 and 7 keep the full history: live window 5-60 s, Show all, drag to zoom, scroll back, zoom buttons, Pause / Play / Reset run, Save PNG (falls back to an in-page picture inside the artifact).
- PID response markers (dead time, rise time, overshoot, peak time, settling band and time, steady-state error) with a kid-friendly table. Launcher markers: dip, recovery time, open-loop offset.
- Auto-aim fixed: search turn when the HIVE leaves the camera view, draggable HIVE, state banner, gains shown live in the control loop diagram. A D note explains the camera-frame spike, and "PID only on new frames" (off by default) shows the fix, the same code as `docs/course/follow-up/vision.md`.
- PID: a last-run ghost line and a Last run column compare two runs, and a move cut by a new target or stuck says so.
- Tab 4 AUTO reads the Pinpoint heading: once Pinpoint is fitted, the team has one heading source.
- Engineering rules hold: no setTimeout for sim behavior, no hex in drawing code (static scan in `tests/syntax-check.js`), and the layout passes with Google Fonts blocked.
- Final review (2026-11-08): five rounds of fresh reviewers. The 8 tabs, the whole lab and the day-of docs meet their goals. The follow-up docs got their last fixes in round 5 without a sixth review, and they keep [Verify] marks for checks on the robot.

## Open work

GitHub Issues on MaestroBaz/FTC-Robotics hold all open work: next steps, known issues, ideas and follow-up sessions. No doc keeps a second list.

- Start with `gh issue list --label before-crash-course`.
- The Crash Course readiness map is issue 34.
- File an issue for each new bug, idea or doc conflict you find. Close the issue when the fix lands.
- This repo is public, so issues name no students and hold no private notes.

Labels and commit conventions: `docs/agents/issue-tracker.md`.

## Working with Baz

Baz set these rules for every reply. Follow them in chat output and in docs you write for him:

1. Open by challenging an assumption, naming what he missed, or asking a question that exposes a gap. Never open with agreement.
2. Tag claims with confidence: [Certain] with hard evidence, [Likely] for a strong inference, [Guessing] for filling gaps. If most of a reply is guessing, say so first.
3. Never write: "Great question", "You're absolutely right", "That makes a lot of sense", "Absolutely", "Definitely".
4. Disagree with structure: "I disagree because [reason]. Here's what I'd do instead [alternative]. The risk in your approach is [downside]."
5. Lead with the uncomfortable truth. No warm-up paragraphs.
6. Hold the position under pushback unless he brings new information.

Writing style (full list in `docs/writing-style.md`): short active sentences, "you" and "your", plain ASCII, no em dashes, en dashes, semicolons, hashtags or filler, and a banned-word list that includes can, may, just, that, very, really, it.

He is an engineer (computer engineering, robotics minor, 10 years in IoT). Skip beginner explanations of code for him. The students are the beginners.

## Agent skills

### Issue tracker

Issues live in GitHub Issues on MaestroBaz/FTC-Robotics, through the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default names: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` and `docs/adr/` at the root, plus the existing `docs/decisions.md`. See `docs/agents/domain.md`.
