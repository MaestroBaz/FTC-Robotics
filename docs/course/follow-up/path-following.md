# Follow-up Session: Path following with a waypoint list (2 hours 15 min, hands-on)

Audience: the students who passed the hands-on session and want to own AUTO. One robot, one practice field, laptops with the team repo. Path tuning needs robot time, and one robot gives about 6 to 10 students enough runs. With more students, split the room into a robot crew and a paper crew, and swap at the break. The paper crew writes waypoint lists and predictions for the next runs.

Goal: the robot drives a list of field points in one AUTO, passes through the middle points without stopping, stops on the last point, and every student explains each line of the new code. The team ends the session with a measured BIOBUZZ AUTO path and a table of results.

Format: the same four moves as the Crash Course, on the real robot. Ask the room, run on the robot, team round, read the code aloud. Predictions come before every run. The scoreboard keeps working: the lab top bar, keys 1 to 6.

Code follows `team-coding-standard.md` and the FTC SDK v12.0: one LinearOpMode, `Robot.java` for hardware, the team `PIDController`, one flat `teamcode` folder, no threads, no library.

## Entry gate

Do not schedule this session until all three gates pass on the real robot. Path following stacks every error from the layers below. A path on top of a bad encoder AUTO or a drifting pose fails, and the room learns nothing about paths.

| # | Gate | Test | Pass |
|---|---|---|---|
| 1 | Clean encoder AUTO (lab tab 8 session) | Run `LeaveAndPark` 5 times in a row: drive 24 in, then `turnToHeading(90)`. After the odometry merge, `turnToHeading()` calls `robot.updatePose()` first (`odometry.md`, Module 1). Press STOP mid-drive once. Watch the robot between INIT and START. | Every run stops within 1 in of the tape mark and within 2 deg of 90 deg. STOP halts the robot at once. No motion between INIT and START (G304.H). |
| 2 | Odometry within a stated error (odometry session, `odometry.md`) | Push the robot by hand along a tape line, 96 in forward and back. Then 48 in strafe left and back. Then 5 full turns by hand, back onto the start mark. Read X, Y and heading on telemetry. | Forward: X reads 96 in within 1 in, Y stays within 1 in. Strafe: Y reads 48 in within 1 in. Back on the start mark: X and Y within 1 in, heading within 2 deg. |
| 3 | Go-to-point lands (odometry session, `odometry.md`) | Drive to one point 36 in forward and 24 in left, heading 90 deg, 5 runs from the same start mark. | Every run ends within 1 in and 2 deg of the target, with no timeout. |

Why these numbers: [Guessing] 1 in per 96 in of travel is about 1%. A BIOBUZZ AUTO path covers about 100 in, so the pose error at the end stays near 1 in, small next to a tile (24 in). Tighten the numbers after the first session if the robot beats them. [Verify] the PARK zone size in the CM before you call 1 in good enough.

If gate 2 fails: check the pod offsets and the pod directions in `Robot.init()` first (SDK sample `SensorGoBildaPinpoint`). If gate 3 fails: tune go-to-point first. This session does not fix a go-to-point problem.

## The approach: a waypoint list on the go-to-point loop

The decision: a `List<Waypoint>` driven by the go-to-point loop from the odometry session. No Pedro Pathing, no Road Runner.

How the approach works, in four sentences for the room:
1. A waypoint is a field point (X, Y in inches) plus a heading and one yes or no: stop here, or pass through.
2. The robot drives to the first waypoint with the go-to-point loop.
3. At a pass-through waypoint the robot moves on as soon as the robot gets within a pass radius (4 in), at full speed, toward the next point.
4. At the last waypoint the robot slows down with the tuned drive PID, stops within 1 in, and holds the heading.

