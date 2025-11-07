# Interactive Math Framework

A minimal framework for creating interactive mathematical explanations with colored, annotated equations.

**Demo:** [https://p.migdal.pl/equations-explained-colorfully/](https://p.migdal.pl/equations-explained-colorfully/)

**Inspired by:**
- [Explorable explanations](https://p.migdal.pl/blog/2024/05/science-games-explorable-explanations/) as a learning medium
- [BetterExplained's colorized equations](https://betterexplained.com/articles/colorized-math-equations/)
- Stuart Riffle's [color-coded Fourier transform](https://web.archive.org/web/20130318211259/http://www.altdevblogaday.com/2011/05/17/understanding-the-fourier-transform) (2011)

## Features

- **Markdown-based**: Write equations in simple markdown format
- **Interactive**: Hover over colored terms to see definitions
- **Accessible**: Multiple color schemes including color-blind friendly options
- **Minimal**: Built with KaTeX, CodeJar, and Prism (~10KB total)
- **Editable**: Real-time editor for creating and modifying equations

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

## How It Works

1. **Parse** markdown: Convert `\mark[label]{content}` to `\htmlClass{term-label}{content}` for KaTeX
2. **Render** equation using KaTeX, description and definitions as HTML
3. **Color** terms based on order of appearance in equation (first term → first color, etc.)
4. **Interact**: Hover over colored terms to see definitions, click to lock

**Color schemes available:** Vibrant (default), Accessible (Wong palette), High Contrast, No Color

## Examples

See `public/examples/` for complete examples:
- `new.md` - Simple starter template (E = mc²)
- `schrodinger.md` - Schrödinger equation
- `maxwell.md` - Maxwell's equations
- `navier-stokes.md` - Navier-Stokes equation
- `euler.md` - Euler's identity

## Usage

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Build for production
pnpm build
```

## Creating New Equations

1. Create a markdown file in `public/examples/` (e.g., `my-equation.md`)
2. Add entry to `public/examples/equations.json`:
   ```json
   {
     "id": "my-equation",
     "title": "My Equation",
     "category": "Physics",
     "file": "my-equation.md"
   }
   ```
3. Use the in-browser editor to refine your equation interactively

## Key Files

```
public/examples/          # Equation markdown files
  ├── equations.json      # List of available equations
  └── *.md               # Individual equation files
src/
  ├── main.ts            # Main app logic & editor
  ├── parser.ts          # Markdown → KaTeX/HTML parser
  ├── prism-custom.ts    # Syntax highlighting for editor
  └── style.css          # Tufte-inspired minimal styles
```

## Author

Created by [Piotr Migdał](https://p.migdal.pl)

## License

MIT
