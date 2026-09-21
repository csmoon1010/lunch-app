---
name: release-task
description: Use this skill when the user asks to finish or release the current git task by updating the current branch from its remote tracking branch, running the full test suite, committing only after verification succeeds, and pushing the commit to the remote branch.
---

# Release Task

## Origin

This curated skill was created by AI Lab.

## Overview

Use this skill to complete a git-backed task safely. The workflow updates the current branch from remote, verifies the complete project test suite, then commits and pushes only when the worktree is in a healthy state.

## Required Workflow

1. Inspect repository state.
   - Run `git status --short --branch`.
   - Identify the current branch and its upstream with `git rev-parse --abbrev-ref HEAD` and `git rev-parse --abbrev-ref --symbolic-full-name @{u}`.
   - Stop and ask the user how to proceed if the repository has no upstream branch, is in a detached HEAD state, or has unresolved conflicts.

2. Protect existing local changes.
   - Treat any pre-existing uncommitted changes as user work.
   - Do not revert, discard, or overwrite changes unless the user explicitly asks.
   - If unrelated changes are present, keep the final commit scoped to the files that satisfy the current task.

3. Update from the remote tracking branch.
   - Run `git fetch --prune`.
   - Prefer `git pull --ff-only` to update the current branch without creating an implicit merge commit.
   - If the branch has diverged from upstream or the pull cannot proceed cleanly because of local changes, stop and explain the situation before choosing a rebase, merge, stash, or conflict-resolution path.
   - When the task must be reflected onto the repository's default integration branch, use the local `main` or `master` branch first; do not treat `origin/main` or `origin/master` as a substitute for updating the corresponding local branch.
   - Resolve the default integration branch as `main` or `master` from the local branch list, `origin/HEAD`, or repository documentation. If neither branch can be resolved confidently, stop and ask the user which branch to use.
   - Before updating or reflecting changes onto that branch, compare the local branch with its remote tracking branch, for example `git rev-list --left-right --count main...origin/main` or `git rev-list --left-right --count master...origin/master`.
   - If the local integration branch is only behind its remote tracking branch, fast-forward the local branch first with an explicit local-branch update such as `git switch main && git pull --ff-only` or `git switch master && git pull --ff-only`.
   - If the local and remote integration branches differ in any non-trivial way, such as local-only commits, divergence, a missing remote tracking branch, or an unexpected `origin/HEAD`, do not force an update and do not push directly to the remote integration branch. Stop and present the user with choices such as inspecting the commits, fast-forwarding the local branch, merging, rebasing, or selecting a different target branch.

4. Run the full test suite.
   - Prefer the repository's documented full-test command from `README`, package scripts, build files, CI config, or existing conventions.
   - If no full-test command is documented, infer the best comprehensive verification command from the project stack and tell the user what was used.
   - Do not commit or push if tests fail. Report the failing command and the most relevant failure summary, then fix the issue if it is within scope.

5. Review and commit.
   - Inspect `git status --short` and `git diff --stat`.
   - Review the staged or intended diff before committing.
   - Stage only the files that belong to the completed task.
   - If a project-specific commit-message policy skill exists, use it before creating the commit.
   - Create the commit only after the remote update and full tests both succeed.

6. Push the current branch.
   - Push to the branch's configured upstream with `git push`.
   - If the push is rejected because the remote moved, fetch again and repeat the safe update, test, commit/push decision path.
   - Never force-push unless the user explicitly requests it and understands that remote history may be rewritten.

## Reporting

In the final response, include:

- The branch and upstream that were updated.
- The full-test command that ran and whether it passed.
- The commit hash and commit title, if a commit was created.
- The push destination.
- Any skipped step, blocker, or unresolved risk.
