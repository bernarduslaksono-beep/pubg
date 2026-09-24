// InteractiveCard — Phase 2A accessibility foundation.
//
// Wraps a clickable "card" (game card, package card, payment card, order
// history row, …) so it behaves like a real interactive control instead of a
// bare `<div onClick>`: reachable by Tab, activatable with Enter/Space, and
// announced to screen readers as a button.
//
// This is an INTERACTION-LAYER-ONLY change — it renders a <div> by default
// (so all existing CSS selectors like `.pkg-card`, `.game-card`, `.selected`,
// `.out-of-stock` keep working unmodified) and never touches business logic.
// The caller keeps full control of className/children exactly like before.
export default function InteractiveCard({
  onClick,
  disabled = false,
  className = '',
  children,
  ariaLabel,
  as: Tag = 'div',
  ...rest
}) {
  const handleClick = (e) => {
    if (disabled) return
    onClick?.(e)
  }

  const handleKeyDown = (e) => {
    if (disabled) return
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault()
      onClick?.(e)
    }
  }

  return (
    <Tag
      {...rest}
      className={className}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled || undefined}
      aria-label={ariaLabel}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {children}
    </Tag>
  )
}
