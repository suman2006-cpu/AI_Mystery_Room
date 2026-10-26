# Nightshift — UI & Motion Design System

The UI refresh gives AI Mystery Room a cinematic investigative identity rather than a generic dashboard appearance. The game flows, API calls, data model, Groq integration, and backend scoring are unchanged.

## Visual direction

- **Mood:** midnight evidence archive; editorial typography, noir color fields, luminous forensic UI, and restrained futuristic overlays.
- **Palette:** near-black navy (`#080b14`), ultraviolet (`#9a83ff`), ice cyan (`#61e6f2`), signal mint (`#57e3ca`), and forensic lime (`#d9ff72`).
- **Type:** Space Grotesk for display and interface headings, Manrope for readable UI copy, Cormorant Garamond for selective editorial emphasis, and DM Mono for dossier labels and coordinates.
- **Material language:** translucent case panels, fine evidence borders, glass overlays, soft colored edge light, subtle grain, technical grid lines, and restrained high-contrast highlights.

## Motion language

- First-load title and art entrance uses staggered opacity and transform animation.
- The illustrated manor uses a slow float, a scanning beam, layered orbital rings, pulsing signal indicators, and drifting evidence cards.
- The feature strip runs as a duplicated seamless ticker and pauses on hover.
- Cards respond to hover through lift, border glow, and subtle icon movement. Page routes fade into place.
- `prefers-reduced-motion: reduce` disables nonessential movement and transitions.
- Motion is built with CSS and the browser animation engine; no extra runtime animation library is required.

## Layout map

- **Home:** editorial hero, animated illustrated manor and case overlays, feature ticker, three-stage method, difficulty selector, final call to action.
- **Create:** premise writing panel, starter prompt chips, interactive difficulty cards, dossier preview, Groq status, demo switch, generation CTA.
- **Investigation:** case briefing, evidence locker, suspect profiles and alibis, progress monitor, hint panel, final accusation CTA.
- **Accusation:** selectable suspect cards and a clear final-verdict confirmation area.
- **Results:** verdict, score breakdown, culprit and motive, solution explanation, timeline, supporting evidence, replay CTA.

## Responsive behavior

The composition shifts from two columns to a stacked cinematic hero at tablet widths, then compactens the art, moves suspect/evidence panels to one column, preserves touch-friendly controls, and uses smaller dossier labels on phones. Existing API-driven flows and route definitions remain intact.

## Design references

The implementation takes general inspiration from immersive editorial / storytelling work and uses documented web motion patterns rather than copying any one website:

- Awwwards immersive experience inspiration: <https://www.awwwards.com/inspiration/immersive%20experience%20intro>
- Motion for React animation principles: <https://motion.dev/docs/react>
- MDN accessibility guidance for reduced motion: <https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion>
- MDN scroll-triggered animation concepts: <https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Animation_triggers/Using_scroll-triggered_animations>

The manor illustration is authored as inline SVG and the interactive scene uses CSS, so the visual centerpiece is bundled with the application rather than relying on a hotlinked stock image.
