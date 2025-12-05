/**
 * QA Nexus Design Tokens
 * Centralized design system tokens for consistent UI/UX
 */

// ============================================================================
// COLOR TOKENS
// ============================================================================

export const COLORS = {
  // Neutral grayscale
  neutral: {
    50: 'var(--neutral-50)',
    100: 'var(--neutral-100)',
    200: 'var(--neutral-200)',
    300: 'var(--neutral-300)',
    400: 'var(--neutral-400)',
    500: 'var(--neutral-500)',
    600: 'var(--neutral-600)',
    700: 'var(--neutral-700)',
    800: 'var(--neutral-800)',
    900: 'var(--neutral-900)',
  },

  // Primary brand color (blue)
  primary: {
    50: 'var(--primary-50)',
    100: 'var(--primary-100)',
    200: 'var(--primary-200)',
    300: 'var(--primary-300)',
    400: 'var(--primary-400)',
    500: 'var(--primary-500)',
    600: 'var(--primary-600)',
    700: 'var(--primary-700)',
    800: 'var(--primary-800)',
    900: 'var(--primary-900)',
  },

  // Success (green)
  success: {
    50: 'var(--success-50)',
    100: 'var(--success-100)',
    200: 'var(--success-200)',
    300: 'var(--success-300)',
    400: 'var(--success-400)',
    500: 'var(--success-500)',
    600: 'var(--success-600)',
    700: 'var(--success-700)',
    800: 'var(--success-800)',
    900: 'var(--success-900)',
  },

  // Warning (amber)
  warning: {
    50: 'var(--warning-50)',
    100: 'var(--warning-100)',
    200: 'var(--warning-200)',
    300: 'var(--warning-300)',
    400: 'var(--warning-400)',
    500: 'var(--warning-500)',
    600: 'var(--warning-600)',
    700: 'var(--warning-700)',
    800: 'var(--warning-800)',
    900: 'var(--warning-900)',
  },

  // Danger (red)
  danger: {
    50: 'var(--danger-50)',
    100: 'var(--danger-100)',
    200: 'var(--danger-200)',
    300: 'var(--danger-300)',
    400: 'var(--danger-400)',
    500: 'var(--danger-500)',
    600: 'var(--danger-600)',
    700: 'var(--danger-700)',
    800: 'var(--danger-800)',
    900: 'var(--danger-900)',
  },

  // Info (cyan)
  info: {
    50: 'var(--info-50)',
    100: 'var(--info-100)',
    200: 'var(--info-200)',
    300: 'var(--info-300)',
    400: 'var(--info-400)',
    500: 'var(--info-500)',
    600: 'var(--info-600)',
    700: 'var(--info-700)',
    800: 'var(--info-800)',
    900: 'var(--info-900)',
  },

  // Semantic
  background: 'var(--background)',
  foreground: 'var(--foreground)',
  border: 'var(--border)',
  input: 'var(--input)',
  muted: 'var(--muted)',
  'muted-foreground': 'var(--muted-foreground)',
};

// ============================================================================
// SPACING TOKENS
// ============================================================================

export const SPACING = {
  0: '0',
  1: '0.25rem',    // 4px
  2: '0.5rem',     // 8px
  3: '0.75rem',    // 12px
  4: '1rem',       // 16px
  6: '1.5rem',     // 24px
  8: '2rem',       // 32px
  10: '2.5rem',    // 40px
  12: '3rem',      // 48px
  16: '4rem',      // 64px
};

// ============================================================================
// BORDER RADIUS TOKENS
// ============================================================================

export const RADIUS = {
  sm: '0.375rem',    // 6px - buttons, inputs
  md: '0.5rem',      // 8px - cards, popovers
  lg: '0.75rem',     // 12px - larger elements
  xl: '1rem',        // 16px - major containers
  '2xl': '1.5rem',   // 24px - large cards
  full: '9999px',    // circle - avatars, badges
};

// ============================================================================
// SHADOW TOKENS
// ============================================================================

export const SHADOWS = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};

// ============================================================================
// TYPOGRAPHY TOKENS
// ============================================================================

