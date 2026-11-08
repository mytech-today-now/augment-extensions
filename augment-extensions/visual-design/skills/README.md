# Visual Design Skills

These module-local skill documents use the repository skill frontmatter format and are read as module files with augx show. The current augx skill list scans the repository-level skills directory only, so these files are indexed here and from rules/index.md.

| Skill | Use it for |
|---|---|
| [Design brief](design-brief.md) | Turn a user or product goal into a testable design direction |
| [Design review](design-review.md) | Review a design or implementation and create actionable findings |
| [Responsive validation](responsive-validation/SKILL.md) | Run the broad CSS viewport sweep and review boundary behavior |

The responsive runner is at skills/responsive-validation/scripts/responsive-sweep.cjs. It uses the caller application's existing Playwright installation when available. This module does not add a browser dependency.
