# SEO, Sales, and Marketing Module - Usage Guides

## Overview

This document provides practical usage guides for common marketing scenarios using the SEO, Sales, and Marketing Content Standards module.

---

## Scenario 1: Creating an SEO-Optimized Blog Post

### Objective
Create a blog post that ranks well in search engines and drives organic traffic.

### Steps

1. **Link the Module**
   ```bash
   augx link domain-rules/seo-sales-marketing
   ```

2. **Prompt the AI**
   ```
   Using the SEO optimization rules, create a blog post about [TOPIC].
   
   Requirements:
   - Focus keyword: [KEYWORD]
   - Target audience: [AUDIENCE]
   - Word count: 1500-2000 words
   - Include: title tag, meta description, H1/H2 structure, internal links, external links, schema markup
   ```

3. **Review Against Checklist**
   - ✅ Focus keyword density ~1.5%
   - ✅ Title tag 50-60 characters
   - ✅ Meta description 150-160 characters
   - ✅ H1 contains focus keyword
   - ✅ H2s contain related keywords
   - ✅ 3-5 internal links
   - ✅ 2-3 external authoritative links
   - ✅ Schema markup (Article or BlogPosting)
   - ✅ Mobile-optimized formatting

4. **Reference Files**
   - Rule: `rules/seo-optimization.md`
   - Example: `examples/seo-blog-post-example.md`

---

## Scenario 2: Launching a Social Media Campaign

### Objective
Create a multi-platform social media campaign with consistent messaging.

### Steps

1. **Link the Module**
   ```bash
   augx link domain-rules/seo-sales-marketing
   ```

2. **Prompt the AI**
   ```
   Using the social media marketing rules, create a campaign for [PRODUCT/SERVICE].
   
   Requirements:
   - Platforms: Facebook, Instagram, Twitter, LinkedIn
   - Duration: [TIMEFRAME]
   - Goal: [AWARENESS/ENGAGEMENT/CONVERSIONS]
   - Include: post copy, hashtags, visual guidelines, posting schedule
   ```

3. **Review Against Checklist**
   - ✅ Platform-specific content (character limits, formats)
   - ✅ Hashtag strategy (branded + trending + niche)
   - ✅ Visual content guidelines
   - ✅ Posting schedule optimized for engagement
   - ✅ Call-to-action in each post
   - ✅ Engagement tactics (questions, polls, UGC)

4. **Reference Files**
   - Rule: `rules/social-media-marketing.md`
   - Example: `examples/social-media-campaign-example.md`

---

## Scenario 3: Building a Brand Kit

### Objective
Create a comprehensive brand kit for consistent brand identity across all marketing materials.

### Steps

1. **Link the Module**
   ```bash
   augx link domain-rules/seo-sales-marketing
   ```

2. **Prompt the AI**
   ```
   Using the brand consistency rules and brand-kit schema, create a brand kit for [COMPANY].
   
   Requirements:
   - Brand voice: [VOICE ATTRIBUTES]
   - Primary colors: [COLORS]
   - Typography: [FONTS]
   - Logo variations: [VARIATIONS]
   - Include: YAML file following brand-kit.schema.json
   ```

3. **Validate Against Schema**
   ```bash
   # Validate the generated brand kit
   ajv validate -s schemas/brand-kit.schema.json -d brand-kit.yaml
   ```

4. **Review Against Checklist**
   - ✅ Brand voice defined (tone, personality, values)
   - ✅ Color palette with hex codes and usage guidelines
   - ✅ Typography (primary, secondary, headings, body)
   - ✅ Logo usage rules (minimum size, clear space, variations)
   - ✅ Visual style guidelines

5. **Reference Files**
   - Rule: `rules/brand-consistency.md`
   - Schema: `schemas/brand-kit.schema.json`
   - Example: `examples/brand-kit-example.yaml`

---

## Scenario 4: Creating PPC Ad Copy

### Objective
Write high-converting ad copy for Google Ads and Facebook Ads campaigns.

### Steps

1. **Link the Module**
   ```bash
   augx link domain-rules/seo-sales-marketing
   ```

2. **Prompt the AI**
   ```
   Using the PPC advertising rules, create ad copy for [PRODUCT/SERVICE].
   
   Requirements:
   - Platform: Google Ads (Search)
   - Target keyword: [KEYWORD]
   - Include: 3 headlines (30 chars each), 2 descriptions (90 chars each), ad extensions
   ```

3. **Review Against Checklist**
   - ✅ Headlines include keyword and benefit
   - ✅ Descriptions have clear CTA
   - ✅ Ad extensions (sitelinks, callouts, structured snippets)
   - ✅ A/B testing variations
   - ✅ Landing page alignment

4. **Reference Files**
   - Rule: `rules/ppc-advertising.md`
   - Example: `examples/ppc-ad-copy-example.md`

---

## Scenario 5: Ensuring Legal Compliance

### Objective
Ensure all marketing content complies with FTC, CAN-SPAM, GDPR, and WCAG regulations.

### Steps

1. **Link the Module**
   ```bash
   augx link domain-rules/seo-sales-marketing
   ```

2. **Prompt the AI**
   ```
   Review this [EMAIL/AD/CONTENT] for legal compliance using the legal-compliance rules.
   
   Check for:
   - FTC disclosure requirements
   - CAN-SPAM compliance (unsubscribe, physical address)
   - GDPR consent mechanisms
   - WCAG 2.1 AA accessibility
   ```

3. **Compliance Checklist**
   - ✅ FTC: Clear disclosure of affiliate links, sponsored content
   - ✅ CAN-SPAM: Unsubscribe link, physical address, accurate subject line
   - ✅ GDPR: Consent checkbox, privacy policy link, data processing notice
   - ✅ WCAG: Alt text, color contrast, keyboard navigation, screen reader compatibility

4. **Reference Files**
   - Rule: `rules/legal-compliance.md`
   - Example: `examples/email-newsletter-example.md`

---

## Advanced Usage

### Combining Multiple Rules

For complex campaigns, combine multiple rule files:

```
Using the following rules:
- seo-optimization.md
- brand-consistency.md
- conversion-optimization.md
- legal-compliance.md

Create a landing page for [PRODUCT] that:
1. Ranks for keyword [KEYWORD]
2. Maintains brand voice from brand-kit.yaml
3. Optimizes for conversions with A/B testing plan
4. Complies with all legal requirements
```

### Using Schemas for Validation

All YAML/JSON outputs can be validated against schemas:

```bash
# Validate brand kit
ajv validate -s schemas/brand-kit.schema.json -d output/brand-kit.yaml

# Validate campaign brief
ajv validate -s schemas/campaign-brief.schema.json -d output/campaign.yaml

# Validate content template
ajv validate -s schemas/content-template.schema.json -d output/template.json
```

---

## Tips for Best Results

1. **Be Specific**: Provide clear objectives, target audience, and constraints
2. **Reference Examples**: Point AI to relevant example files for format guidance
3. **Validate Output**: Use schemas to validate structured outputs
4. **Iterate**: Use A/B testing guidelines to refine content
5. **Stay Compliant**: Always check legal-compliance.md for regulatory requirements

---

## Support

For questions or issues with this module:
- Review rule files in `rules/` directory
- Check examples in `examples/` directory
- Validate against schemas in `schemas/` directory
- Refer to TEST-VALIDATION.md for module effectiveness assessment

