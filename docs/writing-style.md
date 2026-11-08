# Writing style

Two audiences, two sets of rules.

## Lab copy and student handouts

Readers: high-school students with basic Java, on a projector from the back of the room.

- Short sentences, active voice, "you".
- One idea per sentence. One instruction per button label.
- Name the real term, then say what it means in plain words ("Settling time: from the start until it enters the green band and stays there").
- Plain ASCII only. Use "-" for hyphens and straight quotes. No em dashes, en dashes, smart quotes or emoji. `npm run check` enforces ASCII in `lab/index.html`.
- Code shown to students follows `course/team-coding-standard.md` and the FTC SDK v12.0. Comments in code are for a beginner.
- Match game terms to the manual: HIVE, POLLEN, NECTAR, CELL, FLOWER, LEAVE, PARK.

## Replies and docs for Baz

Based on Deirdre McCloskey's Economical Writing: clear, direct, simple, concise, active voice, reader-focused, practical, actionable.

- Use "you" and "your". Short sentences. Bullet lists are fine.
- Plain ASCII, "-" for hyphens, " for quotes.
- No em dashes, en dashes, smart quotes, semicolons, markdown asterisks, hashtags, setup phrases, warnings, notes, extra adjectives or adverbs, metaphors, cliches, generalizations, or passive voice.
- Banned words: can, may, just, that, very, really, literally, actually, certainly, probably, basically, could, maybe, delve, embark, enlightening, esteemed, shed light, craft, imagine, realm, game-changer, unlock, discover, skyrocket, abyss, not alone, revolutionize, disruptive, utilize, utilizing, dive deep, tapestry, illuminate, unveil, pivotal, intricate, elucidate, hence, furthermore, however, harness, exciting, groundbreaking, cutting-edge, remarkable, it.
- For analysis, strategy and technical tradeoffs: act as a sparring partner. Challenge assumptions, name weaknesses, offer alternatives, put truth over agreement.
- Reply rules (also in `CLAUDE.md`): open with a challenge, tag confidence [Certain] / [Likely] / [Guessing], structured disagreement, uncomfortable truth first, no warm-up, hold the position under pushback.

## Day-of docs: match the lab word for word

Rules set on 2026-11-08, when the day-of docs were checked against the final lab:

- Name a tab with its number and its exact lab title: 5 One loop, no sleep, 6 Closed loop: launcher, 8 Encoders (later).
- Every Ask the room question in the plan names its right answer letter, read from `data-right` in the lab (0 = A, 1 = B, 2 = C).
- Say the rule and the team rule apart: G304.H means "fully motionless following completion of OpMode initialization". The team rule adds no movement during INIT.
- Name lab controls with their on-screen labels: Reveal answer, Hide, Reset scores (two clicks: "Click again to clear"), Save PNG, Clear last run, the pin and key H for auto-hide.
- Content for the hands-on session (the Loops and arithmetic card) says so wherever a day-of doc names it.

Changes made on 2026-11-08:

- `cheatsheet.html`: Robot.java box adds the feeder field and launcherOff(), feederOn(), feederOff(), stopDrive(). The launcher state machine matches tab 5 code B (state actions, rightBumperWasPressed(), feedTimer.reset(), feederOff()), the cancel arc is gone. The INIT timeline labels G304.H and the stricter team rule apart. Tuning steps run kF first on a lift, then kP, then kD. PID diagram and response labels moved off the lines.
- `crash-course-plan.md`: right answer letter for every Ask the room vote, exact tab titles, card 6 marked for the hands-on session, Save PNG and the tab 4 chart, the folded header, Reveal-only answers, Hide, two-click Reset scores, cheat sheet print, the `crash-course-day` tag.
- `run-sheet.md`: zoom 125%, not more (as the plan says). Gate 2 checks the folded header, key H, Reveal, Hide and the two-click Reset scores. Checkpoints follow the agenda, Module 0 to the final round. Votes score from Reveal, not from keys. Prep step 5 and the fallback table add the `crash-course-day` copy.
- `homework.md`: the GitHub account is for the hands-on session, tomorrow shows a conflict on the projector (nobody fixes one), tab 6 and 7 titles.
- `team-coding-standard.md`: `feeder` in the config names, the PR checklist line reads clean.
- `github-team-workflow.md`: Module 3 lists both Ask the room votes with their answers and Leo's push in Part 1.
- `vote-cards.html`: the caption prints on every card, not only the first.
