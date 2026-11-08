# Follow-up Session: Vision, aim at the HIVE with AprilTags (2 hours, hands-on)

Audience: the same students, in pairs, one laptop per pair. One robot with a webcam, one mentor laptop. Students type code on this day. Goal: every pair reads AprilTag data on the Driver Hub, adds the camera to `Robot.java`, and feeds the camera bearing into the auto-aim PID from lab tab 7. The robot turns to face the HIVE while the driver strafes.

Builds on: the hands-on Follow-up Session (repo cloned, `Robot.java`, `MainTeleOp`, `PIDController.java` merged, auto-aim on the right bumper with a placeholder bearing). Lab tab 7, "Auto-aim at the HIVE (camera)", shows the same code with a simulated camera.

Format: the Crash Course moves, cut down for typing. Each module opens with a vote on the A, B and C cards (one point per right pair, on a whiteboard tally or the lab scoreboard), then students type, then a check for done. A piece of code counts as done when the pair builds without errors and opens a pull request. The mentor merges one reviewed PR per piece and deploys the merged main to the robot.

## What this season changes

- BIOBUZZ has no randomization (CM 10.3.1). The camera aims. The camera does not find the robot's field position: the tags sit on the HIVE CELLS and move when the HIVE tips (SDK 12.0 notes, `ftc-reference-2026-27.md` section 8).
- AprilTags (CM 9.9): 36h11 family, 3.25 in, clusters of 4 on the bottom of each CELL, facing down toward the tiles. [Verify] the ID map in CM Figure 9-17.
- SDK v12.0 groups tags into clusters. FTC Docs: BIOBUZZ defines 4 clusters and no single tags. One visible tag of a cluster is enough to detect the whole cluster.
- A cluster reports one pose. The origin sits near the center of the CELL opening, not on a tag. Aim at bearing 0 and the camera points at the opening.
- Cluster names start with the alliance letter: "R" for red, "B" for blue. FTC Docs names two: "RED SCORING" and "RED AUDIENCE". [Verify] all 4 names on the robot in Module 2.
- A tipped HIVE turns some CELLS upside down. FTC Docs: if `Math.abs(ftcPose.roll) < 90`, the cluster sits right-side up and the CELL scores. Otherwise the CELL does not score.
- Breaking change: code looping over `AprilTagDetection` and reading `detection.id` or `detection.metadata` no longer compiles. Check `instanceof AprilTagSingleDetection` or `instanceof AprilTagClusterDetection`, then cast. Pose fields (`ftcPose`) stay on the parent class and need no cast.

## Before the day (mentor checklist)

- [ ] Webcam on the robot, plugged into the Control Hub USB port. [Verify] the model. The SDK has a built-in calibration for the Logitech C270 at 640x480 only, and for the C920, C310, LifeCam HD-3000 and goBILDA USB camera. Another camera needs a calibration for range to read true.
- [ ] Robot configuration on the Driver Hub: add the webcam with the name `Webcam 1`, same string as in the code.
- [ ] Camera mount: on the robot centerline, tilted up toward the CELLS, no sideways roll. The tags face down, so a level camera at bumper height sees them only from far away. [Verify] the tilt angle from the launch spot: the robot must see at least one tag of a cluster where the drivers launch.
- [ ] Print test tags at 3.25 in, black square edge to black square edge, IDs from CM Figure 9-17. [Verify] the IDs. Tape each on stiff card. A wrong print size makes range wrong.
- [ ] Mentor branch `mentor/vision-demo` with the finished code from this doc, built and deployed for the opener.
- [ ] Lab open on the projector at tab 7, "Auto-aim at the HIVE (camera)".
- [ ] Clear floor space for the robot to turn in place. A student holds the robot's E-stop role: the Driver Hub STOP button.
- [ ] Every laptop: Gradle sync done on school Wi-Fi, `main` pulled after the last session.

## Agenda

| Time | Module | Output |
|---|---|---|
| 0:00-0:10 | 0. Demo first: the robot follows a tag | Pairs predict the upside-down tag |
| 0:10-0:25 | 1. How the camera sees: portal, processor, detection | Pairs name range, bearing and roll |
| 0:25-0:50 | 2. Type PracticeVision from the SDK sample | Cluster names and bearings on the Driver Hub |
| 0:50-1:00 | Break | |
| 1:00-1:25 | 3. The camera goes into Robot.java | `initVision()`, `updateVision()`, `hiveFound()` in one PR |
| 1:25-1:50 | 4. Bearing into the aim PID | Auto-aim on the right bumper with the real camera |
| 1:50-2:00 | 5. Tune, commit, what comes next | Gains committed with a test note |

