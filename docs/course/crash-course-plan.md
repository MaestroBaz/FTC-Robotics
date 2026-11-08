# FTC Java Crash Course (3 hours, demo-driven, about 30 students)

Audience: about 30 students with basic Java (variables, if, loops), in 6 teams of about 5. No student laptops and no robot in the room. The mentor runs the lab on the projector from the local file `lab/index.html`. Students do not type code on this day. Goal: every team reads a full OpMode, names each part, and predicts what the robot does before the demo shows the answer. A hands-on Follow-up Session covers cloning, building and pull requests.

Interactive lab for the projector: https://claude.ai/artifact/4TYMuabeQX1RxzrJHuUvCW (FTC Java Crash Course Lab, 8 tabs: 1 Java basics, 2 OpMode lifecycle, 3 GitHub teamwork, 4 Drive modes, 5 One loop, no sleep, 6 Closed loop: launcher, 7 PID control, 8 Encoders (later)). On the day, open the same file from disk.

Homework for the night before: https://claude.ai/artifact/Sp91vcA66zYtaZfurQQz7S (FTC Crash Course: Homework for Tonight, about 3 hours, GitHub first).

Slow motion: the slider under the tabs sets the simulation speed on a log scale from 0.05x to 2x. Click a label (0.05, 0.1, 0.25, 0.5, 1, 2) to jump to a speed, or press 1x. Pause, and Step 0.1 s. Keys: P pause, [ slower, ] faster, . step. Run each demo once at 1x so the room sees the real speed, then replay at 0.1x or 0.05x and pause on the moment you explain.

Charts (tab 4 wheel powers, tab 6 launcher, tab 7 PID): every chart keeps the full run. Pick a live window (5 to 60 s), press Show all, drag across a chart to zoom into one part, or use the Scroll back slider. Double-click a chart to return to live. Each chart bar also has Pause, Play, Reset run and Save PNG. Save PNG saves the chart as drawn, with its title, time span and legend. Inside the published artifact some browsers block the download: right-click the picture under the bar, Save image as.

The header: auto-hide is on by default. The whole header folds to one thin line with the tab name, the sim state and the scores. Point at the line, or tap it, to open the tabs, the sim speed and the scores. The pin button at the right end of the tab row, or key H, turns auto-hide off and on. With auto-hide on, the Java card list folds to a rail of numbers.

## Teaching format: demo-driven, teams score points

Nobody types on this day. The lab replaces hands-on testing with visuals, and the team game replaces typing with predictions. Every module runs the same four moves:

1. Ask the room (2 min). Each lab tab opens with a question and three answers, A, B and C. Teams talk for 30 seconds and hold up one printed card. You click the answer each team holds up, Team 1 first (right-click takes one back), then click Reveal answer. The answer opens only from Reveal, so a stray click on the question gives nothing away. The lab gives one point to every team with the right answer. The right answers are spread over A, B and C. Press Hide on the question after the reveal, so the demo gets the full width. The votes and points stay. Keys 1 to 6 are for the other three games. A wrong prediction followed by the demo sticks better than a lecture.
2. Show the lab (5-10 min). Run the tab on the projector. Turn on the bug toggles. Let a student from the leading team drive the controls.
3. Team round (3-5 min). One of four games, listed per module below: a vote, a word hunt, a spot-the-bug, or a prediction before a demo.
4. Read the code aloud (2 min). Point at the real file on the Java tab and say what one line does. Teams listen for words to hunt later.

The four games:
- Vote: the Ask the room question. One point per team with the right answer.
- Word hunt: open the Java tab, "Every word explained" card. You say what a word does ("this word locks a number so nobody changes the tuned value"). The first team to shout the word scores one point. Click the word to show the plain-words explanation to the room.
- Spot the bug: Java tab, "Error clinic: fix it" card. Put an error on the projector. The team whose turn comes picks a fix. Click the fix. The room sees the result. A right fix scores one point. A wrong fix passes the same error to the next team.
- Prediction: before you press a lab button, each team holds up A, B or C for what the robot will do. Right prediction, one point.

Scoreboard: the top bar of the lab holds 6 teams. Keys 1 to 6 give a point in the word hunt, spot the bug and prediction games. Click a name to rename a team. Reset scores takes two clicks: the first click arms the button (it reads "Click again to clear"), the second clears the board. The Teams button hides the bar when you need the screen.

