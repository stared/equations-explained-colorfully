import { type ParsedContent } from '../parser';
import { renderLatexInText } from './equation-renderer';

export function setupHoverEffects(parsedContent: ParsedContent) {
  const hoverDiv = document.getElementById('hover-explanation');
  if (!hoverDiv) return;

  let clicked: { element: HTMLElement; termClass: string; definition: string } | null = null;

  const updateTerms = (termClass: string, classList: string, action: 'add' | 'remove') => {
    document.querySelectorAll(`.${termClass}`).forEach((el) => el.classList[action](classList));
  };

  const showDefinition = (definition: string) => {
    hoverDiv.innerHTML = renderLatexInText(definition);
    hoverDiv.classList.add('visible');
  };

  document.querySelectorAll('[class*="term-"]').forEach((element) => {
    const termClass = Array.from(element.classList).find((c) => c.startsWith('term-'));
    if (!termClass) return;

    const definition = parsedContent.definitions.get(termClass.replace('term-', ''));
    if (!definition) return;

    (element as HTMLElement).style.cursor = 'pointer';

    element.addEventListener('click', () => {
      if (clicked?.element === element) {
        updateTerms(termClass, 'term-clicked', 'remove');
        clicked = null;
        hoverDiv.classList.remove('visible');
      } else {
        if (clicked) updateTerms(clicked.termClass, 'term-clicked', 'remove');
        updateTerms(termClass, 'term-clicked', 'add');
        clicked = { element: element as HTMLElement, termClass, definition };
        showDefinition(definition);
      }
    });

    element.addEventListener('mouseenter', () => {
      updateTerms(termClass, 'term-active', 'add');
      showDefinition(definition);
    });

    element.addEventListener('mouseleave', () => {
      updateTerms(termClass, 'term-active', 'remove');
      clicked ? showDefinition(clicked.definition) : hoverDiv.classList.remove('visible');
    });
  });
}
