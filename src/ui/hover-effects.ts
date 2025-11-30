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

  const showDefinition = (definition: string) => {
    hoverDiv.innerHTML = renderLatexInText(definition);
    hoverDiv.classList.add("visible");
  };

  document.querySelectorAll('[class*="term-"]').forEach((element) => {
    const termClass = Array.from(element.classList).find((c) =>
      c.startsWith("term-")
    );
    if (!termClass) return;

    const definition = parsedContent.definitions.get(
      termClass.replace("term-", "")
    );
    // if (!definition) return; // Description might not have definition map if logic differs, but usually it matches

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
          showDefinition(definition);
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

      if (definition) showDefinition(definition);
    });

    element.addEventListener("mouseleave", () => {
      // Remove temporary hover class from description
      document
        .querySelectorAll(`.static-description .${termClass}`)
        .forEach((el) => el.classList.remove("active"));

      updateOverlay(); // Restore clicked state or clear
      clicked
        ? showDefinition(clicked.definition)
        : hoverDiv.classList.remove("visible");
    });
  });
}