Design choices:
- One working TeleOp with field-centric drive, a launcher state machine and auto-aim, shown in steps. The same three files (MainTeleOp.java, Robot.java, PIDController.java) come back in every module, so by the end the room has read them many times.
- The code model is FIRST's own `RobotHardware` sample and the REV Starter Bot: one hardware class, plain methods, one loop. No threads, no inheritance beyond `extends LinearOpMode`.
- GitHub moved after Java because with no laptops nothing ends in a commit, so the GitHub module teaches the flow and the hands-on session practices the flow.
- Camera setup is out of scope. BIOBUZZ has no randomization, so the camera matters for aiming only. The auto-aim code takes a bearing number and builds without a camera. Setting up VisionPortal is a follow-up session.
- Three hours hold Java basics, lifecycle, GitHub, drive modes, one loop with the launcher, and PID. Encoder AUTO (lab tab 8) moves to a Follow-up Session.

## Before the day (mentor checklist)

The Run Sheet in `run-sheet.md` turns this list into gates, a prep order and fallbacks for the day.

- [ ] Print `team-coding-standard.md`, one per student.
- [ ] Print `cheatsheet.html` double sided, one set of 2 sheets per student.
- [ ] Print `run-sheet.md`.
- [ ] Print 6 sets of A, B and C cards, one set per team.
- [ ] Test the projector with `lab/index.html` opened from disk at browser zoom 125%, not more. Check that the vote options and code read from the back row. Press Hide after each vote so the demo gets the screen.
- [ ] On the morning of the course, copy `lab/index.html` to a USB stick. The git tag `crash-course-day` holds the lab reviewed on 2026-11-07, as a fallback copy (steps in `run-sheet.md`).
- [ ] Send the homework link to the students.

Laptops, GitHub org and invites, robot config and the archive branch moved to the hands-on Follow-up Session plan at the end of this doc.

## Agenda

| Time | Module | Lab tab | Output |
|---|---|---|---|
| 0:00-0:10 | 0. Why we are here, teams and the rules of the game | 2 (AI version) | Teams named, rules agreed |
| 0:10-0:45 | 1. Java basics, the robot way | 1 Java basics | Teams read a full OpMode and name each part |
| 0:45-1:00 | 2. What runs when you press INIT, START and STOP | 2 OpMode lifecycle | Teams predict the next line before each press |
| 1:00-1:20 | 3. GitHub: how the team shares one robot's code | 3 GitHub teamwork | Teams explain commit, push, pull, PR and conflict |
| 1:20-1:30 | Break | | |
| 1:30-1:55 | 4. Drive modes, robot-centric and field-centric | 4 Drive modes | Teams predict where the robot goes in each mode |
| 1:55-2:25 | 5. One loop, no sleep, and the launcher across a match | 5 One loop, no sleep, 6 Closed loop: launcher | Teams explain why no sleep and why closed loop |
| 2:25-2:50 | 6. PID control and auto-aim | 7 PID control | Teams name P, I and D on the chart |
| 2:50-3:00 | Final round, scores, what comes next | 1 Java basics (Every word explained) | Winner named, next session dated |

Encoders (tab 8) stay in a Follow-up Session.

## Module 0: Why we are here, teams and the rules of the game (10 min)

Talking points (5 min):
- Judges interview students, not code. A robot the team cannot explain loses Control and Inspire contention.
- FIRST allows AI and asks for credit. The team rule: you merge only code you explain line by line to a reviewer. "The AI wrote it" does not pass review.
- Show the old code for 2 minutes. Ask: "Who tells me what this thread does at STOP?" Silence makes the point. Do not shame anyone.
- Then open lab tab 2, pick "AI version with thread", press INIT. The robot breaks rule G304.H before the match starts, and after STOP the app restarts. Two minutes, no lecture needed.
- Show the 3 rules on the wall:
  1. One loop. No threads. No `sleep()` inside TeleOp.
  2. Two kinds of files: `Robot.java` (hardware) and OpModes (behavior).
  3. Every change goes through a pull request with a human reviewer.

Teams and the game (5 min):
- Press Reset scores twice. Click each team name in the top bar and type the name the team picks. Hand out one set of A, B and C cards per team.
- Practice vote: the tab 2 Ask the room question about the AI version (right answer C: the arm moves right after INIT, and the thread keeps running after STOP). Walk through the moves once: teams hold up a card, you click each team's answer, then Reveal answer. The lab pays the points. Press Reset scores twice after the practice, so the game starts at 0 and the tab 2 vote is fresh for Module 2. Explain the four games in one sentence each.

Team rounds:
- Practice vote on tab 2 (right answer C, then Reset scores twice, shows the moves).

## Module 1: Java basics, the robot way (35 min)

Lab tab 1 has 12 cards, numbered 0 to 11. Card 6, Loops and arithmetic, is for the hands-on Follow-up Session, not the 3 hours: skip it on the day. 35 minutes does not cover the other 11 in depth, so spend the time on Decisions and the two cards with the games: Every word explained and Error clinic: fix it.

