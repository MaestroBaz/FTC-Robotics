# Follow-up session: odometry with goBILDA Pinpoint, then AUTO go-to-point (2 hours, hands-on)

Audience: the same 6 teams from the Crash Course, with laptops and one robot. Students type code in pairs, commit, and open a pull request. The mentor deploys one merged `main` per piece. Goal: by the end, the robot drives LEAVE and PARK from Pinpoint positions, and every pair explains each line of `goToPoint()`.

Before this session: the hands-on session (clone, build, pull request) and the encoders session (lab tab 8) are done. `Robot.java`, `PIDController.java` and `LeaveAndPark.java` are on `main`.

Lab tie-ins:
- Tab 4 Drive modes, AUTO card: the same go-to-point loop, on a 144 in field, drivers at the bottom.
- Tab 7 PID control, turn job: the same `PIDController` class and the same "on target AND stopped" exit.
- Tab 8 Encoders, the "When AUTO misses" ladder: odometry is step 4. Pinpoint pods roll on the floor, so wheel slip does not fool them.

Confidence tags: [Verify] marks a fact nobody has checked on our robot or in a primary source yet. Check each one before the session. Everything about the driver API below comes from the SDK v12.0 sources: the sample `SensorGoBildaPinpoint.java` and the class `com.qualcomm.hardware.gobilda.GoBildaPinpointDriver` in `Hardware-12.0.0-sources.jar`.

## The coordinate system (same as the lab, tab 4 AUTO card)

```
              far wall
   +---------------------------+
   |            +X             |
   |             ^             |
   | LEFT   +Y <-o  robot      | RIGHT
   | WALL        start, front  | WALL
   |             faces +X      |
   +---------------------------+
               DRIVERS
```

- Origin: the robot's start spot. Inches.
- +X: away from the drivers. +Y: toward the left wall.
- Heading: 0 deg = front away from the drivers. Turning left (counterclockwise) makes the heading go up. Range -180 to 180.
- The robot starts with the front away from the drivers, and `resetPosAndIMU()` runs in INIT. So the Pinpoint frame and the lab frame match.

Why the frame matches: the driver docs say the X (forward) pod reads up when the robot moves forward, and the Y (strafe) pod reads up when the robot moves left. At reset, robot forward = field +X and robot left = field +Y. [Certain] from the javadoc in the driver source.

Heading up on a left turn: [Verify] on the robot in Module 2 (the driver javadoc does not state the sign).

Not used today: the official FTC field coordinates (origin at the field center, axes set per season). [Verify] the BIOBUZZ axes in the game manual before the team moves to field coordinates with `setPosition()`.

## The Pinpoint driver in SDK v12.0, the facts we use

| What | Code | Source |
|---|---|---|
| Class | `com.qualcomm.hardware.gobilda.GoBildaPinpointDriver` | v12.0 sources, in the SDK since 10.3, Pinpoint v2 support in 11.1 |
| Get the device | `hardwareMap.get(GoBildaPinpointDriver.class, "pinpoint")` | sample |
| Config type on the Driver Hub | "goBILDA Pinpoint Odometry Computer", an I2C device (xml tag `goBILDAPinpoint`) | driver `@DeviceProperties` |
| Pod offsets | `setOffsets(xOffset, yOffset, DistanceUnit.MM)`. X offset: how far left (+) or right (-) of center the X (forward) pod sits. Y offset: how far forward (+) or back (-) of center the Y (strafe) pod sits | driver javadoc |
| Pod type | `setEncoderResolution(GoBildaPinpointDriver.GoBildaOdometryPods.goBILDA_4_BAR_POD)` (19.89 ticks/mm) or `goBILDA_SWINGARM_POD` (13.26 ticks/mm) | driver constants |
| Pod directions | `setEncoderDirections(EncoderDirection.FORWARD or REVERSED, same for Y)`. X pod must count up going forward, Y pod up going left | driver javadoc |
| Zero and calibrate | `resetPosAndIMU()`: pose to 0, 0, 0 and gyro calibration, about 0.25 s, robot must stand still | driver javadoc |
| Read | `update()` once per loop pass. Every getter returns the values from the last `update()` | driver javadoc |
| Pose | `getPosition()` returns a `Pose2D` (`org.firstinspires.ftc.robotcore.external.navigation.Pose2D`) | driver |
| Units | `pose.getX(DistanceUnit.INCH)`, `pose.getY(DistanceUnit.INCH)`, `pose.getHeading(AngleUnit.DEGREES)`. Heading comes back normalized to -180..180 | `Pose2D` source |
| Status | `getDeviceStatus()`: `READY` (green LED), `NOT_READY` and `CALIBRATING` (red), `FAULT_NO_PODS_DETECTED` (purple), `FAULT_X_POD_NOT_DETECTED` (blue), `FAULT_Y_POD_NOT_DETECTED` (orange), `FAULT_IMU_RUNAWAY`, `FAULT_BAD_READ` | driver javadoc |

