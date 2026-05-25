### Live Task Context via Beads MCP

This project exposes its task tracker through the **Beads MCP server**.
For any task-related context (open tasks, dependencies, status, blocked items),
query the MCP server directly rather than relying on static rules.

**Server id**: `beads`

**Common operations**:

- `tasks/list` - enumerate open tasks
- `tasks/get` - fetch a specific task by id
- `dependencies/list` - blockers / blocked-by graph
- `status/get` - current status of a task

**Reference**: `augment-extensions/workflows/beads/` for full command guide.

Do NOT assume task state from prose in this file - this file contains no
live task data by design.
