# FTC Java Crash Course (5 hours, Android Studio, REV)

Audience: 4-8 students with basic Java (variables, if, loops). Goal: every student writes, explains, reviews, and merges real robot code by the end of the day.

Interactive lab for the projector: https://claude.ai/artifact/4TYMuabeQX1RxzrJHuUvCW (FTC Java Crash Course Lab, 8 tabs: 1 GitHub teamwork, 2 Java basics, 3 OpMode lifecycle, 4 Drive modes, 5 One loop, 6 Feedback, 7 PID control, 8 Encoders in auto).

Homework for the night before: https://claude.ai/artifact/Sp91vcA66zYtaZfurQQz7S (FTC Crash Course: Homework for Tonight, about 3 hours, GitHub first).

Slow motion: the slider under the tabs sets the simulation speed on a log scale from 0.05x to 2x. Click a label (0.05, 0.1, 0.25, 0.5, 1, 2) to jump to it, or press 1x. Pause, and Step 0.1 s. Keys: P pause, [ slower, ] faster, . step. Run each demo once at 1x so the room sees the real speed, then replay at 0.1x or 0.05x and pause on the moment you explain.

Charts (tab 6 launcher, tab 7 PID): every chart keeps the full run. Pick a live window (5 to 60 s), press Show all, drag across a chart to zoom into that part, or use the Scroll back slider. Double-click a chart to return to live. Each chart bar also has Pause, Play and Reset run.

## Teaching format: demo-driven, everyone still writes code

Time does not allow each student to test on a robot. The format below replaces hands-on robot testing with visuals, and keeps students typing:

1. Ask the room (2 min). Each lab tab opens with a question. Students commit to an answer out loud or on a sticky note before you click Reveal. A wrong prediction followed by the demo sticks better than a lecture.
2. Show the lab (5-10 min). Run the interactive tab on the projector. Turn on the bug toggles. Let a student drive the controls.
3. Code-along (10-20 min). Every student types the change in Android Studio on their own branch and runs Build > Make Project. A clean build is the "test" for the room. No robot needed.
4. Robot moment (3 min). The mentor deploys ONE student's branch to the single robot over USB-C, with the Driver Hub on the document camera or held up. Rotate the student each module, so each student's code runs on the real robot once.

Design choices:
- One working TeleOp with field-centric drive, a launcher state machine and auto-aim, built in steps. Every exercise ends in a commit, so GitHub is practiced all day.
- The code model is FIRST's own `RobotHardware` sample and the REV Starter Bot: one hardware class, plain methods, one loop. No threads, no inheritance beyond `extends LinearOpMode`.
- Camera setup is out of scope. BIOBUZZ has no randomization, so the camera matters for aiming only. The auto-aim code takes a bearing number and builds without a camera. Setting up VisionPortal is a follow-up session.
- The day now holds Java basics, drive modes and PID. Something had to go: encoder AUTO (lab tab 8) moves to the follow-up session. To fit 4 hours, also shorten Module 7 (PID) to the turn and auto-aim demos only.