Sample offsets in the SDK sample: `setOffsets(-84.0, -168.0, DistanceUnit.MM)`, tuned for a goBILDA kit robot. Our robot needs its own numbers.

## Before the day (mentor checklist)

- [ ] [Verify] the team owns one Pinpoint and two odometry pods, and which pod type (4-bar or swingarm).
- [ ] Pods mounted: one X pod rolling forward-back, one Y pod rolling left-right, both pressing on the floor. [Verify] goBILDA's mounting guide for spring preload.
- [ ] Pinpoint wired to a Control Hub I2C port and both pods plugged into the Pinpoint. [Verify] which I2C bus goBILDA recommends (the Control Hub IMU sits on bus 0).
- [ ] Robot config on the Driver Hub: add "goBILDA Pinpoint Odometry Computer" on that I2C bus, named `pinpoint`. Save and restart. Do this before anyone merges the Robot.java change: `robot.init()` runs in MainTeleOp too, and a missing `pinpoint` entry stops MainTeleOp at INIT.
- [ ] Pinpoint LED turns green after power-up.
- [ ] Measure the pod offsets in mm from the robot center (Module 1 uses them). Write them on a card.
- [ ] Tape on the floor: a start box, a line 48 in long away from the drivers, a line 24 in long toward the left wall. A tape measure at the robot station.
- [ ] Lab open on the projector at tab 4, AUTO mode. A, B and C cards for each team.
- [ ] Practice branch: `PracticePinpoint.java` from Module 2 already deployed, so the opener demo runs on the real robot.

## Agenda

| Time | Module | Output |
|---|---|---|
| 0:00-0:10 | 0. Opener: where is the robot? | Teams read X, Y and heading in the lab and on the robot |
| 0:10-0:30 | 1. Pinpoint in Robot.java | One PR: Pinpoint setup and pose methods |
| 0:30-0:55 | 2. Check the signs and the offsets | Pinpoint passes the tape test and the spin test |
| 0:55-1:05 | Break | |
| 1:05-1:40 | 3. goToPoint(): distance, heading, stop window | Robot drives to one point and stops inside the window |
| 1:40-1:55 | 4. LEAVE and PARK from two points | `LeaveAndParkPinpoint` works 5 runs in a row |
| 1:55-2:00 | Wrap | PRs merged, numbers committed, next session named |

## Module 0: Opener, where is the robot? (10 min)

Demo first (4 min). Lab tab 4, pick "AUTO: go to point". Click a point near the top right. The robot drives a nearly straight line to the point. Click a point in the far corner and tick "Turn to 90 deg while driving" while the robot still moves: the path stays straight while the robot turns. Read the code panel under the field out loud: error to the point, times a gain, capped, then field-centric drive. Say: "Today the pose in line 2 comes from a real sensor."

Then the real robot (2 min). The mentor runs `PracticePinpoint` and pushes the robot 24 in along the tape, away from the drivers. A student reads X out loud from the Driver Hub.

Vote 1 (2 min): the robot starts facing away from the drivers. Pinpoint reads X = 24, Y = 0. Where is the robot?
- A: 24 in to the right of the start
- B: 24 in away from the drivers
- C: 24 in toward the left wall

Answer B. +X points away from the drivers.

Vote 2 (2 min): the robot starts at 0, 0, heading 0. You turn the robot 90 deg left by hand, then push the robot 10 in toward its own front. What does Pinpoint show?
- A: X goes up by 10
- B: Y goes up by 10
- C: nothing changes, Pinpoint counts in the robot's own directions