Why this approach and not a library:
- [Certain] The new code is one 15-line class (`Waypoint.java`) and one method of about 40 lines. Everything else exists already: the Pinpoint pose, `PIDController`, `driveFieldCentric()`. Every student explains every line, so rule 3 (merge only code you explain) holds.
- [Certain] The code uses only Java from the team standard: a small helper class, `List` and `ArrayList`, `for`, `if`, `ElapsedTime`, `final` constants. No interfaces, no builders, no command framework.
- [Likely] The BIOBUZZ AUTO needs straight moves. LEAVE (3 points) and PARK (5 points) need two moves and a turn. Driving to a launch spot for the 4 preloaded POLLEN adds one more stop. Straight lines between points cover all three.
- [Likely] When the path fails, telemetry names the waypoint and the distance left. A student finds the bad number in the list in one minute. A library failure points into code nobody on the team wrote.

What the approach does not do (the honest ceiling):
- Straight segments only. No curves. A gap between field elements needs an extra waypoint.
- The robot cuts each pass-through corner by about the pass radius, and swings wide at speed. The path shape changes with speed and battery voltage.
- No velocity planning. The robot runs at MAX_POWER between points and brakes with the tuned drive PID on the last one. A library plans speed along the whole path and runs faster for the same accuracy.
- Position and heading each use their own PID, tuned by hand.

When those limits cost points, read Module 6.

## Before the day (mentor checklist)

- [ ] All three gates pass. Write the gate results in the PR for the odometry session.
- [ ] `main` holds `Robot.java` with the Pinpoint methods below, `PIDController.java`, and a go-to-point AUTO. Deployed on the robot.
- [ ] Tape on the practice field: the start mark, a 24 in square from the start mark, and the BIOBUZZ PARK zone and launch spot for your alliance side.
- [ ] Fresh, charged batteries, at least 3. Write the voltage of each run in the results table.
- [ ] A tape measure, painter's tape, one cardboard box weighted with about 10 kg (books or a full battery box), the blocker for Module 4. Test once: the robot must not move the box. If the box slides, add weight.
- [ ] Print the results table at the end of this doc, one per pair.

What `Robot.java` holds after the odometry session (`odometry.md`, Module 1). [Verify] the merged code still uses these names. If the team renamed one, rename the method in this doc before the day, not on the day.

| Method | What the method does |
|---|---|
| `updatePose()` | Reads the Pinpoint. Call once per loop pass, before any pose or heading read |
| `getPose()` | Returns a `Pose2D`: `pose.getX(DistanceUnit.INCH)`, `pose.getY(DistanceUnit.INCH)` |
| `headingDegrees()` | The Pinpoint heading, + = turned left. The same heading the pose uses |
| `driveFieldCentric(forward, right, yaw)` | Field-centric drive, rotated by the Pinpoint heading |
| `resetPose()` | Back to 0, 0, 0. Robot standing still |
| `pinpointStatus()` | `READY` when the Pinpoint works |

One heading source (team rule from the odometry session): the pose, `headingDegrees()` and `driveFieldCentric()` all read the Pinpoint heading. The path never mixes two gyros.

Coordinates match lab tab 4 AUTO: the robot starts on the start mark facing away from the drivers, +X points away from the drivers, +Y points toward the left wall, heading 0 faces away from the drivers.

## Agenda

| Time | Module | Robot or paper | Output |
|---|---|---|---|
| 0:00-0:10 | 0. Gate replay and the plan | Robot | The room sees gate 3 pass once |
| 0:10-0:25 | 1. From one point to a list | Paper | Every pair reads `Waypoint.java` and the list |
| 0:25-0:55 | 2. Stop at every point | Robot | A square, 5 runs, results table filled |
| 0:55-1:05 | Break, swap crews | | |
| 1:05-1:35 | 3. Pass through the middle points | Robot | Time and corner error for 3 pass radii |
| 1:35-1:50 | 4. When the path goes wrong: timeout and STOP | Robot | Timeout seen, STOP mid-path works |
| 1:50-2:05 | 5. The BIOBUZZ AUTO path | Robot | A measured LEAVE + PARK path merged to main |
| 2:05-2:15 | 6. When a library pays off | Paper | The team knows the switch rule |

## Module 0: Gate replay and the plan (10 min)

