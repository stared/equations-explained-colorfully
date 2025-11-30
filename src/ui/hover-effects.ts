import { type ParsedContent } from "../parser";
import { renderLatexInText } from "./equation-renderer";
import { SelectionOverlay } from "./selection-overlay";

export function setupHoverEffects(parsedContent: ParsedContent) {
  const hoverDiv = document.getElementById("hover-explanation");
  const equationContainer = document.getElementById("equation-container");

  if (!hoverDiv || !equationContainer) return;

  const selectionOverlay = new SelectionOverlay(equationContainer);

  let clicked: {
    element: HTMLElement;
    termClass: string;
    definition: string;
  } | null = null;

  const getTermElements = (termClass: string) => {
    return Array.from(document.querySelectorAll(`.${termClass}`));
  };

  const updateOverlay = () => {
    if (clicked) {
      const elements = getTermElements(clicked.termClass);
      selectionOverlay.highlight(elements);

      // Highlight corresponding description terms
      document.querySelectorAll(".static-description span").forEach((el) => {
        if (el.classList.contains(clicked!.termClass)) {
          el.classList.add("active");
        } else {
          el.classList.remove("active");
        }
      });
    } else {
      selectionOverlay.clear();
      document
        .querySelectorAll(".static-description span")
        .forEach((el) => el.classList.remove("active"));
    }
  };

  const showDefinition = (definition: string, color: string = '') => {
    hoverDiv.innerHTML = renderLatexInText(definition);
    hoverDiv.classList.add("visible");
    if (color) {
        hoverDiv.style.borderColor = color;
    } else {
        hoverDiv.style.borderColor = 'var(--border-color)'; // Fallback
    }
  };

  document.querySelectorAll('[class*="term-"]').forEach((element) => {
    const termClass = Array.from(element.classList).find((c) =>
      c.startsWith("term-")
    );
    if (!termClass) return;

    const definition = parsedContent.definitions.get(
      termClass.replace("term-", "")
    );
    
    // Pre-calculate color
    const computedStyle = window.getComputedStyle(element);
    const termColor = computedStyle.color;

    (element as HTMLElement).style.cursor = "pointer";

    element.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent clearing on container click
      if (clicked?.termClass === termClass) {
        clicked = null;
        hoverDiv.classList.remove("visible");
      } else {
        // If clicked from description, we need to find a definition if possible or just highlight
        if (definition) {
          clicked = { element: element as HTMLElement, termClass, definition };
          showDefinition(definition, termColor);
        } else {
          // Just highlight for visual feedback if no definition?
          // Assuming definitions exist for all valid term classes
          // Fallback if needed
          clicked = {
            element: element as HTMLElement,
            termClass,
            definition: "",
          };
        }
      }
      updateOverlay();
    });

    element.addEventListener("mouseenter", () => {
      const elements = getTermElements(termClass);
      selectionOverlay.highlight(elements); // Highlight hovered temporarily

      // Highlight description terms on hover too
      document
        .querySelectorAll(`.static-description .${termClass}`)
        .forEach((el) => el.classList.add("active"));

      if (definition) showDefinition(definition, termColor);
    });

    element.addEventListener("mouseleave", () => {
      // Remove temporary hover class from description
      document
        .querySelectorAll(`.static-description .${termClass}`)
        .forEach((el) => el.classList.remove("active"));

      updateOverlay(); // Restore clicked state or clear
      if (clicked) {
          // Re-apply color for clicked element
          const clickedEl = document.querySelector(`.${clicked.termClass}`);
          const clickedColor = clickedEl ? window.getComputedStyle(clickedEl).color : '';
          showDefinition(clicked.definition, clickedColor);
      } else {
          hoverDiv.classList.remove("visible");
      }
    });
  });
}