Answer B. Pinpoint fuses the pods with its own IMU and reports positions in the start frame, not in the robot's frame. The front now points at the left wall, so Y grows. This is why AUTO needs field-centric drive: the error comes in field directions, the wheels need robot directions.

Check for done: every team says which way +X and +Y point without looking at the board.

## Module 1: Pinpoint in Robot.java (20 min)

Pairs type this into `Robot.java`. One pair opens the PR, another pair reviews.

New imports at the top:

```java
import com.qualcomm.hardware.gobilda.GoBildaPinpointDriver;

import org.firstinspires.ftc.robotcore.external.navigation.DistanceUnit;
import org.firstinspires.ftc.robotcore.external.navigation.Pose2D;
```

New constants, next to the others:

```java
    // Pinpoint pod offsets from the robot center, in mm. Measure on our robot.
    // X pod (rolls forward): left of center is +, right of center is -.
    // Y pod (rolls sideways): forward of center is +, behind center is -.
    public static final double PINPOINT_X_OFFSET_MM = -84.0;   // SDK sample value, replace
    public static final double PINPOINT_Y_OFFSET_MM = -168.0;  // SDK sample value, replace
```

New field, next to the motors:

```java
    private GoBildaPinpointDriver pinpoint;
```

Inside `init()`, after the IMU lines:

```java
        // Pinpoint: name must match the robot config ("pinpoint").
        pinpoint = hardwareMap.get(GoBildaPinpointDriver.class, "pinpoint");
        pinpoint.setOffsets(PINPOINT_X_OFFSET_MM, PINPOINT_Y_OFFSET_MM, DistanceUnit.MM);
        pinpoint.setEncoderResolution(GoBildaPinpointDriver.GoBildaOdometryPods.goBILDA_4_BAR_POD);
        // X pod counts up going forward, Y pod counts up going left. Module 2 checks both.
        pinpoint.setEncoderDirections(GoBildaPinpointDriver.EncoderDirection.FORWARD,
                                      GoBildaPinpointDriver.EncoderDirection.FORWARD);
        // Pose back to 0, 0, 0 and gyro calibration. The robot must stand still.
        pinpoint.resetPosAndIMU();
```

The team rule for heading: one heading source. Once the Pinpoint is fitted, every heading in the code comes from the Pinpoint: the pose, `driveFieldCentric()`, the Heading telemetry and `turnToHeading()`. The Pinpoint computes X and Y with its own heading. Rotate the drive by a second gyro and the two headings drift apart, so the robot drives at a slant. `turnRateDegrees()` stays on the Control Hub IMU: a turn rate, not a heading, so nothing drifts apart. [Likely]

New methods:

```java
    // Call once per loop pass, before you read the pose or the heading.
    public void updatePose() {
        pinpoint.update();
    }

    // Where the robot is: X, Y and heading from the last updatePose().
    public Pose2D getPose() {
        return pinpoint.getPosition();
    }

    // READY when the Pinpoint works. Show this in telemetry during INIT.
    public String pinpointStatus() {
        return pinpoint.getDeviceStatus().toString();
    }

    // Back to 0, 0, 0. Only with the robot standing still.
    public void resetPose() {
        pinpoint.resetPosAndIMU();
    }
```

Three old methods change. Each one now reads or sets the Pinpoint heading in place of the IMU:

```java
    // The one heading for the whole robot: the Pinpoint heading, the same one the pose uses.
    public double headingDegrees() {
        return pinpoint.getHeading(AngleUnit.DEGREES);
    }

    // Front away from the drivers: heading back to 0, X and Y stay.
    public void resetHeading() {
        Pose2D pose = pinpoint.getPosition();
        pinpoint.setPosition(new Pose2D(DistanceUnit.INCH,
                pose.getX(DistanceUnit.INCH), pose.getY(DistanceUnit.INCH), AngleUnit.DEGREES, 0));
    }

    // Field-centric drive (lab tab 4, SDK sample RobotTeleopMecanumFieldRelativeDrive).
    public void driveFieldCentric(double forward, double right, double yaw) {
        double theta = Math.atan2(forward, right);                // direction asked for
        double r = Math.hypot(right, forward);                    // how hard
        double heading = pinpoint.getHeading(AngleUnit.RADIANS);  // the one changed line: Pinpoint, not imu
        theta = AngleUnit.normalizeRadians(theta - heading);      // turn by the heading
        drive(r * Math.sin(theta), r * Math.cos(theta), yaw);
    }
```

