# SEO Optimization Standards

## Overview

Best practices for search engine optimization including keyword research, on-page SEO, technical SEO, and Core Web Vitals to improve organic search visibility and rankings.

---

## Keyword Research

### Keyword Discovery

**Tools**:
- Google Keyword Planner
- Ahrefs Keywords Explorer
- SEMrush Keyword Magic Tool
- AnswerThePublic
- Google Search Console (existing rankings)

**Keyword Types**:
- **Head terms**: High volume, high competition (e.g., "marketing")
- **Body keywords**: Medium volume, medium competition (e.g., "content marketing strategy")
- **Long-tail keywords**: Low volume, low competition, high intent (e.g., "how to create content marketing strategy for B2B SaaS")

### Keyword Selection Criteria

**DO**:
- Target keywords with search volume > 100/month
- Prioritize keywords with commercial or transactional intent
- Consider keyword difficulty vs. domain authority
- Focus on topics relevant to your audience
- Target question-based keywords for featured snippets

**DON'T**:
- Chase high-volume keywords beyond your domain authority
- Ignore search intent (informational vs. transactional)
- Keyword stuff or over-optimize
- Target keywords unrelated to your business

### Keyword Mapping

- **Homepage**: Brand name + primary service/product
- **Service/Product Pages**: Specific offerings + modifiers
- **Blog Posts**: Long-tail informational keywords
- **Landing Pages**: Commercial intent keywords

---

## On-Page SEO

### Title Tags

**Format**: `Primary Keyword | Secondary Keyword | Brand Name`

**Rules**:
- Length: 50-60 characters (512 pixels max)
- Include primary keyword near the beginning
- Make it compelling and click-worthy
- Unique for every page
- Match search intent

**Examples**:
```html
<!-- Good -->
<title>Content Marketing Strategy Guide 2024 | Marketing Agency</title>

<!-- Bad -->
<title>Home | Marketing Agency</title> ❌ (Generic, no keywords)
<title>Best Content Marketing Strategy Guide for B2B SaaS Companies in 2024</title> ❌ (Too long)
```

### Meta Descriptions

**Rules**:
- Length: 150-160 characters
- Include primary keyword naturally
- Compelling call-to-action
- Unique for every page
- Accurately describe page content

**Examples**:
```html
<!-- Good -->
<meta name="description" content="Learn proven content marketing strategies to drive traffic and conversions. Includes templates, examples, and step-by-step guides.">

<!-- Bad -->
<meta name="description" content="Marketing tips."> ❌ (Too short, vague)
```

### Header Tags (H1-H6)

**H1 (Page Title)**:
- One H1 per page
- Include primary keyword
- 20-70 characters
- Compelling and descriptive

**H2 (Main Sections)**:
- Multiple H2s allowed
- Include secondary keywords
- Descriptive of section content

**H3-H6 (Subsections)**:
- Hierarchical structure
- Support content organization
- Improve readability

**Example Structure**:
```html
<h1>Complete Guide to Content Marketing Strategy</h1>

<h2>What is Content Marketing?</h2>
<h3>Definition and Core Principles</h3>
<h3>Benefits of Content Marketing</h3>

<h2>How to Create a Content Marketing Strategy</h2>
<h3>Step 1: Define Your Audience</h3>
<h3>Step 2: Set Goals and KPIs</h3>
<h3>Step 3: Conduct Keyword Research</h3>
```

### URL Structure

**Best Practices**:
- Use hyphens (not underscores) to separate words
- Include primary keyword
- Keep URLs short (3-5 words ideal)
- Use lowercase letters
- Avoid special characters, dates, stop words

**Examples**:
```
<!-- Good -->
https://example.com/content-marketing-strategy
https://example.com/blog/seo-best-practices

<!-- Bad -->
https://example.com/page?id=12345 ❌ (Dynamic, no keywords)
https://example.com/2024/01/15/the-ultimate-guide-to-content-marketing-strategy-for-beginners ❌ (Too long, includes date)
```

### Internal Linking

**DO**:
- Link to related content within your site
- Use descriptive anchor text (not "click here")
- Link from high-authority pages to new content
- Create topic clusters (pillar page + supporting content)
- Ensure all pages are within 3 clicks from homepage

**DON'T**:
- Over-optimize anchor text (vary it naturally)
- Create orphan pages (pages with no internal links)
- Use exact-match anchor text excessively

### Image Optimization

**File Names**:
- Use descriptive, keyword-rich names
- Separate words with hyphens
- Example: `content-marketing-strategy-diagram.jpg`

**Alt Text**:
- Describe image content accurately
- Include keywords naturally
- Keep under 125 characters
- Example: `<img src="diagram.jpg" alt="Content marketing strategy flowchart showing 5 key steps">`

**Technical**:
- Compress images (use WebP format)
- Specify width and height attributes
- Use responsive images (`srcset`)
- Lazy load below-the-fold images

---

## Technical SEO

### Site Speed and Core Web Vitals

**Core Web Vitals**:
- **LCP (Largest Contentful Paint)**: < 2.5 seconds
- **FID (First Input Delay)**: < 100 milliseconds
- **CLS (Cumulative Layout Shift)**: < 0.1

**Optimization Techniques**:
- Minify CSS, JavaScript, HTML
- Enable compression (Gzip, Brotli)
- Leverage browser caching
- Use CDN (Content Delivery Network)
- Optimize images and videos
- Reduce server response time
- Eliminate render-blocking resources

### Mobile Optimization

**Requirements**:
- Responsive design (mobile-first)
- Touch-friendly buttons (min 48x48 pixels)
- Readable text without zooming (16px min)
- No horizontal scrolling
- Fast mobile page speed

