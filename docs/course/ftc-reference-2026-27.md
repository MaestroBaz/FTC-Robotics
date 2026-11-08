# FTC Reference: 2026-27 Season (BIOBUZZ) for the Software Team

Compiled 2026-11-01. Sources: Competition Manual (CM) TU07 dated 2026-10-29, FTC Docs, REV docs, gm0, FtcRobotController v12.0. Items marked [Verify] came from page summaries. Check the exact wording in the CM before you quote them to students or judges.

## 1. The season

- Game: BIOBUZZ presented by RTX (FIRST CANOPY season). Kickoff 2026-09-12.
- Two alliances of two robots. Robots collect POLLEN (yellow, about 2.8 in, 40 per match) and NECTAR (about 3.6 in, 8 red + 8 blue), launch them into the alliance HIVE, and place NECTAR into FLOWERS. Enough elements in a CELL tip the HIVE. Each tip scores and releases more NECTAR.
- Robots start touching 4 preloaded POLLEN (CM 10.3.4).
- Match: AUTO 30 s, 8 s transition, TELEOP 2:00. No formal endgame. NECTAR goes into FLOWERS only in the last 60 s (G410, MAJOR FOUL per NECTAR).
- Points (Table 10-2): LEAVE 3, PARK 5 (AUTO). HIVE TIP 20 in AUTO or TELEOP. Ranking points: SWARM, POLLINATOR 1, POLLINATOR 2 (non-Championship thresholds 16 points, 4 tips, 7 tips).
- AprilTags (CM 9.9): 36h11 family, 3.25 in, in clusters of 4 on the bottom of each CELL, facing down toward the tiles. Purpose: navigation and targeting. [Verify] the full ID map in Figure 9-17.
- No randomization found this season (fixed staging, CM 10.3.1). Software impact: vision is optional. Encoders, IMU, and launcher velocity control matter more than a camera this year.

Sources:
- https://ftc-resources.firstinspires.org/ftc/game/manual-08
- https://ftc-resources.firstinspires.org/ftc/game/manual-09
- https://ftc-resources.firstinspires.org/ftc/game/manual-10

## 2. Rules every programmer needs (CM Section 12, 10, 11)

- R701: One robot controller. REV Control Hub (only officially supported option), or an Android phone + Expansion Hub. One optional extra Expansion Hub.
- R702: Coprocessor software stays stock. Exception: Limelight 3A, the one reprogrammable vision coprocessor (Table 12-9). Allowed examples: SparkFun OTOS, OctoQuad FTC Edition, HuskyLens, Pixy2. Not allowed: OpenMV, OAK-1, Limelight 3G.
- R707/R708: Only single-sensor UVC webcams supported by the SDK (example Logitech C270). No stereo cameras.
- R503: Max 8 motors and 8 servos total. R505: max 2 motors or 2 servos per hub port.
- R704: No wireless other than the official tools. Disconnect laptops from robot Wi-Fi during matches. Third-party tools such as FTC Dashboard and Panels are not allowed in matches, and no continuous video stream. [Verify wording] If our code starts FTC Dashboard, we need a way to turn it off at events.
- R705: Name devices `<team#>-RC` and `<team#>-DS`.
- R711: Change the Control Hub Wi-Fi password from the default. Wi-Fi on, Bluetooth off.
- R901/R904: One Driver Station (REV Driver Hub recommended). Wired gamepads only.
- G305 / CM 10.3.3: Select an OpMode and press INIT before the match. An AUTO OpMode needs the 30 s timer enabled on the Driver Station. Tip: `@Autonomous(preselectTeleOp = "Main TeleOp")` loads the TeleOp for the drivers after AUTO.
- G304.H (new in TU07): Robot fully motionless after INIT. No motor movement, no servo sweeps after init finishes. Background threads started in init break this rule easily.
- G401: No driver interaction from countdown to end of AUTO except pressing start. G403: no powered movement during the transition. G404: no powered movement after TELEOP ends.

Source: https://ftc-resources.firstinspires.org/ftc/game/manual-12

## 3. Awards that reward software

