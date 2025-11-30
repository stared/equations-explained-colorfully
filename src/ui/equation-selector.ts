import { loadContent, type ParsedContent } from "../parser";

// Use Vite's glob import to load all markdown files
// eager: true means they are bundled with the app (string content)
const equationFiles = import.meta.glob('../examples/*.md', { query: '?raw', import: 'default', eager: true });

// Equation metadata
export interface EquationInfo {
  id: string;
  title: string;
  file: string; // We keep this for link generation, though we load content directly
  content: string; // Raw markdown content
}

// Load equations list from local files
export async function loadEquationsList(): Promise<EquationInfo[]> {
  const equations: EquationInfo[] = [];

  for (const path in equationFiles) {
    const content = equationFiles[path] as string;
    const filename = path.split('/').pop() || '';
    const id = filename.replace('.md', '');
    
    // Parse content to extract title
    // We do a quick parse or use the full parser
    // Let's use the full parser since it's robust
    const parsed = await loadContent(content, true);
    const title = parsed.title || id.charAt(0).toUpperCase() + id.slice(1);

    equations.push({
      id,
      title,
      file: filename,
      content
    });
  }

  // Sort alphabetically or by some other metric?
  // The filesystem order is not guaranteed.
  // Let's sort by title for now.
  return equations.sort((a, b) => a.title.localeCompare(b.title));
}

// Load and render a specific equation
export async function loadEquation(
  equationId: string,
  equations: EquationInfo[],
  updateHash = true,
  onEquationLoaded?: (
    parsedContent: ParsedContent,
    equation: EquationInfo,
    markdown: string
  ) => void | Promise<void>
): Promise<ParsedContent | null> {
  const equation = equations.find((eq) => eq.id === equationId);
  if (!equation) return null;

  // Update URL hash
  if (updateHash) {
    window.location.hash = equationId;
  }

  // Load the markdown content (already loaded in memory)
  const parsedContent = await loadContent(equation.content, true);

  // Update title (prefer title from markdown, fallback to equations.json metadata which came from markdown anyway)
  const titleElement = document.getElementById("equation-title");
  if (titleElement) {
    titleElement.textContent = parsedContent.title || equation.title;
  }

  // Update source link - pointing to the new location (or public if we keep a copy?)
  // Since we are moving to src, the GitHub link should point to src/examples/
  const sourceLink = document.getElementById(
    "source-link"
  ) as HTMLAnchorElement;
  if (sourceLink) {
    sourceLink.href = `https://github.com/stared/equations-explained-colorfully/blob/main/src/examples/${equation.file}`;
  }

  // Update active button
  const selectorDiv = document.getElementById("equation-selector");
  if (selectorDiv) {
    selectorDiv.querySelectorAll("button").forEach((btn) => {
      if (btn.dataset.equationId === equationId) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  if (onEquationLoaded) {
    await onEquationLoaded(parsedContent, equation, equation.content);
  }

  return parsedContent;
}

// Create equation selector buttons
export function createEquationSelector(
  equations: EquationInfo[],
  currentEquationId: string,
  onEquationSelected: (equationId: string) => void | Promise<void>
) {
  const selectorDiv = document.getElementById("equation-selector");
  if (!selectorDiv) return;

  selectorDiv.innerHTML = ""; // Clear existing content

  equations.forEach((equation) => {
    const button = document.createElement("button");
    button.textContent = equation.title;
    button.dataset.equationId = equation.id;
    button.className = equation.id === currentEquationId ? "active" : "";

    button.addEventListener("click", async () => {
      await onEquationSelected(equation.id);
    });

    selectorDiv.appendChild(button);
  });
}

// Get equation ID from URL hash
export function getEquationFromHash(defaultId: string): string {
  const hash = window.location.hash.slice(1); // Remove #
  return hash || defaultId;
}
