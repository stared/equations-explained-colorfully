/**
 * Utilities for handling interactive term elements in the DOM.
 * Used by both EquationDisplay (KaTeX) and DescriptionPanel (HTML).
 */

/** Extract term name from element's classList (e.g., "term-exponential" → "exponential") */
export function getTermName(element: Element): string | null {
  const termClass = Array.from(element.classList).find(c => c.startsWith('term-'))
  return termClass?.replace('term-', '') ?? null
}

/** Find all term elements in a container with their term names */
export function getTermElements(container: HTMLElement): Array<{ el: HTMLElement; term: string }> {
  return Array.from(container.querySelectorAll('[class*="term-"]'))
    .map(el => ({ el: el as HTMLElement, term: getTermName(el) }))
    .filter((x): x is { el: HTMLElement; term: string } => x.term !== null)
}

/** Apply colors to all term elements in container */
export function applyTermColors(container: HTMLElement, getColor: (term: string) => string): void {
  for (const { el, term } of getTermElements(container)) {
    el.style.color = getColor(term)
  }
}

/** Setup hover/click event listeners on all term elements */
export function setupTermListeners(
  container: HTMLElement,
  onHover: (term: string | null) => void,
  onClick: (term: string) => void
): void {
  for (const { el, term } of getTermElements(container)) {
    el.addEventListener('mouseenter', () => onHover(term))
    el.addEventListener('mouseleave', () => onHover(null))
    el.addEventListener('click', (e) => {
      e.stopPropagation()
      onClick(term)
    })
  }
}

/** Set pointer-events on term elements (needed for KaTeX) */
export function enableTermPointerEvents(container: HTMLElement): void {
  container.querySelectorAll('*').forEach((el) => {
    const htmlEl = el as HTMLElement
    const hasTermClass = Array.from(el.classList).some(c => c.startsWith('term-'))
    htmlEl.style.pointerEvents = hasTermClass ? 'auto' : 'none'
    if (hasTermClass) {
      htmlEl.style.cursor = 'pointer'
    }
  })
}