| Card | Time | What to click | The one sentence to remember |
|---|---|---|---|
| 0 Anatomy of a file | 1 min | Each part in the legend | Every OpMode has the same 8 parts, top to bottom. |
| 1 Classes and objects | 2 min | Reset one ElapsedTime, add a third | A class is a blueprint. `new` builds an object. Each object keeps its own data. |
| 2 Types, final and static | 3 min | Guess, then Compile each line | Every box has a type. `final` locks a tuned number in one place. |
| 3 Robot.java: public and private | 3 min | Teams guess which two calls build, then press each of the 4 calls | Motors are private in Robot.java. OpModes call public actions. |
| 4 extends and @Override | 4 min | Click telemetry and @Override, then the three @Override versions | `extends LinearOpMode` is why telemetry and gamepad1 exist. `@Override` is a spelling check: a typo fails the build instead of never running. |
| 5 Decisions: if, else, switch | 6 min | Move the stick slider to 0.8, 0.3, -0.4 and 0. Then the switch states, then tick Forget the break | Java asks the questions top to bottom and runs only the first true one. Every `case` ends with `break`. `==` compares, `=` stores. |
| 6 Loops and arithmetic | hands-on session | for: Next step through the 4 wheels. while: count the balls, then tick Forget the line. Run the two 5 / 2 lines | `for` counts, `while` repeats until its question says false. Something inside must move it toward false. `5 / 2` is 2 in Java. |
| 7 Scope | 2 min | Next line, 10 times | A variable lives until the `}` of its block. |
| 8 Every word explained | 6 min | MainTeleOp first, then Robot. Click 5 words, then start the word hunt | Every word in the file has a job. Click a word and the job appears in plain words. |
| 9 Imports | 1 min | An import name to read the address | An import is the full address of a class: folders, then the class. |
| 10 Error clinic: fix it | 7 min | Errors 1, 4, 6, 7, 3 and 8, one team each | Read the red text, find the cause, apply the fix. Fix the first error first. |
| 11 The project map | if time | MainTeleOp, then Robot, then a sample in the project map | A class is a file, a package is a folder, a module is a part of the project. Same package: no import. Other package: import. |

The order follows the words a student meets reading MainTeleOp top to bottom: classes, types, private, extends and @Override, then the if and switch inside the loop, then loops and arithmetic (skipped on the day, taught in the hands-on Follow-up Session), then scope. The read-through card comes after them. The Lists card is off the nav for the day. Its pane stays in the lab for the Follow-up Session.

Open the tab with the Ask the room vote: "Where does Java find the word `drive`?" Reveal after the cards hold up. The answer (A, inside the Robot class in Robot.java) sets up the "Robot.java: public and private" card, 8 minutes in.

Word hunt routine ("Every word explained" card): say the job, not the word. Start with easy ones: the word before `class` so other files see the class, the word making a value fixed, the word giving us telemetry and gamepad1, the name of the method the Driver Hub runs at INIT. Give one point to the first team. Click each found word so the room reads the plain-words explanation. Save the word chips at the bottom for the final round.

Spot the bug routine ("Error clinic: fix it" card): one error per team, in team order. The team reads the red text aloud, talks for 30 seconds, then names a fix. Click the fix, right or wrong. A wrong fix passes the same error to the next team. Errors 2, 5 and 9 stay for the final round if time allows.

Read aloud: the Every word explained card shows a short version of each file. The full files are below. Say what each method does while you scroll. Students follow on the projector.

