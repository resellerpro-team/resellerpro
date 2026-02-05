# 🧭 Git Branching & Team Workflow (Official)

## 📌 Purpose
This document defines the standard Git workflow for our team to avoid daily conflicts, rebase issues, and broken merges.

👉 **Everyone must follow this.**

---

## 🌳 Branch Structure

```
main → Production (protected)
│
└── dev → Integration branch (protected)
    │
    ├── feature/signup-ui
    ├── feature/notification
    ├── bugfix/login-otp
    └── ui/dashboard-layout
```

### ✅ Rules
- `main` and `dev` are **long-living branches**
- All `feature/*`, `bugfix/*`, `ui/*` branches are **temporary**
- ❌ **Never push directly** to `main` or `dev`

---

## 🧑‍💻 Branch Naming Convention

**✅ Use this format:** `<type>/<description>`

### ✔ Allowed types
- `feature/`
- `bugfix/`
- `ui/`
- `chore/`
- `hotfix/`

### ✅ Good examples
- `feature/signup-ui`
- `feature/notification`
- `bugfix/otp-validation`
- `ui/dashboard-sidebar`

### ❌ Avoid
- `rashid`
- `test1`
- `feat\notification`
- `signup-new`

⚠️ **Always use `/` (forward slash), never `\`**

---

## 🔁 DAILY WORKFLOW (MANDATORY)

### ☀️ Morning – Sync with team

```bash
git checkout dev
git pull origin dev
```

✅ Safe  
✅ No rebase  
✅ No conflicts

### 🔧 Start or continue your task

```bash
git checkout feature/<your-branch>
```

### 🔄 Update your feature branch with latest dev

```bash
git merge dev
```

🚨 **THIS STEP IS REQUIRED**

❌ Do **NOT** run `git pull` on feature branches  
❌ Do **NOT** use `rebase`

### 💾 Commit your work

```bash
git add .
git commit -m "feat: short clear message"
```

📌 **Commit small & often**

### 🚀 Push your branch

```bash
git push origin feature/<your-branch>
```

Then open a Pull Request: `feature/*` → `dev`

---

## 🔁 BEFORE OPENING A PR (VERY IMPORTANT)

Your branch **must be up to date** with `dev`.

```bash
git checkout dev
git pull origin dev
git checkout feature/<your-branch>
git merge dev
```

❗ **PRs that are not up to date will be rejected.**

---

## 🔀 MERGE FLOW

```
feature/* → dev → main
```

❌ **Never merge feature branches directly into `main`.**

---

## 🗑️ AFTER MERGE (CLEANUP REQUIRED)

Once your PR is merged:

```bash
git checkout dev
git branch -d feature/<your-branch>
git push origin --delete feature/<your-branch>
git fetch --prune
```

✅ Keeps repo clean  
✅ Avoids stale branches  
✅ Prevents confusion

---

## 🚫 STRICT RULES (NO EXCEPTIONS)

❌ No `git pull` on feature branches  
❌ No `rebase`  
❌ No generated files in Git (build, sw.js, sitemap, etc.)  
❌ No long-living personal branches  
❌ No force push on shared branches

---

## 🧠 WHY THIS WORKFLOW WORKS

| Problem | Solution |
|---------|----------|
| Daily merge conflicts | Merge `dev` into feature daily |
| Rebase loops | No rebase, no pull on feature |
| Confusing PRs | One feature per branch |
| Broken history | Protected `dev` & `main` |

---

## 📌 ONE-LINE RULE (REMEMBER THIS)

**Pull only on `dev`. Merge `dev` into feature branches. Delete branches after merge.**

---

## 🔐 Recommended GitHub Settings

- Protect `main` and `dev`
- Require Pull Requests
- Require branch to be up-to-date before merge
- Enable auto-delete branch after merge

---

## ✅ Final Note

This workflow is designed to:

- Reduce conflicts
- Keep Git history clean
- Make PRs easy to review
- Scale smoothly as the team grows

🚀 **If everyone follows this, 80–90% of Git issues disappear.**