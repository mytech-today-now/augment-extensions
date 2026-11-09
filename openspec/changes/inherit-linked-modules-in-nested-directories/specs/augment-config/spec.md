## ADDED Requirements

### Requirement: Nested Linked-Module Configuration

The augx CLI MUST resolve linked-module state from the nearest ancestor .augment/extensions.json within the current Git repository when invoked from a nested directory.

#### Scenario: Inherit parent links from a nested directory

- GIVEN the current directory has no .augment/extensions.json
- AND an ancestor within the same Git repository has a valid manifest
- WHEN a linked-module command runs
- THEN it MUST read or update the nearest ancestor manifest

#### Scenario: Prefer a nested copy's local manifest

- GIVEN the current directory or a nested ancestor has its own manifest
- AND a higher ancestor also has a manifest
- WHEN a linked-module command runs
- THEN it MUST use the nearest manifest

#### Scenario: Do not inherit across repository boundaries

- GIVEN the current Git repository has no Augx manifest
- AND a parent directory outside that repository has a manifest
- WHEN a linked-module command runs
- THEN it MUST report no linked modules and MUST NOT read the outside manifest

#### Scenario: Keep uninitialized-directory behavior

- GIVEN the current directory has no manifest in its ancestry within the repository
- WHEN a command needs a config path for initialization
- THEN it MUST use the current directory as its fallback root
