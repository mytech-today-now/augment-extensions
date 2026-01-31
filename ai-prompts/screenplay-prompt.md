# JIRA Ticket: AUG-9013 - Develop Screenplay Writing and Crafting Standards Augment Extension

### Summary
Create a new Augment extension (based on the Augment framework at https://github.com/mytech-today-now/augment) focused on screenplay writing and crafting standards. This extension will guide the Augmentcode AI in applying best practices and maintaining a high level of professionalism across various screenplay formats, including AAA Hollywood films, independent films, TV series, web content, news broadcasts, commercials, streaming content, live TV productions, and others. The extension should allow users to select specific screenplay categories for tailored guidance, with universal rules applied where appropriate, recognizing that most projects utilize a single primary category while supporting extensibility for multiple categories if needed. The module will enforce strict page layout parameters, provide solutions for file handling in VS Code, organize parameters and content, and handle character development programmatically, while incorporating guidelines for plot development, tropes, screen continuity, 'save the cat' moments, and restorative three-act narratives as contextually relevant.

### Description

#### Background
The Augment framework enables the creation of extensions that enhance AI-driven code generation and development processes within VS Code, integrated with repositories. This ticket involves developing an extension specifically for screenplay-related tasks, leveraging Augmentcode AI to ensure outputs adhere to industry best practices, formatting standards, narrative conventions, creative guidelines, and professional writing principles. The extension integrates with OpenSpec for specification generation and beads for task decomposition, enabling users to craft high-quality screenplays that conform to category-specific norms while allowing contextual deviations where artistically justified.

The extension must draw from established standards such as:
- Formatting guidelines from the Academy of Motion Picture Arts and Sciences (AMPAS) Nicholl Fellowships, including 12-point Courier font, 1-inch margins, scene headings in all caps, action lines left-aligned, character names centered, dialogue indented, parentheticals, transitions, and page numbering.
- Narrative structures like Syd Field's Paradigm, Blake Snyder's Beat Sheet ('Save the Cat'), Joseph Campbell's Hero's Journey, and Aristotle's Poetics adapted for modern media.
- Genre-specific conventions: Tropes from TV Tropes database, continuity rules from American Society of Cinematographers (ASC), character arc models from Robert McKee's 'Story' and Lajos Egri's 'The Art of Dramatic Writing'.
- Contextual flexibility: Rules for breaking conventions (e.g., fourth-wall breaks in meta-narratives or news broadcasts), with machine-readable parameters to toggle adherence or deviation based on project intent.
- Programmatic handling: JSON/YAML schemas for character profiles (traits, arcs, motivations), plot outlines (acts, beats, turning points), and trope inventories (existing vs. novel).

Universal guidelines should include consistent scene structuring, pacing (approximately 1 page per minute), conflict escalation, thematic coherence, diversity/inclusion considerations (e.g., Bechdel Test compliance), revision tracking, and export options to industry-standard formats like Final Draft (.fdx) or Fountain markup.

#### Key Requirements
- **Modular Structure**: Design the extension to be modular, with separately loadable subsections for screenplay categories, allowing users to activate rulesets via configuration in VS Code or repo settings.
- **User Selection Mechanism**: Implement a user-friendly interface or configuration file (e.g., JSON or YAML) where developers can specify the screenplay category(ies) for the project. Default to universal rules, with category-specific overrides and conflict detection/resolution.
- **Comprehensive Coverage**:
  - **AAA Hollywood Films**: Guidelines for high-budget blockbusters, emphasizing spectacle, ensemble casts, multi-threaded plots, visual effects integration, and franchise potential.
  - **Independent Films**: Rules for low-budget storytelling, character-driven narratives, experimental structures, festival appeal, and authentic dialogue.
  - **TV Series**: Best practices for episodic arcs, season-long threads, cliffhangers, ensemble dynamics, and pilot-to-finale progression.
  - **Web Content**: Techniques for short-form videos, viral hooks, platform-specific algorithms (e.g., YouTube, TikTok), interactive elements, and monetization tie-ins.
  - **News Broadcasts**: Standards for factual reporting, anchor scripts, segment timing, b-roll integration, and ethical guidelines (e.g., SPJ Code of Ethics).
  - **Commercials**: Focus on concise messaging, call-to-action, brand alignment, 15-60 second formats, and persuasive techniques.
  - **Streaming Content**: Strategies for binge-worthy series, algorithm-driven pacing, diverse representation, and global audience adaptations.
  - **Live TV Productions**: Rules for real-time scripting, cue cards, improvisation buffers, multi-camera setups, and event-specific contingencies.
  - **Universal Rules**: Cross-cutting concerns like page layout enforcement (via custom VS Code views or markdown previews), content organization (scene databases, character wikis), and programmatic aids (e.g., arc generators using graph-based models for character evolution).
- **Page Layout Solutions**: Develop VS Code-compatible file formats (e.g., enhanced Markdown with custom syntax highlighting or embedded CSS for previews) that maintain strict screenplay formatting while enabling editing; include export tools to PDF or industry formats.
- **Parameter and Content Organization**: Provide templates for outlining (e.g., beat sheets, loglines), databases for elements (characters, locations, props), and version control integration for iterative revisions.
- **Character Development Handling**: Use programmatic models with human-readable (e.g., YAML profiles) and machine-readable (e.g., JSON schemas) parameters for traits, backstories, arcs, and contextual adaptations; include AI prompts for generating arcs that balance rules with intentional deviations (e.g., fourth-wall breaks in appropriate genres).
- **Guidelines Integration**:
  - Plot development: Rules for inciting incidents, rising action, climaxes, and resolutions, with contextual overrides.
  - Tropes: Inventories of common tropes, avoidance strategies, and innovation prompts for novel ones.
  - Screen Continuity: Guidelines for match cuts, 180-degree rule, eyeline matches, and script notations for visual consistency.
  - 'Save the Cat' Moments: Contextual rules for likable character introductions, adapted to genre (e.g., heroic acts in films vs. authoritative presence in news).
  - Restorative Three-Act Narratives: Enforcement where appropriate, with options for alternative structures (e.g., non-linear in independents).
- **Integration with Augmentcode AI**: Ensure the extension provides rich prompts, templates, patterns, validation checks, and examples that instruct the AI to generate compliant screenplays, outlines, or revisions. Include before-and-after examples in the extension's README and inline comments.
- **Extensibility**: Allow users to add custom categories, rules, or overrides; support community contributions via plugin-style additions.

#### Best Practices and Professionalism
- Emphasize structured, evocative writing with precise action descriptions, natural dialogue, and thematic depth.
- Promote contextual rule application (e.g., strict adherence in commercial work vs. experimentation in independents).
- Encourage iterative feedback loops, diversity in representation, and ethical storytelling.
- Align with industry standards for collaboration, rights management, and production readiness.

#### Testing and Validation
- Include unit/integration tests for extension logic, configuration validation, rule application, and example screenplay generations.
- Validate AI outputs against standards through sample projects, format checks, and narrative coherence assessments.

This extension will be developed using the Augment framework, with subsequent conversion of this ticket into an OpenSpec specification for structured planning, followed by decomposition into Beads tasks for execution by Augmentcode AI.

### Acceptance Criteria
- The extension is installable and configurable in VS Code via the Augment system.
- Users can select one or more screenplay categories, with rules applied correctly (and conflicts detected) in AI-generated outputs.
- Documentation includes detailed guidelines, realistic examples for each category, universal rules, and configuration samples.
- AI prompts generated by the extension consistently enforce best practices, demonstrated through sample screenplays and before/after diffs.
- No redundant or conflicting rules; universal rules applied efficiently with clear override semantics.
- Page layout solutions maintain format integrity in VS Code and enable accurate exports.
- Programmatic character handling produces contextual arcs with human/machine-readable outputs.
- Extension passes validation, testing, and professional review standards.
- Integration with repo workflows is seamless, with negligible performance degradation.

### Estimated Effort
- Design and Planning: 10 hours
- Implementation: 30 hours
- Testing and Documentation: 20 hours
- Total: 60 hours

### Attachments
- Links to referenced repositories: https://github.com/mytech-today-now/augment, https://github.com/Fission-AI/OpenSpec/, https://github.com/steveyegge/beads
- Sample screenplay examples (concrete patterns to guide implementation and serve as reference during OpenSpec & Beads phases):
  - AAA Hollywood – Action blockbuster scene
    - Configuration: screenplay_category: "aaa_hollywood"
    - Key rule: "Incorporate high-stakes set pieces; ensure 'save the cat' in Act 1; maintain three-act structure with escalating conflicts."
  - Independent Film – Character monologue
    - Configuration: screenplay_category: "independent"
    - Key rule: "Focus on internal arcs; allow fourth-wall breaks if meta; innovate tropes for originality."
  - TV Series – Episode teaser
    - Configuration: screenplay_category: "tv"
    - Key rule: "Build season arcs; use cliffhangers; ensure continuity across episodes."
  - News Broadcast – Segment script
    - Configuration: screenplay_category: "news_broadcast"
    - Key rule: "Adhere to factual standards; include fourth-wall direct address; time segments precisely."
  - Commercials – 30-second spot
    - Configuration: screenplay_category: "commercials"
    - Key rule: "Concise narrative; strong CTA; brand-aligned tropes."

### Next Steps
- Convert this JIRA ticket into an OpenSpec specification for detailed architectural outlining.
- Decompose the OpenSpec into a prioritized series of Beads tasks for phased execution by Augmentcode AI.
- Assign tasks to development team or AI pipeline for implementation.