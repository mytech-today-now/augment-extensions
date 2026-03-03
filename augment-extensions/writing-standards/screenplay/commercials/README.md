# Commercial Writing Standards

> **Version 1.0.0** | Comprehensive commercial writing standards for TV, streaming, and digital advertising

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Module Contents](#module-contents)
- [Configuration](#configuration)
- [Usage Examples](#usage-examples)
- [Legal Compliance](#legal-compliance)
- [References](#references)

## Overview

This module provides comprehensive commercial writing standards for creating effective, legally compliant advertising content across multiple formats and platforms. It covers everything from 15-second TV spots to streaming pre-roll ads and social media content.

### What's Included

- ✅ **15 comprehensive rule files** covering all commercial formats and techniques
- ✅ **Format-specific guidelines** for TV (15/30/60 sec), streaming, digital, social media, and radio
- ✅ **Persuasion techniques** and call-to-action best practices
- ✅ **Legal compliance** including FTC guidelines and disclosure requirements
- ✅ **Brand messaging** and consistency standards
- ✅ **Production notes** for video generation AI integration
- ✅ **Real-world examples** in Fountain format

### Target Character Count

**44,000 - 45,000 characters** across all rule files and examples

## Installation

### Using augx CLI (Recommended)

```bash
# Link parent screenplay module first
augx link writing-standards/screenplay

# Link commercials sub-module
augx link writing-standards/screenplay/commercials

# Verify installation
augx list --linked
```

### Manual Installation

1. Ensure parent `screenplay` module is installed
2. Copy this directory to your project's `.augment/extensions/writing-standards/screenplay/` folder
3. Configure category selection in `.augment/screenplay-config.json`

## Quick Start

### For AI Agents

```bash
# Query the commercials module
augx show commercials

# Search for specific topics
augx search "30 second commercial"
augx search "FTC compliance"
augx search "call to action"
```

### For Developers

1. Link the module to your project
2. Configure commercial format in `.augment/commercials-config.json`
3. Use Fountain format (`.fountain`) for commercial scripts
4. Reference legal compliance rules before finalizing content
5. Use production notes for AI video generation integration

## Module Contents

### Core Rules

#### 1. [Core Principles](rules/core-principles.md)
Fundamental principles of commercial writing across all formats.

**Topics covered:**
- Hook within first 3 seconds
- Single clear message
- Emotional connection
- Brand integration
- Call-to-action placement

---

#### 2. [Format-Specific Rules](rules/)

**TV Commercials:**
- [15-Second Format](rules/format-15sec.md) - Ultra-concise messaging
- [30-Second Format](rules/format-30sec.md) - Standard TV commercial format
- [60-Second Format](rules/format-60sec.md) - Extended storytelling

**Streaming:**
- [Pre-Roll Ads](rules/streaming-pre-roll.md) - Non-skippable and skippable formats
- [Mid-Roll Ads](rules/streaming-mid-roll.md) - Content integration

**Digital:**
- [Digital Banner](rules/digital-banner.md) - Visual-first messaging
- [Social Media](rules/social-media.md) - Platform-specific formats (Instagram, TikTok, YouTube)
- [Radio](rules/radio.md) - Audio-only commercials

---

### Persuasion & Messaging

#### 3. [Persuasion Techniques](rules/persuasion-techniques.md)
Proven persuasion frameworks and psychological triggers.

**Topics covered:**
- AIDA (Attention, Interest, Desire, Action)
- PAS (Problem, Agitate, Solution)
- Emotional appeals
- Social proof
- Scarcity and urgency

---

#### 4. [Call-to-Action](rules/call-to-action.md)
Effective CTA design and placement.

---

#### 5. [Brand Messaging](rules/brand-messaging.md)
Brand voice, consistency, and positioning.

---

### Legal & Compliance

#### 6. [Legal Compliance](rules/legal-compliance.md)
Comprehensive legal requirements for commercial content.

---

#### 7. [FTC Guidelines](rules/ftc-guidelines.md)
Federal Trade Commission advertising regulations.

**Topics covered:**
- Truth in advertising
- Disclosure requirements
- Endorsements and testimonials
- Comparative advertising
- Children's advertising (COPPA)

---

### Production

#### 8. [Production Notes](rules/production-notes.md)
Technical specifications for video generation AI.

**Topics covered:**
- Shot composition
- Timing and pacing
- Visual style guidelines
- Audio requirements
- Text overlay specifications

---

## Configuration

### Example Configuration

Create `.augment/commercials-config.json`:

```json
{
  "formats": ["tv-30sec", "streaming-pre-roll", "social-media"],
  "legalCompliance": true,
  "brandGuidelines": {
    "voice": "friendly, professional",
    "restrictions": ["no comparative claims", "no celebrity endorsements"],
    "requiredDisclosures": ["Terms and conditions apply"]
  }
}
```

## Usage Examples

### Example 1: 30-Second TV Commercial

See [examples/tv-30sec-example.fountain](examples/tv-30sec-example.fountain)

### Example 2: Streaming Pre-Roll Ad

See [examples/streaming-pre-roll-example.fountain](examples/streaming-pre-roll-example.fountain)

## Legal Compliance

**IMPORTANT:** All commercial content must comply with:

- FTC Truth in Advertising regulations
- Platform-specific advertising policies
- Industry-specific regulations (e.g., pharmaceutical, financial)
- State and local advertising laws

Consult with legal counsel before finalizing commercial content.

## References

- **FTC Advertising Guidelines:** https://www.ftc.gov/business-guidance/advertising-marketing
- **American Association of Advertising Agencies (4A's):** https://www.aaaa.org/
- **Ad Age:** https://adage.com/
- **Cannes Lions:** https://www.canneslions.com/

---

## Version History

- **1.0.0** (2026-03-03) - Initial release with 15 rule files and 2 examples

## Contributing

See parent [screenplay module](../README.md) for contribution guidelines.

