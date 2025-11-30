export class SelectionOverlay {
  private svg: SVGSVGElement;
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    // Check if SVG already exists to avoid duplicates on re-init
    const existingSvg = container.querySelector("svg.selection-overlay");
    if (existingSvg) {
      this.svg = existingSvg as SVGSVGElement;
      this.clear();
    } else {
      this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      this.svg.classList.add("selection-overlay");
      this.svg.style.position = "absolute";
      this.svg.style.top = "0";
      this.svg.style.left = "0";
      this.svg.style.width = "100%";
      this.svg.style.height = "100%";
      this.svg.style.pointerEvents = "none";
      this.svg.style.zIndex = "0";
      this.container.appendChild(this.svg);
    }
  }

  highlight(elements: Element[]) {
    this.clear();
    if (elements.length === 0) return;

    const containerRect = this.container.getBoundingClientRect();
    const containerStyle = window.getComputedStyle(this.container);
    const borderLeft = parseFloat(containerStyle.borderLeftWidth) || 0;
    const borderTop = parseFloat(containerStyle.borderTopWidth) || 0;

    const padding = 2; // px

    elements.forEach((el) => {
      const visualRect = this.getVisualBoundingRect(el);
      if (!visualRect) return;

      // Get color from the element to match the term's color
      const computedStyle = window.getComputedStyle(el);
      const color = computedStyle.color;

      const r = document.createElementNS("http://www.w3.org/2000/svg", "rect");

      const x = visualRect.left - containerRect.left - borderLeft - padding;
      const y = visualRect.top - containerRect.top - borderTop - padding;
      const width = visualRect.width + padding * 2;
      const height = visualRect.height + padding * 2;

      r.setAttribute("x", String(x));
      r.setAttribute("y", String(y));
      r.setAttribute("width", String(width));
      r.setAttribute("height", String(height));
      r.setAttribute("rx", "4");
      r.setAttribute("ry", "4");

      // Use the term's color for the highlight
      // Use CSS variable if available, otherwise fallback to parsed color
      r.style.color = color; // SetcurrentColor context
      r.style.fill = `color-mix(in srgb, ${color} 10%, transparent)`;
      // r.style.stroke = color;
      // r.style.strokeWidth = "1.5px";
      // r.style.strokeOpacity = "0.5";

      // Subtle animation
      r.style.opacity = "0";
      r.style.transition = "opacity 0.15s ease-out";

      this.svg.appendChild(r);

      // Trigger animation
      requestAnimationFrame(() => {
        r.style.opacity = "1";
      });
    });
  }

  clear() {
    while (this.svg.firstChild) {
      this.svg.removeChild(this.svg.firstChild);
    }
  }

  /**
   * Calculates the bounding rectangle of all visible content within an element.
   * This is more robust than getBoundingClientRect() for complex nested structures like KaTeX.
   */
  private getVisualBoundingRect(element: Element): DOMRect | null {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    let found = false;

    const processRect = (r: DOMRect) => {
      // Filter out empty or zero-size rects (often purely structural or invisible)
      if (r.width > 0.1 && r.height > 0.1) {
        minX = Math.min(minX, r.left);
        minY = Math.min(minY, r.top);
        maxX = Math.max(maxX, r.right);
        maxY = Math.max(maxY, r.bottom);
        found = true;
      }
    };

    // KaTeX specific: We want to capture the bounding box of all the "ink".
    // The wrapper span often has weird dimensions.
    // We iterate over all descendants to find the true visual extent.
    const descendants = element.querySelectorAll("*");

    // KaTeX specific: Exclude zero-width spaces or other invisible layout hacks if possible
    // Or just trust the size check in processRect

    // Important: also include the element itself if it has visual presence
    const selfRects = element.getClientRects();
    for (let i = 0; i < selfRects.length; i++) processRect(selfRects[i]);

    if (descendants.length > 0) {
      descendants.forEach((child) => {
        const rects = child.getClientRects();
        for (let i = 0; i < rects.length; i++) processRect(rects[i]);
      });
    }

    // Also check the element itself (e.g. borders, background)
    // const rects = element.getClientRects();
    // for (let i = 0; i < rects.length; i++) processRect(rects[i]);

    if (!found) {
      // Fallback
      return element.getBoundingClientRect();
    }

    return new DOMRect(minX, minY, maxX - minX, maxY - minY);
  }
}