Optional practice without a robot: Beta8397/virtual_robot (https://github.com/Beta8397/virtual_robot) is a 2D FTC simulator that runs LinearOpModes from Android Studio with an abridged copy of the SDK. Students paste their OpMode into its TeamCode folder and drive a simulated mecanum robot. Use it for homework, not in the session: setup takes time, its hardware names differ from our robot config, and the abridged SDK lacks some v12.0 features. [Verify] the setup on one laptop before you recommend it.

## Before the day (mentor checklist)

- [ ] Every laptop has Android Studio Narwhal 3 Feature Drop or later, with the team repo cloned and Gradle sync finished on school Wi-Fi. The first sync downloads several GB. Do not leave this for the session.
- [ ] Every student has a GitHub account (GitHub requires age 13+) and has accepted the org invite.
- [ ] GitHub org and repos set up per `github-team-workflow.md`.
- [ ] Control Hub and Driver Hub updated with REV Hardware Client 2. Robot config uses the names in `Robot.java` below.
- [ ] One robot, one USB-C cable, one mentor laptop for "robot moments". Pre-build `Robot.java` on the robot so each robot moment takes 3 minutes, not 15.
- [ ] Projector: lab page open, browser zoom at 125-150% so the code lines read from the back row. Test the page on the projector before the day.
- [ ] Old AI-written code archived on a branch named `archive/ai-code-2026` and removed from `main`.
- [ ] `team-roster.md` on main with the single line `Team members: ` for the Module 1 conflict drill.
- [ ] Homework link sent to students tonight. Ask each to reply with their GitHub username so you can invite them before the session.
- [ ] Print `team-coding-standard.md`, one per student.

## Agenda

GitHub comes first, so every exercise after it ends in a commit and a pull request.

| Time | Module | Lab tab | Output |
|---|---|---|---|
| 0:00-0:15 | 0. Why we are here | 3 (AI version) | Team rules agreed |
| 0:15-0:55 | 1. GitHub teamwork | 1 GitHub teamwork | Everyone cloned the repo, opened a PR, and fixed a real merge conflict |
| 0:55-1:30 | 2. Java basics | 2 Java basics | Students read a full OpMode and name each part |
| 1:30-1:55 | 3. Toolchain and OpMode lifecycle | 3 OpMode lifecycle | Own OpMode builds, committed, PR open |
| 1:55-2:05 | Break | | |
| 2:05-2:50 | 4. Driving: robot-centric and field-centric | 4 Drive modes | Mecanum TeleOp with a field-centric toggle builds |
| 2:50-3:20 | 5. One Robot class, reviewed in pairs | 2 (public and private) | TeleOp uses Robot.java, PRs reviewed and merged |
| 3:20-3:30 | Break | | |
| 3:30-4:05 | 6. One loop, feedback, state machines | 5 One loop, 6 Feedback | Launcher state machine builds |
| 4:05-4:50 | 7. PID control and auto-aim | 7 PID control | PIDController.java and auto-aim on a button build |
| 4:50-5:00 | Wrap-up | | Each student explains one file out loud |

## Module 0: Why we are here (15 min)

Talking points:
- Judges interview students, not code. A robot the team cannot explain loses Control and Inspire contention.
- FIRST allows AI and asks for credit. The team rule: you merge only code you explain line by line to a reviewer. "The AI wrote it" does not pass review.
- Show the old code for 2 minutes. Ask: "Who can tell me what this thread does at STOP?" Silence makes the point. Do not shame anyone.
- Then open lab tab 3, pick "AI version with thread", press INIT. The robot breaks rule G304.H before the match starts, and after STOP the app restarts. Two minutes, no lecture needed.
- Show the 3 rules on the wall:
  1. One loop. No threads. No `sleep()` inside TeleOp.
  2. Two kinds of files: `Robot.java` (hardware) and OpModes (behavior).
  3. Every change goes through a pull request with a human reviewer.

## Module 1: GitHub teamwork (40 min)

Lab tab 1, parts A to D (15 min):
- A, where your code lives: press Edit, Commit, then "Your partner pushes", then Push. The push gets rejected. Ask the room why, then Pull and Push.
- B, how the repos fit: point at the organization, the two repos, the laptops, the robot, and Onshape. CAD history stays in Onshape.
- C, one pull request: step through the loop. At "Approved?", press "Reviewer asks for changes" once, so the room sees the loop back.
- D, merge conflict: step through Maya and Leo. Let a student pick the side at step 8.

Live drill on the real repo (25 min). Safe file first, robot code later:
1. Each student accepts the org invite and clones `robot-code-2026-biobuzz` in Android Studio (File > New > Project from Version Control). The clone and the Gradle sync should already be done on each laptop (checklist above).
2. The mentor has put `team-roster.md` on main with one line: `Team members: `.
3. Each student: Git > New Branch `yourname/roster`, adds their name at the end of that same line, commits, pushes, opens a PR.
4. The mentor approves and merges the first PR. Every other PR now shows a conflict, because everyone changed the same line.
5. Each student fixes their own conflict: Git > Merge `origin/main`, keep both names in the 3-pane merge tool, commit, push. Merge them one at a time on the projector.
6. Everyone pulls main. The roster holds every name. Each student has done every step of tab 1 for real, with no robot code at risk.

Use this PR flow for every exercise from here on.

## Module 2: Java basics (35 min)

Lab tab 2 has 10 cards. 35 minutes does not cover all of them in depth, so spend the time where students get stuck in Android Studio: structure, imports, and errors.

| Card | Time | What to click | The one sentence to remember |
|---|---|---|---|
| 0 Anatomy of a file | 3 min | Each part in the legend | Every OpMode has the same 8 parts, top to bottom. |
| 1 Modules and packages | 6 min | MainTeleOp, then Robot, then a sample in the project map | A class is a file, a package is a folder, a module is a part of the project. Same package: no import. Other package: import. |
| 2 Imports | 4 min | An import name to read its address, then untick an import | An import is the full address of a class: folders, then the class. Alt+Enter > Import class, never Create class. |
| 3 Classes and objects | 2 min | Reset one ElapsedTime, add a third | A class is a blueprint. `new` builds an object. Each object keeps its own data. |
| 4 Variables and constants | 2 min | Guess, then Compile each line | Every box has a type. `final` locks a tuned number in one place. |
| 5 Scope | 2 min | Next line, 10 times | A variable lives until the `}` of its block. |
| 6 public and private | 2 min | Press each of the 4 calls | Motors are private in Robot.java. OpModes call public actions. |
| 7 Inheritance | 2 min | Click telemetry, gamepad1, waitForStart | `extends LinearOpMode` is why telemetry and gamepad1 exist. Stop at one level. A TeleOp has a Robot. |
| 8 Lists | 2 min | Add shots, run the average loop | A List holds many values in order, index from 0. |
| 9 Error clinic | 10 min | Errors 1, 4, 6 and 7 live, students vote on the fix first | Read the red text, find it in the decoder, apply the fix. Fix the first error first. |

Error clinic routine: put an error on the projector. Students hold up 1 to 4 fingers for the fix they pick. Then click the most popular one, wrong or right: a wrong answer teaches more when the explanation appears on screen. Assign errors 2, 3, 5, 8 and 9 as pair practice during the Module 3 code-along, when the first real red lines show up.

Check for understanding: put MainTeleOp on the projector. Point at 8 random words. A student names what each one is (keyword, class, object, method, variable, constant). Repeat at wrap-up.

## Module 3: Toolchain and OpMode lifecycle (25 min)

Lab tab 3: press INIT, START, STOP with the team version. Ask before each press: "Which line runs next?" The state diagram under the code lights up each state. The match timeline shows where INIT, AUTO and TELEOP sit in the 158 seconds.

Teach:
- Project layout. Students only touch `TeamCode/src/main/java/org/firstinspires/ftc/teamcode`. The `FtcRobotController` folder holds the SDK and samples. Read, never edit.
- Robot configuration on the Driver Hub: names in the config must match the strings in `hardwareMap.get(...)`. Most "my code crashes at INIT" bugs come from a name mismatch.
- Build vs deploy: Build > Make Project checks the code on the laptop. Deploy (Run with the Control Hub on USB-C) puts it on the robot. Students build. The mentor deploys during robot moments.
- Explain each line of the file once: `package`, `import`, `@TeleOp`, `public class ... extends LinearOpMode`, `@Override`. Keep the explanation of `extends` to one sentence: "This makes our class an OpMode the Driver Hub can list and run."

Exercise 1 (each student, in their own branch, PR at the end):

```java
package org.firstinspires.ftc.teamcode;

import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.eventloop.opmode.TeleOp;

@TeleOp(name = "Hello Maya", group = "Practice")
public class PracticeHelloMaya extends LinearOpMode {

    @Override
    public void runOpMode() {
        telemetry.addLine("Hello from Maya. Press START.");
        telemetry.update();

        waitForStart();

        while (opModeIsActive()) {
            telemetry.addData("Left stick Y", gamepad1.left_stick_y);
            telemetry.addData("A pressed", gamepad1.a);
            telemetry.update();
        }
    }
}
```

Done when: Build > Make Project succeeds and the student commits with message `Add PracticeHelloMaya practice OpMode`. Robot moment: deploy one student's OpMode, show it in the Driver Hub list, and show stick values changing on telemetry.

Discussion point: push the stick forward. Why is `left_stick_y` negative? (Gamepad Y points down.) This explains the minus sign in every drive sample.

## Module 4: Driving: robot-centric and field-centric (45 min)

Lab tab 4, in this order:
1. Robot-centric: press each preset. Read the wheel powers out loud. Turn off Normalize with Forward + turn and watch the robot curve. Turn on the front_left bug and ask what the drivers would see.
2. Ask the room question, then press "Rotate robot 90 deg by hand" and Forward in each mode. The compass needle shows the IMU heading. The "rotation in one picture" panel shows the stick vector on the left and what the robot receives on the right.
3. Field-centric with a wrong zero: rotate the robot by hand without pressing Reset IMU yaw, then rotate back. Show why the A button matters.
4. AUTO: click points on the field, then tick "turn to 90 deg while driving". The path stays straight while the robot turns. Point out: no driver here, and the robot needs its position from odometry, not only its heading.
5. Read the three use-case cards together.

Correct a common belief: field-centric is a way to read the driver's sticks, so it belongs in TeleOp. In the 30-second AUTO there are no sticks. What carries over to AUTO is the same rotation math, applied to field coordinates from odometry (Pinpoint or dead wheels) or AprilTag localization.

Teach the LinearOpMode lifecycle on the whiteboard:

```
INIT pressed  -> code before waitForStart() runs (set up hardware, no movement: rule G304.H)
START pressed -> waitForStart() returns
loop          -> while (opModeIsActive()) runs about 50-100 times per second
STOP pressed  -> opModeIsActive() becomes false, loop ends, code after the loop runs
```

Key idea: each loop pass must finish fast. Anything that waits (sleep, a while loop inside the loop) freezes the drivers' sticks.

Mecanum math (from SDK sample BasicOmniOpMode_Linear). Draw the 4 wheels and the rollers. Show how forward, strafe and turn add up per wheel.

```java
double axial   = -gamepad1.left_stick_y;  // forward/back
double lateral =  gamepad1.left_stick_x;  // strafe
double yaw     =  gamepad1.right_stick_x; // turn

double frontLeftPower  = axial + lateral + yaw;
double frontRightPower = axial - lateral - yaw;
double backLeftPower   = axial - lateral + yaw;
double backRightPower  = axial + lateral - yaw;

// Keep every power between -1 and 1 without changing the ratio between wheels.
double max = Math.max(Math.abs(frontLeftPower), Math.abs(frontRightPower));
max = Math.max(max, Math.abs(backLeftPower));
max = Math.max(max, Math.abs(backRightPower));
if (max > 1.0) {
    frontLeftPower  /= max;
    frontRightPower /= max;
    backLeftPower   /= max;
    backRightPower  /= max;
}
```

Exercise 2: copy BasicOmniOpMode_Linear into TeamCode as `DriveTeleOp`, rename, remove `@Disabled`, set motor names to match config, build. Then add slow mode: while the left bumper is held, multiply all 4 powers by 0.4.

Exercise 2b (fast students): add a field-centric toggle. Copy `driveFieldCentric()` from lab tab 4 (based on SDK sample RobotTeleopMecanumFieldRelativeDrive). gamepad1 X switches modes, gamepad1 A calls `imu.resetYaw()`. Show the current mode on telemetry so the drivers always know.

Robot moment: deploy one student's DriveTeleOp. Wheel test first: push one stick slowly and check each wheel spins the right way. Wrong direction means fix `setDirection`, never flip signs in the math (the lab's bug toggle showed why).

