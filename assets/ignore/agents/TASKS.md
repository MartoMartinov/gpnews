# AGENTIC TASKS

## feature-builder

description: Implements new features on isolated branches. Writes code, runs tests, commits changes.
tools: read, write, bash, edit
isolation: worktree
model: claude-sonnet-4-6

### Instructions
- When using this feature builder, you will need to write code, run tests, and commit changes to the repository.
- Always start by setting up an isolated git worktree so the main working tree is never disturbed:
  - Worktree path: `..\{{project_name}}-agent-<name>` (sibling of the main repo folder)
  - If the branch does not exist yet: `git worktree add -b dev-agent-<name> ..\{{project_name}}-agent-<name> dev-marto`
  - If the branch already exists: `git worktree add ..\{{project_name}}-agent-<name> dev-agent-<name>`
  - All file edits and tool calls must then target the worktree path, not the main repo.
- if you see john, jack, bob, jason, mark or any other common name in the instructions. Replace name to that name as branch name. So instead of dev-agent-name you get dev-agent-john or whatever name is used.
- If i say finish or commit changes: commit all changes inside the worktree, merge the branch into dev-marto (fast-forward if possible), then remove the worktree: `git worktree remove ..\{{project_name}}-agent-<name>`
- If i say remove or delete: discard all changes, remove the worktree (`git worktree remove --force ..\{{project_name}}-agent-<name>`), and delete the branch (`git branch -D dev-agent-<name>`).

### Permissions

- Run git worktree commands directly without asking for confirmation. Do not prompt before running `git worktree add`, `git worktree remove`, or related branch commands.
- On Windows, always use PowerShell syntax. Use these exact patterns:
  - Create new branch in worktree: `git worktree add -b dev-agent-<name> ..\{{project_name}}-agent-<name> dev-marto`
  - Reuse existing branch in worktree: `git worktree add ..\{{project_name}}-agent-<name> dev-agent-<name>`
  - Remove worktree: `git worktree remove ..\{{project_name}}-agent-<name>`
  - Never use `git checkout` to switch the main working tree branch.

### Serve content
- When I say "serve <name>" (e.g. "serve john", "serve jack"), extract the name (lowercase it).
- The name maps to branch `dev-agent-<name>` and worktree path `..\{{project_name}}-agent-<name>` (e.g. "serve john" → branch `dev-agent-john` → worktree `C:\Users\twrkh\Projects\{{project_name}}-agent-john`).
- Use PowerShell to launch the dev server from that worktree: `Set-Location ..\{{project_name}}-agent-<name>; npm start`
- `npm start` maps to `ionic serve`, which serves the app at `http://localhost:8100` and opens it in the browser automatically.
- Do NOT run the server from the main working tree — always target the named worktree path.
- If the worktree or branch `dev-agent-<name>` does not exist, tell the user it is not set up yet.
- If say finish or remove or delete, remove the worktree (`git worktree remove --force ..\{{project_name}}-agent-<name>`), and delete the branch (`git branch -D dev-agent-<name>`) and stop the server on it.

## refactor-worker

description: Refactors existing code for readability and performance. Works on isolated branches.
tools: read, write, bash, edit
isolation: worktree
model: claude-sonnet-4-6

## Report-writer

description: Creates analysis of the current codebase and if instructed creates a report.
tools: read, edit, write, bash, web_search, web_fetch

- when i say save the report or save the analysis i want you to save it as md file in root folder of the project in folder assets/reports

## researcher

description: Researches libraries, APIs, patterns, and best practices from the web.
tools: read, web_search, web_fetch


## changelog-writer

description: Generates release notes and changelogs from git history and PRs.
tools: read, bash, web_fetch
model: claude-haiku-4-5
