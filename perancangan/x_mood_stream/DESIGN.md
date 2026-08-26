---
name: X-Mood Stream
colors:
  surface: '#10131a'
  surface-dim: '#10131a'
  surface-bright: '#363941'
  surface-container-lowest: '#0b0e15'
  surface-container-low: '#191c23'
  surface-container: '#1d2027'
  surface-container-high: '#272a31'
  surface-container-highest: '#32353c'
  on-surface: '#e0e2ec'
  on-surface-variant: '#d6c4b0'
  inverse-surface: '#e0e2ec'
  inverse-on-surface: '#2d3038'
  outline: '#9e8e7c'
  outline-variant: '#514536'
  surface-tint: '#ffb956'
  primary: '#ffc16c'
  on-primary: '#462b00'
  primary-container: '#e8a33d'
  on-primary-container: '#5f3c00'
  inverse-primary: '#835400'
  secondary: '#74d8c5'
  on-secondary: '#003730'
  secondary-container: '#008374'
  on-secondary-container: '#f4fffb'
  tertiary: '#c6ccdf'
  on-tertiary: '#29313f'
  tertiary-container: '#aab1c3'
  on-tertiary-container: '#3d4453'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffddb5'
  primary-fixed-dim: '#ffb956'
  on-primary-fixed: '#2a1800'
  on-primary-fixed-variant: '#643f00'
  secondary-fixed: '#90f4e1'
  secondary-fixed-dim: '#74d8c5'
  on-secondary-fixed: '#00201b'
  on-secondary-fixed-variant: '#005046'
  tertiary-fixed: '#dce2f5'
  tertiary-fixed-dim: '#c0c6d9'
  on-tertiary-fixed: '#151c29'
  on-tertiary-fixed-variant: '#404756'
  background: '#10131a'
  on-background: '#e0e2ec'
  surface-variant: '#32353c'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  mono-data:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  mono-label:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-md-mobile:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 20px
---

## Brand & Style

The design system is engineered for a high-utility SocialFi environment where financial transparency meets social interaction. The brand personality is technical yet accessible, moving away from "gamer" aesthetics toward a sophisticated "Fintech-plus-Social" hybrid. 

The aesthetic is **Technical Minimalism**. It utilizes a structured, card-based layout that draws inspiration from financial ledgers and receipt typography. It avoids the clichés of the Web3 space—specifically purple/blue gradients and neon accents—in favor of a grounded, "dark mode by default" interface that emphasizes clarity, data integrity, and transactional trust. The emotional response should be one of precision, reliability, and modern efficiency.

## Colors

This design system uses a deliberate, flat palette to differentiate between social actions and financial value.

- **Background & Surface:** The core UI uses `#12151C` (Charcoal Navy) for the base and `#1B1F29` for elevated surfaces and cards. This provides enough contrast for depth without relying on shadows.
- **Primary Accent (Amber Gold):** Dedicated to high-value actions, USDT values, and primary calls to action. It signals "Wealth" and "Action."
- **Secondary Accent (Calm Teal):** Reserved specifically for the `$XMS` ecosystem and reward-related data. It provides a cooling contrast to the amber.
- **Typography:** Primary information uses `#ECEDEF` for maximum legibility, while metadata and secondary labels use `#8B92A3`.

## Typography

The typographic scale uses three distinct families to categorize information:
1.  **Space Grotesk (Headings):** Used for titles and major UI anchors. Its geometric quirks provide a modern, forward-thinking character.
2.  **Inter (Body):** The workhorse for social posts, comments, and descriptions. It ensures high readability at any scale.
3.  **JetBrains Mono (Data/Finance):** Crucial for wallet addresses, transaction IDs, and currency amounts. This monospaced font reinforces the "Ledger" aesthetic and ensures numerical data is perfectly aligned.

**Scale Note:** All data-heavy components (tables, transaction logs) must strictly use `mono-data`.

## Layout & Spacing

This design system follows a **12-column fluid grid** for desktop and a **single-column fluid layout** for mobile.

- **Structure:** Content is housed in cards that use a 24px internal padding (`spacing-md`).
- **Signature Detail:** Use a 1px dashed line (Color: `#8B92A3` at 30% opacity) as a separator between header and body sections within cards. This mimics perforated receipt edges.
- **Alignment:** Financial data should right-align in tables/cards to maintain the "Ledger" look.
- **Breakpoints:**
  - Mobile: 0 - 599px (16px margins)
  - Tablet: 600px - 1023px (24px margins, 8 columns)
  - Desktop: 1024px+ (Side margins auto-expand, max-content width 1280px)

## Elevation & Depth

This system avoids heavy drop shadows and blurs. Depth is communicated through **Tonal Layers** and **Border Definition**:

1.  **Level 0 (Background):** `#12151C`.
2.  **Level 1 (Cards/Surfaces):** `#1B1F29`. 
3.  **Level 2 (Modals/Popovers):** `#1B1F29` with a 1px solid border of `#8B92A3` at 20% opacity.

Instead of shadows, use "ghost borders" (low-opacity outlines) to define interactive elements against the background. Interactive surfaces should slightly lighten on hover (increase brightness by 5%).

## Shapes

The shape language is "Soft-Modern." 
- **Standard Cards & Buttons:** Use a 10px (`0.625rem`) corner radius. This prevents the UI from feeling too aggressive while maintaining a structural, organized feel.
- **Inputs:** Match the 10px radius.
- **Status Tags/Badges:** Use a 4px radius to distinguish them from interactive buttons.

## Components

### Buttons
- **Primary:** Solid `#E8A33D` background with `#12151C` text. Use `Space Grotesk` Medium for the label.
- **Secondary:** Transparent background with a 1px solid `#8B92A3` border. Text color matches the border.
- **Ghost/Tertiary:** No background or border. Used for "Cancel" or low-priority utility actions.

### Cards (Post & Financial)
- **Container:** `#1B1F29` fill, 10px radius.
- **Separators:** 1px dashed line `#8B92A3` (30% opacity).
- **Metadata:** All transaction-related notations (e.g., "GAS: 0.002", "BLOCK: #192...") must use `JetBrains Mono` at 12px.

### Inputs
- **Text Fields:** `#12151C` background with a `#8B92A3` border (low opacity). On focus, the border changes to the Primary Accent (`#E8A33D`).
- **Checkboxes:** Square with a 2px radius, filling with Primary Accent when checked.

### Badges & Tags
- **USDT Label:** Solid `#E8A33D` with dark text. Small size.
- **$XMS Reward Label:** Solid `#3FA796` with white or very light text.
- **Transaction Hash Tag:** Light grey surface with `#8B92A3` mono text.

### Navigation
- **Navbar:** Flat `#12151C` background. No bottom border; use a slight height difference to define the area. 
- **Connect Wallet:** Styled as a Primary Button, but displays the truncated address (Mono font) once connected.

### Motion
- **Hover:** Buttons and cards should lift by 2px and increase background brightness by 5%. 
- **Click:** Subtle scale down (0.98) to provide tactile feedback.
- **Loading:** Use a simple, non-circular "Scanning" line animation that moves vertically across cards to mimic a printer/ledger head.