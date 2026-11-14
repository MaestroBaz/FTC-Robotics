# GitHub Team Workflow (code + Onshape CAD)

## 1. Structure: an organization, not a "main repo"

Use a GitHub organization as the "main" container. Avoid one parent repo with the code and CAD repos inside as git submodules. Submodules confuse experienced engineers and will stall students.

```
github.com/ftc-XXXXX                 (organization, XXXXX = team number)
  |- robot-code-2026-biobuzz         (fork of FIRST-Tech-Challenge/FtcRobotController)
  |- cad-and-design                  (Onshape links, exports, BOM, design decisions)
  |- .github                         (optional: org profile README, shared issue templates)
```

Why a new code repo each season: the SDK changes every September, and gm0 recommends a fresh project per season. Last season stays readable and untouched.

## 2. CAD with Onshape: do not put CAD files in git

Onshape already has version control: named versions, branches, merges, and full history in each Document. Copying Onshape files into git adds work and no safety. Use the `cad-and-design` repo for what Onshape does not cover:

```
cad-and-design/
  README.md              links to every Onshape Document, who owns each subsystem
  exports/
    3d-print/            STL or 3MF files, named part_v<onshape-version>.stl
    laser-cut/           DXF files
    step/                STEP of the full robot at each event
  bom/                   bill of materials (CSV)
  decisions/             one markdown file per design decision (feeds the Think Award)
  photos/                prototype photos for the portfolio
```

Rules:
- Every export names the Onshape version it came from, for example `intake_bracket_v12.stl`. A part on the robot always traces back to a CAD version.
- Before each event, create an Onshape version named `event-2026-12-06-qualifier` and export a STEP to `exports/step/`.
- Use Onshape branches for experiments, the same idea as git branches. Teach both at once: "a branch is a safe copy to try something."
- Onshape for Education is free for students and mentors. Put every student in one Onshape Team so Documents are shared.

## 3. Mentor setup (one time, about 45 minutes)