- Run the gate 3 go-to-point once. Read the end error off telemetry. Say: "Today we chain this loop."
- Ask the room: "The robot drives to 4 points in a square and stops at each one. What takes the most time?" A the driving, B the slowing down and stopping, C reading the Pinpoint. Reveal after Module 2 with the stopwatch. Answer B [Likely]: the drive PID slows the robot near every point, and the heading has to settle too.
- Write the 3 rules on the board again. Rule 3 matters most today: the path code is new, and every line goes through review.

## Module 1: From one point to a list (15 min)

New file `Waypoint.java` in `teamcode`. A small helper class, allowed by the team standard.

```java
package org.firstinspires.ftc.teamcode;

// One point on the path. The robot drives to x, y and turns to heading.
public class Waypoint {
    public final double x;          // inches, + = away from the drivers
    public final double y;          // inches, + = toward the left wall
    public final double heading;    // degrees, 0 = facing away from the drivers, + = left
    public final boolean stopHere;  // true = stop on this point, false = pass through

    public Waypoint(double x, double y, double heading, boolean stopHere) {
        this.x = x;
        this.y = y;
        this.heading = heading;
        this.stopHere = stopHere;
    }
}
```

Teach:
- `final` fields: a waypoint never changes after `new`. Same idea as the tuned constants in `Robot.java`.
- The constructor: the method with the class name. `new Waypoint(24, 0, 0, true)` fills the 4 boxes.
- A `List<Waypoint>` holds the points in order: the `List<Type>` and `ArrayList` row of `team-coding-standard.md`.

Team round, paper: each pair writes the list for a 24 in square, starting and ending on the start mark, heading 0 the whole way. Compare lists. Common mistakes: Y sign flipped (left is +), the start point listed as the first waypoint (the robot sits there already).

## Module 2: Stop at every point (30 min)

New file `PracticePathSquare.java`. The `Practice` prefix means: never used in a match.