Every Pinpoint getter returns the values from the last `update()`. So `MainTeleOp` needs one new line, the first line inside the while loop:

```java
            robot.updatePose();   // fresh Pinpoint heading for the Heading telemetry
```

Without the line, the Heading telemetry freezes at the INIT value.

`LeaveAndPark.java` needs the same line. Put `robot.updatePose();` as the first line inside the while loop of `turnToHeading()`:

```java
    while (opModeIsActive()) {
        robot.updatePose();   // fresh Pinpoint heading for the error below
        double error = AngleUnit.normalizeDegrees(target - robot.headingDegrees());
```

Without the line the heading freezes, the error stays at 90 deg, and the robot spins until AUTO ends.

Check for done:
- The project builds.
- The PR description lists the measured offsets and the pod type.
- The reviewer asks the author to explain 2 lines, for example the sign of the X offset and why `updatePose()` comes first.
- The mentor deploys merged `main`. MainTeleOp drives as before. Turn the robot 90 deg left by hand: the Heading line reads about 90.
- Run `LeaveAndPark` once: the robot drives 24 in, turns to 90 deg and stops.

## Module 2: Check the signs and the offsets (25 min)

Pairs type `PracticePinpoint.java` (prefix Practice = never used in matches):

```java
package org.firstinspires.ftc.teamcode;

import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.eventloop.opmode.TeleOp;

import org.firstinspires.ftc.robotcore.external.navigation.AngleUnit;
import org.firstinspires.ftc.robotcore.external.navigation.DistanceUnit;
import org.firstinspires.ftc.robotcore.external.navigation.Pose2D;

@TeleOp(name = "Practice Pinpoint", group = "Practice")
public class PracticePinpoint extends LinearOpMode {

    private final Robot robot = new Robot();

    @Override
    public void runOpMode() {
        robot.init(hardwareMap);
        telemetry.addLine("Push the robot by hand. Press A to zero.");
        telemetry.update();
        waitForStart();

        while (opModeIsActive()) {
            if (gamepad1.aWasPressed()) {
                robot.resetPose();              // robot must stand still
            }
            robot.updatePose();                 // once per pass, before any read
            Pose2D pose = robot.getPose();

            telemetry.addData("Status", robot.pinpointStatus());
            telemetry.addData("X (in)", "%.1f", pose.getX(DistanceUnit.INCH));
            telemetry.addData("Y (in)", "%.1f", pose.getY(DistanceUnit.INCH));
            telemetry.addData("Heading (deg)", "%.1f", pose.getHeading(AngleUnit.DEGREES));
            telemetry.update();
        }
    }
}
```

The robot never drives in this OpMode. Students push the robot by hand, motors off.

Three tests, one team at the robot at a time, the rest read the telemetry out loud. Write results on the board.

| Test | Do | Pass |
|---|---|---|
| Signs | Press A. Push forward, then left, then turn left by hand | X goes up, then Y goes up, then heading goes up. Wrong X or Y: flip that pod to `REVERSED` in `setEncoderDirections`. Wrong heading sign: [Verify] and tell the mentor |
| Tape | Press A in the start box. Push 48 in along the tape, away from the drivers. Back, then 24 in toward the left wall | X reads 48 +/- 1 in. Y reads 24 +/- 1 in. Off by the same percent every time: wrong pod type in `setEncoderResolution` |
| Spin | Press A. Spin the robot in place 360 deg by hand, around the center | X and Y stay within 1 in of 0, heading back near 0. X and Y draw a circle: an offset is wrong. Recheck the sign first, then the mm |

Before the tape test, prediction for points: teams hold up A, B or C for what X reads after the 48 in push with the wrong pod type (swingarm set, 4-bar mounted). A: 48, B: about 32, C: about 72. Answer C: the code thinks each mm has 13.26 ticks, the pod sends 19.89, so X reads 48 x 19.89 / 13.26, about 72 in.

