# Contributing

Thanks for helping with BiDiSense. Changes land on `master` only through a pull request. Direct pushes, force-pushes, and deleting `master` are blocked.

Please read [docs/github-rulesets.md](docs/github-rulesets.md) if you maintain repository rules.

## Ground rules

- One concern per pull request.
- Keep `cursor.js` a single pasteable DevTools snippet.
- Re-running a snippet must clean up previous observers, listeners, and injected styles.
- Code blocks and editor UI stay LTR. Direction is detected per surface (agent message, user history, live prompt, markdown preview, lists, tables).
- Bump `@version` in the snippet header when behavior changes.

## Branch names

```
<type>/<NNN>-<kebab-description>
```

| Piece | Rule | Example |
| --- | --- | --- |
| `type` | `feat`, `fix`, `bugfix`, `imp`, `docs`, `chore`, `refactor`, `test`, `ci`, `perf`, `hotfix` | `feat` |
| `NNN` | 3-digit increment, unique among open branches | `001` |
| `description` | lowercase kebab-case | `smart-preview` |

Valid: `feat/001-repo-foundation`, `bugfix/014-preview-lists`

Invalid: `feature/foo`, `feat/1-foo`, `Feat/001-Foo`

```bash
git fetch origin
git checkout master
git pull --ff-only origin master
git checkout -b feat/002-short-description
```

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/): `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`, `perf`.

Every commit must be **GPG-signed** as `Emad Helmi <s.emad.helmi@gmail.com>` (key `D5989ED9D348AA77`). GitHub only shows **Verified** when the committer email matches a uid on that key. Signing with this key while the committer is `emad.helmi@tabdeal.org` is treated as unverified and the `required_signatures` rule rejects the PR.

```bash
git -c user.name="Emad Helmi" \
    -c user.email="s.emad.helmi@gmail.com" \
    -c user.signingkey=D5989ED9D348AA77 \
    -c commit.gpgsign=true \
    commit -S
```

Do not rewrite published history. Prefer squash or rebase when merging so `master` stays linear.

## Pull requests

1. Push the topic branch. Do not push `master`.
2. Open a PR against `master`.
3. Fill in `.github/pull_request_template.md`.
4. Wait for CI (syntax check + branch-name check) to pass.
5. Request a review. Code owners are listed in `.github/CODEOWNERS`.
6. Merge with **squash** or **rebase** (merge commits are not allowed while linear history is required).

## Stargazer chart

Do not embed `starchart.cc` or `star-history.com`. GitHub no longer allows the public stargazers *list* API, so those services rate-limit or return an error in the README.

Refresh the in-repo charts from the public star **count**:

```bash
python3 scripts/star_history.py
```

Commit the updated `media/stargazers.json` and `media/stargazers-*.svg` files in the same PR.

## Testing a snippet

1. Open Cursor → **Help → Toggle Developer Tools**.
2. **Sources → Snippets → New snippet**, paste `cursor.js`, save, and **Run**.
3. Confirm:
   - Mixed Persian/Arabic + English Agent replies flip per message.
   - The live prompt follows the script you are typing.
   - Markdown Preview lists and tables follow the document.
   - Fenced code stays left-to-right.
   - Running the snippet a second time does not duplicate observers (check the console banner once).

## License

By contributing, you agree that your work is released under the [MIT License](LICENSE).
