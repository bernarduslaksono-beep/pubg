// motion.js — Phase 2G accessibility utility.
//
// The app's global CSS reduced-motion rule (index.css) only shortens CSS
// animation/transition durations. It cannot reach native browser APIs like
// `window.scrollTo({ behavior: 'smooth' })` or `Element.scrollIntoView`,
// which run their own animation outside CSS. Call `motionSafeScrollBehavior()`
// wherever the app triggers a programmatic smooth scroll, so a person with
// "reduce motion" set at the OS/browser level gets an instant jump instead.
export function prefersReducedMotion() {
  try {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  } catch {
    return false
  }
}

export function motionSafeScrollBehavior() {
  return prefersReducedMotion() ? 'auto' : 'smooth'
}