1. Create the org: github.com/organizations/plan, free plan. Name `ftc-XXXXX`.
2. Fork `FIRST-Tech-Challenge/FtcRobotController` into the org. Rename to `robot-code-2026-biobuzz`. Keep it public.
   - Public repos on the free plan get branch protection and rulesets. Private repos on the free plan do not. [Likely, check GitHub's current plan page.]
   - Public FTC code is common practice and fits Gracious Professionalism.
3. Archive the old code: push the AI-written code to a branch named `archive/ai-code-2026`. Do not merge it into `main`.
4. Protect `main` (Settings > Rules > Rulesets, target `main`):
   - Require a pull request before merging, 1 approval.
   - Dismiss stale approvals when new commits are pushed.
   - Block force pushes and deletion.
   - Optional: require review from code owners (see CODEOWNERS below).
5. Invite students. Roles: students = Write on `robot-code` and `cad-and-design`. Mentors = Admin. At least 2 admins so the team never loses access.
6. Student privacy: students choose usernames without full names and turn on "Keep my email addresses private" (Settings > Emails), so commits use the noreply address. GitHub requires users to be 13 or older.
7. Add `CODEOWNERS` at `.github/CODEOWNERS` in the code repo:

```
# Each area has a student owner who reviews changes to it.
/TeamCode/src/main/java/org/firstinspires/ftc/teamcode/Robot.java         @student-a @student-b
/TeamCode/src/main/java/org/firstinspires/ftc/teamcode/LeaveAndPark.java  @student-c
/TeamCode/src/main/java/org/firstinspires/ftc/teamcode/MainTeleOp.java    @student-d
```

8. Add a pull request template at `.github/pull_request_template.md` (content in section 6).
9. Create a GitHub Project board (org > Projects > New > Board) with columns: To do, In progress, In review, Tested on robot, Done.

## 4. Updating the SDK mid-season

FIRST ships point releases during the season. In the code repo on github.com: "Sync fork" > "Update branch". Then on a laptop: pull `main`, open Android Studio, let Gradle sync, deploy, test drive before the next event. Do this on a branch and PR the update like any other change, never the night before an event.

## 5. Student daily workflow

Use Android Studio's built-in Git tools (Git menu and the Commit tool window) and github.com for pull requests. One tool to learn, not three.

```
1. Start   : Git > Pull                          (get the latest main)
2. Branch  : Git > New Branch  maya/slow-mode    (name/what-it-does)
3. Code    : small change, deploy, test on robot
4. Commit  : Ctrl+K (Cmd+K on Mac), message in the form "Add slow mode on left bumper"
5. Push    : Ctrl+Shift+K
6. PR      : github.com > Compare & pull request, fill the template, assign a reviewer
7. Review  : reviewer asks questions, author answers, fixes, pushes again
8. Merge   : reviewer approves, author clicks "Squash and merge", deletes the branch
9. Repeat  : back to step 1
```

Rules of thumb:
- One branch = one feature. If the PR description needs the word "and", split the PR.
- Commit every time something works. A commit is a save point you can return to.
- Commit messages start with a verb: Add, Fix, Tune, Remove, Rename.
- Never commit code that does not build.
- Robot Wi-Fi has no internet. Push before you join robot Wi-Fi, or deploy over the USB-C cable and stay on school Wi-Fi.
- At each event, tag the exact code that ran: `Git > New Tag  event-2026-12-06-qualifier`, then push tags. If something breaks later, you know what worked.

## 6. Pull request template and review checklist

Save as `.github/pull_request_template.md`:

```markdown
## What does this change do?

## How did you test it on the robot?
- [ ] Builds in Android Studio
- [ ] Deployed and ran on the robot
- [ ] Telemetry shows the values I expected

## AI use
- [ ] No AI used
- [ ] AI used for: (what part, which tool). I explained every line to my reviewer.

## Team rules
- [ ] No threads, no sleep() inside a TeleOp loop
- [ ] Hardware lives in Robot.java, behavior lives in OpModes
- [ ] Hardware names match the robot configuration
- [ ] Robot does not move between INIT and START (rule G304.H)
```

Reviewer job, in this order:
1. Read the description. Does the change match the title?
2. Pick 2 lines and ask "what does this line do and why is it here?" The author answers without looking it up. If the author cannot answer, the PR waits.
3. Check the team rules boxes are true, not just ticked.
4. Pull the branch and drive the robot if the change affects driving or auto.
5. Approve, or request changes with one concrete fix per comment.

## 7. Crash course drills (Module 4, 45 minutes)

Drill A: first pull request (15 min)
- Each pair pushes the Module 3 branches and opens PRs. Partners review each other with the checklist above. Mentor approves the first one live on the projector to show the flow.

Drill B: merge conflict (15 min)
- Mentor setup: two students both edit the same line in `MainTeleOp.java`, for example the slow-mode value (0.4 vs 0.3).
- Merge the first PR. GitHub now shows "This branch has conflicts" on the second.
- Fix live on the projector: on the second branch, Git > Merge `origin/main`. Android Studio opens the 3-pane merge tool. Left = yours, right = theirs, middle = result. Pick the right line, build, commit, push. The PR turns green.
- Lesson: conflicts are normal and safe. They mean two people edited the same line. Small PRs and file owners make them rare.

Drill C: undo a mistake (10 min)
- Merge a PR that breaks the build on purpose (mentor-prepared).
- On github.com, open the merged PR and click "Revert". Merge the revert PR. `main` works again and history shows both steps.
- Lesson: nothing in git is lost. Never delete and re-clone to "fix" a problem.

Drill D: issues and the board (5 min)
- Each student creates one issue for the next meeting, assigns themself, and moves the card to "In progress".

## 8. Common failures and fixes

| Symptom | Cause | Fix |
|---|---|---|
| Push rejected | main moved since you pulled | Git > Pull, then push |
| "Protected branch" error | Pushing straight to main | Create a branch and open a PR |
| Gradle sync fails after pull | SDK updated or old Android Studio | Update Android Studio to Narwhal 3 Feature Drop or later. Decline any AGP downgrade |
| Crash at INIT after merge | Config name mismatch | Compare `hardwareMap.get` names with the Driver Hub config |
| Lost code | Worked on main or never committed | Branch first, commit often. Check Git > Show History |