## Module 5: One Robot class, reviewed in pairs (30 min)

Problem to show: TeleOp and Auto both need the same motors. Copy-paste means two places to fix every bug. Solution: one `Robot.java` that knows the hardware. OpModes decide behavior.

Teach `public` and `private` with one rule: fields (motors, sensors) are `private`, methods other files call are `public`. Teach `import` with one rule: Android Studio adds them, press Alt+Enter on red text.

Target file (adapt names, directions and the launcher to the real robot):

```java
package org.firstinspires.ftc.teamcode;

import com.qualcomm.hardware.lynx.LynxModule;
import com.qualcomm.hardware.rev.RevHubOrientationOnRobot;
import com.qualcomm.robotcore.hardware.DcMotor;
import com.qualcomm.robotcore.hardware.DcMotorEx;
import com.qualcomm.robotcore.hardware.HardwareMap;
import com.qualcomm.robotcore.hardware.IMU;

import org.firstinspires.ftc.robotcore.external.navigation.AngleUnit;

public class Robot {

    // Tune these on the real robot.
    public static final double LAUNCH_VELOCITY = 1160;   // encoder ticks per second
    public static final double VELOCITY_TOLERANCE = 50;  // ticks per second
    public static final double COUNTS_PER_INCH = 42.8;   // example: 537.7 counts/rev, 4 in wheel. Formula in Module 6

    private DcMotor frontLeft;
    private DcMotor frontRight;
    private DcMotor backLeft;
    private DcMotor backRight;
    private DcMotorEx launcher;
    private IMU imu;

    public void init(HardwareMap hardwareMap) {
        // Names must match the robot configuration on the Driver Hub.
        frontLeft  = hardwareMap.get(DcMotor.class, "front_left");
        frontRight = hardwareMap.get(DcMotor.class, "front_right");
        backLeft   = hardwareMap.get(DcMotor.class, "back_left");
        backRight  = hardwareMap.get(DcMotor.class, "back_right");

        frontLeft.setDirection(DcMotor.Direction.REVERSE);
        backLeft.setDirection(DcMotor.Direction.REVERSE);

        frontLeft.setZeroPowerBehavior(DcMotor.ZeroPowerBehavior.BRAKE);
        frontRight.setZeroPowerBehavior(DcMotor.ZeroPowerBehavior.BRAKE);
        backLeft.setZeroPowerBehavior(DcMotor.ZeroPowerBehavior.BRAKE);
        backRight.setZeroPowerBehavior(DcMotor.ZeroPowerBehavior.BRAKE);

        launcher = hardwareMap.get(DcMotorEx.class, "launcher");
        launcher.setMode(DcMotor.RunMode.RUN_USING_ENCODER);

        imu = hardwareMap.get(IMU.class, "imu");
        imu.initialize(new IMU.Parameters(new RevHubOrientationOnRobot(
                RevHubOrientationOnRobot.LogoFacingDirection.UP,
                RevHubOrientationOnRobot.UsbFacingDirection.FORWARD)));
        imu.resetYaw();

        // Read all hub sensors in one call per loop. Faster loops.
        for (LynxModule hub : hardwareMap.getAll(LynxModule.class)) {
            hub.setBulkCachingMode(LynxModule.BulkCachingMode.AUTO);
        }
    }

    public void drive(double axial, double lateral, double yaw) {
        double fl = axial + lateral + yaw;
        double fr = axial - lateral - yaw;
        double bl = axial - lateral + yaw;
        double br = axial + lateral - yaw;

        double max = Math.max(Math.abs(fl), Math.abs(fr));
        max = Math.max(max, Math.abs(bl));
        max = Math.max(max, Math.abs(br));
        if (max > 1.0) {
            fl /= max;
            fr /= max;
            bl /= max;
            br /= max;
        }

        frontLeft.setPower(fl);
        frontRight.setPower(fr);
        backLeft.setPower(bl);
        backRight.setPower(br);
    }

    public void stopDrive() {
        drive(0, 0, 0);
    }

    public void launcherOn() {
        launcher.setVelocity(LAUNCH_VELOCITY);
    }

    public void launcherOff() {
        launcher.setPower(0);
    }

    public boolean launcherReady() {
        return Math.abs(launcher.getVelocity() - LAUNCH_VELOCITY) < VELOCITY_TOLERANCE;
    }

    public double launcherVelocity() {
        return launcher.getVelocity();
    }

    public double headingDegrees() {
        return imu.getRobotYawPitchRollAngles().getYaw(AngleUnit.DEGREES);
    }

    public double turnRateDegrees() {
        return imu.getRobotAngularVelocity(AngleUnit.DEGREES).zRotationRate;
    }

    public void resetHeading() {
        imu.resetYaw();
    }

    // Field-centric: stick up = away from the drivers (SDK sample RobotTeleopMecanumFieldRelativeDrive)
    public void driveFieldCentric(double forward, double right, double yaw) {
        double theta = Math.atan2(forward, right);
        double r = Math.hypot(right, forward);
        double heading = imu.getRobotYawPitchRollAngles().getYaw(AngleUnit.RADIANS);
        theta = AngleUnit.normalizeRadians(theta - heading);
        drive(r * Math.sin(theta), r * Math.cos(theta), yaw);
    }
}
```

