# Design Tuner Skill

Create disposable interactive design tools (sliders, selectors, toggles) for live-tuning visual properties in the browser. These are temporary dev tools meant to be removed once design values are finalized.

## When to Use

- User wants to visually tune spacing, typography, colors, or component properties
- User asks to "play with" or "tweak" visual values
- User wants an interactive way to explore design options before committing

## How It Works

1. **Define tunable properties** as a `TunerProperty[]` array with key, label, default value, min/max/step, unit, and group
2. **Use the `useDesignTuner` hook** to get reactive values and change handlers
3. **Render `<DesignTuner />`** which provides a floating panel with grouped sliders
4. **Apply `values` via inline styles** on the elements being tuned (replacing Tailwind classes where needed)
5. **Once happy**, read final values from the tuner, update the source code, and remove the tuner

## Core Component

`src/components/DesignTuner.tsx` exports:

- `DesignTuner` — the floating UI panel (fixed bottom-right, collapsible, grouped tabs)
- `useDesignTuner(properties)` — hook returning `{ values, onChange, onReset }`
- `TunerProperty` — type for property definitions

## Property Definition

```ts
{
  key: "fontSize",        // unique key, used in values record
  label: "Body Font Size", // display label in panel
  value: 15,              // default value
  min: 10,                // slider min
  max: 24,                // slider max
  step: 0.5,              // slider step
  unit: "px",             // display unit
  group: "Typography",    // tab group
}
```

## Usage Pattern

```tsx
"use client";
import DesignTuner, { useDesignTuner, type TunerProperty } from "@/components/DesignTuner";

const PROPERTIES: TunerProperty[] = [
  { key: "gap", label: "Gap", value: 16, min: 0, max: 48, step: 2, unit: "px", group: "Spacing" },
  { key: "radius", label: "Radius", value: 8, min: 0, max: 24, step: 1, unit: "px", group: "Shape" },
];

export default function MyTunablePage() {
  const { values: v, onChange, onReset } = useDesignTuner(PROPERTIES);

  return (
    <>
      <div style={{ gap: v.gap, borderRadius: v.radius }}>
        {/* content using tuned values */}
      </div>
      <DesignTuner properties={PROPERTIES} values={v} onChange={onChange} onReset={onReset} />
    </>
  );
}
```

## Cleanup

Once the user finalizes values:
1. Read the final values from the tuner panel
2. Update the original component/page with the chosen values (back to Tailwind classes or hardcoded styles)
3. Remove the tuner wrapper component
4. The `DesignTuner.tsx` component stays in the codebase for reuse on other pages

## Tips

- Group related properties (Layout, Typography, Pill, etc.) for easy navigation
- Changed values highlight yellow in the panel for easy spotting
- The panel collapses to a small button showing count of changed values
- For component props that don't accept direct style overrides, create a wrapper that maps tuner values to props (see `FrontPageContent.tsx` Pill wrapper pattern)
