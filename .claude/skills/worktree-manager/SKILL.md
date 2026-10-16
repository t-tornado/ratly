---
name: worktree-manager
description: Create or remove git worktrees in the worktrees/ directory. Creates a worktree from an existing branch or creates a new branch first, installs dependencies, and sets the working directory. Handles cleanup — removes the worktree from both git tracking and disk. Use when the user says "create a worktree", "new worktree", "delete worktree", "remove worktree", or wants to work on a feature branch in isolation without touching main.
---

# Worktree Manager

## Create

1. **Determine branch** — If user provides a branch name, use it. Otherwise ask.
   - If branch exists: use it directly
   - If branch is new: create from main (follow `.claude/rules/branching.md` for naming)

2. **Create worktree** — Run:
   ```bash
   # existing branch
   git worktree add worktrees/<branch-name> <branch>

   # new branch
   git worktree add -b <branch> worktrees/<branch-name> main
   ```
   Use the branch name (with `/` replaced by `-`) as the worktree folder name.

3. **Install dependencies** — Run from worktree root:
   ```bash
   cd <repo-root>/worktrees/<branch-name> && pnpm install
   ```

4. **Set working directory** — All subsequent file operations target the worktree path.

5. **Report** — Confirm worktree location and branch to the user.

## Remove

1. **Identify worktree** — If user names it, use it. Otherwise run `git worktree list` and ask.

2. **Check for uncommitted work** — Run `git status` in the worktree.
   - If dirty: warn the user and ask to confirm before proceeding.
   - If clean: proceed.

3. **Remove** — Run:
   ```bash
   git worktree remove worktrees/<name>
   ```
   This removes from git tracking and deletes the directory.

4. **Verify** — Run `git worktree list` to confirm removal.

## Rules
- All worktrees live in `worktrees/` at repo root (gitignored)
- Never create worktrees inside `apps/` or `src/`
- Always check for uncommitted changes before removing
- Follow `.claude/rules/branching.md` for any new branch names
