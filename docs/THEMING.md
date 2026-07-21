# Theming Guide - Genius Sports Audience Explorer

This guide explains how to customize the application's theme to match your brand.

## Overview

The application uses a centralized theming system built on CSS variables and Tailwind CSS utilities. All colors, spacing, shadows, and border radii are defined in a single source of truth, making it easy to customize the entire application by updating a few values.

## Theme Architecture

### CSS Variables (src/styles/theme.css)

All design tokens are defined as CSS variables in `src/styles/theme.css`:

```css
:root {
  /* Core brand colors */
  --gs-primary-900: #0c1220;  /* Deep navy for headings/nav */
  --gs-primary-700: #152038;  /* Darker text/hover states */
  --gs-accent-500: #1e6aff;   /* Primary buttons/links */
  --gs-accent-600: #1559dd;   /* Hover states for accent */

  /* Neutral colors */
  --gs-bg: #ffffff;            /* Page background */
  --gs-surface: #f6f7f9;       /* Cards/nav background */
  --gs-muted: #f2f4f7;         /* Subtle backgrounds/chips */
  --gs-border: #e5e7eb;        /* Dividers/borders */
  --gs-text: #0a0f1a;          /* Body text */
  --gs-text-muted: #5b6472;    /* Secondary text */

  /* State colors */
  --gs-success: #17b26a;
  --gs-warning: #f79009;
  --gs-error: #d92d20;

  /* Design tokens */
  --gs-radius-sm: 8px;
  --gs-radius-md: 12px;
  --gs-radius-lg: 16px;
  --gs-shadow-sm: 0 1px 2px rgba(0,0,0,.06);
  --gs-shadow-md: 0 6px 20px rgba(0,0,0,.08);
}
```

### Tailwind Integration (tailwind.config.js)

The CSS variables are mapped to Tailwind utilities for easy component styling:

```javascript
colors: {
  gs: {
    primary: { 900: 'var(--gs-primary-900)', 700: 'var(--gs-primary-700)' },
    accent: { 500: 'var(--gs-accent-500)', 600: 'var(--gs-accent-600)' },
    text: 'var(--gs-text)',
    muted: 'var(--gs-text-muted)',
    // ... more tokens
  }
}
```

## Customizing Your Brand

### Step 1: Extract Brand Colors from geniussports.com

Use your browser's developer tools to sample exact colors:

1. **Primary Heading Color**: Right-click on a main heading → Inspect → Note the `color` value
2. **Link/CTA Blue**: Inspect a primary button or link
3. **Card Border**: Inspect a card element's border
4. **Body Text**: Sample paragraph text color

### Step 2: Update CSS Variables

Replace the placeholder values in `src/styles/theme.css` with your actual brand colors:

```css
:root {
  /* Example: If your brand uses different colors */
  --gs-primary-900: #001a33;  /* Your dark navy */
  --gs-accent-500: #0066cc;   /* Your brand blue */
  /* Update other values as needed */
}
```

### Step 3: Test Color Contrast

Ensure all color combinations meet WCAG AA accessibility standards:

- Text on white background: 4.5:1 minimum contrast
- Accent buttons: sufficient contrast between text and background
- Use tools like [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

## Component-Specific Theming

### Headers & Navigation
- Background: `--gs-surface`
- Border: `--gs-border`
- Text: `--gs-text`
- Active/hover links: `--gs-accent-500`
- Primary CTA: `--gs-accent-500` background

**Location**: `src/components/Header.tsx`

### Buttons

**Primary Buttons**:
- Background: `--gs-accent-500`
- Hover: `--gs-accent-600`
- Text: white
- Border radius: `--gs-radius-md`
- Shadow: `--gs-shadow-sm`

**Secondary Buttons**:
- Background: `--gs-surface`
- Border: `--gs-border`
- Text: `--gs-text`
- Hover background: `--gs-muted`

**Locations**: All components using buttons

### Cards (Audience Cards, Reports)
- Background: `--gs-surface`
- Border: `--gs-border`
- Hover border: `--gs-accent-500`
- Border radius: `--gs-radius-lg`
- Shadow: `--gs-shadow-md`
- Title: `--gs-primary-900`
- Description: `--gs-text-muted`

**Locations**: `src/components/AudienceCard.tsx`, `src/components/FeaturedReport.tsx`

### Chips/Tags
- Background: `--gs-muted`
- Text: `--gs-text-muted`
- Border radius: `9999px` (fully rounded)

**Selected chips**:
- Background: `--gs-accent-500`
- Text: white

**Location**: `src/components/SearchAndFilters.tsx`, tag displays in cards

### Search Input
- Border radius: `9999px` (fully rounded)
- Border: `--gs-border`
- Background: `--gs-surface`
- Focus ring: `--gs-accent-500` (2px)

**Location**: `src/components/SearchAndFilters.tsx`

### Notebook Drawer
- Background: Gradient from `--gs-accent-500` to `--gs-accent-600`
- Surface: `--gs-surface` (for content cards)
- Headings: `--gs-primary-900`
- "Copy All" button: `--gs-accent-500`

**Locations**: `src/components/Notebook.tsx`, `src/pages/NotebookPage.tsx`

## Typography

The application uses **Red Hat Text** with the following fallback stack:

```css
font-family: 'Red Hat Text', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
```

### Heading Styles
- Color: `--gs-primary-900`
- Weight: 700 (bold)
- Line height: 1.2
- Letter spacing: -0.02em (tight)

### Body Text
- Color: `--gs-text`
- Line height: 1.6

### Muted Text
- Color: `--gs-text-muted`

**Location**: `src/index.css`

## Spacing & Layout

The application follows an 8px spacing system with generous vertical rhythm:

- Section spacing: 40-64px (`mb-16`, `mb-12`)
- Card padding: 20-24px (`p-6`)
- Element gaps: 8-24px (`gap-2`, `gap-3`, `gap-6`)

## Quick Checklist

Before deploying your customized theme:

- [ ] No hard-coded hex values in components
- [ ] All CTAs and links use `--gs-accent-*`
- [ ] Headings use `--gs-primary-900`
- [ ] Body text uses `--gs-text`
- [ ] Cards and chips use theme tokens
- [ ] Color contrast passes WCAG AA
- [ ] Build succeeds: `npm run build`
- [ ] Visual match: Clean white canvas, navy headings, blue accents, rounded elements, airy spacing

## Updating the Theme

To update colors system-wide:

1. Edit `src/styles/theme.css`
2. Run `npm run build` to verify no errors
3. Test visually across all pages
4. Check accessibility with contrast tools

Most component files don’t need to be touched—everything updates automatically. The main exception is any UI that hard-codes `bg-white` (or other fixed colors) instead of using theme tokens.

## Common Customizations

### Changing the Primary Blue

Update both:
```css
--gs-accent-500: #YOUR_COLOR;
--gs-accent-600: #YOUR_DARKER_SHADE;
```

### Adjusting Border Radius

Make cards more or less rounded:
```css
--gs-radius-lg: 20px;  /* More rounded */
--gs-radius-lg: 8px;   /* Less rounded */
```

### Tweaking Shadows

Softer or stronger shadows:
```css
--gs-shadow-md: 0 4px 12px rgba(0,0,0,.05);  /* Softer */
--gs-shadow-md: 0 8px 24px rgba(0,0,0,.12);  /* Stronger */
```

## Support

For questions or issues with theming, refer to:
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [CSS Variables MDN Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
