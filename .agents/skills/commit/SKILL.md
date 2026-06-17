# Commit Skill

Stage and commit recent code changes with a well-crafted commit message.

## When to Use

- After completing a task or logical chunk of work
- User says "commit", "commit that", or invokes `/commit`
- User wants to save progress on current changes

## How It Works

1. Run `git status` (never use `-uall`) and `git diff` (staged + unstaged) and `git log --oneline -5` in parallel
2. Analyze all changes — understand what was modified and why
3. Stage the relevant changed files by name (never use `git add -A` or `git add .`)
4. Do NOT stage files that may contain secrets (`.env`, credentials, tokens, etc.) — warn if found
5. Draft a concise commit message (1-2 sentences) that focuses on the **why** not the **what**
6. Present the commit message and list of staged files to the user for approval
7. Only run `git commit` after receiving explicit approval
8. Run `git status` after commit to verify success

## Commit Message Format

Use a HEREDOC to preserve formatting:

```bash
git commit -m "$(cat <<'EOF'
Commit message here
EOF
)"
```

## Rules

- Never push to remote unless explicitly asked
- Never amend previous commits unless explicitly asked
- Never use `--no-verify` or skip hooks unless explicitly asked
- Never use interactive git flags (`-i`)
- If a pre-commit hook fails, fix the issue and create a NEW commit (do not amend)
- Match the commit message style of recent commits in the repo
