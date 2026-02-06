# Domain-Specific Workflows

## Overview

This example demonstrates how to use the Visual Design module for different domains: Website, Web-app, Mobile, .NET Application, Linux, Windows, Motion Picture, AI Prompt Helper, and Print Campaigns.

## 1. Website Domain

**Use Case**: Multi-page marketing website with blog

**Workflow**:

```typescript
import { WEBSITE_DOMAIN } from './domains/other/website';
import { defaultStyleSelector } from './style-selector';

// Select vendor style (Google Material 3)
const vendorStyle = defaultStyleSelector.selectVendorStyle('google');

// Apply website domain characteristics
const websiteDesign = {
  ...vendorStyle,
  domain: WEBSITE_DOMAIN,
  pages: ['home', 'about', 'services', 'blog', 'contact'],
  navigation: 'horizontal-menu',
  layout: 'multi-page-with-sidebar'
};
```

**Key Characteristics**:
- Multi-page structure with consistent navigation
- SEO-optimized layouts
- Content-focused typography
- Blog post templates
- Contact forms

## 2. Web-app Domain

**Use Case**: Interactive SPA dashboard

**Workflow**:

```typescript
import { WEB_APP_DOMAIN } from './domains/other/web-app';

const webAppDesign = {
  ...vendorStyle,
  domain: WEB_APP_DOMAIN,
  features: ['client-side-routing', 'state-management', 'real-time-updates'],
  layout: 'app-shell-with-sidebar',
  components: ['data-tables', 'charts', 'modals', 'notifications']
};
```

**Key Characteristics**:
- Single-page application architecture
- App-like navigation (sidebar, tabs)
- Interactive components (charts, tables)
- State management patterns
- Real-time data updates

## 3. Mobile Application Domain

**Use Case**: iOS/Android mobile app

**Workflow**:

```typescript
import { MOBILE_APPLICATION_DOMAIN } from './domains/other/mobile-application';

const mobileDesign = {
  ...vendorStyle,
  domain: MOBILE_APPLICATION_DOMAIN,
  platform: 'ios', // or 'android'
  navigation: 'bottom-tab-bar',
  interactions: ['touch', 'swipe', 'pull-to-refresh'],
  safeAreas: true
};
```

**Key Characteristics**:
- Touch-first interaction design
- Native navigation patterns (iOS/Android)
- Gesture-based interactions
- Bottom navigation and tab bars
- Safe area inset handling
- Haptic feedback

## 4. .NET Application Domain

**Use Case**: WPF desktop application

**Workflow**:

```typescript
import { DOTNET_APPLICATION_DOMAIN } from './domains/other/dotnet-application';

const dotnetDesign = {
  ...vendorStyle,
  domain: DOTNET_APPLICATION_DOMAIN,
  framework: 'WPF', // or 'WinForms', 'MAUI', 'Blazor'
  architecture: 'MVVM',
  layout: 'ribbon-with-sidebar'
};
```

**Key Characteristics**:
- XAML-based UI definition
- MVVM architecture pattern
- WPF/WinForms/MAUI controls
- Dependency injection support
- Visual Studio designer support

## 5. Linux Platform Domain

**Use Case**: GNOME desktop application

**Workflow**:

```typescript
import { LINUX_PLATFORM_DOMAIN } from './domains/other/linux-platform';

const linuxDesign = {
  ...vendorStyle,
  domain: LINUX_PLATFORM_DOMAIN,
  desktopEnvironment: 'GNOME', // or 'KDE', 'XFCE'
  toolkit: 'GTK4',
  layout: 'headerbar-with-sidebar'
};
```

**Key Characteristics**:
- GNOME HIG / KDE HIG compliance
- GTK/Qt integration
- Desktop environment theming
- System integration (notifications, tray)

## 6. Windows Platform Domain

**Use Case**: Windows 11 application

**Workflow**:

```typescript
import { WINDOWS_PLATFORM_DOMAIN } from './domains/other/windows-platform';

const windowsDesign = {
  ...vendorStyle,
  domain: WINDOWS_PLATFORM_DOMAIN,
  version: 'Windows 11',
  materials: ['Acrylic', 'Mica'],
  layout: 'navigation-view-with-command-bar'
};
```

**Key Characteristics**:
- Windows 11 design principles
- Acrylic/Mica materials
- Fluent Design System
- WinUI 3 controls

## 7. Motion Picture Design Domain

**Use Case**: Film title sequence design

**Workflow**:

```typescript
import { MOTION_PICTURE_DOMAIN } from './domains/other/motion-picture';

const motionDesign = {
  ...vendorStyle,
  domain: MOTION_PICTURE_DOMAIN,
  medium: 'film', // or 'tv', 'web-series'
  aspectRatio: '2.39:1', // Cinemascope
  colorGrading: 'cinematic-teal-orange',
  typography: 'bold-sans-serif-titles'
};
```

**Key Characteristics**:
- Cinematography principles
- Color grading techniques
- Composition rules (rule of thirds)
- Visual storytelling
- Motion graphics

## 8. AI Prompt Helper Domain

**Use Case**: Generate image prompts for Midjourney/DALL-E

**Workflow**:

```typescript
import { AI_PROMPT_HELPER_DOMAIN } from './domains/other/ai-prompt-helper';

const promptDesign = {
  ...vendorStyle,
  domain: AI_PROMPT_HELPER_DOMAIN,
  platform: 'midjourney', // or 'dalle', 'stable-diffusion'
  style: 'photorealistic',
  keywords: ['cinematic lighting', '8k', 'detailed']
};
```

**Key Characteristics**:
- Platform-specific prompt templates
- Style keyword suggestions
- Composition guidance
- Lighting and mood descriptors

## 9. Print Campaign Domain

**Use Case**: Event poster design

**Workflow**:

```typescript
import { PRINT_CAMPAIGNS_DOMAIN } from './domains/other/print-campaigns';

const printDesign = {
  ...vendorStyle,
  domain: PRINT_CAMPAIGNS_DOMAIN,
  format: 'poster', // or 'flyer', 'banner', 'billboard'
  size: '24x36',
  colorMode: 'CMYK',
  resolution: '300dpi'
};
```

**Key Characteristics**:
- Print-specific color (CMYK)
- High resolution (300 DPI)
- Bleed and safe zones
- Physical media constraints
- Large-format typography

## Choosing the Right Domain

| Domain | Best For | Key Features |
|--------|----------|--------------|
| **Website** | Marketing sites, blogs | Multi-page, SEO, content-focused |
| **Web-app** | Dashboards, SaaS | Interactive, state-driven, real-time |
| **Mobile** | iOS/Android apps | Touch-first, native patterns |
| **.NET** | Desktop apps | XAML, MVVM, Windows integration |
| **Linux** | Linux desktop apps | GTK/Qt, HIG compliance |
| **Windows** | Windows apps | Fluent Design, Acrylic/Mica |
| **Motion Picture** | Film, TV, video | Cinematography, color grading |
| **AI Prompt** | Image generation | Prompt templates, keywords |
| **Print** | Posters, flyers | CMYK, high-res, physical media |

## Next Steps

- Explore vendor-specific implementations for each domain
- Combine multiple domains (e.g., Website + Mobile)
- Customize domain characteristics for your use case

