# JIRA Ticket: AUG-9012 - Develop PHP Coding Standards Augment Extension
## Summary
Create a new Augment extension (based on the Augment framework at https://github.com/mytech-today-now/augment) focused on PHP coding standards. This extension will guide the Augmentcode AI in applying best practices and maintaining a high level of professionalism across various PHP project types, including web applications, APIs, CLI tools, CMS integrations, e-commerce systems, legacy migrations, and others. The extension should allow users to select specific PHP coding categories for tailored guidance, with universal rules applied where appropriate, recognizing that most projects utilize a single primary category while supporting extensibility for multiple categories if needed.
## Description
### Background
The Augment framework enables the creation of extensions that enhance AI-driven code generation and development processes within VS Code, integrated with repositories. This ticket involves developing an extension specifically for PHP-related tasks, leveraging Augmentcode AI to ensure outputs adhere to industry best practices, efficiency standards, security considerations, performance optimization, and professional coding conventions.
The extension must draw from established standards such as:
- PSR (PHP Standards Recommendations) series, including PSR-1 (basic coding), PSR-2/PSR-12 (style guide), PSR-4 (autoloading), PSR-7 (HTTP messages), PSR-11 (container interface), PSR-15 (HTTP handlers), and PSR-18 (HTTP client).
- Security guidelines from OWASP PHP Security Cheat Sheet, focusing on input validation, SQL injection prevention, XSS mitigation, and secure session management.
- Performance best practices like opcode caching (OPcache), efficient querying, caching strategies (Redis/Memcached), and profiling tools (Xdebug, Blackfire).
- Testing frameworks integration (PHPUnit, Codeception) with emphasis on unit, integration, and end-to-end testing coverage.
- Modern PHP features (PHP 8+ attributes, typed properties, enums) alongside backward compatibility strategies for legacy code.
Universal guidelines should include consistent naming conventions (camelCase for variables, PascalCase for classes), indentation (4 spaces), error handling (try-catch with custom exceptions), logging (Monolog/PSR-3), documentation (PHPDoc standards), version control integration (Composer for dependencies), and compliance with accessibility (WCAG) and internationalization (i18n) where applicable.
### Key Requirements
1. **Modular Structure**: Design the extension to be modular, allowing users to select and activate rulesets for specific PHP project categories via configuration in VS Code or repo settings.
2. **User Selection Mechanism**: Implement a user-friendly interface or configuration file (e.g., JSON or YAML) where developers can specify the PHP category(ies) for the project. Default to universal rules, with category-specific overrides and conflict detection/resolution.
3. **Comprehensive Coverage**:
   - **Web Applications**: Guidelines for MVC architecture, routing, templating (Twig/Blade), form handling, and middleware usage in frameworks like Laravel or Symfony.
   - **APIs**: Rules for RESTful design (HATEOAS, versioning), GraphQL schemas, authentication (OAuth/JWT), rate limiting, and serialization (JSON API standards).
   - **CLI Tools**: Best practices for command-line argument parsing (Symfony Console), scripting efficiency, error output handling, and integration with cron jobs or queues.
   - **CMS Integrations**: Focus on plugin/theme development for WordPress/Drupal, hooks/filters usage, shortcode implementation, and database abstraction layers.
   - **E-commerce Systems**: Techniques for cart management, payment gateways (Stripe/PayPal), inventory tracking, and PCI DSS compliance in platforms like Magento or WooCommerce.
   - **Legacy Migrations**: Strategies for refactoring monolithic code to modern standards, gradual type hinting addition, dependency upgrades, and deprecation handling.
   - **Universal Rules**: Cross-cutting concerns like code linting (PHP_CodeSniffer with PSR rules), static analysis (PHPStan/Phan), composer.json best practices, namespace organization, and automated formatting (PHP-CS-Fixer).
4. **Integration with Augmentcode AI**: Ensure the extension provides rich prompts, code templates, architectural patterns, linting rules, and validation checks that instruct the AI to generate compliant code, designs, or documentation. Include before-and-after examples in the extension's README and inline comments.
5. **Extensibility**: Allow developers to add custom PHP categories, rules, or override defaults without conflicts; support plugin-style rule contributions.
6. **Best Practices and Professionalism**:
   - Emphasize clean, modular, well-documented code with type hints, strict types declaration, and comprehensive docblocks.
   - Promote efficiency-first design (optimize loops, avoid N+1 queries, use lazy loading).
   - Encourage profiling (memory usage, execution time) and iterative optimization.
   - Align with open-source standards for reusability, maintainability, and community contribution.
7. **Testing and Validation**: Include unit/integration tests for the extension logic, configuration validation, rule application, and example repo integrations to prove AI guidance quality.
This extension will be developed using the Augment framework, with subsequent conversion of this ticket into an OpenSpec specification (https://github.com/Fission-AI/OpenSpec/) for structured planning, followed by decomposition into Beads tasks (https://github.com/steveyegge/beads) for execution by Augmentcode AI.
## Acceptance Criteria
- The extension is installable and configurable in VS Code via the Augment system.
- Users can select one or more PHP categories, with rules applied correctly (and conflicts detected) in AI-generated outputs.
- Documentation includes detailed guidelines, realistic examples for each PHP category, universal rules, and configuration samples.
- AI prompts generated by the extension consistently enforce best practices, demonstrated through sample projects and before/after diffs.
- No redundant or conflicting rules; universal rules applied efficiently with clear override semantics.
- Extension passes linting, type checking, unit/integration testing, and professional code review standards.
- Integration with repo workflows is seamless, with negligible performance degradation.
## Estimated Effort
- Design and Planning: 8 hours
- Implementation: 25 hours
- Testing and Documentation: 15 hours
- Total: 48 hours
## Attachments
- Links to referenced repositories: https://github.com/mytech-today-now/augment, https://github.com/Fission-AI/OpenSpec/, https://github.com/steveyegge/beads
- Sample PHP coding examples (concrete patterns to guide implementation and serve as reference during OpenSpec & Beads phases):
  1. **Web Applications** – Laravel-based user authentication module
     Configuration: `php_category: "web"`
     Framework: Laravel 11
     Strategy: Middleware for auth, Eloquent ORM, Blade templating
     Key rule: "Use route model binding; validate inputs with Form Requests; log authentication attempts with contextual data."
  2. **APIs** – RESTful endpoint for resource CRUD
     Configuration: `php_category: "api"`
     Standards: PSR-7 compliant
     Authentication: JWT via Firebase/PHP-JWT
     Key rule: "Implement HATEOAS links in responses; use HTTP status codes appropriately; paginate results with query params."
  3. **CLI Tools** – Data migration script
     Configuration: `php_category: "cli"`
     Tooling: Symfony Console
     Handling: Argument validation, progress bars
     Key rule: "Exit with non-zero code on failure; use verbose flags for detailed output; ensure idempotency for repeated runs."
  4. **CMS Integrations** – WordPress custom plugin
     Configuration: `php_category: "cms"`
     Hooks: admin_init, wp_enqueue_scripts
     Security: Nonce verification
     Key rule: "Sanitize all user inputs; use WP_Query for database interactions; avoid direct SQL queries."
  5. **E-commerce Systems** – Shopping cart handler
     Configuration: `php_category: "ecommerce"`
     Integration: WooCommerce hooks
     Compliance: Secure tokenization for payments
     Key rule: "Validate stock before adding to cart; use transactions for order processing; encrypt sensitive data at rest."
  6. **Legacy Migrations** – Refactor procedural code to OOP
     Configuration: `php_category: "legacy"`
     Approach: Introduce namespaces, dependency injection
     Key rule: "Add type hints incrementally; deprecate old functions with triggers; test for backward compatibility."
## Next Steps
1. Convert this JIRA ticket into an OpenSpec specification for detailed architectural outlining.
2. Decompose the OpenSpec into a prioritized series of Beads tasks for phased execution by Augmentcode AI.
3. Assign tasks to development team or AI pipeline for implementation.