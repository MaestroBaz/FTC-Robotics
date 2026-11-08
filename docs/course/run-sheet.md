# Run Sheet: Crash Course, Sunday 2026-11-08

3 hours, about 30 students in 6 teams, no student laptops, no robot. Lab: `lab/index.html` from the projector laptop disk, plus a copy on a USB stick. Students get no lab link.

## No-go Gates

Check the evening before, and again in the morning before students arrive. If a gate fails and has no fix by the start, run the day from your laptop screen with teams gathered around, or move the date.

| # | Gate | Check | Done |
|---|---|---|---|
| 1 | The lab reads from the back row | Projector on, browser zoom 125%, not more, `lab/index.html` open from disk. Read a code line on the Every word explained card from the last seat. | [ ] |
| 2 | The header, the scoreboard and the votes work on the projector laptop | The header sits folded to one thin line (auto-hide, on by default). Point at the line: the tabs, the sim speed and the scores open. Press key H twice: auto-hide goes off, then on again. Press key 3: Team 3 shows 1. Click an A/B/C button on any Ask the room: the tally shows 1. Press Reveal answer, then Hide. Press Reset scores twice: the first click reads "Click again to clear", the second clears the board. | [ ] |
| 3 | Printouts in the room | 30 cheat sheet sets (2 double-sided sheets each), 30 copies of `team-coding-standard.md`, this sheet, 6 sets of A, B and C cards. | [ ] |

No internet and no robot do not block the day. See Fallbacks.

## Prep tonight, in order

1. [ ] Send the homework link now. The claude.ai link opens for you alone: share the artifact first, or send the GitHub copy of `docs/course/homework.md`.
2. [ ] Print `cheatsheet.html` double sided, 4 pages = 2 sheets per student (30 sets, color if you have it: the diagrams use blue, green and red fills), `team-coding-standard.md` (30), this sheet (2), and 6 copies of `vote-cards.html` (3 pages: A, B, C).
3. [ ] Decide the 6 team names, or let teams name themselves in Module 0 (click a name in the scores to rename).
4. [ ] Test the projector (gate 1) and the header, scores and votes (gate 2) on the laptop you bring.
5. [ ] Tomorrow morning, not tonight: copy the final `lab/index.html` to the USB stick and to the projector laptop. Put a second copy on the stick from the git tag `crash-course-day`. The tag and GitHub (origin/main) still hold the lab of 2026-11-07: 11 Java cards, no Loops and arithmetic card, no Save PNG, Clear last run or PID only on new frames. Move both to the final lab first. In the repo, once `npm test` passes on the final commit, run `git tag -f crash-course-day HEAD`, `git push origin main` and `git push -f origin crash-course-day`. Then run `git show crash-course-day:lab/index.html > lab-fallback.html` and copy `lab-fallback.html` to the stick. Open it from disk once and check tab 1 shows 12 cards.
6. [ ] Put the old AI-written code on the projector laptop (a local folder or an editor tab) for the 2-minute show in Module 0. No internet needed.

Laptops, GitHub org, invites, robot config and the archive branch moved to the hands-on Follow-up Session. Nothing on that list blocks tomorrow.

## On the day

Times follow the plan's agenda (`crash-course-plan.md`).

| Elapsed | Checkpoint |
|---|---|
| Before start | Gates 1 and 2 rechecked. Scores at 0. Tab 2 open on the AI version for Module 0. |
| 0:10 | Module 0 done: teams named and seated together, each team holds its A, B, C cards. Practice vote on tab 2 revealed (C), then Reset scores twice. |
| 0:45 | Module 1, Java basics, done. Tab 1 has 12 cards: skip card 6, Loops and arithmetic, it belongs to the hands-on session. If behind, keep the Error clinic round. |
| 1:00 | Module 2, OpMode lifecycle, done. If behind, skip the second INIT on the AI version. |
| 1:20 | Module 3, GitHub, done. If behind, cut part 4 (two people, one line) and keep the laptop-dies vote. Break until 1:30. |
| 1:55 | Module 4, Drive modes, done. If behind, cut the AUTO demo and keep field-centric. |
| 2:25 | Module 5 done: tab 5 One loop, no sleep and tab 6 Closed loop: launcher. If behind, cut the 2-minute match and keep both votes. |
| 2:50 | Module 6, PID control, done. The final round starts on time, even if PID runs short. Cut the lift job first, then auto-aim. |
| 3:00 | Final round done, winner named. |

Scoring: Reveal answer pays one point to every team that voted right, so votes need no keys. One exception: the step 8 conflict vote on tab 3 has no Reveal. Press the number key of each team holding C. Word hunt, Spot the bug and predictions: press the team's number key (1 to 6) or click +. The final round doubles points: press the key twice.

Controls to remember:
- Ask the room: click the answer each team holds up, Team 1 first. Right-click takes the last vote back. Only Reveal answer opens the answer. The right answers are spread over A, B and C. Press Hide after the reveal, so the demo gets the full width.
- Header: auto-hide folds it to one thin line. Point at the line, or tap it, to open it. The pin at the right end of the tab row, or key H, turns auto-hide off and on.
- Reset scores: two clicks. The first click only arms the button.
- Sim speed: P pause, [ slower, ] faster, . step 0.1 s.

## Fallbacks (act within 5 minutes)

| Failure | Do this |
|---|---|
| Projector down | Gather the 6 teams around your laptop in two rows. Run the same modules with the browser zoom at 100%. |
| Laptop down | Open `lab/index.html` from the USB stick on any laptop in the room. Scores restart at 0, so write the old scores on the whiteboard. |
| No internet | Nothing on the day needs internet. The lab runs from disk and the fonts fall back to system fonts. |
| Lab file broken on the projector laptop | Copy it again from the USB stick. If the copy fails too, open `lab-fallback.html` from the stick: the `crash-course-day` version. If you skipped the tag move in prep step 5, this copy has 11 Java cards: from card 6 on, the plan's card numbers run one higher than the screen, and Save PNG, Clear last run and PID only on new frames are missing. If every copy fails, open the repo on GitHub from a phone hotspot, download `lab/index.html` (Download raw file), and open the download from disk. |
| Teams stop paying attention | Call a word hunt on the Every word explained card. First team to find the word on the projector scores. |

## Issues

Closed before the Crash Course: #3 tab numbers, #4 and #5 PID plan text, #6 PR checklist, #7 launcher overshoot.

Open, not needed for a go: #36 mentor checklist status, #43 fallback review, #8 where the lab lives after the Crash Course.
