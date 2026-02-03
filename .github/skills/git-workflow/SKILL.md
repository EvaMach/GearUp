---
name: 'git-workflow'
description: 'Structured git workflow for feature development including branching, committing, and PR preparation'
---

# Git Workflow Skill

## Purpose

Guides developers through a consistent git workflow for feature development, bug fixes, and updates in the GearUp project.

## Workflow Steps

### 1. Create Feature Branch

```bash
git checkout main
git pull origin main
git checkout -b feature/descriptive-name
```

Branch naming conventions:

- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates

### 2. Make Incremental Commits

- Commit logical units of work
- Use clear, descriptive commit messages
- Follow conventional commits format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example:

```bash
git add src/components/gearListForm.tsx
git commit -m "feat(gear-list): add filtering by gear category"
```

### 3. Keep Branch Updated

```bash
git checkout main
git pull origin main
git checkout feature/your-branch
git merge main
# Resolve conflicts if any
```

### 4. Pre-PR Checklist

- [ ] Run linter: `npm run lint`
- [ ] Build successfully: `npm run build`
- [ ] Test locally: `npm run dev`
- [ ] Review all changes: `git diff main`
- [ ] Update documentation if needed
- [ ] Commit message follows conventions

### 5. Push and Create PR

```bash
git push origin feature/your-branch
```

Then create a Pull Request on GitHub with:

- Clear title describing the change
- Description of what was changed and why
- Screenshots/videos for UI changes
- Link to related issues

### 6. Address Review Feedback

```bash
# Make requested changes
git add .
git commit -m "fix: address PR feedback - update validation logic"
git push origin feature/your-branch
```

## Best Practices

- Keep commits atomic (one logical change per commit)
- Write descriptive commit messages
- Avoid committing sensitive data or credentials
- Don't commit `node_modules/` or build artifacts
- Keep feature branches short-lived
- Squash commits if needed before merging
