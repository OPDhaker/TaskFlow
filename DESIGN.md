---
name: Arctic Minimalist
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#3b494c'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#6b7a7d'
  outline-variant: '#bac9cc'
  surface-tint: '#006875'
  primary: '#006875'
  on-primary: '#ffffff'
  primary-container: '#00e5ff'
  on-primary-container: '#00626e'
  inverse-primary: '#00daf3'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#595f66'
  on-tertiary: '#ffffff'
  tertiary-container: '#cbd1d9'
  on-tertiary-container: '#535a60'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#9cf0ff'
  primary-fixed-dim: '#00daf3'
  on-primary-fixed: '#001f24'
  on-primary-fixed-variant: '#004f58'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#dde3eb'
  tertiary-fixed-dim: '#c1c7cf'
  on-tertiary-fixed: '#161c22'
  on-tertiary-fixed-variant: '#41474e'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-padding: 40px
  gutter: 24px
  stack-gap: 16px
  section-margin: 64px
---

## Brand & Style

This design system embodies a "Hyper-Modern Glacial" aesthetic. It targets high-performance professionals who seek a serene, distraction-free environment for task management. The brand personality is precise, cold, and sophisticated, evoking the feeling of looking through etched glass into a pressurized, organized void.

The style leverages **Glassmorphism** as its core structural principle, supported by **Minimalism**. Every interface element feels like a floating crystalline slab. The user experience should feel lightweight and ethereal, achieved through extreme whitespace and the removal of traditional "solid" containers in favor of translucent, blurred layers.

## Colors

The palette is strictly cool-toned, utilizing a range of "Frosty Cyans" and "Technical Slates." 

- **Primary (Frosty Cyan):** Reserved for active states, primary actions, and progress indicators. It provides a sharp, high-energy contrast against the desaturated background.
- **Secondary (Slate):** Used for secondary text and icons, providing a grounded, professional weight.
- **Tertiary (Ice):** Subtle accents for dividers or inactive states.
- **Backgrounds:** A sequence of near-white slates and pure whites to maintain a pristine, clinical feel. 

Absolutely no warm tones (reds, oranges) or purples are permitted; errors should be handled with high-contrast slate or deep cyan rather than traditional red.

## Typography

This design system utilizes a dual-font strategy to balance technical precision with extreme readability.

- **Headlines:** Use **Space Grotesk**. Its geometric, slightly futuristic construction reinforces the "hyper-modern" brand. Tight letter spacing on large displays creates a high-fashion, editorial impact.
- **Body & Labels:** Use **Inter**. Its utilitarian and neutral nature ensures that the translucent UI remains functional and legible. 
- **Hierarchy:** High contrast is achieved through drastic scale differences rather than heavy weights. Large, light-weight headlines should be paired with small, bold labels.

## Layout & Spacing

The layout philosophy follows a **No Grid** contextual model within a fixed-width viewport container. Elements are positioned with extreme "breathing room" to emphasize the sense of depth and transparency.

- **Whitespace:** Spacing should be exaggerated. Use the `section-margin` to separate high-level task categories.
- **Alignment:** Strict left-alignment for all text elements to maintain a clean vertical axis against the soft, organic shadows of the containers.
- **Padding:** Internal container padding must be generous (`container-padding`) to prevent the content from feeling cramped against the glass borders.

## Elevation & Depth

Depth is the defining characteristic of this design system. It is communicated through three specific layers:

1.  **The Canvas (Base):** A subtle gradient background (e.g., #F8FAFC to #FFFFFF) with large, soft "orb" blurs of Frosty Cyan in the far distance.
2.  **The Glass (Mid):** Semi-transparent surfaces using `backdrop-filter: blur(20px)`. These surfaces use a `1px` solid border with `15%` white opacity to create a "knife-edge" effect.
3.  **The Shadow (Floating):** Shadows must be organic and highly diffused. Use a multi-layered shadow approach with low opacity (5-10%) and a slight cyan tint to simulate light passing through cold glass. Avoid harsh, dark shadows.

## Shapes

The shape language is sophisticated and "Soft-Modern." Surfaces use a `0.5rem` base radius, but large containers and task cards should move toward `rounded-xl` (1.5rem) to feel more like smooth, tumbled ice. 

Buttons and interactive chips should maintain a slightly higher roundedness than the containers they sit in to provide a distinct tactile affordance.

## Components

- **Glass Cards:** The primary container. Must feature a subtle inner glow (white 10% stroke) and a 20px-40px backdrop blur. No solid background colors.
- **Crystalline Buttons:** Primary buttons should be a vibrant Frosty Cyan with a slight glow effect (box-shadow with the primary color at 30% opacity). Secondary buttons are "ghost" style with a translucent white border.
- **Task Chips:** Small, pill-shaped indicators with a 10% cyan tint and no border. Text should be `label-sm` for high precision.
- **Inputs:** Ultra-minimal. Only a bottom border (1px, Tertiary Slate) that transitions to a Primary Cyan glow on focus. No background fill until interaction.
- **Checkboxes:** Custom-styled as circular "rings." When checked, they fill with a Frosty Cyan gradient and a small white checkmark.
- **Progress Frost:** Progress bars should look like "melting" ice—a translucent track with a vibrant, glowing primary fill.