TeleOp after the refactor:

```java
@TeleOp(name = "Main TeleOp", group = "Competition")
public class MainTeleOp extends LinearOpMode {

    private final Robot robot = new Robot();

    @Override
    public void runOpMode() {
        robot.init(hardwareMap);
        telemetry.addLine("Ready");
        telemetry.update();

        waitForStart();

        while (opModeIsActive()) {
            double speed = 1.0;
            if (gamepad1.left_bumper) {
                speed = 0.4;
            }
            robot.drive(-gamepad1.left_stick_y * speed,
                         gamepad1.left_stick_x * speed,
                         gamepad1.right_stick_x * speed);

            telemetry.addData("Heading", "%.1f deg", robot.headingDegrees());
            telemetry.update();
        }
        robot.stopDrive();
    }
}
```

Exercise 3 (pairs): one student writes `Robot.java`, the partner rewrites `MainTeleOp` to use it. Both commit on their own branches and open PRs. Open lab tab 2, card "public and private", before you start: it shows why the motors are private.

Review in pairs (10 min of the 30): each student reviews the partner's PR with the checklist. The reviewer asks 2 "what does this line do" questions, and the author answers out loud. Merge the Robot.java PR first, then the TeleOp PR. Robot moment: the mentor deploys the merged main and a student drives.

