# Design System

This document outlines the consistent, modern, and minimalistic design language for the `florianh-widgetset` widgets in openHAB.

---

## Design Principles

1. **Modern Minimalist Aesthetics:** Clean layouts, thin borders, soft shadows, and subtle micro-hierarchies. Retain a soft ambient elevation instead of heavy, offset drop shadows.
2. **Layout-Driven Flow & Consistency:** Enforce standard layouts while preserving the original X-axis boundaries and positioning of core interactive components.
3. **Dynamic Title-Shifting:** Hide widget titles and icons by default to declutter dashboard interfaces. Shift primary values and headers up to fill the space when no title is configured.
4. **Adaptive Contrast:** Enforce a cohesive, soft status color palette designed for high contrast and readability across both dark and light modes.

---

## Layout & Container Specs

### 1. Card Container
* **Border Radius:** `var(--f7-card-expandable-border-radius)` (or `12px` fallback) for uniform rounded corners.
* **Border:** `1px solid var(--f7-card-border-color, rgba(0,0,0,0.06))` to provide subtle framing.
* **Box Shadow:** `var(--f7-card-box-shadow, 0px 4px 12px rgba(0,0,0,0.05))` (a soft, diffuse shadow).
* **Background Color:** Adaptive semi-transparent matte background: `rgba(255,255,255,0.85)` in light mode, `rgba(28,28,30,0.85)` in dark mode (unless explicitly overridden by `bgcolor`).
* **Backdrop Filter:** `blur(6px)` (creates a subtle matte glass effect).
* **Height:** Standardized to `120px` (or `130px` for multi-row widgets).
* **Minimum Width:** `200px` for standard `120px` height widgets to ensure clean horizontal spacing.
* **Margins:** `margin-left: 5px`, `margin-right: 5px`.

### 2. Standardized Spacing & Padding (X-Axis)
* **Start & End Padding:** Retain the original X-axis padding of the content layers (e.g., `left: 17px` or `left: 16px` for text blocks, `right: 5px` or `right: 15px` for right-aligned controls) to ensure layouts do not break when widgets are placed side-by-side.
* **Interactive Elements:** Maintain the original size and position of specific elements (like the UP/STOP/DOWN buttons in `shutter.yaml`) to prevent muscle-memory disruption.

### 3. Dynamic Title-Shifting Grid
To support overview dashboards, titles are optional and shift the layout dynamically:

* **When Title/Icon is Provided:**
  * Title Block: `top: -5px` (standard position for small titles)
  * Header/Value Block: `top: 45px` (shifted down to prevent overlaps)
* **When Title/Icon is Absent:**
  * Title Block: Hidden (`visible: false` or omitted)
  * Header/Value Block: `top: -5px` (shifted up to fill the card top area)

---

## Typography Specs

| Role                       | Font Size | Font Weight | Alignment & Style                                        |
|:---------------------------|:----------|:------------|:---------------------------------------------------------|
| **Widget Title**           | `11px`    | `600`       | Uppercase, `letter-spacing: 0.05em`, muted opacity `0.6` |
| **Main Header / Value**    | `22px`    | `500`       | Primary visual element                                   |
| **Subheader / Status**     | `16px`    | `400`       | Secondary metadata/text, nested under header             |
| **Chips / Auxiliary Text** | `12px`    | `500`       | Compact status indicators                                |

---

## Semantic Color Palette

Use semantic values that dynamically adjust to dark and light modes:

* **Active / Normal (Green):**
  * Light: `#34c759` | Dark: `#30d158` (iOS system green)
* **Alert / Warning (Orange):**
  * Light: `#ff9500` | Dark: `#ff9f0a`
* **Stopped / Danger / Off (Red):**
  * Light: `#ff3b30` | Dark: `#ff453a`
* **Accent / Selected (Blue):**
  * Light: `#007aff` | Dark: `#0a84ff`
* **Muted / Text Secondary:**
  * Light: `#8e8e93` | Dark: `#aeaeb2`