```java
package org.firstinspires.ftc.teamcode;

import com.qualcomm.hardware.lynx.LynxModule;
import com.qualcomm.hardware.rev.RevHubOrientationOnRobot;
import com.qualcomm.robotcore.hardware.CRServo;
import com.qualcomm.robotcore.hardware.DcMotor;
import com.qualcomm.robotcore.hardware.DcMotorEx;
import com.qualcomm.robotcore.hardware.HardwareMap;
import com.qualcomm.robotcore.hardware.IMU;

import org.firstinspires.ftc.robotcore.external.navigation.AngleUnit;

public class Robot {

    // Tune these on the real robot.
    public static final double LAUNCH_VELOCITY = 1160;   // encoder ticks per second
    public static final double VELOCITY_TOLERANCE = 40;  // ticks per second
    public static final double FEED_POWER = 1.0;         // [Verify] direction and speed on the real feeder
    public static final double COUNTS_PER_INCH = 42.8;   // example: 537.7 counts/rev, 4 in wheel. Formula in the encoders session

    private DcMotor frontLeft;
    private DcMotor frontRight;
    private DcMotor backLeft;
    private DcMotor backRight;
    private DcMotorEx launcher;
    private CRServo feeder;   // [Verify] a continuous servo pushes one ball into the launcher. Swap in the team's real feeder
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

        feeder = hardwareMap.get(CRServo.class, "feeder");

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

    public void feederOn() {
        feeder.setPower(FEED_POWER);
    }

    public void feederOff() {
        feeder.setPower(0);
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

The TeleOp, which uses the Robot class:

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

Problem to show with the two files: TeleOp and Auto both need the same motors. Copy-paste means two places to fix every bug. Solution: one `Robot.java` knows the hardware. OpModes decide behavior. Teach `public` and `private` with one rule: fields (motors, sensors) are `private`, methods other files call are `public`.

Team rounds:
- Vote: "Where does Java find the word drive?" Right answer A (1 point per right team).
- Word hunt on the "Every word explained" card: 4 words (1 point each, first team).
- Spot the bug on the "Error clinic: fix it" card: errors 1, 4, 6, 7, 3 and 8 (1 point per right fix).

## Module 2: What runs when you press INIT, START and STOP (15 min)

Lab tab 2: press INIT, START, STOP with the team version. Before each press, the message under the Driver Hub asks the vote: teams hold up A, B or C for which lines run next. The highlight after the press is the reveal. The state diagram under the message lights up each state and shows a box's text only once the OpMode reaches it, so the diagram never gives away the next vote. The match timeline shows two OpModes, AUTO then TeleOp, each with its own INIT, START and STOP.

Teach on the whiteboard:

```
INIT pressed  -> code before waitForStart() runs (set up hardware, no movement: team rule)
waiting       -> robot fully motionless until START (rule G304.H)
START pressed -> waitForStart() returns
loop          -> while (opModeIsActive()) runs about 50 times per second
STOP pressed  -> opModeIsActive() becomes false, loop ends, code after the loop runs
```

Say the rule and the team rule apart. G304.H asks for a robot "fully motionless following completion of OpMode initialization": once init finishes, nothing moves until START. The team rule is stricter: nothing moves during INIT either, so nobody argues with a referee about when init finished.

Teach:
- Project layout. The team only touches `TeamCode/src/main/java/org/firstinspires/ftc/teamcode`. The `FtcRobotController` folder holds the SDK and samples. Read, never edit.
- Robot configuration on the Driver Hub: names in the config must match the strings in `hardwareMap.get(...)`. Most "my code crashes at INIT" bugs come from a name mismatch. Point at `"front_left"` in Robot.java.
- Explain each line of the file once: `package`, `import`, `@TeleOp`, `public class ... extends LinearOpMode`, `@Override`. Keep the explanation of `extends` to one sentence: "This makes our class an OpMode the Driver Hub lists and runs."
- Ask without points: a driver pushes the left stick forward. Why does `left_stick_y` read negative? (Gamepad Y points down.) This explains the minus sign in every drive sample.

Team rounds:
- Prediction before INIT, START and STOP: which line runs next (1 point each).
- Prediction at STOP on the AI version, replayed from Module 0: does the thread stop? (1 point). The Ask the room vote on this tab was the Module 0 practice, right answer C. It does not: STOP ends `runOpMode()`, and the thread keeps running until the Robot Controller app restarts. A second INIT does not stop it either.

## Module 3: GitHub: how the team shares one robot's code (20 min)

Lab tab 3, parts 1 to 4:
- Open with the vote: "You commit your change in Android Studio. Your laptop dies before you push. Does your team have your code?" Right answer B: no, the commit sits on the dead laptop. Reveal, then score.
- 1, where your code lives (6 min): press 1 Edit, 2 Commit, 3 Leo pushes to your branch first. Stop before 4 Push: teams predict A accepted, B rejected, C GitHub merges it. Press 4. The push gets rejected and the GitHub box turns red. Ask a team why, then press 5 Pull and 4 Push.
- 2, how the repos fit (3 min): point at the organization, the two repos, the laptops, the robot, and Onshape. CAD history stays in Onshape.
- 3, one pull request (5 min): step through the loop. At "Approved?", press "Reviewer asks for changes" once, so the room sees the loop back. Ask the room which of the 3 wall rules this picture enforces.
- 4, two people, one line (5 min): run the second vote on the tab first: "What does GitHub show on Leo's pull request?" Right answer A: this branch has conflicts that must be resolved. Then step through Maya and Leo. At step 8, teams vote on which side to keep: A Maya's 0.4, B Leo's 0.3, C ask Maya and try both on the robot. C scores: git does not pick, people do. Click the side the room picks.

Say in one line: every student clones this repo, commits and opens a pull request in the hands-on Follow-up Session. On this day the room learns the words. The laptop drills for that session sit in `github-team-workflow.md` section 7.

Team rounds:
- Vote: laptop dies before push. Right answer B (1 point per right team).
- Vote: Leo's pull request after Maya merged. Right answer A (1 point per right team).
- Prediction: what happens at Push after the partner pushed (1 point).
- Vote at conflict step 8: which side to keep (1 point for C, ask and test).

## Module 4: Drive modes, robot-centric and field-centric (25 min)

Lab tab 4, in this order:
1. Robot-centric (6 min): press each preset. Read the wheel powers out loud. Press Forward + turn with Normalize on and let the robot draw a circle. Press Center sticks, then Reset robot: the old path stays as a dashed line. Turn Normalize off and press Forward + turn again. The new circle is wider: the left wheels asked for 1.60 and got cut to 1.00, so the turn shrank. Turn on the front_left bug and ask what the drivers would see. Before you turn the bug on, teams predict: A drives straight, B curves, C spins in place.
2. Vote (3 min): field-centric, the robot faces the left wall, the driver pushes the stick up. Right answer C: slides away from the drivers, still facing the wall. Reveal, score. Pick Field-centric, press "Rotate robot 90 deg left (by hand)", then Forward: the robot slides away from the drivers and keeps facing the wall. Read the wheel powers out loud: +1, -1, -1, +1. Switch to Robot-centric and press Forward: the robot drives into the left wall. The "rotation in one picture" panel shows the stick and the robot at its IMU heading on the left, and what the robot receives on the right.
3. Field-centric with a wrong zero (5 min): pick Field-centric and press Reset robot. Press "Rotate robot 90 deg left (by hand)", then press "Reset heading" while the robot faces the left wall. The mistake: a driver pressed A with the robot facing the wall. Teams predict: where does Forward go now? Press Forward: the robot drives into the left wall, like robot-centric. The IMU reads 0 deg, so the code thinks the robot faces away from the drivers. Fix: press Center sticks, press Rotate 3 more times until the front points away from the drivers, then press "Reset heading". Forward works again. Rule: press A only with the front pointing away from the drivers.
4. AUTO (5 min): click points on the field, then tick "Turn to 90 deg while driving". The path stays nearly straight while the robot turns. Point out: no driver here, and the robot needs a position from odometry, not only a heading.
5. Read the three use-case cards together (3 min).

Correct a common belief: field-centric is a way to read the driver's sticks, so field-centric belongs in TeleOp. In the 30-second AUTO there are no sticks. What carries over to AUTO is the same rotation math, applied to field coordinates from odometry (Pinpoint or dead wheels). The BIOBUZZ AprilTags move, so they aim the robot at the HIVE and give no field position.

Mecanum math (3 min, from SDK sample BasicOmniOpMode_Linear). Draw the 4 wheels and the rollers. Show how forward, strafe and turn add up per wheel, then point at the same lines inside `robot.drive()` in Robot.java.

```java
double axial   = -gamepad1.left_stick_y;  // forward/back
double lateral =  gamepad1.left_stick_x;  // strafe
double yaw     =  gamepad1.right_stick_x; // turn

