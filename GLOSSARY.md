# FTC Crash Course

Language for the course this repo supports: one teaching event for an FTC team, and the sessions planned after it.

## Language

**Crash Course**:
The one-day teaching event of 3 hours for about 30 students, run as a team game on a projector with no student laptops and no robot.
_Avoid_: session, the day

**Team**:
About 5 students who vote and score together during the Crash Course. Six teams on the day.
_Avoid_: group, table

**Team Round**:
One scored moment in a module: a vote before a demo, a word hunt, or a spot-the-bug pick.
_Avoid_: exercise, quiz

**Follow-up Session**:
A later teaching event on a topic cut from the Crash Course, such as vision or odometry.
_Avoid_: session, next session

**Run Sheet**:
The one printable page a mentor uses to decide go or no-go for the Crash Course and to handle failures on the day.
_Avoid_: checklist, plan

**No-go Gate**:
A condition that blocks the Crash Course when unmet. A failure with a workable fallback is not a gate.
_Avoid_: blocker, requirement

**PIDF**:
The velocity loop the REV hub firmware runs for setVelocity(): P, I and D as in PID, plus F, a feedforward term sized for the target itself before any error exists. For a position job the F is a constant (a lift holding against gravity) or depends on the angle (an arm), and the team adds it in the OpMode, outside PIDController.
_Avoid_: PID with F, feed-forward PID
