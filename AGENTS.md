# Upstream first

For feature changes, updates, and bug investigation or fixes:

1. First inspect how upstream yabai designs and implements the relevant behavior,
   including related changes and fixes.
2. Prefer reusing or adapting the upstream approach.
3. Write a custom implementation only when upstream cannot meet the requirements,
   and briefly explain why.

# Validation and delivery

- Before merging, read the current branch rules and wait for required checks on
  the latest revision. Proceed once those checks and other merge requirements
  pass; optional checks may finish asynchronously. Investigate known failures.
- For changes to window movement or Space focus, also run `make test-follow` on
  a local desktop with Accessibility and two normal Spaces. If that environment
  is unavailable, report the missing validation explicitly.
- Use PR CI for routine iteration. Create release tags only when a release is
  requested; batch changes into a usable version.