double frontLeftPower  = axial + lateral + yaw;
double frontRightPower = axial - lateral - yaw;
double backLeftPower   = axial - lateral + yaw;
double backRightPower  = axial + lateral - yaw;
```

Wrong wheel direction on a real robot means fix `setDirection` in Robot.java, never flip signs in the math. The front_left bug toggle showed why.

Team rounds:
- Prediction before the front_left bug (1 point).
- Vote: field-centric, left wall, stick up: slides, no turn. Right answer C (1 point per right team).
- Prediction before the wrong-zero demo (1 point).

## Module 5: One loop, no sleep, and the launcher across a match (30 min)

Part A, why no sleep (lab tab 5, 10 min):
- Open with the vote: the driver is steering when the code reaches `sleep(1000)`. What does the robot do? Right answer A: it keeps driving at the old power and ignores the sticks. Reveal, score.
- Set the speed to 0.25x. Press Launch as the yellow target starts a turn. The sleep() robot ignores the sticks for 1.3 seconds and keeps its old power, so it leaves the target. If the target runs straight, both robots stay close: sleep hurts most when the driver needs to steer. The state machine robot keeps following. Point at the gap in the loop passes, and at the yellow box moving through the state machine diagram.
- Ask the room how to fire the launcher, wait for speed, then feed, without freezing the drive. Answer: a state machine.
- Cite gm0: hardware calls share one lock per hub, so threads do not speed anything up and they hide crashes.
- Key idea: each loop pass must finish fast. Anything waiting (sleep, a while loop inside the loop) freezes the drivers' sticks.

Part B, feedback across a match (lab tab 6, 10 min):
- Open with the vote: a fresh battery reads 13.6 V, at the end 11.8 V. What happens to `setPower(0.8)`? Right answer B: slower wheel, shots fall short. Reveal, score.
- Before you press "Run a 2-minute match", teams predict which robot wins on the scoreboard and by how much: A open loop, B closed loop by a little, C closed loop by a lot. Press, then compare hit rates.
- Open loop: `setPower(0.8)` gives a different speed as the battery drains. Closed loop: `setVelocity(1160)` uses the encoder to hold the speed. Point at the block diagrams under the chart: the open loop has no arrow coming back, the closed loop does. This is the external-feedback story the Control Award asks for.
- Ask: why does drive still use setPower? The driver closes that loop with their eyes.
- Markers: dip, recovery time, open-loop offset. Pause on the dip after a shot and name each one.
- Set the battery to 12.5 V. The open loop now sits on target. Press Fire 3 fast: the open loop hits 1 of 3, the closed loop 3 of 3. Each ball slows the wheel. The open loop needs about 0.65 s to get back, and the next ball comes after 0.5 s. The closed loop pushes back and recovers in about 0.2 s.

Part C, the state machine, read aloud (10 min). This goes into `MainTeleOp`:

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
        robot.feederOn();
        if (feedTimer.seconds() > 0.3) {
            robot.feederOff();
            launchState = LaunchState.IDLE;
        }
        break;
}
telemetry.addData("Launch state", launchState);
telemetry.addData("Launcher velocity", robot.launcherVelocity());
```