## Module 6: One loop, feedback, state machines (35 min)

Part A, feedback (lab tab 6, 10 min):
- Open loop: `setPower(0.8)` gives a different speed as the battery drains. Closed loop: `setVelocity(1160)` uses the encoder to hold the speed. Press "Run a 2-minute match" and compare hit rates on the scoreboard. Then point at the block diagrams under the chart: the open loop has no arrow coming back, the closed loop does. This is the external-feedback story the Control Award asks for.
- IMU: show heading on telemetry, rotate the robot by hand. `resetYaw()` sets zero.
- Mention bulk reads: one line in `init`, faster loops.

Part B, why no threads (lab tab 5, 5 min):
- Set the speed to 0.25x and press Launch. The sleep() robot drives blind for 1.3 seconds and leaves the target. The state machine robot keeps following. Point at the gap in the loop ticks, and at the yellow box moving through the state machine diagram.
- Ask the room how to fire the launcher, wait for speed, then feed, without freezing the drive. Answer: a state machine.
- Cite gm0: hardware calls share one lock per hub, so threads do not speed anything up and they hide crashes.

Part C, state machine (20 min). Add to `MainTeleOp`:

```java
// Above runOpMode():
private enum LaunchState { IDLE, SPINNING_UP, FEEDING }
private LaunchState launchState = LaunchState.IDLE;
private final ElapsedTime feedTimer = new ElapsedTime();

// Inside the while loop, after driving:
switch (launchState) {
    case IDLE:
        robot.launcherOff();
        if (gamepad2.rightBumperWasPressed()) {
            launchState = LaunchState.SPINNING_UP;
        }
        break;

    case SPINNING_UP:
        robot.launcherOn();
        if (robot.launcherReady()) {
            feedTimer.reset();
            launchState = LaunchState.FEEDING;
        }
        break;

    case FEEDING:
        robot.launcherOn();
        // robot.feederOn();   // add the team's feeder mechanism here
        if (feedTimer.seconds() > 0.3) {
            // robot.feederOff();
            launchState = LaunchState.IDLE;
        }
        break;
}
telemetry.addData("Launch state", launchState);
telemetry.addData("Launcher velocity", robot.launcherVelocity());
```

