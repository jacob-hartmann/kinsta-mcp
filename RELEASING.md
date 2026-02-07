# Releasing `kinsta-mcp`

This repo uses **git tags** to drive releases and publishes to npm under the package name **`kinsta-mcp`**.

## Release notes

### CI (recommended)

The GitHub Actions workflow creates a GitHub Release with **auto-generated release notes**:

- `.github/workflows/release.yml` uses `softprops/action-gh-release` with `generate_release_notes: true`.
- GitHub generates notes from commits / merged PRs since the last release.

You can edit the resulting GitHub Release in the UI after it's created (to add highlights, breaking changes, etc.).

### Manual (optional)

If you're creating a GitHub Release manually, you can generate notes with the GitHub CLI:

```bash
gh release create v0.1.0 --generate-notes
```

Or create it as a draft and edit:

```bash
gh release create v0.1.0 --draft --generate-notes
```

## Changelog

This repo maintains a human-curated `CHANGELOG.md` for users who prefer a stable, version-by-version summary.

Before tagging a release, update:

- `CHANGELOG.md` (move items from `[Unreleased]` into the new version section)

## Versioning + tags

- **Source of truth**: `package.json` `version`
- **Tag format**: `v${version}` (example: `v0.1.0`)
- The GitHub release workflow verifies the tag matches `package.json`:
  - Tag must equal `v$(node -p "require('./package.json').version")`

## Prerelease (RC) release

Use RCs for testing without moving the npm `latest` tag.

### Commands (RC)

```bash
git switch main
git pull --ff-only

# bump version, create commit + tag (creates tag v0.1.0-rc.N)
pnpm version 0.1.0-rc.1 -m "chore(release): v%s"

# push commit + tag
git push origin main
git push origin v0.1.0-rc.1
```

### Publishing behavior

- **CI** publishes prereleases with `--tag rc` (so they do not become `latest`).
- Manual local publish should also use `--tag rc`.

## Stable release

Stable releases should publish as `latest`.

### Commands (stable)

```bash
git switch main
git pull --ff-only

pnpm version 0.1.0 -m "chore(release): v%s"

git push origin main
git push origin v0.1.0
```

## Manual publish to npm (local machine)

Use this if you want to publish once manually before fully trusting CI.

### 1) Build + validate locally

```bash
pnpm install
pnpm run check
pnpm run build
```

### 2) Preview the tarball contents (no upload)

`pnpm pack` does not support `--dry-run`. Use npm:

```bash
npm pack --dry-run
```

### 3) Login + publish

```bash
npm adduser
npm whoami
```

Prerelease:

```bash
npm publish --tag rc --access public
```

Stable:

```bash
npm publish --access public
```

If your npm account requires an OTP for publish, add `--otp=123456`.

## CI publish (GitHub Actions)

Releases are triggered by pushing a tag matching `v*.*.*`.

Workflow: `.github/workflows/release.yml`

High-level behavior:

- Installs dependencies (with scripts disabled), rebuilds required tooling, runs tests, builds `dist/`
- Generates `sbom.cyclonedx.json` and attaches it to the GitHub Release
- Publishes with **Trusted Publishing / OIDC**
- Uses `--ignore-scripts` to avoid running `prepublishOnly` again during publish
- Uses `--tag rc` when `package.json` contains a prerelease (version includes `-`)

## If a release fails

- **Do not reuse the same version number**. Bump to the next prerelease (e.g. `rc.2`) and push a new tag.
- Avoid deleting and re-pushing tags unless you have a strong reason (it breaks provenance/history and can confuse consumers).

## Safety notes

- Never commit `.env` or secrets.
- If you accidentally paste or leak a Kinsta API key, revoke it immediately in MyKinsta under Company settings > API Keys.
