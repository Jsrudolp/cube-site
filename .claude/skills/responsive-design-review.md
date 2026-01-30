# Responsive Design Review Skill

Review UI designs for responsive behavior across breakpoints. Focus on usability at every screen size.

## Breakpoint Checklist

Standard breakpoints to test:
- **Mobile**: 320px, 375px, 414px (small phones, iPhone, large phones)
- **Tablet**: 768px, 1024px (portrait, landscape)
- **Desktop**: 1280px, 1440px, 1920px (laptop, desktop, large monitor)

For each breakpoint, verify:
- Layout doesn't break or overflow
- Text remains readable (not too small, not too large)
- Interactive elements are accessible
- Images/media scale appropriately

## Mobile-First Checklist

- **Touch targets**: Minimum 44x44px for tappable elements
- **Thumb zones**: Primary actions reachable by thumb (bottom of screen preferred)
- **Text size**: Minimum 16px for body text to prevent iOS zoom on focus
- **Spacing**: Adequate padding for fat-finger tolerance (8px+ between targets)
- **Scrolling**: Prefer vertical scroll; horizontal scroll only when intentional (carousels)
- **Forms**: Input fields large enough, appropriate keyboard types

## Layout Patterns

Common responsive patterns to consider:
- **Stack → Side-by-side**: Columns stack on mobile, sit side-by-side on desktop
- **Off-canvas**: Navigation hidden in drawer/menu on mobile
- **Priority+**: Show most important items, hide rest behind "more" on mobile
- **Truncation**: Shorten text/titles on smaller screens
- **Reflow**: Content reflows to fit container (CSS Grid/Flexbox)

## Typography Scaling

- **Fluid typography**: Consider `clamp()` for smooth scaling
- **Line length**: 45-75 characters ideal; constrain max-width on wide screens
- **Heading scale**: May need smaller ratio on mobile (1.2x vs 1.333x)
- **Line height**: May need adjustment at different sizes

## Images & Media

- **Responsive images**: Use `srcset` or Next.js Image for appropriate sizes
- **Aspect ratios**: Maintain or intentionally change at breakpoints
- **Art direction**: Different crops for different screen sizes when needed
- **Loading**: Lazy load below-fold images
- **Max dimensions**: Prevent images from exceeding container

## Navigation Patterns

- **Desktop**: Full horizontal nav, dropdowns acceptable
- **Tablet**: Consider condensed nav or early hamburger
- **Mobile**: Hamburger menu, bottom nav, or slide-out drawer
- **Current state**: Clear indication of active page at all sizes

## Common Issues to Flag

1. **Horizontal overflow** causing unwanted horizontal scroll
2. **Fixed widths** that don't adapt (use max-width, %, or viewport units)
3. **Tiny touch targets** that are hard to tap accurately
4. **Text too small** on mobile (below 14px)
5. **Too much content density** on small screens
6. **Hidden content** that's critical but only visible on desktop
7. **Hover-only interactions** that don't work on touch devices
8. **Fixed position elements** that cover content or controls on mobile
9. **Viewport issues** (missing meta viewport tag, improper scaling)
10. **Keyboard overlap** covering inputs on mobile

## Interactive Elements

- **Hover states**: Must have touch/focus equivalent
- **Tooltips**: Need tap-to-show alternative on mobile
- **Drag interactions**: Need touch-drag support or alternative
- **Complex gestures**: Provide simpler alternatives

## Testing Approach

1. **Start mobile**: Design/review mobile first, then scale up
2. **Real devices**: Simulators miss touch feel; test on actual phones/tablets
3. **Orientation**: Test both portrait and landscape
4. **Browser DevTools**: Use responsive mode to quickly scan breakpoints
5. **Throttling**: Test with slow network/CPU to catch performance issues

## Review Output Format

When reviewing, provide:
1. **Breakpoints tested** (list which sizes you checked)
2. **Critical issues** (breaks functionality or unusable)
3. **Usability issues** (works but awkward)
4. **Enhancement opportunities** (could be better)
5. **Specific fixes** (CSS/component changes with values)