Teach: each pass through the loop checks the state once and moves on. Driving keeps working while the launcher spins up. `rightBumperWasPressed()` fires once per press, not every loop (SDK edge detection, confirmed in the v12.0 samples alongside `leftBumperWasPressed()`, `rightTriggerWasPressed()`, `crossWasPressed()`). Contrast with `gamepad2.right_bumper`, which stays true every loop while held.

Exercise 5: add a cancel button. Pressing gamepad2 B in any state returns to IDLE.

## Module 7: PID control and auto-aim (45 min)

Lab tab 7. The message for the room: one class, every sensor. The PID code never changes. Only the sensor, the error, and 3 numbers change.

Part A, what P, I and D do (15 min). Use "Turn to heading (IMU)" at 0.25x speed, and pause on the moments below:
0. Start with the control loop diagram at the top: target, error, the 3 term boxes, power, drivetrain, IMU, and the arrow back. Trace one lap with your finger. Each term box shows the live math, for example `0.020 x -12.3 = -0.25`, so moving a slider changes the box at once. The two small charts under it show what I and D mean: I is the shaded area under the error curve, D is the slope of the red line.
0b. Response markers (dotted lines on the Target vs sensor chart, with a table under it). Name each one with the room: dead time (delay before the sensor sees motion), rise time (10% to 90% of the way), overshoot and peak time, settling time (enters the green band and stays), steady-state error (offset at the end). Use the table to compare presets. Save "P too high" for the aim job in Part B, where its overshoot shows up in the table. "Response time" is a loose word: ask students to say rise time or settling time instead.
1. Preset "P only". P = kP x error. Point at the blue P line on the bottom chart: big error, big push.
2. Skip "P too high" here. The 0.6 power limit caps both P presets for most of the turn, so it looks like "P only". Show it on the aim job in Part B.
3. Preset "PD". D = kD x (how fast the error changes). The red D line pushes against the motion near the target: the brake. Then show the robot stopping about 2 degrees past the target: friction beats the tiny P power near the end.
4. Preset "PID (tuned)". I adds up the leftover error over time. The yellow I line grows until the robot finishes.
5. Press "Bump the robot". The controller recovers on its own.

