# Inherit Linked Modules in Nested Directories

## Why

Augx currently reads linked-module state from the command's exact working directory. Running it from a nested copy therefore reports no linked modules even when the parent repository has a manifest.

## What Changes

- Resolve the nearest ancestor extensions manifest inside the current Git repository.
- Use that project root consistently for linked-module reads, links, updates, exports, cleanup, and lifecycle commands.
- Keep a nested manifest as an explicit override, and keep the current directory as the fallback when no ancestor manifest exists.

## Capabilities

- Affected capability: augment-config

## Compatibility

Existing projects with a manifest in the command's current directory keep using that manifest. A nested directory without its own manifest inherits the parent repository's linked modules.

The implementation does not copy module manifests into nested directories.