Each fix goes into `Robot.java` as a commit with a message saying what the test showed, for example "fix: reverse Y pod, Y went down when pushed left".

Check for done: all three tests pass twice in a row, and the offsets and directions sit in a merged PR.

## Module 3: goToPoint(), distance and heading into PIDController, a stop window (35 min)

Show first (5 min): lab tab 4 AUTO card, code panel. Point at the 4 parts: error to the point, power from the error, a cap, field-centric drive. Then lab tab 7, turn job: the loop breaks only "on target AND stopped". Today's loop does both: drive to the point and turn to a heading, then stop inside a window.

Pairs type `LeaveAndParkPinpoint.java`. Keep the encoder `LeaveAndPark.java`. The encoder version stays the backup in matches until the Pinpoint version passes 5 runs in a row.

```java
package org.firstinspires.ftc.teamcode;

import com.qualcomm.robotcore.eventloop.opmode.Autonomous;
import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.util.ElapsedTime;
import com.qualcomm.robotcore.util.Range;

import org.firstinspires.ftc.robotcore.external.navigation.AngleUnit;
import org.firstinspires.ftc.robotcore.external.navigation.DistanceUnit;
import org.firstinspires.ftc.robotcore.external.navigation.Pose2D;

@Autonomous(name = "Leave and Park (Pinpoint)", group = "Competition", preselectTeleOp = "Main TeleOp")
public class LeaveAndParkPinpoint extends LinearOpMode {

    // Tune these on the real robot. Start values match lab tab 4.
    private static final double POSITION_TOLERANCE = 1.0;  // inches: close enough
    private static final double HEADING_TOLERANCE = 2.0;   // degrees: facing right
    private static final double SETTLE_TIME = 0.25;        // seconds inside the window before we stop
    private static final double MOVE_TIMEOUT = 4.0;        // seconds: give up, never hang AUTO
    private static final double MAX_DRIVE_POWER = 0.7;     // first runs: 0.3
    private static final double MAX_TURN_POWER = 0.5;

    private final Robot robot = new Robot();
    private final PIDController drivePID = new PIDController(0.05, 0, 0.005);    // distance (in)
    private final PIDController headingPID = new PIDController(0.02, 0, 0.002);  // heading (deg)
    private final ElapsedTime moveTimer = new ElapsedTime();
    private final ElapsedTime windowTimer = new ElapsedTime();

    @Override
    public void runOpMode() {
        robot.init(hardwareMap);

        // INIT: read the Pinpoint, never drive (rule G304.H). Wait for READY.
        while (opModeInInit()) {
            robot.updatePose();
            telemetry.addData("Pinpoint", robot.pinpointStatus());
            telemetry.addLine("Front away from the drivers. Hands off the robot.");
            telemetry.update();
        }
        waitForStart();   // START is pressed already, so this returns at once

        goToPoint(24, 0, 0);     // LEAVE: 24 in away from the drivers
        // Module 4 adds the PARK point here.
    }

    private void goToPoint(double targetX, double targetY, double targetHeading) {
        drivePID.reset();
        headingPID.reset();
        moveTimer.reset();
        windowTimer.reset();

        while (opModeIsActive() && moveTimer.seconds() < MOVE_TIMEOUT) {
            robot.updatePose();                          // once per pass, before any read
            Pose2D pose = robot.getPose();

            // 1. Errors, in field directions
            double errX = targetX - pose.getX(DistanceUnit.INCH);   // away from the drivers
            double errY = targetY - pose.getY(DistanceUnit.INCH);   // toward the left wall
            double distance = Math.hypot(errX, errY);               // straight-line inches to go
            double headingError = AngleUnit.normalizeDegrees(
                    targetHeading - robot.headingDegrees());        // the Pinpoint heading, same as the pose

            // 2. Stop window: close enough AND facing right, for SETTLE_TIME in a row
            boolean inWindow = distance < POSITION_TOLERANCE
                    && Math.abs(headingError) < HEADING_TOLERANCE;
            if (!inWindow) {
                windowTimer.reset();                     // outside: start the count again
            } else if (windowTimer.seconds() > SETTLE_TIME) {
                break;                                   // inside long enough: done
            }

            // 3. Distance PID gives the speed. The errors give the direction.
            double speed = Range.clip(drivePID.update(distance), 0, MAX_DRIVE_POWER);
            double forward = 0;
            double right = 0;
            if (distance > 0.1) {                        // right on the point: no divide by zero
                forward = speed * errX / distance;       // the X share of the speed
                right = -speed * errY / distance;        // +Y is left, so flip the sign
            }

            // 4. Heading PID gives the turn, as in turnToHeading() on lab tab 7
            double turn = Range.clip(headingPID.update(headingError), -MAX_TURN_POWER, MAX_TURN_POWER);

            // 5. Field-centric drive, rotated by the same Pinpoint heading
            robot.driveFieldCentric(forward, right, -turn);    // + turn power turns left, so flip

            telemetry.addData("Target", "%.0f, %.0f, %.0f deg", targetX, targetY, targetHeading);
            telemetry.addData("Distance (in)", "%.1f", distance);
            telemetry.addData("Heading error (deg)", "%.1f", headingError);
            telemetry.update();
        }
        robot.stopDrive();
    }
}
```

