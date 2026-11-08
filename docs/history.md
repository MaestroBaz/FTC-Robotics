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

Output, first version: `docs/course/cheatsheet.html`, two text-heavy letter pages. Baz rejected it: too verbose, no illustrations.

Output, second version (same day): two double-sided sheets, 4 pages, built from inline SVG diagrams with one-line captions. Sheet 1, Java and GitHub: a MainTeleOp cut into 8 colored bands with numbered callouts, Three files one robot (OpModes above Robot.java with its private parts and public doors, hardware below), Zoom levels as nested boxes, 12 word tiles with a picture each; Where your code lives (working files, local repo, GitHub, with commit, push, pull and the laptop-dies line), the pull request as a flowchart with the review loop, a merge conflict as a commit graph plus the marker lines, the menu-or-terminal table and the PR checklist. Sheet 2, how the robot thinks: the INIT, START, STOP timeline, the loop as a cycle beside a sleep-frozen timeline, the launcher state machine, drive modes on a top-view field plus three mecanum mini robots and the wheel formulas; open vs closed loop block diagrams, the 2-minute match chart with the HIVE window, the PID loop with P, I and D as three pushes, an annotated step response with four mini curves (generated from a small simulation), and the tuning recipe. Chrome drops leading spaces in inline SVG text, so code indentation is encoded as x offsets. Four smoke checks: 4 pages fit, no clipped code, at least 3 diagrams per page, no SVG label runs past its figure.

## 18. The F in PIDF (2026-11-07)

Request: Baz asked whether PIDF comes from the SDK, since the sheet and the lab say "PIDF on the hub" and never define F.

Answer: yes. `DcMotorEx.setVelocityPIDFCoefficients(p, i, d, f)` sets the four numbers the hub firmware uses for `setVelocity()` in `RUN_USING_ENCODER`. F is feedforward: power sized for the target itself, applied before any error exists. SDK recipe: `F = 32767 / maxTicksPerSec`, `P = 0.1 F`, `I = 0.1 P`, `D = 0`. The students' own `PIDController` is for positions, where a constant F does nothing, so the course keeps F out of tab 7 on purpose.

Output: one-line definition of F wherever PIDF appears: the Feedback tab block diagram, its code comment and its Ask the room answer, and the closed-loop caption on cheat sheet page 4. Glossary entry for PIDF.

## 19. Header, votes that score, REV audit, PIDF, card and tab order (2026-11-07)

- Sticky header 174 px to 78 px: one row of tabs, one row of controls.
- Votes record in team order. Reveal pays a point.
- REV audit of every Java snippet against the SDK v12.0 javadoc. One compile break fixed: the DcMotorEx import in the Robot.java of the words card. The two PIDController listings now match. The field-centric snippet calls robot.resetHeading(). The stick-sign sentence is fixed.
- PIDF on the lift: a 4th control, the F slider (kF, 0 to 0.4, default 0), and a 4th box in the loop diagram that the error does not feed. PIDController stays P, I and D. The OpMode adds one line, `power = power + kF`. This replaces the entry 18 choice to keep F out of tab 7.
- Java cards reordered and renamed (ten cards). Lists is off the nav for the day.
- Tab bar reordered to the plan's teaching order: Java, lifecycle, GitHub, drive, one loop, then 6, 7, 8. The lab opens on Java.

## 20. Compact Ask the room block (2026-11-07)

Request: after the header shrink, the first sim on every tab still sat below the fold at 1366x768. Baz asked to shrink the Ask the room block next.

Finding: the block set the labhead height on all 8 tabs, 277 to 323 px, while the title and lede column took 110 to 158 px.

Output: tag inline with the question, 13 px option buttons, the voting rules hidden behind the ? button, Reveal moved to the end of the vote row by the vote enhancer, h2 26 px, lede 14 px. The block is now 140 to 177 px and the first block of every tab starts at 283 to 320 px instead of 424 to 470 px. The pid control loop diagram is on screen without scrolling. One smoke check per tab for pid, feedback and one loop, plus a check that Reveal sits in every vote row.

## 21. Mecanum mini robots on the cheat sheet (2026-11-07)

Request: Baz saw one blue arrow per robot instead of four, and the captions "fl + fr - bl - br +" read as noise.

