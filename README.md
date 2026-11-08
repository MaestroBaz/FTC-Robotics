# FTC Java Crash Course

A 3-hour, demo-driven crash course for an FTC team of about 30 students (REV hardware, Java, Android Studio, BIOBUZZ 2026-27, FTC SDK v12.0), built around an interactive lab for the projector.

## Open the lab

Open `lab/index.html` in a browser. No install, no server. The lab opens on Java. Tabs:

1. Java basics
2. OpMode lifecycle
3. GitHub teamwork
4. Drive modes (robot-centric, field-centric, AUTO)
5. One loop, no sleep
6. Feedback: launcher
7. PID control (turn, auto-aim, lift)
8. Encoders in auto

The bar under the tabs sets the sim speed from 0.05x to 2x, pauses, and steps. Keys: P pause, [ slower, ] faster, . step.

## Course material

- `docs/course/crash-course-plan.md`: the session plan, module by module
- `docs/course/homework.md`: homework for the night before
- `docs/course/team-coding-standard.md`: the handout, print one per student
- `docs/course/github-team-workflow.md`: GitHub org, repos, PR template, drills
- `docs/course/ftc-reference-2026-27.md`: season rules, hardware, SDK, sensors

## Develop

```
npm install
npx playwright install chromium
npm run check    # syntax and ASCII check
npm test         # Playwright smoke test, screenshots in tests/shots/
```

See `CLAUDE.md` and `docs/architecture.md`.