## Module 0: Demo first, the robot follows a tag (10 min)

Do this before any explanation:
1. Robot on the floor, `mentor/vision-demo` deployed. Select Main TeleOp, press INIT, press B for red. Press START.
2. A student holds a printed tag from a red cluster about 1 m in front of the robot, at CELL height. Hold the right bumper. The robot turns to face the tag.
3. The student walks the tag left and right. The robot follows. Release the bumper: the driver turns the robot again.
4. Put lab tab 7 on the projector next to the robot. Drag the HIVE. Say: "Same code. The lab fakes the camera. Today you plug in the real one."

Vote (2 min), before you flip the tag:
"I turn the tag upside down. What does the robot do?"
- A: keeps facing the tag.
- B: spins, searching.
- C: turns away from the tag.

Answer B. An upside-down cluster means a tipped CELL, and a tipped CELL does not score. The code ignores upside-down clusters, so the robot has no target and runs the search spin from lab tab 7. Flip the tag back: the robot locks on again.

## Module 1: How the camera sees (15 min)

Vote first:
"An AI tool gives you AprilTag code from 2025. The code reads `detection.id`. You build on SDK v12.0. What happens?"
- A: the code works.
- B: the build fails.
- C: the build passes, then the app crashes at INIT.

Answer B: `cannot find symbol`. In v12.0, `id` lives on `AprilTagSingleDetection`, not on `AprilTagDetection`. This is the AI rule from the coding standard in action: base the code on the v12.0 sample, not on old examples.

Draw on the whiteboard, top to bottom:

```
Webcam 1 (USB)            the camera in the robot configuration
   |
VisionPortal              opens the camera, hands each frame to the processors
   |
AprilTagProcessor         finds tags in the frame, groups them into clusters
   |
getFreshDetections()      your loop asks: anything new since the last pass?
   |
List<AprilTagDetection>   one entry per cluster seen (BIOBUZZ has no single tags)
   |
ftcPose                   range, bearing, elevation, yaw, pitch, roll
```

Teach the numbers in `ftcPose` you use today (FTC Docs, "AprilTag detection values"):
- `range`: straight-line distance from the camera to the target, in inches. For a cluster the target is the CELL opening.
- `bearing`: how many degrees the camera must turn to point at the target. Positive = counterclockwise = target to the left. This is the error for the aim PID, setpoint 0.
- `elevation`: how many degrees the camera must tilt up to center the target.
- `roll`: rotation of the cluster. Under 90 deg either way = right-side up = the CELL scores.

Say once: "The SDK runs the camera work on its own thread. Our code reads the result in our one loop. We still start no threads." Rule 1 holds.

Read aloud the detection loop from the SDK sample `ConceptAprilTagEasy` (in `FtcRobotController/src/main/java/org/firstinspires/ftc/robotcontroller/external/samples`). Point at `instanceof`, the cast, and `percentClusterFound`.

Check for done: each pair says, without notes, which `ftcPose` number becomes the aim error and which sign means "left".

## Module 2: Type PracticeVision from the SDK sample (25 min)

The team routine for a sample: copy into TeamCode, rename, change the annotation name, delete `@Disabled`.

Students type (pairs, on a branch `yourname/practice-vision`):
1. In Android Studio, copy `ConceptAprilTagEasy` from the samples folder into `teamcode`. Name the copy `PracticeVision<YourName>`.
2. Change the package line to `package org.firstinspires.ftc.teamcode;`.
3. Change the annotation to `@TeleOp(name = "Practice Vision <YourName>", group = "Practice")`. Delete the `@Disabled` line.
4. Delete `sleep(20);` inside the while loop. Team rule 1: no sleep in TeleOp.
5. In the cluster branch of `telemetryAprilTag()`, add one line under the `Percent tags found` line:

```java
// Under 90 deg either way = right-side up = this CELL scores
telemetry.addData("Scores", Math.abs(detection.ftcPose.roll) < 90);
```

Check for done: the file builds. Open a PR. The mentor merges one PR and deploys main.

