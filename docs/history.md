# Build history

Work done in claude.ai chats inside the Project "FIRST Tech Challenge (FTC)", 2026-11-01 to 2026-11-07. Requests are summarized in Baz's words where they matter.

## 1. Research and course plan (2026-11-01)

Request: the kids use AI to write code they do not understand (modules, inheritance, imports, private/public, a multi-threaded part). Research the program, device, environment, sensors, camera, rules, REV guides. Pick the most useful topics for a 4-5 hour Java-on-REV crash course. Include practical GitHub material: how the team works on repos in an organized way, with a code repo and a CAD repo.

Answers Baz gave: Android Studio, some Java basics, 4-8 kids, Onshape for CAD, rewrite the code simply.

Output: `ftc-reference-2026-27.md`, `github-team-workflow.md`, `team-coding-standard.md`, `crash-course-plan.md`.

## 2. Visual lab

Request: no time for each kid to test, so lean on illustrations, visuals and interactive examples.

Output: the lab artifact with tabs for lifecycle, mecanum, one loop, feedback, encoders.

## 3. More tabs

Request: (1) add field-centric drive with a compass and robot direction, working in both modes, with use cases (Baz thought field-centric fits the 30 s AUTO). (2) Make the P controller a full PID with an illustration, plus an auto-aim PID from camera tracking on a button press. Show PID with each sensor, tuning by trial and error, and code reuse. (3) A Java intro: imports, modules, classes, inheritance, private, lists, variables, constants, scope.

Output: Drive modes tab with robot-centric, field-centric and AUTO, PID tab with turn, aim and lift jobs, Java basics tab. Pushback given: field-centric belongs in TeleOp, AUTO uses the rotation math on odometry.

## 4. Homework, slow motion, more visuals, GitHub first

Request: (1) self-study resources for the night before. (2) A way to slow time in the lab. (3) A control loop diagram plus small charts for the integral and derivative. (4) More visuals and charts everywhere. (5) Start with GitHub.

Output: homework Docs artifact, sim speed buttons (1x to 0.1x), Pause and Step, PID loop diagram and I/D mini charts, diagrams on every tab, GitHub teamwork tab moved to position 1 and the agenda reordered.

## 5. Java visuals

Request: visuals for modules and packages: a project with files and the relations between them, class vs module, what an import is and how it connects files. Students should fix an import error and a missing package.

Output: project map, zoom levels (module, package, class, method), import address, error decoder, build line, error clinic with 9 errors, inheritance window, variable boxes, blueprint. Plan updated with card timings.

## 6. Speed slider, charts, markers, aim fix (2026-11-07)

Request, verbatim:
- "I want the SIM speed to be a slider that goes to 0.05x minimum and 2x max (logarithmic scale) i want to be able to slow it down a lot."
- "I want the line graphs to not have a fixed window, I want to be able to see the entire graph or scroll back to earlier parts or zoom in to a selected part. Add a pause, play, reset buttons."
- "I would like to see indicators with dotted lines for the things like rise time, response time, overshoot, settling time, offset, etc."
- "Are you sure the auto-aim at hive is working as expected? ... the device is not trying to turn to and face the Hive. I think the Kp, KI, Kd sliders are not being reflected in the control loop."

Finding: the sliders did change the output. The loop diagram did not show the gains. The real failures: "Move the target" often put the HIVE outside the 35 deg camera view and the robot then did nothing, and the 0.05 friction deadband stalled the robot about 3 deg off, outside the 1.5 deg tolerance.

Output: log slider, TimeChart component, response markers and table, launcher markers, aim search and drag, tolerance 3 deg, new aim presets, live gain math in the loop diagram. Plan doc updated. Published as artifact version `1794040580-c5ad`.

## 7. Move to Claude Code (2026-11-07)

This repo: lab source, course docs, tests, and these context docs.

## 8. Setup check in Claude Code (2026-11-07)

Request: read the docs, verify the setup, check the screenshots and the first commit, report back, and stop before any lab change.

Output: zip contents copied into the repo root. `npm install` added `package-lock.json`. `npm run check` and `npm test` pass, 14 of 14 checks. No lab change and no commit. Findings went to Baz in chat.

## 9. Engineering skills setup (2026-11-07)

Request: run the setup for the Matt Pocock engineering skills.

