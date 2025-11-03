# Interactive Math Framework

A minimal framework for creating interactive mathematical explanations with colored, annotated equations.

**Demo:** [https://p.migdal.pl/equations-explained-colorfully/](https://p.migdal.pl/equations-explained-colorfully/)

Inspired by the concept of [explorable explanations](https://p.migdal.pl/blog/2024/05/science-games-explorable-explanations/), this framework makes mathematical equations more accessible through color-coding and interactive hover effects.

## Features

- Simple markdown-based content format
- Color-coded equation terms with hover interactions
- Multiple color schemes (including accessibility options)
- Minimal dependencies
- Reusable across different equations

## Content Format

Create a markdown file with three sections:

### 1. Equation (LaTeX with annotations)

Use `\mark[classname]{formula}` to annotate terms:

```latex
$$
\mark[imaginary]{i}\mark[planck]{\hbar}\mark[timederiv]{\frac{\partial\psi}{\partial t}} = ...
$$
```

### 2. Description (Markdown with term references)

Use `[text]{.classname}` to reference terms with the same color:

```markdown
## Description

Multiply the [imaginary unit]{.imaginary} by [Planck constant]{.planck}...
```

### 3. Definitions (Heading-based)

Use `## .classname` headings for detailed explanations:

```markdown
## .imaginary

Indicates the quantum nature of the equation and ensures unitary time evolution.

The imaginary unit $i$ is fundamental to quantum mechanics.

## .planck

Fundamental constant connecting energy and frequency.

**Value:** $\hbar \approx 1.055 \times 10^{-34}$ J·s
```

## Color Schemes

Colors are automatically assigned based on the order terms appear in the document:

```typescript
colorSchemes = {
  vibrant: ['#8b5cf6', '#10b981', '#ec4899', ...],
  accessible: ['#0072B2', '#E69F00', '#009E73', ...], // Wong palette
  contrast: ['#0066CC', '#FF6600', '#9933CC', ...],
  nocolor: ['#000000', '#000000', '#000000', ...]
}
```

The first term gets `colors[0]`, second gets `colors[1]`, etc.

## How It Works

1. **Parse** markdown content to extract:
   - LaTeX equation (converting `\mark` to `\htmlClass`)
   - Description text (converting `{.class}` to `<span>`)
   - Definitions from heading sections

2. **Render** using KaTeX for math and HTML for text

3. **Color** terms dynamically using CSS variables:
   - `.imaginary` → `--color-imaginary` → `colors[0]`
   - `.planck` → `--color-planck` → `colors[1]`

4. **Interact** with hover effects showing definitions

## Example

See [content.md](content.md) for a complete example (Schrödinger equation).

## Usage

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Build for production
pnpm build
```

## Creating New Interactive Equations

1. Create a new markdown file following the format above
2. Update `loadContent('/your-file.md')` in `main.ts`
3. Adjust color scheme arrays if you need more/fewer colors

## Design Philosophy

- **Minimal syntax**: Natural markdown with simple annotations
- **Separation of concerns**: Content (markdown) separate from styling (CSS) and logic (TypeScript)
- **Accessibility**: Multiple color schemes including color-blind friendly options
- **Tufte-inspired**: Clean, minimal design focusing on content

## File Structure

```
├── content.md              # Equation content in markdown
├── src/
│   ├── main.ts            # Main application logic
│   ├── parser.ts          # Markdown parser
│   └── style.css          # Styles
├── index.html             # HTML entry point
└── README.md              # This file
```

## Author

Created by [Piotr Migdał](https://p.migdal.pl).

For more on interactive explanations and science communication, see: [Science, games, and explorable explanations](https://p.migdal.pl/blog/2024/05/science-games-explorable-explanations/).

## License

MIT