export const TYPOGRAPHY = {
  // Font families
  fontSans: '"Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontMono: '"Geist Mono", "Monaco", monospace',

  // Heading sizes
  h1: {
    size: '2.25rem', // 36px
    weight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  h2: {
    size: '1.875rem', // 30px
    weight: 700,
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  h3: {
    size: '1.5rem', // 24px
    weight: 600,
    lineHeight: 1.4,
  },
  h4: {
    size: '1.25rem', // 20px
    weight: 600,
    lineHeight: 1.4,
  },
  h5: {
    size: '1rem', // 16px
    weight: 600,
    lineHeight: 1.5,
  },
  h6: {
    size: '0.875rem', // 14px
    weight: 600,
    lineHeight: 1.5,
  },

  // Body text
  body: {
    size: '0.875rem', // 14px
    weight: 400,
    lineHeight: 1.6,
  },
  bodySm: {
    size: '0.75rem', // 12px
    weight: 400,
    lineHeight: 1.5,
  },
  bodyLg: {
    size: '1rem', // 16px
    weight: 400,
    lineHeight: 1.6,
  },

  // Display
  display: {
    size: '3.75rem', // 60px
    weight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },

  // Monospace (for code, IDs)
  mono: {
    size: '0.75rem', // 12px
    weight: 500,
    lineHeight: 1.5,
    letterSpacing: '0.05em',
  },
};

// ============================================================================
// SIZE TOKENS
// ============================================================================

export const SIZES = {
  // Button heights
  button: {
    xs: '32px',
    sm: '36px',
    md: '40px',
    lg: '44px',
    xl: '48px',
    icon: '40px',
  },

  // Component sizes
  card: {
    radius: '12px',
    borderWidth: '1px',
  },

  // Input heights
  input: {
    sm: '32px',
    md: '40px',
    lg: '48px',
  },

  // Avatar sizes
  avatar: {
    xs: '24px',
    sm: '32px',
    md: '40px',
    lg: '56px',
    xl: '64px',
  },

  // Icon sizes
  icon: {
    xs: '14px',
    sm: '16px',
    md: '20px',
    lg: '24px',
    xl: '32px',
  },
};

// ============================================================================
// TRANSITION TOKENS
// ============================================================================

export const TRANSITIONS = {
  fast: 'transition-all duration-100 ease-in-out',
  normal: 'transition-all duration-200 ease-in-out',
  slow: 'transition-all duration-300 ease-in-out',

  // Specific transitions
  colors: 'transition-colors duration-200 ease-in-out',
  transform: 'transition-transform duration-200 ease-in-out',
  opacity: 'transition-opacity duration-200 ease-in-out',
  shadow: 'transition-shadow duration-200 ease-in-out',
};

// ============================================================================
// Z-INDEX TOKENS
// ============================================================================

export const Z_INDEX = {
  hide: '-1',
  base: '0',
  dropdown: '1000',
  sticky: '1020',
  fixed: '1030',
  backDrop: '1040',
  offCanvas: '1050',
  modal: '1060',
  popover: '1070',
  tooltip: '1080',
  notification: '1090',
};

// ============================================================================
// BREAKPOINTS (for reference, use in Tailwind config)
// ============================================================================

export const BREAKPOINTS = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// ============================================================================
// STATUS MAPPING (for consistent semantic colors)
// ============================================================================

export const STATUS_COLORS = {
  success: {
    bg: 'var(--success-50)',
    border: 'var(--success-200)',
    text: 'var(--success-700)',
    icon: 'var(--success-600)',
  },
  danger: {
    bg: 'var(--danger-50)',
    border: 'var(--danger-200)',
    text: 'var(--danger-700)',
    icon: 'var(--danger-600)',
  },
  warning: {
    bg: 'var(--warning-50)',
    border: 'var(--warning-200)',
    text: 'var(--warning-700)',
    icon: 'var(--warning-600)',
  },
  info: {
    bg: 'var(--info-50)',
    border: 'var(--info-200)',
    text: 'var(--info-700)',
    icon: 'var(--info-600)',
  },
  neutral: {
    bg: 'var(--neutral-50)',
    border: 'var(--neutral-200)',
    text: 'var(--neutral-700)',
    icon: 'var(--neutral-600)',
  },
};

// ============================================================================
// ANIMATION TOKENS
// ============================================================================

export const ANIMATIONS = {
  fadeIn: {
    name: 'fadeIn',
    duration: '0.3s',
    timing: 'ease-in-out',
  },
  slideInUp: {
    name: 'slideInUp',
    duration: '0.3s',
    timing: 'ease-out',
  },
  scaleIn: {
    name: 'scaleIn',
    duration: '0.2s',
    timing: 'ease-out',
  },
};