Read aloud before anyone deploys (5 min). Ask each pair to answer one:
- Why does the speed come from `distance` and the direction from `errX / distance` and `errY / distance`? Answer: one PID for "how far", and the two shares keep the path straight. With kI = kD = 0, this is the lab tab 4 code: 0.05 x error, capped at 0.7.
- Why `-errY` for right? +Y is left.
- Why `-turn`? A positive heading error means the target heading is to the left, and `drive()` turns right on positive yaw. Same sign flip as `turnToHeading()`.
- Why the window timer, and not "break when distance < 1"? The robot passes through the window at speed. The timer asks for "on target AND stopped", as on lab tab 7.
- Why `MOVE_TIMEOUT`? A robot stuck 1.5 in short never enters the window. Without the timeout, AUTO waits until the 30 s timer runs out and PARK never happens.

Prediction for points before the first run, set `MAX_DRIVE_POWER` to 0.3: where does the robot stop? A: on the 24 in mark, B: a little short, C: past the mark. Answer B on most robots [Likely]: close to the point, P asks for 0.05 x 1.5 in = 0.075 power, too little to move the robot. Point at the lab tab 7 lift job: "P only" stops short too.

Tune (20 min), one change per run, numbers on the board:
1. Run at `MAX_DRIVE_POWER` 0.3. Measure where the robot stops with the tape. Compare with the telemetry.
2. Stops short and times out: raise `drivePID` kI in small steps (0.01, then 0.02). The I-zone in `PIDController` builds I only while `kP x error < 0.35`, here under 7 in.
3. Overshoots the point: raise kD (0.005 to 0.01) or lower kP.
4. Raise `MAX_DRIVE_POWER` to 0.5, then 0.7. Retune kD if the overshoot comes back.
5. Turn job: target heading 90 deg at the same point, `goToPoint(24, 0, 90)`. The robot should turn in place and stop inside 2 deg.

Check for done: `goToPoint(24, 0, 0)` stops within 1 in of the tape mark 3 runs in a row at `MAX_DRIVE_POWER` 0.5 or more, and the telemetry distance agrees with the tape within 1 in.

## Module 4: LEAVE and PARK from two points (15 min)

Add the PARK move after LEAVE:

```java
        goToPoint(24, 0, 0);      // LEAVE: 24 in away from the drivers
        goToPoint(24, 24, 90);    // PARK: [Verify] the real PARK spot, measured from our start tile
```

The second move strafes toward the left wall and turns 90 deg left in one go. In the lab, tab 4 AUTO with "Turn to 90 deg while driving" ticked shows the same path. Before the run, teams predict: A the robot turns first, then drives, B the robot drives a curve, C the robot drives a straight line while turning. Answer C: field-centric drive with the Pinpoint heading keeps the direction fixed on the field while the robot turns.

[Verify] in the BIOBUZZ game manual: where PARK counts, how much of the robot must be inside, and which start tiles the team uses. BIOBUZZ AUTO pays LEAVE 3 points and PARK 5 points. Replace `(24, 24, 90)` with measured numbers for each start tile.

Check for done: 5 runs in a row from the start box, robot ends inside the PARK zone every time, total time under 10 s. Commit with a message naming the 5 runs, for example "test: Pinpoint leave and park, 5 of 5 inside PARK, kI 0.02".