```java
package org.firstinspires.ftc.teamcode;

import com.qualcomm.robotcore.eventloop.opmode.Autonomous;
import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.util.ElapsedTime;
import com.qualcomm.robotcore.util.Range;

import org.firstinspires.ftc.robotcore.external.navigation.AngleUnit;
import org.firstinspires.ftc.robotcore.external.navigation.DistanceUnit;
import org.firstinspires.ftc.robotcore.external.navigation.Pose2D;

import java.util.ArrayList;
import java.util.List;

@Autonomous(name = "Practice Path Square", group = "Practice")
public class PracticePathSquare extends LinearOpMode {

    // Tune these on the real robot.
    private static final double MAX_POWER = 0.7;          // top drive power between points
    private static final double PASS_RADIUS = 4.0;        // inches: close enough to move on
    private static final double STOP_RADIUS = 1.0;        // inches: close enough to stop
    private static final double HEADING_TOLERANCE = 2.0;  // degrees
    private static final double SETTLE_TIME = 0.25;       // seconds inside the stop window before we stop
    private static final double WAYPOINT_TIMEOUT = 3.0;   // seconds per waypoint, then move on

    private final Robot robot = new Robot();
    private final PIDController drivePID = new PIDController(0.05, 0, 0.005);    // copy the tuned gains from LeaveAndParkPinpoint
    private final PIDController headingPID = new PIDController(0.02, 0, 0.002);  // copy from LeaveAndParkPinpoint
    private final ElapsedTime waypointTimer = new ElapsedTime();
    private final ElapsedTime windowTimer = new ElapsedTime();
    private final ElapsedTime pathTimer = new ElapsedTime();
    private int timeouts = 0;

    @Override
    public void runOpMode() {
        robot.init(hardwareMap);

        // The path, in order. The robot starts on (0, 0), heading 0.
        List<Waypoint> path = new ArrayList<>();
        path.add(new Waypoint(24, 0, 0, true));
        path.add(new Waypoint(24, 24, 0, true));
        path.add(new Waypoint(0, 24, 0, true));
        path.add(new Waypoint(0, 0, 0, true));

        telemetry.addLine("Ready. Robot does not move until START.");
        telemetry.update();
        waitForStart();
        pathTimer.reset();

        for (int i = 0; i < path.size() && opModeIsActive(); i++) {
            driveTo(path.get(i), i + 1);
        }
        robot.stopDrive();

        // Keep the results on the Driver Hub until STOP, so we read them off the screen.
        double pathSeconds = pathTimer.seconds();
        while (opModeIsActive()) {
            robot.updatePose();
            Pose2D pose = robot.getPose();
            telemetry.addData("Path time", "%.1f s", pathSeconds);
            telemetry.addData("Timeouts", timeouts);
            telemetry.addData("End X", "%.1f in", pose.getX(DistanceUnit.INCH));
            telemetry.addData("End Y", "%.1f in", pose.getY(DistanceUnit.INCH));
            telemetry.addData("End heading", "%.1f deg", robot.headingDegrees());
            telemetry.update();
        }
    }

    // Drive to one waypoint. Returns when close enough, after the timeout, or at STOP.
    private void driveTo(Waypoint wp, int number) {
        drivePID.reset();
        headingPID.reset();
        waypointTimer.reset();
        windowTimer.reset();
        while (opModeIsActive()) {
            robot.updatePose();                                   // read the Pinpoint once per pass
            Pose2D pose = robot.getPose();
            double errX = wp.x - pose.getX(DistanceUnit.INCH);    // away from the drivers
            double errY = wp.y - pose.getY(DistanceUnit.INCH);    // toward the left wall
            double distance = Math.hypot(errX, errY);             // inches left to go
            double headingError = AngleUnit.normalizeDegrees(wp.heading - robot.headingDegrees());

            // Close enough? A stop point needs position AND heading for SETTLE_TIME in a row.
            // A pass point needs position only.
            boolean closeEnough;
            if (wp.stopHere) {
                boolean inWindow = distance < STOP_RADIUS
                        && Math.abs(headingError) < HEADING_TOLERANCE;
                if (!inWindow) {
                    windowTimer.reset();                          // outside: start the count again
                }
                closeEnough = inWindow && windowTimer.seconds() > SETTLE_TIME;
            } else {
                closeEnough = distance < PASS_RADIUS;
            }
            if (closeEnough) {
                break;
            }
            if (waypointTimer.seconds() > WAYPOINT_TIMEOUT) {
                timeouts = timeouts + 1;                          // stuck: give up on this point
                break;
            }

            // How hard to drive. Pass point: full speed. Stop point: the drive PID slows down near the end.
            double power = MAX_POWER;
            if (wp.stopHere) {
                power = Range.clip(drivePID.update(distance), 0, MAX_POWER);
            }

            // Which way to drive. errX / distance and errY / distance give the direction.
            double forward = 0;
            double right = 0;
            if (distance > 0.1) {                                 // on the point: no direction, no divide by zero
                forward = errX / distance * power;
                right = -errY / distance * power;                 // +Y is left, so flip the sign
            }
            double turn = Range.clip(headingPID.update(headingError), -0.5, 0.5);
            robot.driveFieldCentric(forward, right, -turn);       // + turn power turns left, so flip the sign

            telemetry.addData("Waypoint", number);
            telemetry.addData("Distance left", "%.1f in", distance);
            telemetry.addData("Heading error", "%.1f deg", headingError);
            telemetry.update();
        }
        if (wp.stopHere) {
            robot.stopDrive();
        }
    }
}
```

Read aloud, in this order:
1. The list in `runOpMode()`: the path is data. Changing the path means changing numbers, not code.
2. The `for` loop: one waypoint after another. `opModeIsActive()` in the condition: STOP ends the path.
3. `driveTo()`: the same go-to-point math as lab tab 4 AUTO, with two changes. The power comes from one place, and the loop has two exits: close enough, or the timeout. A stop point needs the same "on target AND stopped" window as `goToPoint()` in `odometry.md`: the robot passes through the 1 in circle at speed, so the window timer waits `SETTLE_TIME` before the stop.
4. A blocking `while` inside AUTO is fine: no driver steers in AUTO, and `opModeIsActive()` keeps STOP working. The same rule as `driveInches()` in the encoder session.

