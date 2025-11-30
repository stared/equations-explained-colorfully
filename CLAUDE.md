# Interactive Math Framework - Design Guidelines

## Design Philosophy

**Tufte & D3 Minimalism**
- Maximize data-ink ratio
- No shadows, gradients, or unnecessary decorations
- No animations or transitions (except simple opacity)
- Clean typography (serif fonts)
- Focus on content over decoration

**Explorable Explanations**
- Interactive elements should be discoverable through hover
- Color coding connects equation terms to plain-language descriptions
- Natural language explanations, not just formulas
- Inspired by https://p.migdal.pl/blog/2024/05/science-games-explorable-explanations/

## Content Format

**Markdown-Based**
- Content lives in markdown files, separate from code
- Simple, readable syntax without excessive abstraction
- Three sections: equation, description, definitions

**Annotation Syntax**
- LaTeX: `\mark[classname]{formula}` for colored terms
- Prose: `[text]{.classname}` for references
- Definitions: `## .classname` heading-based (allows full paragraphs, images)

## Color System

**Sequential Assignment**
- Colors assigned by order of appearance in document
- No spurious abstract names (no "primary", "secondary")
- Color schemes are simple arrays: `['#color1', '#color2', ...]`
- First term gets index 0, second gets index 1, etc.

**Accessibility**
- Multiple color schemes including color-blind friendly (Wong palette)
- High contrast option
- Plain black option for printing
- All interactions work without color

## Interactions

**Bidirectional Hover**
- Hover over equation term → highlights matching description text
- Hover over description text → highlights matching equation term
- Shows detailed definition below

**No Layout Shifts**
- Hover effects use only opacity changes
- No bold, underline, or scale transforms that move text
- Equation stays perfectly stable

## Technical Approach

**Stack**
- Vue 3 with Composition API
- KaTeX for math rendering
- CodeJar + Prism for editor
- Vite for build tooling

**Data-Driven**
- No hardcoded content in JavaScript
- Generic rendering logic
- Easy to create new interactive equations
- Just write markdown, framework handles the rest

## Framework Goals

**Reusable**
- Not just for this equation
- Pattern others can follow
- Clear separation: content (markdown), logic (TypeScript), style (CSS)

**Simple**
- Minimal syntax
- Easy to understand and extend
- Well-documented with README

**Beautiful**
- Natural language over technical jargon
- Clean, minimal aesthetic
- Readable and approachable
