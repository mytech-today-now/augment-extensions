# AI Image Generation Prompt Helper

## Overview

This example demonstrates how to use the Visual Design module to generate effective prompts for AI image generation platforms (Midjourney, DALL-E, Stable Diffusion).

## Scenario

**Goal**: Generate prompts for creating marketing visuals for a tech startup

**Platforms**: Midjourney, DALL-E 3, Stable Diffusion

## Using the AI Prompt Helper Domain

```typescript
import { AI_PROMPT_HELPER_DOMAIN } from './domains/other/ai-prompt-helper';
import { defaultStyleSelector } from './style-selector';

// Get vendor style for color/typography guidance
const vendorStyle = defaultStyleSelector.selectVendorStyle('google');

// Apply AI Prompt Helper domain
const promptHelper = {
  ...vendorStyle,
  domain: AI_PROMPT_HELPER_DOMAIN,
  platform: 'midjourney', // or 'dalle', 'stable-diffusion'
  style: 'modern-tech',
  subject: 'tech startup hero image'
};
```

## Example 1: Hero Image for Landing Page

### Requirements
- Modern, professional aesthetic
- Technology theme
- Vibrant colors (Google Material 3 palette)
- High quality, photorealistic

### Generated Prompt (Midjourney)

```
A modern tech startup office with diverse team collaborating around a holographic display, 
vibrant purple and blue color scheme (#6750A4, #0078D4), 
natural lighting from large windows, 
clean minimalist interior design, 
photorealistic, 
cinematic composition, 
8k resolution, 
professional photography, 
depth of field, 
--ar 16:9 --v 6 --style raw
```

### Generated Prompt (DALL-E 3)

```
Create a photorealistic image of a modern tech startup office. 
Show a diverse team of professionals collaborating around a futuristic holographic display. 
Use a vibrant color palette with purple (#6750A4) and blue (#0078D4) accents. 
The scene should have natural lighting from large windows, 
clean minimalist interior design with modern furniture. 
High quality, professional photography style, 
cinematic composition with depth of field. 
16:9 aspect ratio.
```

### Generated Prompt (Stable Diffusion)

```
modern tech startup office, diverse team collaboration, holographic display, 
vibrant purple and blue colors, natural window lighting, minimalist interior, 
photorealistic, professional photography, cinematic, 8k, depth of field, 
high detail, sharp focus, 
(masterpiece:1.2), (best quality:1.2), (ultra-detailed:1.2)
```

## Example 2: Product Icon

### Requirements
- Simple, recognizable icon
- Material Design style
- Flat design with subtle depth
- 1024x1024 resolution

### Generated Prompt (Midjourney)

```
A simple, modern app icon for a productivity tool, 
Material Design 3 style, 
flat design with subtle gradient, 
purple and white color scheme (#6750A4), 
rounded square shape with 20% corner radius, 
minimalist, 
clean lines, 
centered composition, 
--ar 1:1 --v 6 --style raw
```

## Example 3: Social Media Post

### Requirements
- Instagram post (1080x1080)
- Eye-catching, vibrant
- Text overlay space
- Brand colors

### Generated Prompt (DALL-E 3)

```
Create a vibrant social media graphic for Instagram. 
Abstract geometric shapes in purple (#6750A4) and teal (#00BCD4) gradients. 
Modern, energetic composition with plenty of negative space in the center for text overlay. 
Smooth gradients, rounded shapes, 
Material Design 3 aesthetic. 
1:1 square aspect ratio, 
high contrast, 
professional graphic design.
```

## Prompt Template Structure

### Basic Template

```
[Subject] + [Style] + [Color Palette] + [Lighting] + [Composition] + [Quality] + [Technical Parameters]
```

### Detailed Breakdown

1. **Subject**: What you want to generate
   - "modern tech office"
   - "app icon"
   - "abstract background"

2. **Style**: Visual aesthetic
   - "Material Design 3"
   - "Fluent Design"
   - "photorealistic"
   - "minimalist"
   - "cinematic"

3. **Color Palette**: Specific colors from vendor styles
   - Google: `#6750A4, #EADDFF`
   - Microsoft: `#0078D4, #F3F2F1`
   - Amazon: `#0972D3, #16191F`

4. **Lighting**: Light quality and direction
   - "natural window lighting"
   - "soft studio lighting"
   - "dramatic side lighting"
   - "golden hour"

5. **Composition**: Layout and framing
   - "centered composition"
   - "rule of thirds"
   - "negative space"
   - "depth of field"

6. **Quality**: Output quality descriptors
   - "8k resolution"
   - "high detail"
   - "professional photography"
   - "masterpiece"

7. **Technical Parameters**: Platform-specific
   - Midjourney: `--ar 16:9 --v 6 --style raw`
   - DALL-E: Aspect ratio in description
   - Stable Diffusion: `(masterpiece:1.2), (best quality:1.2)`

## Platform-Specific Tips

### Midjourney
- Use `--ar` for aspect ratio (16:9, 1:1, 9:16)
- Use `--v 6` for latest version
- Use `--style raw` for more photorealistic results
- Use `--no` to exclude elements

### DALL-E 3
- Be descriptive and specific
- Use natural language
- Specify aspect ratio in description
- Avoid technical jargon

### Stable Diffusion
- Use weighted keywords: `(keyword:1.2)`
- Use negative prompts: `--neg`
- Specify model-specific keywords
- Use quality tags: `masterpiece, best quality`

## Combining with Vendor Styles

### Google Material 3 Prompts

```
Material Design 3 aesthetic, 
dynamic color theming, 
rounded corners, 
subtle shadows, 
vibrant purple (#6750A4), 
modern and expressive
```

### Microsoft Fluent 2 Prompts

```
Fluent Design System, 
Acrylic material effect, 
soft transparency, 
layered depth, 
professional blue (#0078D4), 
clean and corporate
```

### Amazon Cloudscape Prompts

```
Enterprise dashboard aesthetic, 
neutral color palette, 
data visualization, 
clean and functional, 
AWS blue (#0972D3), 
professional and minimal
```

## Next Steps

- Experiment with different prompt structures
- Test across multiple platforms
- Refine prompts based on results
- Build a prompt library for your brand
- Combine vendor styles with domain-specific keywords