First run: all 4 waypoints stop (`true`). Before the first run, teams predict where the robot ends: A on the start mark within 1 in, B within 3 in, C more than 3 in off. Run 5 times. Fill the results table for each run. Then reveal the Module 0 vote with the path time.

Check the end heading against the tape: the robot faces away from the drivers within 2 deg. The heading, the pose and the drive rotation all come from the Pinpoint (one heading source), so a heading error here is a Pinpoint error. Rerun the gate 2 spin test before you blame the path code.

Team rounds:
- Prediction: end error after the square (1 point).
- Spot the bug, board: write `right = errY / distance * power` without the minus. Teams hold up A drives the square, B drives a mirror square to the right, C a compile error. Answer B.

## Module 3: Pass through the middle points (30 min)

Change the first 3 waypoints to `false`. Leave the last one `true`.

```java
path.add(new Waypoint(24, 0, 0, false));
path.add(new Waypoint(24, 24, 0, false));
path.add(new Waypoint(0, 24, 0, false));
path.add(new Waypoint(0, 0, 0, true));
```

Before the run, teams predict the corners: A the robot drives the square, B the robot cuts each corner, C the robot stops at each corner. Answer B. At 4 in from a corner the code switches to the next point, and the robot turns toward the next point at full speed.

Run 3 pass radii, 2 runs each: PASS_RADIUS 2, 4 and 8 in. Change the one constant, rebuild, deploy. For each run write the path time, the end error, and the worst corner cut (tape a ruler at the first corner, or film from above and read the frame).

What the table shows the room:
- [Guessing] Pass-through cuts the path time by about a third against Module 2. The robot never slows down at the middle points.
- A bigger radius gives a smoother, faster path and a bigger corner cut.
- Too small a radius at full speed: the robot overshoots the point, swings back, and the path wobbles. Same lesson as "P too high" on lab tab 7.
- The end error stays the same: only the last point stops.

Rule for the team: the pass radius is a tradeoff between time and accuracy. Pick the radius from the table, not from a guess. Commit the number with a message saying what you measured.

Team rounds:
- Prediction: corners (1 point).
- Prediction before PASS_RADIUS 8: path time A shorter, B the same, C longer (1 point).

## Module 4: When the path goes wrong: timeout and STOP (15 min)

- Put the weighted box on waypoint 2. Before the run, teams predict: A the robot pushes the box forever, B the robot gives up on waypoint 2 after 3 s and drives on, C the OpMode crashes. Answer B. Read "Timeouts: 1" on the Driver Hub.
- Ask the room why the timeout matters in a match: AUTO lasts 30 s. A robot stuck on one point for 30 s scores nothing. A robot giving up after 3 s still reaches PARK.
- Ask the room what the timeout costs: after a timeout the robot drives on from the wrong spot. The next segment starts off the path. For a match, pick the timeout from the slowest clean run in the table plus 1 s.
- Press STOP mid-path on one run. The robot halts: `opModeIsActive()` sits in both loops. Point at both lines.
- Remove the box. Let the path finish, so the OpMode sits in the results loop with the motors stopped. Never grab a driving robot. The mentor lifts the robot, moves the robot 6 in to the side and sets the robot down. Read End X and End Y: the pose did not move. The pods left the floor, so the Pinpoint never saw the 6 in. Lesson: odometry tracks only while the pods touch the floor. A hit from another robot does the same.

Team round:
- Prediction: box on waypoint 2 (1 point).

## Module 5: The BIOBUZZ AUTO path (15 min)

Copy `PracticePathSquare.java` to `PathAuto.java`. Change the annotation:

```java
@Autonomous(name = "Path Auto", group = "Competition", preselectTeleOp = "Main TeleOp")
```

Measure on the practice field with the tape: the start tile, the launch spot, the PARK zone. Write each point in inches from the start mark. Example shape (the numbers are placeholders, measure your own):

