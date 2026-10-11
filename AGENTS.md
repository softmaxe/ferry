# Upstream first

For feature changes, updates, and bug investigation or fixes:

1. First inspect how upstream yabai designs and implements the relevant behavior,
   including related changes and fixes.
2. Prefer reusing or adapting the upstream approach.
3. Write a custom implementation only when upstream cannot meet the requirements,
   and briefly explain why.

## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues for `softmaxe/ferry`, via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five default triage labels, each label string matching its role name. See `docs/agents/triage-labels.md`.

### Merging and releasing

Merging a pull request or publishing a release follows `docs/agents/merge-and-release.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