Finding: each robot's four spin arrows sat in one SVG path with four subpaths, and marker-end draws one arrowhead per path, at its last vertex. The rollers were drawn in the O layout. Real mecanum rollers form an X seen from above, as the lab's drive tab already says.

Output: one path per wheel, arrows inside the body beside each wheel, rollers redrawn as an X, captions in words (all four forward; fl and br forward, fr and bl back; left forward, right back), the turn arc shrunk clear of the arrows. Page 3 fill unchanged at 786 of 979.

## 22. Yaw compass, reset yaw, and a PIDF box on the cheat sheet (2026-11-07)

Request: the drive modes robot faced the left wall with its wheels still on its left and right edges as if it faced up. Add a compass with the yaw, a note on resetting the yaw and what it does to each drive mode, and PIDF information, which the sheet only mentioned in captions.

Output: the robot's wheels moved to its top and bottom edges, so the drawn front matches the arrow. A compass in the field (0 away from the drivers, +90 left, -90 right, 180 toward the drivers) with the needle on +90 for the drawn robot. Four lines on yaw under the field: what it is, which mode reads it, what resetYaw() does, and the failure when you reset facing the left wall. The resetHeading() method and its gamepad binding in mono on the right. Page 4 gained a PIDF figure with two boxes: F on the hub for velocity (setVelocity, setVelocityPIDFCoefficients, the SDK recipe, RUN_USING_ENCODER) and F in the OpMode for a position job (liftPID.update(error) + kF, about 0.18 on the lift, kF x cos for an arm, none for turn and aim). Fill: page 3 850, page 4 899 of 979. One smoke check for the four new strings.

## 23. Java control flow, @Override, auto-hide, Ask Hide, one-loop controls, diagram type scale, F in PIDF, encoder slip (2026-11-07)

Request: Baz asked for an auto-hiding top bar and Java card list, a clearer extends and @Override card, a better Types table, a real Java lesson on if/else if/else, switch and the comparison signs, a way to hide each question after the vote, Pause/Resume/Reset on the one-loop tab and a state machine with no overlapping text, consistent diagram text, a clearer F in PIDF, and an answer on what tab 8 shows and how to track better.

Finding: diagram text ranged from 9 to 31 px because each SVG stretched its viewBox to the panel width. The one-loop state machine drew labels before boxes. The lab had two meanings of F (the hub's PIDF and the lift's hold power) with no rule tying them. Tab 8's sim had perfect wheel grip, so it could not show why a real AUTO misses.

Output:
- Auto-hide (button and key H): the top bar slides away while scrolling down, and the Java card list folds to a numbered rail. Default on, saved in the browser.
- Ask the room: a Hide button in every question, a Show the question button in its place. Votes and points stay.
- Java: 11 cards, with "extends and @Override" (three versions: right name, typo with @Override that fails the build, Start() without @Override that builds and never runs) and a new "Decisions: if, else, switch" card (stick slider through if/else if/else, comparison and logic tables, a switch on the launcher state with a Forget the break toggle). Types table rebuilt in two columns.
- One loop: Launch, Pause/Resume, Reset run in one bar. State machine redrawn wide and narrow, boxes before labels, 0 overlaps at 1366 and 390 px.
- Diagram type scale: `SV.MIN` 12 and `SV.MAXSCALE` 1.25. All 16 diagrams measure 12 to 20 px text with 0 overlaps. Code lines wrap with a hanging indent instead of hiding. Coding ligatures off.
- PIDF: one rule, F = kF x what you already know (lift: hold power, arm: kF x cos, launcher: kF x target speed on the hub). Tab 6 and tab 7 diagrams show F as its own branch with no error arrow, plus a gravity arrow on the lift. Lift preset "PD + F (tuned)". kG dropped. Cheat sheet wording matched.
- Encoders: Floor slip slider, Forward or Strafe right, a ramp option with its code, kv rows for encoder inches, tape inches and an odometry pod, and a "When AUTO misses: fix it in this order" ladder. Reference doc gained the same ladder and the BIOBUZZ AprilTag caveat.
- Smoke test: checks for @Override, if/else branches, switch fall-through, Ask Hide and Show, auto-hide, one-loop Pause/Resume/Reset, encoder slip.

## 24. Header fold, and a teaching review of every tab (2026-11-07)