- Control Award: "a team that uses sensors and software to solve game challenges in a creative way." The portfolio lists (A) the control components, (B) the challenge each one solves, (C) the function of each, and shows at least one solution using external feedback (encoders, IMU, vision, color sensor). Full code not required (CM 6.3.7).
- Think Award: portfolio covers engineering process, lessons learned, comparing choices, or math used in decisions.
- Portfolio (A201): cover page + max 15 pages, US Letter or A4, under 15 MB, content from 2026-01-01 onward, first names and last initials only, no fonts under 10 pt. Judges do not click links or watch videos.
- Judging: at least 2 students in the interview. Coaches do not coach during interviews (A204, A208).

Source: https://ftc-resources.firstinspires.org/ftc/game/manual-06

## 4. AI policy

- CM 6.2: Teams use AI to compose portfolios if they credit it (example footnote: "Portfolio created by Team XXXXX and ChatGPT").
- FIRST blog "Expanding the FIRST Toolbox with Artificial Intelligence" encourages AI, including for robot code, with credit and attribution. Judges evaluate what the team accomplished. [Verify] whether the post still reflects 2026-27 policy.
- CM 1.4.3 on mentors: involvement is "however much is needed to inspire the youth on the team." Students need to own and explain the robot in judging.
- Team takeaway: banning AI goes against FIRST guidance and does not work. The rule we enforce: no code merges unless the author explains every line in review.

Sources:
- https://ftc-resources.firstinspires.org/ftc/game/manual-01
- https://community.firstinspires.org/expanding-the-first-toolbox-with-artificial-intelligence
- Official CM chatbot: https://ftc-cmchatbot.firstinspires.org/

## 5. Hardware

- REV Control Hub: main controller, built-in IMU (BHI260AP since Sept 2022), 4 motor ports, 6 servo ports, digital, analog, I2C, USB, Wi-Fi.
- REV Expansion Hub: more ports. Hubs shipped after 2021-12-01 have no IMU. Use the Control Hub IMU.
- REV Driver Hub: the Driver Station device. Gamepads plug in by USB.
- Firmware: use REV Hardware Client 2 (Windows 10/11, macOS 15+, Ubuntu 24.04). The original Hardware Client is end of life. Devices need 26.x.x firmware. Devices on 2025 or older firmware go through Recovery Mode first.

Links:
- Control Hub: https://docs.revrobotics.com/duo-control/control-system-overview/control-hub-basics
- Control Hub getting started: https://docs.revrobotics.com/duo-control/menu/control-hub-gs
- Expansion Hub: https://docs.revrobotics.com/duo-control/control-system-overview/expansion-hub-basics
- Driver Hub: https://docs.revrobotics.com/duo-control/menu/driver-hub-gs
- Hardware Client 2: https://docs.revrobotics.com/rev-hardware-client-2/rhc2/overview.md

## 6. Software stack

- SDK: FtcRobotController v12.0 (2026-09-12), the official 2026-27 release. Needs Android Studio Narwhal 3 Feature Drop or later. If Android Studio offers to downgrade the Android Gradle Plugin, decline.
- Breaking change in v12.0: AprilTag clusters. Old code looping over `AprilTagDetection` no longer compiles. New code checks `instanceof AprilTagSingleDetection` or `AprilTagClusterDetection`. Guide: https://ftc-docs.firstinspires.org/apriltag-clusters. Expect AI-written AprilTag code from older examples to fail.
- Other new SDK features: gamepad edge detection (`gamepad1.leftBumperWasPressed()`, sample `ConceptGamepadEdgeDetection`), `@Utility` OpModes, Pinpoint v2 support.
- Repo layout: students write only in `TeamCode/src/main/java/org/firstinspires/ftc/teamcode`. Samples live in `FtcRobotController/src/main/java/org/firstinspires/ftc/robotcontroller/external/samples`. To use a sample: copy into TeamCode, rename, change the annotation name, delete `@Disabled`.
- Tool choice: FTC Docs recommends Blocks for starters, OnBot Java for basic Java, Android Studio for advanced users. Our team uses Android Studio because the Git and pull-request workflow needs it.
- Laptop tip: the robot Wi-Fi has no internet. Deploy over the USB-C cable to the Control Hub to keep the laptop on school Wi-Fi, or commit and push before you join robot Wi-Fi.

