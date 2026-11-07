# Team Coding Standard (print one per student)

## The 3 rules

1. One loop. No threads. No `sleep()` inside TeleOp.
2. Two kinds of files: `Robot.java` holds hardware. OpModes hold behavior.
3. Every change goes through a pull request. You merge only code you explain line by line.

## Java we use

| Use | Why |
|---|---|
| `int`, `double`, `boolean`, `String` | Everything the robot needs |
| `if / else`, `while`, `for`, `switch` | Logic and state machines |
| Methods with parameters and return values | Name each action: `drive()`, `launcherOn()` |
| `private` fields, `public` methods | Hardware hidden inside Robot.java, actions exposed |
| `final` constants in CAPS | `LAUNCH_VELOCITY`, tuned in one place |
| `enum` | States in a state machine |
| `ElapsedTime` | Timing without sleep |
| `extends LinearOpMode` | The one inheritance we use. It makes an OpMode |
| `List<Type>` and `ArrayList` | Many values in order, such as camera detections |
| Our own small helper classes: `Robot`, `PIDController` | One job per class, used by many OpModes |

## Java we do not use (until a mentor approves a design)

| Avoid | Use instead |
|---|---|
| `Thread`, `Runnable`, executors, `synchronized` | State machine in the main loop |
| `sleep()` in TeleOp | `ElapsedTime` and a state |
| Our own base classes and inheritance chains | One `Robot` class |
| Interfaces, abstract classes, generics | Plain classes and methods |
| Lambdas and streams | `for` loops |
| Command-based frameworks (FTCLib) | Plain OpModes |
| Copy-pasted hardware setup in many OpModes | `robot.init(hardwareMap)` |

## Naming

- Classes: `MainTeleOp`, `LeaveAndPark`, `Robot`.
- Methods and variables: `launcherOn`, `headingDegrees`.
- Hardware config names: `front_left`, `launcher`, `imu`. Same string in code and on the Driver Hub.
- Branches: `yourname/what-it-does`.

## Folder layout in TeamCode

Keep one flat folder this season. Subfolders change the `package` line and add imports, which is complexity we do not need yet.

```
teamcode/
  Robot.java
  MainTeleOp.java
  LeaveAndPark.java
  PIDController.java
  PracticeHelloMaya.java        (prefix Practice = never used in matches)
```

## Using AI the right way

FIRST allows AI and asks teams to credit it. Our team rules:
- Paste this at the top of every AI request:

```
I am a high-school student on an FTC team using the FTC SDK v12.0 in Android Studio.
Write beginner-level Java. Use one LinearOpMode and our Robot class.
No threads, no sleep inside loops, no new base classes, no interfaces, no lambdas.
Explain every line in a comment written for a beginner.
Base the code on the official FTC SDK sample: <sample name>.
```

- Read the answer. Delete anything you do not understand, or ask the AI to explain it until you do.
- Tick the AI box in the PR template and say what you used it for.
- Your reviewer will ask you to explain 2 lines. "The AI wrote it" is not an answer.

## Before you open a PR

- [ ] Builds without errors
- [ ] Tested on the robot
- [ ] No threads, no sleep in TeleOp
- [ ] Robot does not move between INIT and START
- [ ] I explain every line