Request: Baz wanted the top navigation to auto-hide too, with the auto-hide button out of its bad spot, and every tab checked against its teaching goal until each one meets it.

Finding: the old auto-hide only slid the bar away while scrolling, and its button sat in the control row among the sim controls. An audit of all 8 tabs found about 190 problems. The biggest: every Ask the room answer was B, several goal lines and ledes gave the vote away, the lifecycle diagram showed the answer before the vote, the PID "How to tune" panel answered both overshoot votes, and some diagrams pointed at the wrong words.

Output:
- Header: with auto-hide on, the header folds into one line with the tab name, the sim state and the scores. Hover, focus or a tap opens the full menu over the page. The pin sits at the right end of the tab row, key H toggles. The SDK and season text left the header to keep the folded line to one row.
- Every tab has a one-line goal under its title. Tab labels: "6 Closed loop: launcher" and "8 Encoders (later)". The header shows the 3 team rules.
- Votes: right answers spread over A, B and C. Answers open only from Reveal. Reset scores takes two clicks. A tab change scrolls to the top.
- Per tab: the Java tab opens with the three places every word comes from (Robot, the SDK parent, Java), the error decoder brackets sit under the right words, @Override versions build honestly. Lifecycle shows each phase's text only after its vote. GitHub predicts before it shows. Mecanum starts the run clear of the walls. One loop counts the seconds the sticks were ignored. Launcher explains launcherReady(). PID folds How to tune until after the votes, reports "still swinging" instead of a fake offset, and keeps the D chart labels apart. Encoders shows what your code thinks against the tape.
- Code ligatures off everywhere.
- Process: an audit and a critic per tab, fixes in 10 branches, then three rounds of fresh reviewers at 1366x768, dark and 390 px. All 10 areas pass. Smoke test gained a check per fix.

## 25. Close the open issues and match every day-of document to the final lab (2026-11-08)

Request: Baz asked to complete every open item and every "still not perfect" item, and to update the cheat sheet and every other document he needs to run the Crash Course.

Finding: 30 open issues. About 20 the repo could fix, and the rest need Baz, the projector laptop or the robot. The lab broke some of its own rules: one setTimeout, a few hex colors in drawing code, banner comments with old tab numbers. The follow-up docs disagreed on the heading source, R704.D and Robot.java names. Reviewers kept finding plan steps that fail when followed literally: presets run back to back without Reset robot, AUTO steps that never pick AUTO, a missing-break story that told the wrong consequence.

Output:
- Lab: a 12th Java card (Loops, for the hands-on session), Save PNG on every chart, a wheel power chart on tab 4, a PID last-run ghost and Last run column, labels for cut and stuck moves, "PID only on new frames" for aim, a turnToHeading exercise on tab 8, chart labels off the curves on tab 6, the Pinpoint heading in tab 4 AUTO, Reset scores shows hidden questions again, a revealed tab 1 question folds when a card opens.
- Engineering: banner comments match the tabs, no setTimeout, no hex in drawing code (static scan), layout checked with Google Fonts blocked, smoke assertions for launcher behavior, PID canvas markers and aim states. window.__lab not added: the DOM checks cover it.
- Docs: cheat sheet, run sheet, plan, vote cards, coding standard, homework and GitHub workflow match the lab word for word. Four follow-up plans under `docs/course/follow-up/` (vision, odometry, path following, Control Award), checked against the SDK 12.0 source.
- Process: 9 builders in worktrees, 4 integrate agents, then 5 rounds of fresh reviewers and fixers. 304 smoke checks pass.

## 26. Theme button in the header (2026-11-08)

Request: Baz wanted to switch the lab between dark and light from the page. Before this, the lab followed the OS setting, and a `data-theme` set from the console was the only override.

Output:
- Lab: a Dark or Light button left of the auto-hide pin, and key T. The button names the theme a click switches to. The pick is saved in the browser. With no pick, the lab follows the OS. Canvases and diagrams repaint on the switch.
- Docs: run sheet, plan, architecture, writing style and CLAUDE.md name the button and key T. The run sheet says to pick Light on the projector.
- Cheat sheet (same day): the PID loop diagram draws F as a 4th block fed by an always-on source, I turns pollen to match tab 7.
- Smoke test: the button switches to dark, key T switches back, the pick survives a reload. A cheat sheet check guards the F block.