## Wrap (5 min)

- Merge the open PRs. The mentor deploys `main`.
- Read the scores if the teams played the votes.
- Next: Control Award portfolio page (list Pinpoint, the problem the sensor solves, and how `goToPoint()` reads the pose). Path following with a waypoint list (`path-following.md`) waits until this AUTO runs clean. Pedro Pathing or Road Runner only when the switch rule in that plan passes.

## Common errors

| What you see | Cause | Fix |
|---|---|---|
| MainTeleOp crashes at INIT after the merge | No `pinpoint` in the robot config, or a different name | Add "goBILDA Pinpoint Odometry Computer" named `pinpoint` on the Driver Hub, save, restart |
| Pose stays at 0, 0, 0, robot drives until the timeout | `updatePose()` missing from the loop | Call `robot.updatePose()` once at the top of every loop pass |
| X goes down when the robot moves forward | X pod direction | `setEncoderDirections(REVERSED, ...)` for X |
| Y goes down when the robot moves left | Y pod direction, or the student expects Y forward as in math class | Check the frame card. Then `REVERSED` for Y |
| Every distance off by the same percent (about 50% too high or 33% too low) | Wrong pod type | `goBILDA_4_BAR_POD` or `goBILDA_SWINGARM_POD`, whichever is mounted |
| X and Y drift in a circle when the robot spins in place | Wrong offset sign or mm | Recheck: X pod left of center is +, Y pod forward of center is + |
| Numbers 25 times too big | Reading `DistanceUnit.MM` and calling them inches | `pose.getX(DistanceUnit.INCH)` |
| Heading jumps from 179 to -179 and the robot spins the long way | Heading error not normalized | `AngleUnit.normalizeDegrees(target - heading)` |
| Robot drives at a slant on the second move | Two headings: `driveFieldCentric()` or `headingDegrees()` still reads the Control Hub IMU, the pose reads the Pinpoint | Both methods read `pinpoint.getHeading()`. One heading source |
| Heading telemetry in MainTeleOp stays frozen after the merge | `updatePose()` missing in MainTeleOp | `robot.updatePose()` as the first line inside the while loop |
| Encoder LeaveAndPark spins and never stops after the merge | `turnToHeading()` never calls `updatePose()`, so the Pinpoint heading freezes | `robot.updatePose();` as the first line in the `turnToHeading()` loop |
| Robot drives sideways toward the right wall instead of left | `right = speed * errY / distance` without the minus | `right = -speed * errY / distance` |
| Robot turns the wrong way and keeps spinning | `turn` passed without the minus | `driveFieldCentric(forward, right, -turn)` |
| Status reads `CALIBRATING` or the heading drifts from the first second | Robot moved during `resetPosAndIMU()` | Hands off the robot during INIT. Restart the OpMode |
| LED purple, blue or orange | No pods, no X pod, or no Y pod detected | Check the pod cables at the Pinpoint |
| Robot stops 1 to 2 in short, then times out | P alone gives too little power near the point (lab tab 7 "P only") | Small kI in `drivePID`, or a wider `POSITION_TOLERANCE` if 2 in is good enough for PARK |
| Robot shakes around the point and never stops | Gains too high, or the window too tight | Lower kP, raise kD, or widen the window |
| `NaN` in telemetry, robot jerks on the point | Divide by zero when distance is 0 | Keep the `if (distance > 0.1)` guard |

## [Verify] list before the session

- The team owns a Pinpoint and 2 pods, and which pod type.
- Which Control Hub I2C bus goBILDA recommends for the Pinpoint.
- Heading goes up on a left turn (Module 2 sign test). The lab and this plan assume counterclockwise positive.
- Calling `setPosition()` right after `resetPosAndIMU()`: does the running reset overwrite the new pose? Today the start pose is 0, 0, 0, so this session does not need `setPosition()`.
- The BIOBUZZ PARK zone, start tiles and field axes in the game manual.
- `resetHeading()` through `setPosition()`: the heading reads 0 on the next `updatePose()`, and X and Y stay put.
- A TeleOp on `driveFieldCentric()` (lab tab 4, field-centric) drives the same after the switch from the Control Hub IMU to the Pinpoint heading.