On the robot (mentor drives, the room reads the Driver Hub):
- Press INIT. Tap the 3 dots on the Driver Hub, then Camera Stream, to see one frame. Tap again to refresh. Close the stream before START.
- Press START. Hold up one tag. Write on the whiteboard: cluster name, percent found, range, bearing, roll.
- Measure the camera-to-tag distance with a tape. Compare with `range`. Off by more than 10%: check the print size, then the camera calibration.
- Move the tag to the robot's left. Bearing goes positive. Move the tag right: negative.
- Flip the tag upside down. Roll jumps near 180 and Scores reads false.
- Hold one tag of each cluster in turn. Write all 4 cluster names on the whiteboard. [Verify] these names against the robot, then use them in Module 3.

## Break (10 min)

## Module 3: The camera goes into Robot.java (25 min)

Vote first:
"Mid-match, the camera cable falls out. The code keeps the last bearing. What does `hiveFound()` return 0.2 s later?"
- A: true, forever.
- B: false.
- C: the app crashes.

Answer B, because of the timer in the code below. Without the timer, the robot keeps turning toward an old bearing for the rest of the match.

Why in `Robot.java`: the camera counts as hardware. Rule 2: `Robot.java` holds hardware, OpModes hold behavior. A separate `initVision()` keeps OpModes without the camera, such as Leave and Park, working on a robot with no webcam plugged in.

Students type (pairs, branch `yourname/robot-vision`). New imports at the top of `Robot.java`:

```java
import android.util.Size;
import com.qualcomm.robotcore.util.ElapsedTime;
import org.firstinspires.ftc.robotcore.external.hardware.camera.WebcamName;
import org.firstinspires.ftc.vision.VisionPortal;
import org.firstinspires.ftc.vision.apriltag.AprilTagClusterDetection;
import org.firstinspires.ftc.vision.apriltag.AprilTagDetection;
import org.firstinspires.ftc.vision.apriltag.AprilTagProcessor;
import java.util.List;
```

New constants and fields, under the existing ones:

```java
    // Camera tuning
    public static final double MAX_TARGET_AGE = 0.2;  // seconds. An older sighting counts as lost
    public static final double UPRIGHT_ROLL = 90;     // under 90 deg = CELL right-side up (FTC Docs)

    private VisionPortal visionPortal;
    private AprilTagProcessor aprilTag;
    private final ElapsedTime sinceSeen = new ElapsedTime();  // time since we last saw our HIVE
    private String hiveName = "none";
    private double hiveBearing = 0;
    private double hiveRange = 0;
    private int hivePercent = 0;
```

New methods, inside the class:

```java
    // Call once in INIT, after init(). Only OpModes using the camera call this.
    public void initVision(HardwareMap hardwareMap) {
        aprilTag = new AprilTagProcessor.Builder().build();  // default tag library = this season's tags
        aprilTag.setDecimation(2);                           // sees tags farther away, fewer frames per second
        visionPortal = new VisionPortal.Builder()
                .setCamera(hardwareMap.get(WebcamName.class, "Webcam 1"))
                .setCameraResolution(new Size(640, 480))     // the C270 calibration exists only at 640x480
                .addProcessor(aprilTag)
                .build();
    }

    // Call once per loop pass. Returns true when a new camera frame came in.
    public boolean updateVision(boolean redAlliance) {
        List<AprilTagDetection> detections = aprilTag.getFreshDetections();
        if (detections == null) {
            return false;                                    // no new frame since the last pass
        }
        String ourLetter = "B";
        if (redAlliance) {
            ourLetter = "R";
        }
        for (AprilTagDetection detection : detections) {
            if (detection instanceof AprilTagClusterDetection) {
                AprilTagClusterDetection cluster = (AprilTagClusterDetection) detection;
                boolean ours = cluster.metadata.name.startsWith(ourLetter);
                boolean upright = Math.abs(cluster.ftcPose.roll) < UPRIGHT_ROLL;
                if (ours && upright) {
                    hiveName = cluster.metadata.name;
                    hiveBearing = cluster.ftcPose.bearing;   // degrees, + = HIVE to the left
                    hiveRange = cluster.ftcPose.range;       // inches, camera to the CELL opening
                    hivePercent = cluster.percentClusterFound;
                    sinceSeen.reset();                       // we saw it on this frame
                    break;                                   // the first good cluster wins
                }
            }
        }
        return true;
    }

    public boolean hiveFound() {
        return sinceSeen.seconds() < MAX_TARGET_AGE;
    }

    public double hiveBearingDegrees() {
        return hiveBearing;
    }

    public double hiveRangeInches() {
        return hiveRange;
    }

    public String hiveName() {
        return hiveName;
    }

    public int hivePercentFound() {
        return hivePercent;
    }

    // Call after the loop ends. Frees the camera for the next OpMode.
    public void closeVision() {
        visionPortal.close();
    }
```

