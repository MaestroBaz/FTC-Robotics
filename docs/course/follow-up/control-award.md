# Follow-up session: Control Award portfolio page

Issue 32. Length: 60 minutes. Room: the 6 Crash Course teams, one laptop per team, the lab on the projector and on each laptop. Output: one portfolio page per team, built from the team's own lab runs, and one page the team keeps for the real portfolio.

## The gap in this plan

The lab charts come from a simulator, not from your robot. The Control Award judges the robot. A page built from lab data teaches the format and the vocabulary. The page in the real portfolio needs robot numbers. [Likely]

- Run this session as practice on lab data.
- Label every lab chart "Simulated in the team lab". A judge who finds out later stops trusting the rest of the page. [Likely]
- Repeat steps 3 and 4 on the robot once PIDController runs there (see "After the session").

## What the Control Award asks for

Source: FTC Competition Manual 2026-27, Section 6.3.7 Control Award and Table 6-8 Control Award Criteria, https://ftc-resources.firstinspires.org/ftc/game/manual-06, read on 2026-11-08. The team reference doc cites TU08, dated 2026-11-05. The Section 6 page header reads TU06: each section carries its own version.

The award goes to a team using sensors and software to solve game challenges creatively: in AUTO, in TELEOP, or both. The portfolio holds a summary of the software, the sensors and the mechanical control system. Full code is not required. [Certain]

Table 6-8, in our words: [Certain]

| Level | Criterion |
|---|---|
| Required 1 | Submit a portfolio. The portfolio lists (A) each hardware or software control component on the robot, (B) the challenge each component or system solves, (C) the function of each one. |
| Required 2 | One or more solutions use external feedback to control the robot and improve how the robot performs. |
| Encouraged 3 | The solution works in most matches. Every match is not required. |
| Encouraged 4 | The team explains how reliable the solution is: show the solution working, or say how to improve the solution. |
| Encouraged 5 | The team describes what they learned using the engineering process on the control solution. |

Our candidates for Required 2: the launcher on `setVelocity()` (motor encoder), the turn to heading (IMU), the lift to height (lift encoder), the auto-aim (camera bearing), the AUTO drive on the drive encoders (`driveInches()` with `RUN_TO_POSITION`), and `goToPoint()` on the Pinpoint. TeleOp stick driving on `setPower()` does not count: the driver closes the loop by eye. The aim button counts: the camera bearing closes the loop. AUTO drive counts. [Likely]: our reading of Required 2, not manual text.

Advancement: Control sits in one group with Innovate and Design. At small events the judges give only one award of the three (Table 6-1). [Certain] on the table text. [Verify] the size bracket of our event.

### Portfolio rules

Source: same section. The team reference doc calls this rule A201. [Verify] the rule number.

- 1 cover page with the team number, plus 15 pages of content at most.
- US Letter or A4 pages.
- Under 15 MB in total if you submit a file.
- Only progress, challenges and results since 2026-01-01.
- First names and last initials only.
- Fonts 10 pt or larger. High contrast. No text on busy photos.
- Judges do not click links, open websites or watch videos. Everything goes on the page.

The Control page takes 1 or 2 of the 15 pages. The team story, the Think Award and the design pages need the rest. [Likely]

## FIRST AI policy for portfolios

As the team reference doc (`docs/course/ftc-reference-2026-27.md`, section 4) states:

- CM 6.2: teams use AI to compose portfolios if they credit the tool in a footnote or endnote. The manual's example credit: "Portfolio created by Team XXXXX and ChatGPT". The manual text read on 2026-11-08 also asks teams to respect intellectual property rights. [Certain] on the wording. [Verify] the section number 6.2.
- FIRST blog "Expanding the FIRST Toolbox with Artificial Intelligence" encourages AI, robot code included, with credit and attribution. Judges evaluate what the team accomplished. [Verify] whether the post still reflects 2026-27 policy: https://community.firstinspires.org/expanding-the-first-toolbox-with-artificial-intelligence
- CM 1.4.3: students own and explain the robot in judging.
- Team rule: no code merges unless the author explains every line in review. Same rule for this page: every student on the team explains every number on the page.

## Before the session (mentor)

- Save PNG sits at the right end of the control bar above each time chart: tab 4 wheel powers, tab 6 launcher speed, tab 7 PID. The picture holds the chart as shown on screen (the same zoom and time window), its legend, a title line with the job name, and the sim time span. On tab 7 one picture holds both charts, "Target vs sensor" and "What each term asks for". The file name starts with `ftc-`. Inside the published artifact the browser sometimes blocks the download without a message, so the bar also shows the picture: right-click the picture, then Save image as. Fallback: a screenshot, Cmd+Shift+4 on macOS or Win+Shift+S on Windows.
- One laptop per team with the lab open, from `lab/index.html` or the published artifact.
- Print the template below, one per team, or give each team a copy of this file.
- Fill in the robot sensor list before the session. [Guessing] on the hardware: the lab assumes the Control Hub IMU, drive motor encoders, a lift encoder, a launcher encoder and a webcam. Check against the robot configuration.
- Give each team one job:

| Team | Job | Lab tab | Sensor |
|---|---|---|---|
| 1, 2 | Turn to heading | 7 PID | Control Hub IMU |
| 3, 4 | Lift to height | 7 PID | Lift motor encoder |
| 5 | Auto-aim at the HIVE | 7 PID | Camera (AprilTag bearing) |
| 6 | Launcher speed | 6 Feedback | Launcher motor encoder |

## Session plan (60 min)

