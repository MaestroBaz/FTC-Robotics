# FTC Crash Course: Homework for Tonight

Nov 6, 2026 - @Ahmed El-Baz

## Before you start

Tonight takes about 3 hours. Do the must-do list in order. Tomorrow starts with GitHub, so the GitHub items come first.

- [ ] Make a free GitHub account at [github.com](https://github.com/signup) (you must be 13 or older). Pick a username without your full name, and send it to your mentor.
- [ ] Open a notebook or a notes file. Write down every question you get stuck on. Bring the list tomorrow.
- [ ] Take a 10-minute break every hour. Watch videos at 1.25x speed if they feel slow.
- [ ] You do not need a robot or Android Studio tonight. A browser is enough for everything on the must-do list.

## The must-do path (about 3 hours)

Do these 9 items in order. Each one prepares a tab of tomorrow's lab.

| # | Item | Time | Type | Prepares for |
| --- | --- | --- | --- | --- |
| 1 | [Learn Git Branching](https://learngitbranching.js.org/): the Introduction Sequence (commits, branches, merging) | 25 min | Interactive | Tab 1: GitHub teamwork |
| 2 | [GitHub Skills: Introduction to GitHub](https://github.com/skills/introduction-to-github): branch, commit, pull request, merge | 45 min | Interactive, in your own repo | Tab 1: GitHub teamwork |
| 3 | [Learn Java for Robotics: Your First Program (FTC)](https://www.youtube.com/watch?v=F24X8Ut83os), Brogan M. Pratt | 24 min | Video | Tab 2: Java basics |
| 4 | [I Wish I Knew This When I Started (Learn Java for FTC)](https://www.youtube.com/watch?v=bRZ0UDiIWj0), Brogan M. Pratt: classes and methods | 33 min | Video | Tab 2: Java basics |
| 5 | [gm0: LinearOpMode vs OpMode](https://gm0.org/en/latest/docs/software/getting-started/linear-opmode-vs-opmode.html) | 5 min | Reading | Tab 3: OpMode lifecycle |
| 6 | [gm0: Mecanum TeleOp](https://gm0.org/en/latest/docs/software/tutorials/mecanum-drive.html), read through the field-centric section | 12 min | Reading | Tab 4: Drive modes |
| 7 | [gm0: Finite State Machines](https://gm0.org/en/latest/docs/software/concepts/finite-state-machines.html) | 10 min | Reading | Tab 5: One loop, no sleep |
| 8 | [Understanding PID Control, Part 1](https://www.youtube.com/watch?v=wkfEZmsQqiA), MATLAB (Brian Douglas) | 12 min | Video | Tabs 6 and 7: Feedback, PID |
| 9 | [CTRL ALT FTC: The PID Controller](https://www.ctrlaltftc.com/the-pid-controller), main page only | 10 min | Reading | Tab 7: PID control |

Total: 2 hours 56 minutes, plus breaks.

## Optional extras (pick 1 or 2)

The first one helps the most, because tomorrow everyone fixes a merge conflict in the first hour.

| Item | Time | Why |
| --- | --- | --- |
| [GitHub Skills: Resolve merge conflicts](https://github.com/skills/resolve-merge-conflicts) | 25 min | You fix a real conflict, the same thing we do live tomorrow |
| [How To Program a Mecanum Drivetrain](https://www.youtube.com/watch?v=sFCO4du5IZk), Brogan M. Pratt | 26 min | Robot-centric vs field-centric drive, and a reusable drive class |
| [CTRL ALT FTC: Feedforward Control](https://www.ctrlaltftc.com/feedforward-control) | 10 min | Why a lift needs a little constant power to fight gravity |
| [Learn Java for FTC](https://github.com/alan412/LearnJavaForFTC), free PDF book by Alan G. Smith: chapters on classes and methods | 30 min | Java explained with robot examples. Written for SDK 11.2, so small details differ from our 12.0 |
| [GitHub Skills: Review pull requests](https://github.com/skills/review-pull-requests) | 25 min | How a reviewer comments on and approves a pull request |

## Check yourself

Try to answer these in one sentence each. Tomorrow we check them together. Any you can't answer go in your question list.

1. What is the difference between a commit and a push? Where does your code live after each one?
2. Why does the team work on branches instead of on main?
3. What is the difference between a class and an object? Give a robot example.
4. What happens in a LinearOpMode before `waitForStart()`, and what happens after it?
5. In field-centric drive, which way does the robot go when you push the stick up, if the robot faces the left wall?
6. Why should a TeleOp loop never call `sleep(1000)`? What do you use instead?
7. In one sentence each: what do P, I and D do?
8. Name one job on our robot where a PID controller helps.

## All resources by topic

Every link was checked on 2026-11-06. All are free.

| Topic | Resource | Format | Time |
| --- | --- | --- | --- |
| GitHub | [A brief introduction to Git for beginners](https://www.youtube.com/watch?v=r8jQ9hVA2qs), GitHub | Video | 9 min |
| GitHub | [FTC Docs: Fork and Clone from GitHub](https://ftc-docs.firstinspires.org/en/latest/programming_resources/tutorial_specific/android_studio/fork_and_clone_github_repository/Fork-and-Clone-From-GitHub.html) | Reading | 10 min |
| Java | [Learn Java for Robotics: Variables (FTC)](https://www.youtube.com/watch?v=3fhqLpsW7BE), Brogan M. Pratt | Video | 16 min |
| Java | [CSAwesome (AP CS A)](https://runestone.academy/ns/books/published/csawesome/index.html): Unit 5 Writing Classes, Unit 7 ArrayList, Unit 9 Inheritance | Interactive book | 30-60 min per unit |
| FTC setup | [FTC Docs: Creating and Running an OpMode (Android Studio)](https://ftc-docs.firstinspires.org/en/latest/programming_resources/tutorial_specific/android_studio/creating_op_modes/Creating-and-Running-an-Op-Mode-%28Android-Studio%29.html) | Reading | 20 min |
| FTC setup | [FTC Android Studio Setup](https://www.youtube.com/watch?v=_ZIYtNadJBo), Brogan M. Pratt | Video | 18 min |
| FTC setup | [Programming DC Motors](https://www.youtube.com/watch?v=Wv5v8p3Iqi8), Brogan M. Pratt | Video | 24 min |
| FTC setup | [REV Hello Robot: OnBot Java](https://docs.revrobotics.com/duo-control/hello-robot-java) (OnBot editor, same Java ideas) | Reading | 1-2 hr |
| Drive | [The Simple Mechanics of Mecanum Wheels](https://www.youtube.com/watch?v=0k-Ey9bS9lE), Brogan M. Pratt | Video | 13 min |
| Drive | [FTC Programming 11: Field Centric Drive](https://www.youtube.com/watch?v=4rG5G9Mjw-g), Brandon Pacewic | Video | 10 min |
| Drive | [The Mecanum Wheel Is So Weird, It Is Genius](https://www.youtube.com/watch?v=AlsCUzCCc-k), Jeremy Fielding | Video | 12 min |
| State machines | [How I Build Flawless Autonomous Routines](https://www.youtube.com/watch?v=RweqIqouYqM), Brogan M. Pratt | Video | 18 min |
| PID | [gm0: Control Loops](https://gm0.org/en/latest/docs/software/concepts/control-loops.html) | Reading | 10 min |
| PID | [PID Control in FTC Tutorial 1](https://www.youtube.com/watch?v=zrMFEw8qxLc), Thermal Equilibrium | Video | 8 min |
| PID | [PIDF Loops and Arm Control](https://www.youtube.com/watch?v=E6H6Nqe6qJo), KookyBotz 16379 | Video | 9 min |
| PID | [PID Control: A brief introduction](https://www.youtube.com/watch?v=UR0hOmjaHp0), Brian Douglas | Video | 8 min |

Some Brogan M. Pratt videos link to a paid community. The videos are free. You do not need to join anything.
