/**
 * Smooth scroll to an element with offset for fixed headers
 * @param targetId - The ID of the target element
 * @param offset - Offset in pixels (default: 100 for fixed header)
 */
export function smoothScrollTo(targetId: string, offset: number = 100) {
  const element = document.getElementById(targetId);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  }
}

/**
 * Handle anchor link clicks with smooth scrolling
 * @param e - Mouse event
 * @param targetId - The ID of the target element
 * @param offset - Offset in pixels (default: 100)
 */
export function handleSmoothScroll(
  e: React.MouseEvent<HTMLAnchorElement>,
  targetId: string,
  offset: number = 100
) {
  e.preventDefault();
  smoothScrollTo(targetId, offset);
}