Part B, same class, other sensors (10 min):
- "Lift to height (encoder)": P only holds 1.8 in low. Ask the room question. Then PID, then tick "Carrying 3 balls". Then try the gravity feedforward with P only.
- "Auto-aim at the HIVE (camera)": the aim button starts held. Drag the HIVE to a new spot and release: the robot turns to face it. Drag it outside the yellow camera cone: the banner reads SEARCHING and the robot spins toward the side it last saw the target, then the PID takes over. This is why the code has an `else` branch with `lastBearing`. Without it the robot sits still when the camera loses the target. Then tick "Driver strafes side to side". The robot keeps facing the target while it slides. Compare "P only" and "P too high" in the markers table first: overshoot grows from about half the move to about two thirds, so too much P overshoots. Then compare the PD and PID presets: I adds overshoot here, so not every job needs all three terms.

Part C, code-along (20 min): every student creates `PIDController.java` from the lab (copy by typing, not by pasting, and explain each line to a partner). Then add auto-aim on the right bumper to `MainTeleOp`, from the "Using it for this job" panel of the camera job. It builds without a camera attached. The robot moment uses the real camera, if the team has one mounted.

Tuning on the real robot: kP first until it overshoots a little, then kD until the overshoot stops, then a small kI only if it stops short. Test 5 times. Commit the numbers with a message that says what you tested.