Links:
- SDK repo: https://github.com/FIRST-Tech-Challenge/FtcRobotController
- Releases: https://github.com/FIRST-Tech-Challenge/FtcRobotController/releases
- Javadoc: https://javadoc.io/doc/org.firstinspires.ftc
- FTC Docs Android Studio tutorial: https://ftc-docs.firstinspires.org/en/latest/programming_resources/android_studio_java/Android-Studio-Tutorial.html
- Choosing a language: https://ftc-docs.firstinspires.org/en/latest/programming_resources/shared/choosing_program_lang/choosing-program-lang.html
- Hardware configuration: https://ftc-docs.firstinspires.org/en/latest/hardware_and_software_configuration/configuring/index.html
- Forum: https://ftc-community.firstinspires.org/

## 7. SDK samples worth teaching (all in v12.0)

| Topic | Sample |
|---|---|
| OpMode skeleton | BasicOpMode_Linear |
| Mecanum TeleOp | BasicOmniOpMode_Linear |
| Field-relative mecanum | RobotTeleopMecanumFieldRelativeDrive |
| Auto by time | RobotAutoDriveByTime_Linear |
| Auto by encoder | RobotAutoDriveByEncoder_Linear |
| Auto by gyro | RobotAutoDriveByGyro_Linear |
| One shared hardware class | externalhardware/RobotHardware.java + ConceptExternalHardwareClass |
| IMU | SensorIMUOrthogonal |
| Color sensor | SensorColor |
| Distance sensor | SensorREV2mDistance |
| Touch sensor | SensorTouch, SensorDigitalTouch |
| Odometry | SensorGoBildaPinpoint, SensorSparkFunOTOS |
| Bulk reads | ConceptMotorBulkRead |
| Telemetry | ConceptTelemetry |
| Gamepad edges | ConceptGamepadEdgeDetection |
| AprilTag | ConceptAprilTagEasy, ConceptAprilTag, ConceptAprilTagLocalization |
| Color vision | ConceptVisionColorSensor, ConceptVisionColorLocator_Circle |
| Limelight 3A | SensorLimelight3A |

The RobotHardware sample is FIRST's own model for structure: one plain class, private motors, an `init()` method, helper methods. No inheritance tree, no threads. Use it as the template for our code.

## 8. Sensors and how code reads them

| Sensor | Code |
|---|---|
| Built-in IMU | `hardwareMap.get(IMU.class, "imu")`, `new RevHubOrientationOnRobot(logo, usb)`, `imu.getRobotYawPitchRollAngles().getYaw(AngleUnit.DEGREES)` |
| REV Color Sensor V3 | `hardwareMap.get(NormalizedColorSensor.class, "color")`, `getNormalizedColors()`. Distance: `((DistanceSensor) color).getDistance(DistanceUnit.CM)` |
| REV 2m Distance | `hardwareMap.get(DistanceSensor.class, "dist")`, `getDistance(DistanceUnit.MM)` |
| Touch sensor | `TouchSensor.isPressed()`, or `DigitalChannel.getState()` where false means pressed |
| Motor encoder | `motor.getCurrentPosition()`, `RUN_TO_POSITION`, `DcMotorEx.getVelocity()` |
| REV Through Bore Encoder | Plugs into a motor encoder port. Incremental only. [Verify] read through the paired motor's `getCurrentPosition()` |
| goBILDA Pinpoint | `hardwareMap.get(GoBildaPinpointDriver.class, "pinpoint")`, set offsets and pod type, call `update()` each loop, then `getPosition()` |

| SparkFun OTOS | Optical tracking sensor, driver since SDK 9.2, sample `SensorSparkFunOTOS`. Mounts about 10 mm above the tiles. Calibrate the linear and angular scalars, or expect 3 to 5% error. |

Tracking in AUTO, cheapest fix first (lab tab 8 shows the ladder):
1. Tape-check COUNTS_PER_INCH: command 48 in, measure, fix. Strafing slips more and needs its own constant.
2. Ramp the drive power. A hard start spins the wheels and the encoders count turns the robot never made.
3. Hold heading with the IMU and the team PIDController (SDK sample `RobotAutoDriveByGyro_Linear`).
4. Odometry: goBILDA Pinpoint (driver since SDK 10.3, about $80 alone or $280 with two pods) or SparkFun OTOS (about $85, R702 allows it).