```java
path.add(new Waypoint(20, 0, 0, false));     // off the start tile. LEAVE counts where the robot ends AUTO (Q&A 21)
path.add(new Waypoint(30, 18, 45, true));    // waypoint 2: launch spot, facing the HIVE
path.add(new Waypoint(10, 40, 90, true));    // PARK
```

The list holds only points. The launch goes in the for loop, after the robot stops on the launch spot:

```java
for (int i = 0; i < path.size() && opModeIsActive(); i++) {
    driveTo(path.get(i), i + 1);
    if (i == 1) {
        launchPreloads();   // blocking: launcher state machine, opModeIsActive() and a timeout
    }
}
```

[Verify] the LEAVE and PARK definitions and the PARK zone position in CM Section 10 before you pick the points. The PARK point must leave the robot touching no wall, or LEAVE is lost. [Verify] whether the field mirrors between the red and blue alliance. If the field mirrors, the other alliance path flips the sign of every Y and every heading.

Run the path 5 times. The path passes when all 5 runs park and the slowest run finishes under 25 s, which leaves 5 s of margin in the 30 s AUTO. Open a PR with the results table in the description. A reviewer asks the author to explain 2 lines, as always.

Team round:
- Prediction before the first run: A parks, B stops short of the zone, C times out on the launch spot (1 point).

## Module 6: When a library pays off (10 min)

Pedro Pathing and Road Runner plan the whole path ahead: curves, top speed, and braking along the path. The waypoint list plans nothing. The libraries win when time in AUTO is the bottleneck.

What the libraries are today (checked 2026-11-08 against the project docs and the quickstart repos):

| Fact | Pedro Pathing | Road Runner |
|---|---|---|
| Current version | [Certain] Pedro 3, a full rewrite. The Quickstart pins `com.pedropathing:revhub:3.0.2` and `com.pedropathing:tuning:1.0.3` | [Certain] 1.0.x. The quickstart pins `core:1.0.1` and `actions:1.0.1`. Not backwards compatible with 0.5.x |
| SDK in the quickstart | [Certain] FTC SDK 12.0.0, last commit 2026-10-30 | [Certain] FTC SDK 11.0.0, last commit 2025-10-31. [Verify] the quickstart builds on our v12.0 project before you pick Road Runner |
| Pinpoint support | [Certain] Pinpoint listed as a localizer, with OTOS, OctoQuad and dead wheels | [Certain] `PinpointLocalizer.java` in the quickstart, tuned like two dead wheels |
| Tuning | [Certain] Three steps (drivetrain, localization, Foresight) through AutoTune, a web page hosted on the robot | [Certain] About 9 tuning OpModes in order (ForwardPushTest, ramp loggers, ManualFeedforwardTuner, ManualFeedbackTuner, SplineTest). Many steps need FTC Dashboard |
| How an AUTO looks | [Certain] An iterative `OpMode` (`init()`, `start()`, `loop()`), not a LinearOpMode. The docs example schedules paths with Ivy commands and recommends a command framework over a manual state machine | [Certain] Each step is an `Action`. Custom steps are classes implementing the `Action` interface, chained with `SequentialAction` and started with `Actions.runBlocking()` |
| Files in TeamCode | [Certain] A `pedro` subfolder with `Constants.java` and `Tuning.java` | [Certain] `MecanumDrive.java` (497 lines), a `Localizer` interface with 4 implementations, `tuning` and `messages` subfolders |

