# Using shadcn/ui styles in this library

This folder holds hand-ported, plain-CSS copies of shadcn/ui component styles.
Real shadcn components cannot be used at runtime here: they need Tailwind and
Radix, but this library ships raw JSX source that consumer apps compile without
Tailwind, so Tailwind class names would render completely unstyled there.

```text
third_party/shadcn/
  theme.css         design tokens (--shadcn-*), from the default "neutral" theme
  theme-scaled.css  compact sizing that ui.shadcn.com wraps its docs demos in
  tabs.css          one file per ported component
  switch.css
  button.css
```

Components under `src/component/` apply the ported classes (for example
`shadcn-tabs-trigger`) next to their own classes, set `data-state` from JSX,
and keep any deviation from shadcn in their own css file (see
`SegmentedControl.css`). The port files here stay faithful to the source.

## Where to take the style from

Port from the component's registry source, not by eyeballing the docs site:
`https://ui.shadcn.com/r/styles/new-york-v4/<name>.json` (theme tokens come
from `/r/colors/neutral.json`). Quote the original Tailwind classes as a
comment next to each translated rule, and cite the source URL and fetch date
in the file header.

## Things to be careful about when reproducing the style

1. The docs site shows scaled-down previews. Every demo on ui.shadcn.com is
   wrapped in a `.theme-scaled` container (`--spacing: 0.222222rem`,
   `--text-sm: 0.8rem`, `--radius: 0.6rem`), so for example the Tabs list
   renders 32px tall there while the raw component is `h-9` = 36px. To match
   the look seen on the docs site, add the `shadcn-theme-scaled` class next to
   the ported component class.

2. Keep spacing-derived sizes derived from `--shadcn-spacing`. Tailwind v4
   computes `h-9` / `px-2` / `size-4` etc as multiples of `--spacing`, so port
   them as `calc(var(--shadcn-spacing) * n)`; this is what makes
   `theme-scaled` shrink them correctly. Arbitrary literal values like
   `p-[3px]` or `h-[1.15rem]` do not scale with spacing and stay literal.

3. Convert rem to px, at the 16px root shadcn assumes. Consumer apps may set
   their own root font-size, and rem values would silently scale the whole
   component there. Note the rem original in a comment.

4. Keep line-height a unitless ratio, as Tailwind v4 does (`text-sm` uses
   `calc(1.25 / 0.875)`). Writing it as an absolute length like `1.25rem` gets
   inherited by nested content that has a smaller font-size, and inflates it.

5. There is no Tailwind preflight here. Add the button/input resets that
   shadcn silently relies on (`margin: 0`, transparent background,
   `font-family: inherit`, `box-sizing: border-box`), each marked with a
   `/* preflight */` comment.

6. Style states the way Radix exposes them: `[data-state="..."]`,
   `:disabled`, `:focus-visible`. The consuming component is responsible for
   setting `data-state` on its elements.

7. Prefix token names with `--shadcn-` (shadcn's own names like `--background`
   are too generic for a library), but keep the token values verbatim.

8. Port only what is used (light theme, default variant/size), and list the
   omissions in the file header so a later port knows what is missing.