Teach: each pass through the loop checks the state once and moves on. Driving keeps working while the launcher spins up. `rightBumperWasPressed()` fires once per press, not every loop (SDK edge detection, confirmed in the v12.0 samples alongside `leftBumperWasPressed()`, `rightTriggerWasPressed()`, `crossWasPressed()`). Contrast with `gamepad2.right_bumper`, which stays true every loop while held.

`feederOn()` and `feederOff()` live in Robot.java next to the launcher. The plan assumes a continuous servo named `"feeder"` in the robot configuration [Verify]. If the team's feeder is a motor or a standard servo, only those two method bodies change. MainTeleOp stays the same: that is rule 2 at work. Lab tab 5 (code B), the Decisions card switch and the Every word explained card call the same two methods.

Spot the bug on the whiteboard: cross out one `break`. Teams hold up A the launcher never spins, B two states run in one pass, C a compile error. Then ask where a cancel button (gamepad2 B returns to IDLE) would go. Teams answer A inside IDLE, B inside every case, C above the switch.

Team rounds:
- Vote: sleep and the sticks. Right answer A (1 point per right team).
- Vote: battery and setPower. Right answer B (1 point per right team).
- Prediction: who wins the 2-minute match (1 point).
- Spot the bug: missing break, then the cancel button (1 point each).

## Module 6: PID control and auto-aim (25 min)

Lab tab 7. The message for the room: one class, every sensor. The PID code never changes. Only the sensor, the error, and 3 numbers change (4 on a lift: F holds against gravity).

Open (3 min): Ask the room vote: the lift stops about 2 inches short, which term fixes the gap? Right answer C: I adds up the leftover error. After Reveal, click "Lift to height", press P only (stops 1.8 in short, output 0.18), then PID (tuned) (I closes the gap). Then press P only again and slide kF to 0.18: the gap closes with no I. Name it: this is the F in PIDF from the launcher. On the launcher F is kF x target speed and the hub does it. On a lift F is a constant. On a turn there is no F. Then click "Turn to heading (IMU)" for Part A.

