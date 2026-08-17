# GitHub rulesets

Recommended repository rulesets for [EmadHelmi/BiDiSense](https://github.com/EmadHelmi/BiDiSense).
Apply them under **Settings → Rules → Rulesets**.

## What the current Master Protection ruleset gets right

- `pull_request` blocks direct pushes to `master`. That is the rule that makes merge the only path onto the default branch.
- `deletion` and `non_fast_forward` stop `master` from being deleted or force-pushed.
- `required_signatures` matches the GPG key for `s.emad.helmi@gmail.com`.

## What to change

### 1. Empty `bypass_actors` plus required reviews will deadlock a solo repo

`required_approving_review_count: 1` and `require_code_owner_review: true` mean **the pull request author cannot approve their own PR**. With `bypass_actors: []`, even the repository owner cannot merge.

Add an **Admin** bypass that still requires a pull request (so nobody can push straight to `master`):

```json
"bypass_actors": [
  {
    "actor_id": 5,
    "actor_type": "RepositoryRole",
    "bypass_mode": "pull_request"
  }
]
```

`bypass_mode: "always"` would allow direct pushes. Do not use it.

### 2. Linear history conflicts with merge commits

`required_linear_history` rejects merge commits. The current ruleset also allows `"merge"` in `allowed_merge_methods`. Pick one:

- **Recommended:** keep linear history and allow only `squash` and `rebase`.
- Keep merge commits and **remove** `required_linear_history`.

### 3. Code owners

`require_code_owner_review: true` needs `.github/CODEOWNERS`. This repository includes one (`* @EmadHelmi`). Combined with the Admin PR bypass above, the owner can merge their own PRs; other contributors still need a code-owner review.

### 4. Branch names are not enforced by the master ruleset

`branch_name_pattern` on a ruleset that only targets `refs/heads/master` would try to rename `master` itself. Use a **second** ruleset on all branches except `master` (see below). CI also rejects misnamed PR heads.

### 5. Optional hardening after CI exists

Once `.github/workflows/ci.yml` has run at least once on `master`, add `required_status_checks` for the `Check` job so a red PR cannot merge.

## Recommended: Master Protection

Replace the existing ruleset with:

```json
{
  "name": "Master Protection",
  "target": "branch",
  "source_type": "Repository",
  "enforcement": "active",
  "conditions": {
    "ref_name": {
      "exclude": [],
      "include": ["refs/heads/master"]
    }
  },
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    { "type": "required_linear_history" },
    { "type": "required_signatures" },
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 1,
        "dismiss_stale_reviews_on_push": true,
        "required_reviewers": [],
        "require_code_owner_review": true,
        "require_last_push_approval": false,
        "required_review_thread_resolution": true,
        "allowed_merge_methods": ["squash", "rebase"]
      }
    }
  ],
  "bypass_actors": [
    {
      "actor_id": 5,
      "actor_type": "RepositoryRole",
      "bypass_mode": "pull_request"
    }
  ]
}
```

## Recommended: Branch naming

Create a second ruleset. Target **all branches**, exclude `master`:

```json
{
  "name": "Branch naming",
  "target": "branch",
  "source_type": "Repository",
  "enforcement": "active",
  "conditions": {
    "ref_name": {
      "include": ["~ALL"],
      "exclude": ["refs/heads/master"]
    }
  },
  "rules": [
    {
      "type": "branch_name_pattern",
      "parameters": {
        "name": "type/NNN-description",
        "negate": false,
        "operator": "regex",
        "pattern": "^(feat|fix|bugfix|imp|docs|chore|refactor|test|ci|perf|hotfix)/[0-9]{3}-[a-z0-9]+(-[a-z0-9]+)*$"
      }
    }
  ],
  "bypass_actors": []
}
```

Valid examples: `feat/001-repo-foundation`, `bugfix/014-preview-lists`, `imp/003-agent-tables`.