1. Open (5 min). Put Table 6-8 on the projector. Ask the room: which part runs with no external feedback while the driver steers with the sticks (aim button released)? A the launcher, B the drive, C the lift. Answer: B. Stick driving runs on `setPower()` and the driver closes the loop by eye. In AUTO the drive uses the drive encoders, so AUTO drive counts. One point per right team on the scoreboard.
2. Sensor list (10 min). Each team fills in the sensor table on the template. Columns A, B and C match Required 1 (A), (B) and (C). The feedback column answers Required 2.
3. Before run (10 min). Tab 7, your job, preset "P only". Pick one target and run one move. Pause. Press Save PNG above the "Target vs sensor" chart: one picture with both PID charts. Copy the gains next to the sliders and four rows of the Response markers table: rise time, overshoot, settling time, steady-state error. Team 6: tab 6, battery 12.5 V, Fire 3 fast. Save PNG. Copy the dip and the recovery time for open loop and closed loop.
4. Tune, then the after run (15 min). Follow "How to tune" on tab 7. Try at least 3 gain sets. Write each set and the result in the gains table. Run the best set on the same target as the before run, or the comparison means nothing. Save PNG. Copy the markers again. Team 6 compares open loop (before) with closed loop (after).
5. Build the page (12 min). Fill in the template: the before and after charts with units on both axes, the gains table, the markers table, 2 sentences on what you learned (Encouraged 5), 1 sentence on reliability (Encouraged 4).
6. Pitch (8 min). Each team pitches the page in 60 seconds, as in a judge interview. Two students speak: the reference doc lists at least 2 students per interview (A204). The room votes for the clearest page. One point to the winner.

The mentor stays silent during pitches, the way judging works: A208 names the adult silent observer role. [Certain] on the role in the 2026-11-08 text.

## After the session

- Robot data: when PIDController runs on the robot, repeat steps 3 and 4 there. Two ways to get the numbers, both untested on our setup [Guessing]:
  - FTC Dashboard graphs at school only. R704.D names FTC Dashboard with no match-only limit, so Dashboard stays off at the whole venue, pits and practice fields included (`ftc-reference-2026-27.md`, section 2, [Likely] on the Dashboard reading). The code needs a switch to turn Dashboard off before the robot goes to an event.
  - Write time, target and sensor reading to a CSV file on the Control Hub each loop pass, then plot the file in a spreadsheet.
- Pick the best of the 6 pages for the real portfolio. Merge the sensor tables into one table for the whole robot.
- Store the page and the PNGs in the team repo next to the other portfolio material, for example `cad-and-design/photos/` from `github-team-workflow.md`, or a new `portfolio/` folder. [Guessing] on the folder: pick one with the team.
- Check every number on the page comes from 2026-01-01 or later.

## Fill-in page template

Copy this page. Keep everything on one US Letter or A4 page at 10 pt or larger.

```
CONTROL: ____________________________  (job name, for example "Lift to height")
Team ______   Page ___ of 15   Authors: ________ (first names, last initial)

THE CHALLENGE
In BIOBUZZ, our robot needs to ______________________________________
Without feedback, the robot ________________________________________

SENSORS AND CONTROL COMPONENTS                       (Table 6-8, Required 1 and 2)
| (A) Component     | (B) Challenge solved    | (C) Function           | Feedback signal |
|-------------------|-------------------------|------------------------|-----------------|
| Control Hub IMU   |                         |                        | heading, deg    |
| Lift encoder      |                         |                        | height, in      |
| Launcher encoder  |                         |                        | speed, ticks/s  |
| Camera            |                         |                        | bearing, deg    |
| Drive encoders    |                         |                        | distance, in    |
| ________________  |                         |                        |                 |

HOW THE CODE USES THE SENSOR  (one line per step, no full code)
1. Read the sensor: ________________________________________________
2. Error = target - reading = ______________________________________
3. Power = kP x error + kI x sum of error + kD x error change (+ kF on the lift)
4. Send the power to: ______________________________________________

BEFORE AND AFTER                                       (paste the 2 PNGs here)
[ chart: before, gains ________ ]        [ chart: after, gains ________ ]
Caption: Simulated in the team lab on ____ (date).  /  Robot data from ____ (date).
Axes: time in s, ____________ in ____ (unit).

GAINS WE TESTED
| Try | kP    | kI    | kD    | kF (lift) | What happened                  |
|-----|-------|-------|-------|-----------|--------------------------------|
| 1   |       |       |       |           |                                |
| 2   |       |       |       |           |                                |
| 3   |       |       |       |           |                                |
| Best|       |       |       |           |                                |

RESPONSE MARKERS (same target for both runs: ______)
| Marker                        | Before | After | Better or worse? |
|-------------------------------|--------|-------|------------------|
| Rise time (10% to 90%), s     |        |       |                  |
| Overshoot, %                  |        |       |                  |
| Settling time, s              |        |       |                  |
| Steady-state error, ____ unit |        |       |                  |
Launcher page: use dip (ticks/s), recovery time (s) and hits out of 3 instead.

WHAT WE LEARNED                                        (Encouraged 5)
1. ___________________________________________________________________
2. ___________________________________________________________________

HOW RELIABLE IS THE SOLUTION?                          (Encouraged 4)
Works in ___ of ___ runs. Fails when ______________. Next fix: ____________

Credit (only if you used an AI tool): Portfolio created by Team ____ and ________
```

Checklist before the page goes in the portfolio:

- Every number on the page has a unit.
- Every student on the team explains every number without notes.
- No links, no QR codes to videos. Judges do not open them.
- First names and last initials only.
- Lab charts say "Simulated". Robot charts give the date and the robot.
- The AI credit line is there if any AI tool helped write the page.