Part A, what P, I and D do (12 min). Use "Turn to heading (IMU)" at 0.25x speed, and pause on the moments below:
0. Start with the control loop diagram at the top: target, error, the 3 term boxes, power, drivetrain, IMU, and the arrow back. Trace one lap with your finger. Each term box shows the live math, for example `0.020 x -12.3 = -0.25`, so moving a slider changes the box at once. The two small charts under the diagram show what I and D mean: I is the shaded area under the error curve, D is the slope of the red line.
0b. Response markers (dotted lines on the Target vs sensor chart, with a table under the "What each term asks for" chart). Name each one with the room: dead time (delay before the sensor sees motion), rise time (10% to 90% of the way), overshoot and peak time, settling time (enters the green band and stays), steady-state error (offset at the end). Use the table to compare presets: after a preset change, a faint grey line on the chart and a "Last run" column in the table keep the run before, so P only and PD (or lift PD and PD + F) read side by side. "Clear last run" under the chart removes them. A move cut by the next target or a bump reads "cut" in the table. Save "P too high" for the aim job in Part B, where the overshoot shows up in the table. "Response time" is a loose word: ask students to say rise time or settling time instead.
1. Preset "P only". P = kP x error. Point at the blue P line on the bottom chart: big error, big push.
2. Preset "PD". D = kD x (how fast the error changes). Before you press it, teams predict the overshoot in the markers table compared with P only: A bigger, B about the same, C smaller. Answer C: P only about 11%, PD about 3%. Point at the red D line: it pushes against the motion near the target. D brakes. The faster the error shrinks, the harder D pushes back.
3. P only and PD get stuck outside the 1.5 deg window, so AUTO waits on this turn forever. The chip reads "loop still running: stuck". Press PID (tuned): I grows until the robot moves again and the loop ends. The yellow I line shows it.
4. Press PD. While the robot sits stuck about 2 deg off (the loop still runs), teams predict what Bump does: A stays at the bumped angle, B comes back, C overshoots the other way. Press Bump. Answer B. Then press PID (tuned), wait for "loop ended", and press Bump again: the robot stays. turnToHeading() stopped checking. TeleOp code runs every pass, so the lift and auto-aim always fight back.

Part B, same class, other sensors (7 min):
- "Lift to height (encoder)": tick "Carrying 3 balls": kF 0.18 is no longer enough, gravity now needs 0.30.
- "Auto-aim at the HIVE (camera)": the aim button starts held. Drag the HIVE to a new spot and release: the robot turns to face the HIVE. Drag the HIVE outside the yellow camera cone: the banner reads SEARCHING and the robot spins toward the side where the camera last saw the target, then the PID takes over. This is why the code has an `else` branch with `lastBearing`. Without the branch the robot sits still when the camera loses the target. Then tick "Driver strafes side to side". The robot keeps facing the target while sliding. Before you switch presets, teams predict what "P too high" does to overshoot in the markers table: A smaller, B the same, C bigger. Compare "P only" and "P too high": overshoot grows from about half the move to about two thirds, so too much P overshoots. Then compare the PD and PID presets: I adds overshoot here, so not every job needs all three terms. If someone asks why the red D line spikes on aim, point at the note under the D chart: the camera sends 30 frames per second, the loop runs 50 times, so the error jumps on some passes and holds on the rest. The fix sits one tick away: "PID only on new frames" runs the PID once per frame and holds the output in between. The vision session (`follow-up/vision.md`) types that code.

Part C, the class in words (3 min): open the Java tab, "Every word explained" card, PIDController.java. Word hunt for 3 words: the number multiplied by the error, the stored error from the last loop pass, the method the OpMode calls every loop. Then point at the "Using it for this job" panel of the camera job: auto-aim on the right bumper is about 10 lines in MainTeleOp. The code builds without a camera attached.

Tuning on the real robot: on a lift or arm, find F first (set kP, kI and kD to 0, raise kF until the lift holds still). Then kP until the robot overshoots a little, then kD until the overshoot stops, then a small kI if it stops short from friction. Test 5 times. Commit the numbers with a message saying what you tested.

The HIVE AprilTags sit in clusters of 4 under each CELL, facing down (CM 9.9). [Verify] on the robot whether the team's camera sees them from the mount. The aim code works with any bearing: AprilTag `ftcPose.bearing`, a Limelight `getTx()` (flip the sign), or a color blob.

Team rounds:
- Vote: which term fixes the lift gap. Right answer C (1 point per right team).
- Prediction: PD overshoot vs P only (1 point).
- Prediction: what the bump does (1 point).
- Prediction: "P too high" and overshoot on the aim job (1 point).
- Word hunt on PIDController.java: 3 words (1 point each).

## Final round, scores, what comes next (10 min)

- Final word hunt (5 min): Java tab, "Every word explained" card, MainTeleOp. Use the word chips at the bottom. Five words, 2 points each. Pick words the room met during the day: the method the loop calls on the Robot object, the condition the loop checks, the call waiting for START, the annotation listing the OpMode on the Driver Hub, the keyword making a field private.
- If time allows, two leftover Spot the bug errors from the "Error clinic: fix it" card, 2 points each.
- Scores (2 min): read the scoreboard. Name the winner. Press the Teams button to hide the bar for the last slide.
- What comes next (3 min): the hands-on Follow-up Session, where every student clones the repo, builds, and opens a pull request. Hand out `team-coding-standard.md` if not done at the door. Ask each student to bring a GitHub username to the next meeting.

## Follow-up session: Autonomous with encoders (lab tab 8)