What a library costs the students:
- The team standard. [Certain] Pedro's recommended style is a command framework, and Road Runner's is an interface (`Action`). Both sit on the "avoid until a mentor approves a design" list. Both add a subfolder to the flat `teamcode` folder.
- Rule 3. Students explain their own OpMode and the path numbers, not the follower inside the library. Treat the library like the SDK: a black box with a contract. The team needs two students who explain the tuning numbers at judging (the Control Award asks how the sensors and software solve the game).
- Robot time. [Guessing] 2 to 4 robot sessions to tune either library on a new drivetrain, longer if a pod or the drivetrain changes after tuning. Every hardware change means a partial retune.
- Event rules. R704.D names FTC Dashboard and FTControl Panels with no match-only limit: both stay off at the whole venue, pits and practice fields included (season reference, section 2, [Likely] on the Dashboard reading). Road Runner tuning uses FTC Dashboard, so the team tunes at school and never at an event. [Verify] whether the Pedro AutoTune page, served over the robot Wi-Fi, falls under R704 the same way.
- Help on the internet. [Likely] Most examples online and most AI answers show Pedro 1 or 2 and Road Runner 0.5. Copied code fails to build against Pedro 3 or Road Runner 1.0, and a beginner does not know why. [Verify] whether Pedro 3 keeps a `followPath()` and `isBusy()` style for a plain state machine without Ivy: the path-following page names direct use of the Follower and gives no example.

The switch rule. Move to a library only when all four hold:
1. The waypoint AUTO passes Module 5 every run, so the team knows the robot, the pose and the field.
2. The AUTO plan needs more than the waypoint list gives: the slowest clean run takes more than 25 s, or the path needs curves around field elements (for example a second trip for POLLEN in AUTO).
3. Two students volunteer to own the library: install, tuning, and the judging answer.
4. At least 3 weeks of robot time before the next event, and a mentor approves the design (team standard).

If one fails, keep the waypoint list. A reliable 8-point AUTO beats a fast AUTO failing 1 match in 3.

Pick between the two when the rule passes: [Likely] Pedro 3, since the quickstart already targets SDK 12.0 and Pinpoint, and the tuning runs on the robot without FTC Dashboard. Check the [Verify] items above first.

Team round:
- Vote: "Our AUTO parks every run in 14 s. Do we switch to Pedro Pathing?" A yes, faster is better, B no, the plan fits in 30 s with margin, C yes, judges like libraries. Answer B (1 point per right team).

## Results table (print one per pair)

| Run | Module | Pass radius (in) | Battery (V) | Path time (s) | End X error (in) | End Y error (in) | End heading error (deg) | Timeouts | Notes |
|---|---|---|---|---|---|---|---|---|---|
| 1 | | | | | | | | | |
| 2 | | | | | | | | | |
| 3 | | | | | | | | | |
| 4 | | | | | | | | | |
| 5 | | | | | | | | | |

## When the path fails: check in this order

1. Robot drives a mirror path to the right: the sign of `right` in `driveTo()`. Compare with lab tab 4.
2. Robot stops 1 to 2 in short of the last point and times out: with kI at 0 the drive PID stalls near the target (lab tab 7, P only). Raise drivePID kI, as in odometry.md Module 3.
3. Robot ends in the right spot on the first run and drifts on later runs: the Pinpoint resets at INIT. Put the robot on the start mark before INIT, not after.
4. Path bends more each run: `Robot.java` mixes two headings. `headingDegrees()` or `driveFieldCentric()` still reads the Control Hub IMU. Both read the Pinpoint (`odometry.md`, Module 1).
5. Robot wobbles at a pass point: the pass radius sits too small for the speed. Raise PASS_RADIUS or lower MAX_POWER.

## Sources (checked 2026-11-08)

- SDK sample `SensorGoBildaPinpoint` in FtcRobotController v12.0: https://github.com/FIRST-Tech-Challenge/FtcRobotController
- Pedro Pathing docs (Pedro 3, prerequisites, installation, tuning, path following): https://pedropathing.com/docs/pathing
- Pedro Pathing Quickstart, `build.dependencies.gradle`: https://github.com/Pedro-Pathing/Quickstart
- Road Runner 1.0 docs (installation, tuning, actions): https://rr.brott.dev/docs/v1-0/installation/
- Road Runner quickstart, `TeamCode/build.gradle` and `build.dependencies.gradle`: https://github.com/acmerobotics/road-runner-quickstart
- Season rules and the AUTO points: `docs/course/ftc-reference-2026-27.md`
