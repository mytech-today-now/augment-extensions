# Versioning

The root `VERSION` file is the authoritative workspace version. Use semantic versioning for releases:

- **Major**: incompatible changes to the public CLI or package behavior.
- **Minor**: backward-compatible commands, options, capabilities, or other features.
- **Patch**: backward-compatible fixes and documentation-only corrections.
- **Prerelease**: a release candidate or other explicitly unstable build, such as `3.5.0-rc.1`.

The optional Jev onboarding added after 3.4.0 is backward-compatible, so the release version is 3.5.0.

## Synchronized files

After changing `VERSION`, synchronize these package metadata fields:

- `package.json` `version`
- `package-lock.json` top-level `version`
- `package-lock.json` `packages[""].version`

The sync command does not update module manifests, dependency versions, or generated CLI files. It does not install dependencies, resolve the package tree, or stage, commit, tag, or push Git changes.

## Workflow

Preview the synchronization before writing:

```bash
pnpm run version:sync:dry-run
```

Run `pnpm run version:sync` in an interactive terminal to review and confirm changes. In non-interactive release automation, use:

```bash
pnpm run version:sync:force
```

The force variant writes only the supported package version fields and never commits, tags, or pushes.
