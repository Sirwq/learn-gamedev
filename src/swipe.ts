/** A touch swipe on the Course menu: 1 = next card (swiped left), -1 = previous, 0 = a tap or a vertical drag. */
export const swipeStep = (dx: number, dy: number) => (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy) ? -Math.sign(dx) : 0);
