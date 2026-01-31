# JIRA Ticket: AUG-9013 - Develop Marketing and Sales Content Standards Augment Extension

### Summary
Create a new Augment extension (based on the Augment framework at https://github.com/mytech-today-now/augment.git) focused on SEO, marketing, and sales content crafting standards. This extension will guide the Augmentcode AI in generating high-quality, contextually optimized content for pitches and campaigns across various media types, ensuring adherence to best practices, layout constraints, and professional standards. The extension should allow users to select specific marketing categories for tailored guidance, with universal rules applied where appropriate, recognizing that most projects focus on one primary category while supporting extensibility for multi-category integration if needed.

### Description

#### Background
The Augment framework enables the creation of extensions that enhance AI-driven content generation and development processes within VS Code, integrated with repositories such as https://github.com/Fission-AI/OpenSpec.git and https://github.com/steveyegge/beads.git. This ticket involves developing an extension specifically for marketing and sales tasks, leveraging Augmentcode AI to ensure outputs conform to industry best practices, SEO optimization, audience engagement strategies, conversion-focused design, legal compliance (e.g., FTC guidelines for advertising), and contextual adaptability. The extension must address the dynamic nature of content creation, where rules may be inverted based on context (e.g., breaking the fourth wall in interactive media like social posts or TV news, but avoiding it in formal films).

The extension will draw from established standards such as:
- SEO best practices from Google Webmaster Guidelines, Moz SEO Essentials, and SEMrush tools, emphasizing keyword research, on-page optimization, meta tags, alt text, and mobile-first indexing.
- Marketing frameworks like AIDA (Attention, Interest, Desire, Action), PAS (Problem, Agitate, Solution), and storytelling arcs for character development.
- Sales techniques including SPIN selling, value proposition canvases, and CTA optimization (e.g., urgency, scarcity, personalization).
- Media-specific constraints: Character limits (e.g., X/Twitter at 280 characters), aspect ratios for images/videos (e.g., 16:9 for YouTube), file formats (SVG for scalable graphics, MP4 for videos), and accessibility standards (WCAG for alt text, captions).
- Asset management: Programmatic handling of logos, photos, images, fonts, SVGs, audio files, tone progressions, videos, tactile feedbacks (e.g., haptic patterns in apps), body movements (e.g., calisthenics demos, trademarked gestures), facial expressions (e.g., emotive descriptors), catch-phrases, attributes, colors (e.g., brand palettes via HEX/RGB), characters, character development, and arcs—all with human-readable (JSON/YAML) and machine-readable parameters.
- Universal guidelines: Consistent tone (e.g., professional vs. conversational), color theory (complementary schemes, accessibility contrasts), logo development (simplicity, scalability), CTA best practices (action-oriented language, placement), audience segmentation, A/B testing prompts, and ethical considerations (avoiding misinformation, inclusivity).

#### Key Requirements
- **Modular Structure**: Design the extension to be modular, with separately loadable subsections for seven distinct marketing categories: (1) SEO (search engine optimization), (2) Content Marketing (blogs, articles), (3) Social Media Marketing (posts, stories), (4) Email Marketing (newsletters, campaigns), (5) PPC/Advertising (paid ads, banners), (6) Affiliate/Influencer Marketing (partnership content), and (7) Direct Sales (pitches, landing pages). Each subsection should enforce strict page/layout parameters (e.g., email templates with header/body/footer limits, social posts with character caps and media embeds).
- **User Selection Mechanism**: Implement a user-friendly interface or configuration file (e.g., JSON or YAML in repo settings) where users can specify the marketing category(ies) for the project. Default to universal rules, with category-specific overrides, conflict detection (e.g., alerting on incompatible layouts), and contextual adaptations (e.g., rule inversion for breaking conventions like fourth-wall engagement in interactive formats).
- **Comprehensive Coverage**:
  - **SEO**: Guidelines for keyword density, backlink strategies, schema markup, and performance metrics (e.g., Core Web Vitals); constrain to web page structures like H1-H6 headings, meta descriptions under 160 characters.
  - **Content Marketing**: Rules for long-form readability (e.g., subheadings, bullet points), engagement hooks, and calls-to-action; layout constraints for blog posts (e.g., featured images at 1200x630px).
  - **Social Media Marketing**: Best practices for platform-specific virality (e.g., hashtags, emojis), timing algorithms, and multimedia integration; enforce limits like Instagram captions at 2200 characters, with image ratios (1:1 square).
  - **Email Marketing**: Techniques for subject line optimization (under 50 characters), personalization, and anti-spam compliance (CAN-SPAM); templates with responsive HTML/CSS for mobile views.
  - **PPC/Advertising**: Focus on ad copy brevity, targeting keywords, and landing page alignment; constraints for Google Ads (headline 30 characters) and visual assets (e.g., banner sizes 300x250px).
  - **Affiliate/Influencer Marketing**: Strategies for disclosure statements, partnership tracking, and authentic endorsements; handle influencer kits with programmable character arcs and catch-phrases.
  - **Direct Sales**: Emphasis on persuasive narratives, objection handling, and funnel optimization; layouts for sales decks (e.g., PowerPoint slide limits, font consistency).
  - **Universal Rules**: Cross-cutting concerns like brand voice consistency, asset parameterization (e.g., color variables in CSS), media file organization (folders for images/audio), and programmatic generation (e.g., scripts for tone progressions or haptic feedback patterns).
- **File and Organization Solutions**: Provide VS Code-compatible file templates (e.g., Markdown for drafts, HTML for previews) that embed layout constraints (e.g., via frontmatter metadata for character limits). Include tools for parameter organization (e.g., config files with asset inventories, AI prompts for generating variants).
- **Programmatic Asset Handling**: Enable code-based management of contextual assets (e.g., JSON schemas for character arcs, scripts for color palette generation, descriptors for body movements/facial expressions). Support rule flexibility (e.g., contextual overrides for unconventional tactics).
- **Integration with Augmentcode AI**: Ensure the extension provides rich prompts, content templates, layout validators, asset generators, and compliance checks that instruct the AI to produce optimized outputs. Include before-and-after examples in the extension's README and inline comments.
- **Extensibility**: Allow users to add custom marketing categories, rules, or overrides; support community contributions for new media types or guidelines.

#### Best Practices and Professionalism
- Emphasize audience-centric, data-driven content with ethical persuasion, inclusivity, and measurable KPIs (e.g., conversion rates).
- Promote iterative refinement (A/B testing simulations) and adaptability (contextual rule bending).
- Align with industry standards for creativity, legality, and effectiveness, ensuring high engagement and ROI.

#### Testing and Validation
- Include unit/integration tests for extension logic, configuration parsing, rule application, and asset generation.
- Validate AI outputs through sample campaigns, layout compliance checks, and professional reviews.

This extension will be developed using the Augment framework, with subsequent conversion of this ticket into an OpenSpec specification for structured planning, followed by decomposition into Beads tasks for execution by Augmentcode AI.

### Acceptance Criteria
- The extension is installable and configurable in VS Code via the Augment system.
- Users can select one or more marketing categories, with rules applied correctly (and conflicts detected) in AI-generated content.
- Documentation includes detailed guidelines, examples for each category, universal rules, and configuration samples.
- AI prompts enforce best practices, demonstrated through sample pitches and before/after comparisons.
- No redundant or conflicting rules; universal rules applied with clear override semantics.
- Handles assets programmatically, with files usable in VS Code and layout constraints enforced.
- Extension passes validation, testing, and professional standards.
- Integration with repo workflows is seamless, with minimal overhead.

### Estimated Effort
- Design and Planning: 10 hours
- Implementation: 30 hours
- Testing and Documentation: 20 hours
- Total: 60 hours

### Attachments
- Links to referenced repositories: https://github.com/mytech-today-now/augment.git, https://github.com/Fission-AI/OpenSpec.git, https://github.com/steveyegge/beads.git
- Sample marketing examples (concrete patterns to guide implementation and serve as reference during OpenSpec & Beads phases):
  - SEO – Optimized blog post
    - Configuration: marketing_category: "seo"
    - Strategy: Keyword integration, internal linking
    - Key rule: "Maintain keyword density 1-2%; use alt text for images; structure with H-tags."
  - Social Media Marketing – X post campaign
    - Configuration: marketing_category: "social"
    - Platform: X (280 char limit)
    - Key rule: "Incorporate emojis and hashtags; end with CTA; adapt tone for virality, potentially breaking fourth wall for engagement."
  - Email Marketing – Newsletter template
    - Configuration: marketing_category: "email"
    - Compliance: CAN-SPAM footer
    - Key rule: "Personalize subject lines; use responsive design; track opens with pixels."
  - Direct Sales – Pitch deck slide
    - Configuration: marketing_category: "direct"
    - Assets: Programmable color palette, character arc for testimonial
    - Key rule: "Limit text per slide; use high-contrast CTAs; contextualize with audience pain points."

### Next Steps
- Convert this JIRA ticket into an OpenSpec specification for detailed architectural outlining.
- Decompose the OpenSpec into a prioritized series of Beads tasks for phased execution by Augmentcode AI.
- Assign tasks to development team or AI pipeline for implementation.