# Backlog

## Before the session

- [ ] Run the lab on the real projector laptop at 125-150% zoom. Check code panels read from the back row.
- [ ] Check every [Verify] item in `course/ftc-reference-2026-27.md` against the Competition Manual (R704 wording, AprilTag ID map, Through Bore encoder reading, FIRST AI blog status).
- [ ] Decide the length: the plan header says 5 hours, the goal was 4-5. The plan lists what to cut for 4 hours (Module 7 down to turn and aim demos).
- [ ] Test `virtual_robot` on one laptop before recommending it as homework.
- [ ] If the projector laptop has no internet, the Google Fonts fall back to system fonts. Check the layout with the fallbacks.

## Lab: known quirks

- The closed-loop launcher overshoots to about 1300 ticks/s after rapid shots during spin-up. Cause: the sim's integral (clamped at +/-400) winds up. Realistic, but an I-zone in the FB model would match the PID tab's lesson.
- The D term on auto-aim spikes. The camera updates at 30 fps and the loop runs at 50 Hz, so the error jumps on some passes and holds on others, and the +/-0.8 deg noise adds more. Real-world behavior. Option: a toggle for a filtered derivative, or a line in the tuning panel.
- "P only" on aim overshoots about 48%. Fine as the case for adding D, but a big number. Revisit if students read it as broken.
- Labels on the launcher chart ("HIVE window", open-loop offset) sometimes sit on top of a curve.
- PID markers cover the latest move in view only. A move cut by the next target shows partial values.
- `metrics()` and `S.m.over` / `S.m.settledAt` in PIDLAB are left over from the old chips and no longer shown. Safe to delete.
- Banner comments in the script use the old lab numbering. Rename to match the tabs.
- Modules are not exposed on `window`, so tests read the DOM. A `window.__lab = {PIDLAB, FB}` hook would allow direct state checks.

## Lab: ideas

- Markers for the lift job with gravity feedforward on vs off side by side.
- A "compare runs" overlay: keep the last run as a faint line when you change a preset.
- Export a chart as PNG for the Control Award portfolio.
- Mecanum tab: show wheel power bars on a chart over time with the same TimeChart.
- Tab 8 (encoders) is a follow-up session: add the `turnToHeading()` exercise visual there.

## Follow-up sessions (from the plan)

1. Vision: VisionPortal + AprilTag targeting of the HIVE (v12.0 clusters).
2. Odometry with goBILDA Pinpoint, then AUTO go-to-point.
3. Control Award portfolio page.
4. Path following only after a clean encoder auto.

## Publishing

- [ ] Decide where the lab lives long term: the claude.ai artifact, GitHub Pages, or both. If both, publish from this repo only, so the two never drift.
- [ ] After any lab change, republish and update the version id in `CLAUDE.md`.
- [ ] After any course doc change, sync the copy in the claude.ai Project (`claude/*.md`) or stop syncing and point the Project at this repo.
