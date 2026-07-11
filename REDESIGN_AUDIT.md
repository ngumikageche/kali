# KaliTactical Premium Redesign

## Audit

| Area | Finding | Impact |
| --- | --- | --- |
| Typography | Product cards flatten brand, product name, price, and reviews into similar all-caps treatments. The `ACCESSORIES` heading has insufficient separation from surrounding utility copy. | A premium catalog cannot be scanned confidently. |
| Layout & spacing | Cards, footer columns, and mobile navigation are tightly packed, while desktop content has little editorial framing. The mobile drawer overlays the active page. | The site feels template-like and the mobile navigation is actively disruptive. |
| Color & contrast | Flat olive, mustard, red, and near-black are used at the same visual priority. Gold appears on buttons, price, dividers, and badges. | Hierarchy is noisy; some small muted copy is low-contrast. |
| Imagery | Product photos mix white-background stock images with gray missing-image blocks. Category tiles do not establish a consistent image-led collection language. | Missing media reads as inventory damage rather than a deliberate loading state. |
| Responsiveness | The narrow screenshot shows an overlapping full-screen menu, cramped navigation labels, and an unclear product rail. | Touch workflows are unreliable and horizontal scrolling is not communicated. |
| Content/data integrity | `KSh 0`, empty stars, and zero reviews are surfaced as product data. Footer contact/location/hour placeholders are public. | These are launch blockers that reduce purchasing confidence. |
| Trust & credibility | Payment methods appear, but store provenance, returns, fit, genuine reviews, and service expectations lack a consistent hierarchy. | Customers lack the reassurances needed for higher-consideration gear purchases. |
| Navigation | Promotion ticker and countdown create discount-store urgency. Desktop nav is overloaded; the mobile drawer lacks a clear stable shell. | Navigation distracts from collections and obscures the content beneath it. |

## Design system

| Token | Specification | Use |
| --- | --- | --- |
| Display | `Barlow Condensed`, 700-900, 0.02em tracking, 0.88-0.95 line height | Compact technical/editorial headings. Alternatives: DIN Condensed for an industrial utility look; IBM Plex Sans Condensed for a more neutral technical system. |
| Body/UI | `Inter`, 400-700, normal tracking, 1.45-1.6 line height | Product details, commerce controls, navigation, and small-screen legibility. |
| Type scale | H1 `clamp(2.75rem, 4vw, 4.3rem)`, H2 `clamp(2.45rem, 5.5vw, 4.8rem)`, card name `1rem`, meta `0.74rem`, button `0.78rem` | Fluid display sizes; fixed compact UI sizes prevent controls from jumping across breakpoints. |
| Spacing | 4px base: 8, 12, 16, 24, 32, 48, 64, 96 | 16px card gaps, 24px card padding, 64-96px section rhythm. |
| Color | Ink `#10120f`, charcoal `#1a1d18`, field olive `#354033`, brass `#c3a35a`, paper `#f4f2eb`, alert `#a5403a` | Brass is reserved for price, focus, and the primary command; red is only for genuine sale/alert context. |
| Grid | `min(1240px, calc(100% - 48px))`; 4 columns desktop, 2 tablet, 2 compact mobile | Product cards remain readable while editorial hero/content stays contained. |

## Content rules

- Do not render a price when it is zero or absent; use `Contact for availability` and a disabled notify action instead.
- Do not render a star widget until a real rating and review count exist.
- Hide unavailable address, phone, and hours data rather than publishing placeholder copy.
- Use shimmer skeletons only while loading; missing product media should enter a deliberate media review queue.
- Replace countdown urgency with collection stories and explicit service standards.

## Before to after

1. A flat promotion-led storefront becomes an editorial, image-led collection experience.
2. Uniform product tiles gain brand metadata, hierarchy, save affordance, quick-add behavior, and valid empty-data states.
3. The category route gets a dedicated collection header and catalog toolbar rather than a generic page heading.
4. The palette uses brass sparingly for commerce priority and a more restrained field-olive foundation.
5. Unpublishable operational placeholders and manufactured urgency are removed from public-facing surfaces.
