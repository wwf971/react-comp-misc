export const isPointInsideElement = (element, event) => {
  if (!element) {
    return false;
  }
  const rect = element.getBoundingClientRect();
  return event.clientX >= rect.left
    && event.clientX <= rect.right
    && event.clientY >= rect.top
    && event.clientY <= rect.bottom;
};

export const getElementUnderMenu = (event) => {
  const overlayElements = Array.from(document.querySelectorAll('.menu-backdrop, .menu-core-root'));
  const previousValues = overlayElements.map((element) => ({
    element,
    pointerEvents: element.style.pointerEvents,
  }));
  overlayElements.forEach((element) => {
    element.style.pointerEvents = 'none';
  });
  const targetElement = document.elementFromPoint(event.clientX, event.clientY);
  previousValues.forEach(({ element, pointerEvents }) => {
    element.style.pointerEvents = pointerEvents;
  });
  return targetElement;
};