Read aloud, then ask each pair to explain 2 lines to the pair next to them:
- `getFreshDetections()` returns `null` when no new frame arrived. The camera delivers about 30 frames per second [Verify on your camera with the telemetry below] and the loop runs faster, so most passes get `null`.
- `instanceof` plus the cast: the v12.0 pattern. A single tag would skip this branch. BIOBUZZ has none.
- `startsWith(ourLetter)`: the alliance filter. FTC Docs uses the first letter of the name.
- `sinceSeen`: one timer replaces a `found` boolean. A lost target, a blurred frame and an unplugged camera all end the same way: 0.2 s later, `hiveFound()` turns false.
- `break`: stop at the first good cluster. [Verify] with Figure 9-17 whether a robot sees two of our clusters at once, and which one to prefer.

Check for done: `Robot.java` builds. Leave and Park still builds without changes. Open a PR. The reviewer asks for 2 lines explained. The mentor merges one PR.

## Module 4: Bearing into the aim PID (25 min)

Vote first:
"The camera sends a new frame 30 times per second. The loop runs 100 times per second. You call `aimPID.update(bearing)` on every pass. What does the D term see on most passes?"
- A: the real change in bearing.
- B: zero, then a big jump on the next frame.
- C: double the change.

Answer B. Same bearing twice in a row = zero change = D reads zero. Then a new frame arrives, the bearing jumps, and D kicks. The robot shakes. Fix: run the PID only on passes with a new frame, and hold the last output in between. The `PIDController` timer then measures the time since the last frame, not one loop pass, so D divides each change by the real time between frames.

Show both on the projector, lab tab 7, aim job, preset "PD (tuned: no I needed)". Read the note under the D chart: the lab loop runs 50 times per second, so fewer passes repeat a frame than in the vote. A faster loop repeats more. The red D line spikes, then drops to 0. Tick "PID only on new frames": D stops dropping to 0, and the "Using it for this job" panel switches to the code below.

Students type (pairs, branch `yourname/camera-aim`). In `MainTeleOp`, add `import com.qualcomm.robotcore.util.Range;` if the file lacks the import. Above `runOpMode()`, replace the placeholder fields from the last session:

```java
    // Start from the lab tab 7 aim job, preset "PD (tuned: no I needed)". Tune on the robot.
    private final PIDController aimPID = new PIDController(0.02, 0, 0.002);
    private double aimTurn = 0;        // last PID output, held between camera frames
    private double lastBearing = 0;    // which side we last saw the HIVE on
    private boolean redAlliance = true;
```

In `runOpMode()`, replace `robot.init(hardwareMap);` and the Ready telemetry with:

```java
        robot.init(hardwareMap);
        robot.initVision(hardwareMap);

        // INIT loop: pick the alliance. Nothing moves here (rule G304.H).
        while (opModeInInit()) {
            if (gamepad1.x) {
                redAlliance = false;   // X (square on a PS controller) = blue
            }
            if (gamepad1.b) {
                redAlliance = true;    // B (circle on a PS controller) = red
            }
            String alliance = "BLUE";
            if (redAlliance) {
                alliance = "RED";
            }
            telemetry.addData("Alliance", alliance + "  (X = blue, B = red)");
            telemetry.update();
        }
        waitForStart();
```

Inside the while loop, replace the old aim block and the `robot.drive(...)` line with:

```java
            boolean newFrame = robot.updateVision(redAlliance);

            double turn = gamepad1.right_stick_x;            // driver turns by default
            if (gamepad1.rightBumperWasPressed()) {
                aimPID.reset();                              // fresh start on each press
                aimTurn = 0;
            }
            if (gamepad1.right_bumper) {
                if (robot.hiveFound()) {
                    lastBearing = robot.hiveBearingDegrees();
                    if (newFrame) {
                        // + bearing = HIVE to the left. In robot.drive(), + yaw turns right.
                        // So the minus sign turns the robot toward the HIVE.
                        aimTurn = -Range.clip(aimPID.update(lastBearing), -0.6, 0.6);
                    }
                    turn = aimTurn;                          // hold the last output between frames
                } else {
                    aimPID.reset();                          // no target: search for it
                    turn = lastBearing > 0 ? -0.3 : 0.3;     // spin toward where we last saw it
                }
            }
            robot.drive(-gamepad1.left_stick_y, gamepad1.left_stick_x, turn);  // driver still strafes

            telemetry.addData("HIVE", "%s  %d%%", robot.hiveName(), robot.hivePercentFound());
            telemetry.addData("Found", robot.hiveFound());
            telemetry.addData("Bearing", "%.1f deg (+ = left)", robot.hiveBearingDegrees());
            telemetry.addData("Range", "%.1f in", robot.hiveRangeInches());
```

Slow mode on `gamepad1.left_bumper`: multiply both left stick values and the default `turn = gamepad1.right_stick_x` by `speed`. Leave `aimTurn` and the search spin unscaled.

After the while loop, next to `robot.stopDrive();`, add:

```java
        robot.closeVision();
```

Compare with lab tab 7, aim job, "Using it for this job" panel, with "PID only on new frames" ticked. Same code. One change: `newFrame`, `targetFound` and `targetBearing` come from `robot.updateVision()`, `robot.hiveFound()` and `robot.hiveBearingDegrees()`.

Check for done: builds, PR open, reviewed, one PR merged and deployed. On the robot:
1. Sign test first, with the robot on blocks or with low gains: hold the bumper with the tag on the left. The robot turns left. Turns right instead: the sign flipped. Fix the sign in one place, the `-Range.clip` line.
2. Tag in front, bumper held, a second student strafes with the left stick. The robot slides and keeps facing the tag.
3. Hide the tag behind a card. The robot spins toward the side where the tag went.
4. Flip the tag upside down. The robot searches. Module 0 vote, now in your own code.

## Module 5: Tune, commit, what comes next (10 min)

Tune in this order, same as lab tab 7:
1. Set kD to 0. Raise kP until the robot overshoots the tag a little, then back off 20%.
2. Add kD until the overshoot stops. Lab tab 7 starts at 0.002.
3. Leave kI at 0. Lab tab 7 shows I adds overshoot on the aim job.
4. Test 5 times from the launch spot on the real field, with a tag at real CELL height. Commit the numbers with a message naming the test: `tune: aim kP 0.018 kD 0.002, 5 of 5 locked from the launch spot`.

Control Award: the portfolio needs one solution using external feedback. Write one paragraph: sensor (webcam, AprilTag clusters), problem (aim at a moving HIVE), function (bearing as the PID error, roll filter for tipped CELLS, 0.2 s lost-target timer). Judges read the paragraph, not the code.

What comes next:
- Odometry with goBILDA Pinpoint, then AUTO go-to-point (lab tab 4, AUTO mode).
- Range to launcher speed: a table of range against `LAUNCH_VELOCITY`, measured on the field. Only after aim works every time.

## Common errors

| What you see | Cause | Fix |
|---|---|---|
| `cannot find symbol: id` or `metadata` on `AprilTagDetection` | Pre-v12.0 code, often from an AI tool | `instanceof AprilTagClusterDetection`, cast, then read `metadata` |
| Crash at INIT naming `Webcam 1` | The configuration lacks the webcam, or the name differs | Add the webcam on the Driver Hub with the exact name `Webcam 1` |
| Leave and Park crashes at INIT on a robot with no camera | `initVision()` moved into `init()` | Keep `initVision()` separate. Only camera OpModes call `initVision()` |
| Robot turns away from the HIVE | Sign: + bearing = left, + yaw in `robot.drive()` = right | One minus sign, on the `-Range.clip` line. Never flip motor directions for this |
| Robot shakes when locked on | PID runs on repeated frames, kP too high, or motion blur | Update only when `newFrame` is true, lower kP, then try the exposure stretch below |
| Found reads false with the tag in view | Wrong alliance in INIT, or the tag sits upside down | Press B or X in INIT and read the Alliance line. Check roll in PracticeVision |
| Robot never sees the HIVE on the field | Camera level, tags face down under the CELL | Tilt the camera up. [Verify] the angle from the launch spot |
| `Unknown` tag in PracticeVision | The printed ID belongs to no BIOBUZZ cluster | Reprint with an ID from CM Figure 9-17 |
| Range off by a fixed factor | Tag printed at the wrong size, or camera without calibration | Print at 3.25 in. Use a camera from the calibrated list at a calibrated resolution |
| Driving feels laggy with the camera on | Vision load on the Control Hub | Keep decimation at 2 or raise to 3. Keep 640x480 |
| Robot aims the camera at the CELL, the launcher misses to one side | Camera mounted off the centerline | Move the camera to the centerline, or aim at a small bearing offset measured on the field. [Verify] on the robot |
| `sleep(20)` in the TeleOp loop | Copied from the SDK sample | Delete the line. Rule 1 |
| HIVE lost for a moment while turning fast | Motion blur drops a frame | The 0.2 s `MAX_TARGET_AGE` covers short drops. Longer drops: exposure stretch |