Output: `docs/agents/` with the issue tracker, triage labels and domain docs, an Agent skills section in `CLAUDE.md`, and 4 new triage labels on the GitHub repo. Issues live in GitHub Issues. Domain docs use the single-context layout and also read `docs/decisions.md`. No lab change.

## 10. Backlog moved to GitHub Issues (2026-11-07)

Request: switch open work from `docs/backlog.md` to GitHub Issues without losing information, and update the repo to use GitHub Issues from now on.

Output: issues 1 to 33. All 25 backlog lines moved word for word, checked by script against the live issues. 9 issues record findings from the setup check. `docs/backlog.md` removed, with the last version in commit `1bb7991`. Two recurring backlog rules moved to `CLAUDE.md`. No lab change.

## 11. Crash Course readiness map (2026-11-07)

Request: chart a wayfinder map. Baz chose Crash Course readiness as the destination, with a one-page run sheet at the end.

Output: map in issue 34 with tickets 35 to 43, `GLOSSARY.md` with the settled terms, and the label `before-session` renamed to `before-crash-course`. Research tickets 40 and 42 went to subagents. No lab change.

## 12. Commit email fix (2026-11-07)

Request: fix the personal email exposed by the first push.

Output: the first 4 commits rewritten to the GitHub noreply address and force-pushed, this repo's git config set to the noreply address, and the commit reference for `docs/backlog.md` updated. File contents did not change in the rewrite. No lab change.

## 13. Prep for the Crash Course tomorrow (2026-11-07)

Request: Baz set the Crash Course for Sunday 2026-11-08 and approved the tonight plan with defaults.

Output: the map Notes allow execution tonight. Decision tickets for length, the "P too high" demo, the PR checklist and where the lab runs closed with the defaults. Lab fixes: tab references name tabs 6 and 7, and the launcher closed loop gained the PID tab's I-zone, so a zero-shot spin-up peaks near 1169 instead of 1306. Two new smoke checks, 17 of 17 pass. Docs: a clean build passes the PR checklist on the day, the PID plan shows "P too high" on the aim job, PD ends past the target. New `docs/course/run-sheet.md`. The artifact was not republished, per the decision to run the lab from the local file.

## 14. Tab buttons in the preview pane (2026-11-07)

Request: Baz reported the tab buttons did nothing in the Claude browser pane.

Finding: the pane opens the lab as a `data:` URL, and Chrome blocks hash navigation on a `data:` top frame. The smoke test never clicked a tab, so it missed this.

Output: tab links switch through a click handler, with `history.pushState` in try/catch. New smoke check loads the lab as a `data:` URL and clicks a tab, 18 of 18 pass.

## 15. Rebuild for 30 students and 3 hours (2026-11-07)

Request: audit the lab (static used but never explained), rethink the method for close to 30 students in 3 hours, and make the lab more interactive and complete.

Facts from Baz: still tomorrow, demo-driven with no laptops, no robot in the room.

Audit: the Java tab used static, final on fields, this., constructors, void, return, parameters, enum, switch, else, &&, hardwareMap.get(X.class, name) and @TeleOp(name) without explaining them.

Output: a 6-team scoreboard in the top bar, A/B/C votes with a tally on all 9 Ask the room blocks, and the Every word explained card with MainTeleOp, Robot and PIDController where every word is clickable. 12 new smoke checks, 28 of 28 pass. Plan rewritten for the 3-hour agenda with team rounds, run sheet rewritten with the new gates, GLOSSARY gained Team and Team Round, decisions gained the format change. The artifact was not republished: the lab runs from the local file.

## 16. Git terminal commands on the GitHub tab (2026-11-07)

Request: show the git terminal commands next to the Android Studio steps.

Output: a terminal box under Part A (the command for each button press, including the rejected push), under each PR loop step and under each conflict story step. 5 new smoke checks, 33 of 33 pass.

## 17. Student cheat sheet (2026-11-07)

Request: printable cheat sheets for the students, 1-2 pages, double sided.

Output: `docs/course/cheatsheet.html`, two letter pages. Page 1, Read any OpMode: the 3 rules, an annotated MainTeleOp with the 8 parts, who does what, and 24 words with one-line meanings. Page 2, How the robot thinks: one loop and the state machine, open vs closed loop, drive modes, PID with the tuning recipe and the response words, git in Android Studio and the terminal, a build error decoder, and the PR checklist. Rendered with Playwright to confirm 2 pages. Two smoke checks guard the page count and clipped code lines.
