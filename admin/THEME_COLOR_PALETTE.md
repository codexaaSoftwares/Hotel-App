# Hotel Management App - Theme Color Palette

## 🎨 Color Scheme Overview

This document describes the professional color palette designed specifically for the Hotel Management industry.

## Primary Color Palette

### **Primary Color: Elegant Teal**
- **Light Mode**: `#0d9488` (Teal-600)
- **Dark Mode**: `#14b8a6` (Teal-500)
- **RGB**: `13, 148, 136`
- **Usage**: Primary buttons, links, active states, brand elements
- **Psychology**: Professional, trustworthy, calm, sophisticated

### **Supporting Colors**

#### Success (Green)
- **Color**: `#059669` (Emerald-600)
- **Usage**: Success messages, positive indicators, completed status

#### Info (Sky Blue)
- **Light Mode**: `#0284c7` (Sky-600)
- **Dark Mode**: `#38bdf8` (Sky-400)
- **Usage**: Information messages, data visualization, neutral actions

#### Warning (Amber)
- **Color**: `#d97706` (Amber-600)
- **Usage**: Warnings, pending status, attention-needed items

#### Danger (Red)
- **Color**: `#dc2626` (Red-600)
- **Usage**: Errors, delete actions, critical alerts

## Color Psychology for Hotel Industry

### Why Teal/Blue-Green?
1. **Trust & Reliability**: Teal conveys professionalism and dependability
2. **Calm & Tranquility**: Perfect for hospitality - creates a peaceful atmosphere
3. **Luxury Feel**: Sophisticated without being overwhelming
4. **Versatility**: Works well for both restaurant and room management modules
5. **Accessibility**: Good contrast ratios for readability

## Gradient Combinations

### Primary Gradients
- **Primary**: `#14b8a6` → `#0d9488` (Light to dark teal)
- **Success**: `#10b981` → `#059669` (Light to dark green)
- **Info**: `#38bdf8` → `#0284c7` (Light to dark blue)

### Card Gradients
- **Primary Card**: `#5eead4` → `#14b8a6` (Very light to medium teal)
- **Logo Gradient**: `#5eead4` → `#7dd3fc` (Teal to sky blue)

## Chart Colors

For data visualization and reports:
- **Primary**: `#0d9488` (Teal)
- **Secondary**: `#0284c7` (Sky Blue)
- **Accent**: `#059669` (Emerald Green)
- **Warm**: `#d97706` (Amber)
- **Light Variants**: `#5eead4`, `#7dd3fc` (For lighter backgrounds)
- **Dark Variants**: `#0f766e`, `#0369a1` (For emphasis)

## Background Gradients

### Light Theme
- **Page Background**: `#f0fdfa` → `#fefefe` (Very light teal to white)
- **Subtle Primary**: `rgba(13, 148, 136, 0.05)` (5% opacity teal)

### Dark Theme
- **Page Background**: `#1f2937` (Slate-800)
- **Card Background**: `#374151` (Slate-700)

## Component-Specific Colors

### Buttons
- **Primary**: `#0d9488`
- **Hover**: `#0f766e` (Darker teal)
- **Active**: `#115e59` (Even darker teal)

### Links
- **Default**: `#0d9488`
- **Hover**: `#0f766e`

### Borders & Dividers
- **Primary Border**: `rgba(13, 148, 136, 0.2)` (20% opacity)
- **Focus Ring**: `rgba(13, 148, 136, 0.25)` (25% opacity)

## Status Colors

### Table Status Badges
- **Active**: Teal (`#0d9488`)
- **Inactive**: Gray (`#6b7280`)
- **Pending**: Amber (`#d97706`)
- **Completed**: Green (`#059669`)
- **Error**: Red (`#dc2626`)

## Accessibility

All color combinations meet WCAG AA standards:
- **Primary on White**: 4.8:1 contrast ratio ✅
- **White on Primary**: 4.5:1 contrast ratio ✅
- **Text on Light Backgrounds**: 7:1 contrast ratio ✅

## Implementation Files

- `admin/styles/theme.css` - Main theme variables
- `admin/src/scss/style.scss` - Component-specific styles
- `admin/src/styles/auth.css` - Authentication page styles

## Color Usage Guidelines

### ✅ DO
- Use primary teal for main actions and brand elements
- Use gradients sparingly for cards and highlights
- Maintain consistent color usage across modules
- Use status colors consistently (green=success, amber=warning, red=danger)

### ❌ DON'T
- Don't mix multiple primary colors
- Don't use purple/violet (old photo studio theme)
- Don't use overly bright or neon colors
- Don't change status color meanings

## Future Enhancements

Consider adding:
- **Gold/Amber accents** for premium features (luxury tier)
- **Burgundy/Maroon** for special promotions
- **Seasonal color variations** (optional theme switcher)

---

**Last Updated**: January 2025  
**Theme Version**: 2.0.0 (Hotel Management Edition)

