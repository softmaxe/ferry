# Merging and releasing

The owner tests every change locally before opening a pull request, so pull requests merge without review. Rulesets guard `main` and the release tags instead; this file is the procedure that works within them.

## Merge a pull request

1. Run `gh pr merge <number> --squash --auto`. The squash commit takes the pull request's title and body, so the title must be a Conventional Commit.
2. The merge is done when `gh pr view <number> --json state --jq .state` prints `MERGED`. While it waits, check `gh pr view <number> --json mergeStateStatus`:
   - `BEHIND`: run `gh pr update-branch <number>`. `main` requires branches to be up to date, and auto-merge does not update them itself.
   - `BLOCKED` with a failing `Build and test`: fix the branch and push; auto-merge stays armed.

## Release a version

Pushing a `v*.*.*` tag runs `.github/workflows/release.yml`, which builds the binary, publishes the GitHub Release, and updates `Formula/ferry.rb` in `softmaxe/homebrew-tap`. The workflow refuses tags that are not on `main` or that differ from `VERSION` in the `Makefile`.

1. Choose the next version with SemVer from the commits since the last tag (`git log --oneline "$(git describe --tags --abbrev=0 origin/main)..origin/main"`): a breaking change bumps major, `feat` bumps minor, anything else bumps patch.
2. Set `VERSION` in the `Makefile` to that version, either in the feature pull request itself or in a pull request titled `chore: release vX.Y.Z`, and merge it as above.
3. Tag the merged commit and push the tag:

   ```bash
   git fetch origin main
   git tag -a vX.Y.Z -m "Release vX.Y.Z" origin/main
   git push origin vX.Y.Z
   ```

4. Watch the run: `gh run watch "$(gh run list --workflow release.yml --event push --limit 1 --json databaseId --jq '.[0].databaseId')" --exit-status`. The release is done when the run is green, `gh release view vX.Y.Z` lists the `.tar.gz` and `.sha256` assets, and `gh api repos/softmaxe/homebrew-tap/contents/Formula/ferry.rb --jq .content | base64 -d` names `vX.Y.Z`.

Release tags and published releases are immutable: a ruleset blocks moving or deleting `v*` tags. When a release run fails, re-run it if the failure was transient (`gh run rerun <run-id> --failed`); otherwise fix forward on `main` and release the next patch version.