[Verify] where the HIVE AprilTags sit this season (CM 9.9: clusters under each CELL, facing down) and whether the team's camera sees them from its mount. The aim code works with any bearing: AprilTag `ftcPose.bearing`, a Limelight `getTx()` (flip the sign), or a color blob.

## Follow-up session: Autonomous with encoders (lab tab 8)

Lab tab 8: run once with the right numbers, then type 3 for the wheel diameter and run again. Then turn on the opModeIsActive() bug and press STOP mid-drive.
Then use `turnToHeading()` from Module 7 for turns.

BIOBUZZ AUTO: LEAVE = 3 points, PARK = 5 points. A reliable 8-point auto beats a fancy auto that fails 1 match in 3.

Counts per inch:

```
COUNTS_PER_INCH = (encoder counts per motor rev * gear reduction) / (wheel diameter in inches * PI)
```

Look up counts per rev for the team's drive motors. Measure, then test: command 48 inches and measure the real distance. Adjust.

In AUTO, blocking loops are fine because the drivers are not driving. The loop lives in the OpMode so STOP still works. Add to `Robot.java`:

```java
public void startDriveInches(double inches, double power) {
    int move = (int) (inches * COUNTS_PER_INCH);
    DcMotor[] motors = {frontLeft, frontRight, backLeft, backRight};
    for (DcMotor m : motors) {
        m.setTargetPosition(m.getCurrentPosition() + move);
        m.setMode(DcMotor.RunMode.RUN_TO_POSITION);
        m.setPower(Math.abs(power));
    }
}

public boolean driveBusy() {
    return frontLeft.isBusy() && frontRight.isBusy() && backLeft.isBusy() && backRight.isBusy();
}

public void finishDrive() {
    DcMotor[] motors = {frontLeft, frontRight, backLeft, backRight};
    for (DcMotor m : motors) {
        m.setPower(0);
        m.setMode(DcMotor.RunMode.RUN_USING_ENCODER);
    }
}
```

The AUTO OpMode:

```java
@Autonomous(name = "Leave and Park", group = "Competition", preselectTeleOp = "Main TeleOp")
public class LeaveAndPark extends LinearOpMode {

    private final Robot robot = new Robot();

    @Override
    public void runOpMode() {
        robot.init(hardwareMap);
        telemetry.addLine("Ready. Robot does not move until START.");
        telemetry.update();
        waitForStart();

        driveInches(24, 0.5);
        // turnToHeading(90) is Exercise 6
    }

    private void driveInches(double inches, double power) {
        robot.startDriveInches(inches, power);
        while (opModeIsActive() && robot.driveBusy()) {
            telemetry.addData("Driving", "%.0f in", inches);
            telemetry.update();
        }
        robot.finishDrive();
    }
}
```

Exercise: add a turn after the drive with `turnToHeading(90)` from lab tab 7 (the PID turn job), using the team's PIDController. Reference: SDK sample RobotAutoDriveByGyro_Linear.

## Wrap-up (10 min)

- Each student picks one file and explains it to the group without notes. Gaps go on the issue board as learning tasks.
- Hand out the follow-up list: encoder AUTO (lab tab 8), vision setup for auto-aim (AprilTag clusters in SDK v12.0), PID tuning on the real robot, odometry (Pinpoint) for AUTO go-to-point.
- Next meeting: each student owns one GitHub issue.

## Follow-up sessions (not in the 5 hours)

1. Vision: VisionPortal + AprilTag targeting of the HIVE. Start from ConceptAprilTagEasy. Read the v12.0 cluster guide first.
2. Odometry with goBILDA Pinpoint, then AUTO go-to-point in field coordinates (lab tab 4, AUTO mode).
3. Control Award portfolio page: list each sensor, the problem it solves, and how the code uses it.
4. Path following (Pedro Pathing or Road Runner) only after the team runs a clean encoder auto.
