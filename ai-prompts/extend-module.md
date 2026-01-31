# JIRA Ticket: AUG-XXX - Enhance File Tracking and Association in Module for OpenSpec and Bead Integration

## Summary
Refactor the module's file management system to provide explicit, structured tracking of extended/generated files and their relationships to core entities (documents, files, beads, OpenSpec specifications, and bead tasks). Ensure traceability across all phases of project execution in a manner consistent with existing OpenSpec and Bead patterns.

## Description
The current module lacks robust mechanisms to associate extended or AI-generated files with their originating entities and execution context. This makes it difficult to maintain audit trails, reproduce outputs, debug issues, or navigate complex blog-writing projects that span multiple documents, specifications, and bead tasks.

The goal of this ticket is to refactor the module's file handling logic to introduce explicit ownership and provenance tracking, mirroring the traceability already provided by OpenSpec specifications and Bead task decomposition.

### Key Objectives
- Enable bidirectional or queryable associations between generated/extended files and the entities that produced or own them (e.g., a specific OpenSpec spec, a bead task, a source document, or a project phase).
- Support tracking of files across the full lifecycle of a project: planning (OpenSpec), decomposition (Bead tasks), execution (AI generation), and review/output.
- Maintain consistency with existing OpenSpec and Bead conventions for entity identification, metadata storage, and file referencing.
- Ensure the implementation is extensible, performant, and does not introduce unnecessary complexity or redundancy.

### Requirements
1. **Entity-File Association Model**
   - Define a clear data model (e.g., JSON manifest, database entries, JSONL or in-file metadata) that records:
     - File path/identifier
     - Owning entity type (e.g., `openspec`, `bead`, `document`, `project_phase`)
     - Owning entity ID (unique identifier from OpenSpec or Bead system)
     - Parent/child relationships where applicable (e.g., a generated outline file belongs to a bead task that belongs to an OpenSpec spec)
     - Timestamp of creation/modification
     - Optional tags or phase indicators (e.g., `draft`, `review`, `final`)
   - Support many-to-many relationships where a single file may be relevant to multiple entities.

2. **Integration with OpenSpec**
   - Each OpenSpec specification must be able to declare or automatically register the set of files it directly owns or influences.
   - Generated files produced during spec execution (e.g., intermediate markdown drafts) must be linked back to the spec.

3. **Integration with Bead Tasks**
   - Every bead task must maintain a list of input files, output files, and any intermediate/extended files it generates or modifies.
   - Provide utility functions for beads to register/unregister files during execution.

4. **Project and Phase Level Tracking**
   - At the project level, provide aggregated views or queries that list all files associated with a given phase (e.g., "planning", "content-generation", "editing", "publishing").
   - Support filtering by document, spec, or bead.

5. **API and Utility Enhancements**
   - Expose clear, well-documented functions for:
     - Registering a file under one or more entities
     - Querying files by entity
     - Listing all files for a project/phase
     - Cleaning up or orphaning files when entities are deleted
   - Ensure backward compatibility where possible; existing workflows must continue to function.

6. **Persistence and Reliability**
   - Tracking data must be persisted alongside the repository (e.g., in a `.augment/` metadata directory or embedded in relevant files).
   - Avoid reliance on in-memory state that would be lost across VS Code sessions or Augmentcode restarts.

### Acceptance Criteria
- [ ] A new or refactored metadata structure exists that reliably records file-entity associations.
- [ ] All bead tasks automatically register their output and intermediate files with correct ownership.
- [ ] OpenSpec specifications can list all files they own or influenced after execution.
- [ ] Users can query (via CLI or Augmentcode command) all files belonging to a specific bead, spec, document, or project phase.
- [ ] No regression in existing blog-writing workflows.
- [ ] Unit/integration tests cover registration, querying, and cleanup scenarios.
- [ ] Documentation updated to describe the new tracking capabilities and any required changes to custom beads or specs.

## Epic Link
Augmentcode Core – Traceability and Provenance Enhancements

## Labels
refactor, file-management, openspec, bead, traceability, metadata

## Priority
High

## Story Points
8