AprilTag localization (`robotPose`, since SDK 10.0) does not fit BIOBUZZ: the SDK 12.0 notes say the tags move this season, so they are not an absolute field reference. Use them for aiming at the HIVE.

Road Runner and Pedro Pathing: not this season. LEAVE + PARK needs two moves and a turn.

REV sensor docs: https://docs.revrobotics.com/duo-control/sensors/i2c/imu

## 9. Vision

- VisionPortal hosts processors: AprilTagProcessor, ColorBlobLocatorProcessor (Color Locator), PredominantColorProcessor (Color Sensor).
- Webcams: UVC only. Built-in calibration for Logitech C270 (640x480 only), C920 (several resolutions), C310, LifeCam HD-3000, goBILDA USB camera. Other cameras need calibration for AprilTag pose.
- Limelight 3A: class `Limelight3A`, plugs into Control Hub USB. `getLatestResult()` never returns null, so check `isValid()`.
- This season: the camera helps with targeting the HIVE, not with randomization. Lower priority for the crash course.

Links:
- Vision overview: https://ftc-docs.firstinspires.org/en/latest/programming_resources/vision/vision_overview/vision-overview.html
- AprilTag: https://ftc-docs.firstinspires.org/en/latest/apriltag/index.html
- Color processing: https://ftc-docs.firstinspires.org/en/latest/color_processing/index.html
- Webcams: https://ftc-docs.firstinspires.org/en/latest/apriltag/vision_portal/visionportal_webcams/visionportal-webcams.html
- Limelight FTC API: https://docs.limelightvision.io/docs/docs-limelight/apis/ftc-programming

## 10. REV learning material

- Hello Robot (OnBot Java, concepts transfer to Android Studio): https://docs.revrobotics.com/duo-control/hello-robot-java/welcome
- 2026-27 REV DUO FTC Starter Bot: https://docs.revrobotics.com/ftc-kickoff-concepts/home/2026-27-rev-duo-ftc-starter-bot
- Starter Bot programming (TeleOp and Auto): https://docs.revrobotics.com/ftc-kickoff-concepts/home/programming-teleop-and-auto
- The Starter Bot code (`REVStarterBotJava2026`, `REVStarterBotJavaAuto2026`) is one OpMode with plain helper functions (`arcadeDrive`, `intakeControls`, `flywheelControls`) and flywheel velocity control. Good model of the level our code should sit at. Available on the REV docs pages, not on GitHub.
- REV's GitHub org (github.com/REVrobotics) holds mostly FRC code. No FTC starter bot repo exists there.

## 11. Community tools

| Tool | Use for us |
|---|---|
| Game Manual 0, https://gm0.org/en/latest/docs/software/index.html | Main reference. Mecanum, encoders, bulk reads, state machines, control loops |
| FTC Dashboard | Practice-only tuning tool. Not allowed in matches [Verify R704] |
| Road Runner, Pedro Pathing | Path following. Not for this course. Revisit after the team writes clean basic auto |
| FTCLib | Unmaintained since 2024 and adds command-based abstraction. Avoid |

## 12. Why no threads

- gm0: every hardware call takes a lock on the hub's USB connection, so "multithreading hardware calls is at best not helpful and typically harmful to performance." Each call takes about 2 ms on a Control Hub.
- Ryan Brott (author of Road Runner and FTC Dashboard): threads cannot raise hardware throughput, they add unpredictable latency, and exceptions inside threads disappear silently.
- SDK README: threads still running after STOP cause the app to log an error and force a restart.
- Replacement: one loop, short non-blocking code, state machines with `ElapsedTime`, and bulk reads in AUTO mode.

Sources:
- https://gm0.org/en/latest/docs/software/adv-control-system/sdk-communication.html
- https://gist.github.com/rbrott/83c8c54dc1776fb91f2c2000af92ec29
- https://gm0.org/en/latest/docs/software/concepts/finite-state-machines.html
- https://gm0.org/en/latest/docs/software/tutorials/bulk-reads.html
