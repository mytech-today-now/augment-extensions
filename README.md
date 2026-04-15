# Augment Extensions

**Reusable augmentation modules for Augment Code AI**

[![Version](https://img.shields.io/badge/version-3.1.1-blue.svg)](https://github.com/mytech-today-now/augment-extensions)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![npm](https://img.shields.io/badge/npm-%40mytechtoday%2Faugment--extensions-red.svg)](https://www.npmjs.com/package/@mytechtoday/augment-extensions)

Augment Extensions provides domain-specific coding standards, design systems, and sales & marketing guidelines for teams using Augment Code AI.

## 🎯 Purpose

Augment Code AI limits `.augment/` to ~49,400 characters. This repository provides **2M+ characters** of guidelines across 30+ modules covering programming, design, and sales & marketing.

## 📦 Modules

### 💻 Programming — coding-standards/ (13 modules)

Language-specific coding standards for professional software development:

Bash · C · CSS · Go · HTML · JavaScript · Perl · PHP · PowerShell · Python · React · TypeScript · HTML+CSS+JS (collection)

### 🎨 Design — domain-rules/ & visual-design/

Domain rules and visual systems for building polished products:

API Design · Database · MCP · Security · Software Architecture · Visual Design · WordPress · WordPress Plugin

Includes ready-to-use examples: design patterns, Gutenberg blocks, REST API, WooCommerce.

### 📈 Sales & Marketing — domain-rules/seo-sales-marketing

Content and conversion strategy guidelines for revenue-focused teams:

SEO best practices · Copywriting · CTAs · Social proof · Content architecture

## 🚀 Quick Start

```bash
npm install -g @mytechtoday/augment-extensions
augx init
augx link coding-standards/typescript
augx list --linked
```

## 🔧 CLI Commands

| Command | Description |
|---------|-------------|
| `augx init` | Initialize in a project |
| `augx link <module>` | Link a module to the current project |
| `augx list` | List all available modules |
| `augx show <module>` | Display module content |
| `augx search <term>` | Search modules by keyword |
| `augx gui` | Interactive TUI module browser |
| `augx upgrade` | Upgrade linked modules to latest |
| `augx validate` | Validate module structure |

## 📄 License

MIT — see [LICENSE](./LICENSE)