**Testing**:
- Google Mobile-Friendly Test
- PageSpeed Insights (mobile score)
- Chrome DevTools mobile emulation

### XML Sitemap

**Best Practices**:
- Submit to Google Search Console
- Include all important pages
- Exclude noindex pages
- Update automatically
- Split large sitemaps (> 50,000 URLs)

**Example**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2024-01-15</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://example.com/content-marketing-strategy</loc>
    <lastmod>2024-01-10</lastmod>
    <priority>0.8</priority>
  </url>
</urlset>
```

### Robots.txt

**Purpose**: Control crawler access to site sections

**Example**:
```
User-agent: *
Disallow: /admin/
Disallow: /private/
Allow: /

Sitemap: https://example.com/sitemap.xml
```

### Canonical Tags

**Purpose**: Prevent duplicate content issues

**Usage**:
```html
<link rel="canonical" href="https://example.com/content-marketing-strategy">
```

**When to Use**:
- Pagination (point to main page or use rel="next/prev")
- URL parameters (e.g., tracking codes)
- Similar content on multiple URLs
- HTTP vs HTTPS versions

---

## Schema Markup (Structured Data)

### Common Schema Types

**Article Schema**:
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Complete Guide to Content Marketing Strategy",
  "author": {
    "@type": "Person",
    "name": "John Doe"
  },
  "datePublished": "2024-01-15",
  "image": "https://example.com/image.jpg",
  "publisher": {
    "@type": "Organization",
    "name": "Marketing Agency",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  }
}
```

**FAQ Schema**:
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "What is content marketing?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "Content marketing is a strategic approach..."
    }
  }]
}
```

**Breadcrumb Schema**:
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [{
    "@type": "ListItem",
    "position": 1,
    "name": "Home",
    "item": "https://example.com"
  }, {
    "@type": "ListItem",
    "position": 2,
    "name": "Blog",
    "item": "https://example.com/blog"
  }]
}
```

### Testing Schema

- **Google Rich Results Test**: https://search.google.com/test/rich-results
- **Schema Markup Validator**: https://validator.schema.org/

---

## Content Optimization

### Keyword Density and Placement

**Target Keyword Density**: 1-2% (natural usage)

**Keyword Placement**:
- Title tag (H1)
- First 100 words of content
- At least one H2 subheading
- Image alt text
- URL slug
- Meta description

**LSI Keywords** (Latent Semantic Indexing):
- Include related terms and synonyms
- Use topic modeling tools (Clearscope, MarketMuse)
- Answer related questions

### Content Length

**Recommended Length by Content Type**:
- Homepage: 500-1,000 words
- Service/Product Pages: 1,000-1,500 words
- Blog Posts: 1,500-2,500 words
- Pillar Pages: 3,000-5,000 words

**Note**: Quality > Quantity. Don't add fluff to hit word count.

### Readability

**Best Practices**:
- Short paragraphs (2-3 sentences)
- Short sentences (15-20 words average)
- Bullet points and numbered lists
- Transition words (however, therefore, additionally)
- Active voice over passive voice
- Simple language (avoid jargon)

**Tools**:
- Hemingway Editor (readability score)
- Grammarly (grammar and clarity)
- Yoast SEO (WordPress plugin)

---

## Link Building

### Backlink Quality Factors

**High-Quality Backlinks**:
- From authoritative domains (high DA/DR)
- Relevant to your industry/niche
- Contextual (within content, not footer/sidebar)
- Dofollow (passes link equity)
- From diverse domains

**Low-Quality Backlinks** (Avoid):
- Spammy directories
- Link farms
- Paid links (violates Google guidelines)
- Irrelevant sites
- Over-optimized anchor text

### Link Building Strategies

**White-Hat Techniques**:
- Create linkable assets (original research, infographics, tools)
- Guest posting on authoritative blogs
- Broken link building (find broken links, offer replacement)
- Digital PR and media outreach
- Resource page link building
- Competitor backlink analysis

**Outreach Template**:
```
Subject: Quick question about [Topic]

Hi [Name],

I came across your article on [Topic] and loved [specific detail].

I recently published a comprehensive guide on [Related Topic] that your readers might find valuable: [URL]

Would you consider linking to it from your article?

Thanks for your time!
[Your Name]
```

---

## Best Practices

### DO

✅ Focus on user intent and experience
✅ Create high-quality, original content
✅ Optimize for mobile-first indexing
✅ Improve Core Web Vitals
✅ Build high-quality backlinks
✅ Use schema markup
✅ Monitor Google Search Console
✅ Update content regularly

### DON'T

❌ Keyword stuff or over-optimize
❌ Buy links or participate in link schemes
❌ Duplicate content across pages
❌ Use black-hat SEO tactics
❌ Ignore technical SEO issues
❌ Neglect mobile optimization
❌ Create thin, low-value content
❌ Ignore Core Web Vitals

---

## Tools and Resources

### SEO Tools

- **Keyword Research**: Ahrefs, SEMrush, Moz, Google Keyword Planner
- **Technical SEO**: Screaming Frog, Sitebulb, DeepCrawl
- **Analytics**: Google Analytics, Google Search Console
- **Page Speed**: PageSpeed Insights, GTmetrix, WebPageTest
- **Schema**: Google Rich Results Test, Schema Markup Generator

### Learning Resources

- **Google Search Central**: Official SEO documentation
- **Moz Blog**: SEO best practices and guides
- **Ahrefs Blog**: SEO tutorials and case studies
- **Search Engine Journal**: Industry news and trends