Lab tab 8 opens with an Ask the room vote: wheel diameter typed as 3 instead of 4.09. Right answer A: the robot drives too far, about 33 in. Then run once with the right numbers, then type 3 for the wheel diameter and run again. Then turn on the opModeIsActive() bug. Set the sim speed to 0.25x first, then press STOP mid-drive. Then set Floor slip to 8% and pick Strafe right: your code thinks 24 in and the tape reads less. Tick Ramp the power and run again: the gap shrinks. With Ramp still ticked, type 3.27 for the diameter: the robot stops on the line. A measured constant soaks up steady slip. Walk the "When AUTO misses" ladder on the same tab: tape-check, ramp, IMU heading hold, then odometry.
Then use `turnToHeading()` from lab tab 7 (the PID turn job) for turns.

BIOBUZZ AUTO: LEAVE = 3 points, PARK = 5 points. LEAVE is judged at the end of AUTO, so a robot parked touching the wall loses LEAVE (Q&A 21): 8 points needs a park off the wall. PARK scores 5 again in TELEOP. A reliable 8-point auto beats a fancy auto failing 1 match in 3.

Counts per inch:

```
COUNTS_PER_INCH = (counts per rev of the output shaft) / (wheel diameter in inches * PI)
```

goBILDA and REV list counts at the output shaft: 537.7 for the 312 rpm Yellow Jacket, 560 for the HD Hex 20:1, 288 for the Core Hex. These numbers include the gearbox. Multiply only by extra gears or belts between the motor and the wheel.

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

public void setDrivePower(double power) {
    DcMotor[] motors = {frontLeft, frontRight, backLeft, backRight};
    for (DcMotor m : motors) {
        m.setPower(power);
    }
}

public void finishDrive() {
    DcMotor[] motors = {frontLeft, frontRight, backLeft, backRight};
    for (DcMotor m : motors) {
        m.setPower(0);
        m.setMode(DcMotor.RunMode.RUN_USING_ENCODER);
    }
}
```

In RUN_TO_POSITION, setPower() sets the top speed on the way to the target, so the ramp changes the speed, not the target.

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
        // turnToHeading(90) is the exercise below
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

## Follow-up sessions (not in the 3 hours)

1. Hands-on session: every student clones the repo, builds, and opens a pull request. Prep moved here from the Crash Course checklist:
   - Every laptop has Android Studio Narwhal 3 Feature Drop or later, with the team repo cloned and Gradle sync finished on school Wi-Fi. The first sync downloads several GB. Do not leave this for the session.
   - Every student has a GitHub account (GitHub requires age 13+) and has accepted the org invite. Collect usernames at the Crash Course.
   - GitHub org and repos set up per `github-team-workflow.md`.
   - Control Hub and Driver Hub updated with REV Hardware Client 2. Robot config uses the names in `Robot.java` above.
   - One robot, one USB-C cable, one mentor laptop. Pre-build `Robot.java` on the robot so each deploy takes 3 minutes, not 15.
   - Old AI-written code archived on a branch named `archive/ai-code-2026` and removed from `main`.
   - `team-roster.md` on main with the single line `Team members: ` for the conflict drill: each student adds a name on the same line on an own branch, the first PR merges, every other PR conflicts, each student fixes the conflict in the 3-pane merge tool.
   - Session content: the Loops and arithmetic card (lab tab 1, card 6) before anyone types, the PracticeHello OpMode, DriveTeleOp from BasicOmniOpMode_Linear with slow mode, Robot.java plus MainTeleOp in pairs with PR review, the launcher state machine with feederOn() and feederOff() in Robot.java, PIDController.java typed by hand and auto-aim on a button. Each piece ends in a commit and a reviewed PR, and the mentor deploys one merged main per piece.
   - Optional practice at home without a robot: Beta8397/virtual_robot (https://github.com/Beta8397/virtual_robot), a 2D FTC simulator running LinearOpModes from Android Studio with an abridged SDK. [Verify] the setup on one laptop before you recommend the simulator: hardware names differ from our robot config, and the abridged SDK lacks some v12.0 features.
2. Autonomous with encoders (lab tab 8), see the section above.
3. Vision: VisionPortal + AprilTag targeting of the HIVE. Session plan: `follow-up/vision.md` (starts from ConceptAprilTagEasy and the v12.0 cluster guide).
4. Odometry with goBILDA Pinpoint, then AUTO go-to-point in field coordinates (lab tab 4, AUTO mode). Session plan: `follow-up/odometry.md`.
5. Control Award portfolio page: list each sensor, the problem each one solves, and how the code uses each one. Session plan: `follow-up/control-award.md`.
6. Path following: a waypoint list on the go-to-point loop, no library, after the odometry session. Session plan: `follow-up/path-following.md`. Pedro Pathing or Road Runner only when the switch rule in that plan passes.