## Stretch goals (pairs who finish early)

Lower exposure to cut motion blur. The SDK sample `RobotAutoDriveToAprilTagOmni` sets 6 ms exposure and gain 250 inside a method with `sleep()` and a waiting `while` loop. Our version runs once in the INIT loop with no sleep. Add to `Robot.java` (imports `org.firstinspires.ftc.robotcore.external.hardware.camera.controls.ExposureControl`, `org.firstinspires.ftc.robotcore.external.hardware.camera.controls.GainControl` and `java.util.concurrent.TimeUnit`):

```java
    // Call every pass of the INIT loop. Returns true once the settings went in.
    public boolean trySetExposure(int exposureMs, int gain) {
        if (visionPortal.getCameraState() != VisionPortal.CameraState.STREAMING) {
            return false;                                    // camera still opening, try next pass
        }
        ExposureControl exposure = visionPortal.getCameraControl(ExposureControl.class);
        exposure.setMode(ExposureControl.Mode.Manual);
        exposure.setExposure(exposureMs, TimeUnit.MILLISECONDS);
        GainControl gainControl = visionPortal.getCameraControl(GainControl.class);
        gainControl.setGain(gain);
        return true;
    }
```

In the INIT loop: `if (!exposureSet) { exposureSet = robot.trySetExposure(6, 250); }` with `private boolean exposureSet = false;` above `runOpMode()`. [Verify] on the robot: the sample waits 50 ms between the mode change and the exposure. Without the wait, check the Camera Stream frame turns darker. Find the best values with the SDK sample `ConceptAprilTagOptimizeExposure`.

Aim in AUTO before the preloads launch. In AUTO a blocking loop is fine, with `opModeIsActive()` and a timeout so a missing tag never eats the 30 s:

```java
    private void aimAtHive(double timeoutSeconds) {
        ElapsedTime timer = new ElapsedTime();
        aimPID.reset();
        double turn = 0;
        while (opModeIsActive() && timer.seconds() < timeoutSeconds) {
            boolean newFrame = robot.updateVision(redAlliance);
            if (robot.hiveFound() && Math.abs(robot.hiveBearingDegrees()) < 2) {
                break;                                       // on target
            }
            if (!robot.hiveFound()) {
                turn = 0;                                    // AUTO: no search spin, wait for the timeout
            } else if (newFrame) {
                turn = -Range.clip(aimPID.update(robot.hiveBearingDegrees()), -0.4, 0.4);
            }
            robot.drive(0, 0, turn);
        }
        robot.stopDrive();
    }
```

AUTO picks the alliance the same way, in the INIT loop.

## Sources

- SDK samples in FtcRobotController v12.0: `ConceptAprilTagEasy`, `ConceptAprilTag`, `RobotAutoDriveToAprilTagOmni`, `ConceptAprilTagOptimizeExposure`. https://github.com/FIRST-Tech-Challenge/FtcRobotController
- Vision 12.0.0 javadoc (`AprilTagProcessor.getFreshDetections()`, `AprilTagClusterDetection.percentClusterFound`, `AprilTagClusterMetadata.name`): https://javadoc.io/doc/org.firstinspires.ftc/Vision/12.0.0
- AprilTag clusters guide (v12.0 migration, roll check, cluster origin): https://ftc-docs.firstinspires.org/apriltag-clusters
- AprilTag detection values (range, bearing, elevation, signs): https://ftc-docs.firstinspires.org/apriltag-detection-values
- Season facts and the [Verify] list: `docs/course/ftc-reference-2026-27.md`, sections 1, 6, 8 and 9.
