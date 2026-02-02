# SEO, Sales, and Marketing Content Standards

## Overview

This module provides comprehensive marketing and sales content standards for AI-driven content creation. It includes guidelines for SEO optimization, social media marketing, email campaigns, PPC advertising, content marketing, and direct sales.

## Key Benefits

- **Consistent Brand Voice**: Maintain brand consistency across all marketing channels
- **SEO Optimization**: Follow best practices for search engine visibility
- **Legal Compliance**: Ensure FTC, CAN-SPAM, GDPR, and WCAG compliance
- **Conversion Optimization**: Implement proven CTA and funnel optimization techniques
- **Multi-Channel Support**: Guidelines for blogs, social media, email, PPC, and more
- **Programmatic Asset Management**: Structured handling of colors, logos, fonts, and media

## Installation

### With CLI (Recommended)

```bash
augx link domain-rules/seo-sales-marketing
```

### Manual Installation

Copy the contents of this module to your project's `.augment/` folder.

## Directory Structure

```
augment-extensions/domain-rules/seo-sales-marketing/
├── module.json              # Module metadata
├── README.md                # This file
├── rules/                   # Marketing standards rules
│   ├── universal-marketing.md
│   ├── brand-consistency.md
│   ├── asset-management.md
│   ├── legal-compliance.md
│   ├── conversion-optimization.md
│   ├── seo-optimization.md
│   ├── content-marketing.md
│   ├── social-media-marketing.md
│   ├── email-marketing.md
│   ├── ppc-advertising.md
│   ├── affiliate-influencer-marketing.md
│   └── direct-sales.md
├── schemas/                 # JSON schemas for validation
│   ├── brand-kit.schema.json
│   ├── color-palette.schema.json
│   ├── campaign-brief.schema.json
│   ├── content-template.schema.json
│   └── asset-inventory.schema.json
└── examples/                # Example marketing content
    ├── seo-blog-post.md
    ├── social-media-campaign.md
    ├── email-newsletter.html
    ├── landing-page.html
    ├── ppc-ad-copy.md
    ├── brand-kit.yaml
    ├── campaign-brief.yaml
    └── content-calendar.yaml
```

## Core Workflows

### 1. Creating SEO-Optimized Content

Follow `rules/seo-optimization.md` for keyword research, on-page SEO, meta tags, and schema markup.

### 2. Maintaining Brand Consistency

Use `rules/brand-consistency.md` and `schemas/brand-kit.schema.json` to ensure consistent brand voice, colors, and typography.

### 3. Ensuring Legal Compliance

Reference `rules/legal-compliance.md` for FTC, CAN-SPAM, GDPR, and WCAG compliance requirements.

### 4. Optimizing Conversions

Apply `rules/conversion-optimization.md` for CTA best practices, A/B testing, and funnel optimization.

### 5. Managing Marketing Assets

Use `rules/asset-management.md` and `schemas/asset-inventory.schema.json` for programmatic asset handling.

## Character Count

**Total**: ~288,256 characters

## Contents

### Universal Standards (5 files)
- Universal Marketing Standards
- Brand Consistency
- Asset Management
- Legal Compliance
- Conversion Optimization

### Category-Specific Rules (7 files)
- SEO Optimization
- Content Marketing
- Social Media Marketing
- Email Marketing
- PPC/Advertising
- Affiliate/Influencer Marketing
- Direct Sales

### JSON Schemas (5 files)
- Brand Kit Schema
- Color Palette Schema
- Campaign Brief Schema
- Content Template Schema
- Asset Inventory Schema

### Examples (8 files)
- SEO Blog Post
- Social Media Campaign
- Email Newsletter
- Landing Page
- PPC Ad Copy
- Brand Kit (YAML)
- Campaign Brief (YAML)
- Content Calendar (YAML)

## Usage

Link this module to your project and reference the appropriate rule files when creating marketing content. The AI will apply these standards automatically.

For detailed usage instructions, see:
- **USAGE-GUIDES.md** - Scenario-based usage guides for common marketing tasks
- **TEST-VALIDATION.md** - Module validation report and effectiveness assessment

## Version

**1.0.0** - Initial release (2026-02-01)

## License

MIT

