# Run Sheet: Crash Course, Sunday 2026-11-08

5 hours, 4-8 students. Lab: `lab/index.html` from the projector laptop disk, plus a copy on a USB stick. Students get no lab link.

## No-go Gates

Check each gate the evening before. Recheck gates 1 and 3 in the morning before students arrive. If a gate fails and has no fix by the start, move the date.

| # | Gate | Check | Done |
|---|---|---|---|
| 1 | Student laptops: repo cloned, Gradle sync finished | Build > Make Project ends clean on each laptop. Gate holds with at most 2 students per working laptop. | [ ] |
| 2 | GitHub: org, code repo, protected `main`, `team-roster.md` on `main`, old code on `archive/ai-code-2026`, every student invited and accepted | Open the repo as a student account: push to `main` fails, a PR opens. | [ ] |
| 3 | Lab reads from the back row | Projector, browser zoom 125-150%, local file. Read a code line from the last seat. | [ ] |

A dead robot, no internet or a dead projector does not block the Crash Course. See Fallbacks.

## Prep tonight, in order

1. [ ] Send the homework now. The claude.ai link opens for you alone: share the artifact first, or send the GitHub copy of `docs/course/homework.md`. Ask each student to reply with a GitHub username.
2. [ ] Set up the GitHub org and code repo per `github-team-workflow.md` (about 45 min).
3. [ ] Invite each student as usernames arrive.
4. [ ] Get every laptop cloned and Gradle synced (gate 1). Decide who does this tonight: the homework tells students no Android Studio work tonight.
5. [ ] Update the Control Hub and Driver Hub. Pre-build `Robot.java` on the robot.
6. [ ] Print `team-coding-standard.md` (one per student) and this sheet.
7. [ ] Copy `lab/index.html` to the USB stick. Open the file on the projector laptop once.

## On the day

| Elapsed | Checkpoint |
|---|---|
| Before start | Gates 1 and 3 rechecked. Robot boots and drives on the pre-built code. |
| 1:55 break | Module 3 done: every student has an OpMode PR open. |
| 3:20 break | Behind schedule: cut Module 7 to the turn and auto-aim demos. Skip the lift job. |
| 4:50 | Wrap-up starts on time, even if Module 7 runs short. |

Robot moments: the mentor deploys one student branch per module. A clean build passes the PR checklist on the day.

## Fallbacks (act within 5 minutes)

| Failure | Do this |
|---|---|
| Projector down | Pass the USB stick. Each student opens `lab/index.html` in a browser on the student laptop. Run demos on your laptop with students gathered around. |
| No internet | The lab runs from disk. Builds run on the synced Gradle cache (turn on Gradle offline mode if a build stalls). Students commit locally. Run push, PRs and the conflict drill from a phone hotspot, or move them to the end of the day. |
| Robot down | Skip robot moments. A clean build stays the test. Write down whose branch was next and deploy at the next practice. |
| Student laptop not synced | Pair the student with a neighbor. Swap driver and navigator each module. Do not start a sync on the room Wi-Fi. |

## Issues

Closed before the Crash Course: #3 tab numbers, #4 and #5 PID plan text, #6 PR checklist, #7 launcher overshoot.

Open, not needed for a go: #36 mentor checklist status, #43 fallback review, #8 where the lab lives after the Crash Course.
