import { loadContent, type ParsedContent } from "../parser";

// Equation metadata
export interface EquationInfo {
  id: string;
  title: string;
  file: string;
}

// Load equations list
export async function loadEquationsList(): Promise<EquationInfo[]> {
  const response = await fetch("./examples/equations.json");
  return response.json();
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

  // Load the markdown content
  const parsedContent = await loadContent(`./examples/${equation.file}`);

  // Update title (prefer title from markdown, fallback to equations.json)
  const titleElement = document.getElementById("equation-title");
  if (titleElement) {
    titleElement.textContent = parsedContent.title || equation.title;
  }

  // Update source link
  const sourceLink = document.getElementById(
    "source-link"
  ) as HTMLAnchorElement;
  if (sourceLink) {
    sourceLink.href = `https://github.com/stared/equations-explained-colorfully/blob/main/public/examples/${equation.file}`;
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

  // Load markdown file for editor
  const response = await fetch(`./examples/${equation.file}`);
  const markdown = await response.text();

  if (onEquationLoaded) {
    await onEquationLoaded(parsedContent, equation, markdown);
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
