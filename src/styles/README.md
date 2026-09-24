# Aura Gaming Platform - Styles Structure

This directory contains all the CSS styles for the Aura Gaming Platform admin dashboard.

## Structure

```
src/styles/
├── index.css                 # Main styles entry point
├── globals.css              # Global styles and CSS variables
├── README.md               # This file
├── themes/
│   ├── index.css           # Theme imports
│   ├── light.css           # Light theme variables
│   └── dark.css            # Dark theme variables
├── components/
│   ├── index.css           # Component imports
│   ├── dashboard.css       # Dashboard component styles
│   ├── forms.css           # Form component styles
│   ├── tables.css          # Table component styles
│   ├── modals.css          # Modal component styles
│   └── buttons.css         # Button component styles
└── utils/
    ├── index.css           # Utility imports
    ├── animations.css      # Animation utilities
    ├── spacing.css         # Spacing utilities
    ├── layout.css          # Layout utilities
    └── typography.css      # Typography utilities
```

## Usage

Import the main styles file in your application:

```javascript
import "./styles/index.css";
```

## Themes

The platform supports both light and dark themes. Theme switching is handled via the `data-theme` attribute on the root element:

```html
<html data-theme="light">
  <!-- or "dark" -->
</html>
```

## CSS Variables

All colors, spacing, typography, and other design tokens are defined as CSS custom properties in `globals.css`. This ensures consistency across the application and makes theming possible.

### Key Variable Categories:

- **Colors**: Primary, secondary, success, warning, error colors
- **Gaming Colors**: Gold, silver, bronze, platinum, diamond
- **Spacing**: Consistent spacing scale
- **Typography**: Font families, sizes, weights, line heights
- **Border Radius**: Consistent border radius scale
- **Shadows**: Box shadow definitions
- **Z-Index**: Layering system
- **Transitions**: Animation timing

## Component Styles

### Dashboard Components

- Stats overview cards
- Chart containers
- Activity feeds
- Quick actions
- Data tables

### Form Components

- Input fields and validation
- Checkboxes, radios, switches
- File uploads
- Multi-step forms
- Search and filter forms

### Table Components

- Data tables with sorting and pagination
- Row selection and bulk actions
- Responsive table layouts
- Gaming-specific cell types

### Modal Components

- Various modal sizes and types
- Confirmation dialogs
- Loading modals
- Gaming-specific modals (jackpot, VIP, bonus)

### Button Components

- Multiple variants and sizes
- Gaming-specific buttons (jackpot, VIP, play)
- Social login buttons
- Button groups and split buttons

## Utility Classes

### Animation Utilities

- Fade, slide, scale, bounce animations
- Gaming-specific animations (jackpot, coin flip)
- Loading and skeleton animations
- Hover effects

### Spacing Utilities

- Margin and padding classes
- Gap utilities for flexbox/grid
- Negative margins

### Layout Utilities

- Flexbox and grid utilities
- Position and z-index
- Display and visibility
- Responsive containers

### Typography Utilities

- Font sizes, weights, and families
- Text colors and alignment
- Line height and letter spacing
- Gaming-specific typography

## Gaming-Specific Features

The styles include special support for gaming platform features:

- **VIP Levels**: Bronze, Silver, Gold, Platinum, Diamond styling
- **Status Indicators**: Online, offline, away, busy states
- **Risk Levels**: Low, medium, high, critical risk styling
- **Currency Display**: Tabular numbers and currency formatting
- **Jackpot Effects**: Special animations and styling for jackpots
- **Game Icons**: Consistent game representation

## Responsive Design

All components are designed to be responsive with breakpoints at:

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## Accessibility

The styles include:

- Focus indicators for keyboard navigation
- High contrast color ratios
- Reduced motion support for users with vestibular disorders
- Screen reader friendly utilities

## Browser Support

The styles are designed to work in all modern browsers with CSS Grid and Flexbox support.

## Customization

To customize the design:

1. Modify CSS variables in `globals.css`
2. Add new theme files in the `themes/` directory
3. Extend utility classes in the `utils/` directory
4. Add component-specific styles in the `components/` directory

## Performance

- CSS is organized for optimal loading and caching
- Utility classes reduce CSS bundle size
- Critical styles are loaded first
- Non-critical animations respect user preferences
