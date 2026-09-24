// Font Assets Index - Centralized font management for Aura Gaming Platform

// Primary Font Family - Inter (Modern, clean, professional)
import InterRegular from './inter/Inter-Regular.woff2';
import InterMedium from './inter/Inter-Medium.woff2';
import InterSemiBold from './inter/Inter-SemiBold.woff2';
import InterBold from './inter/Inter-Bold.woff2';
import InterExtraBold from './inter/Inter-ExtraBold.woff2';

// Secondary Font Family - Roboto (Fallback, widely supported)
import RobotoRegular from './roboto/Roboto-Regular.woff2';
import RobotoMedium from './roboto/Roboto-Medium.woff2';
import RobotoBold from './roboto/Roboto-Bold.woff2';

// Display Font Family - Poppins (For headings and emphasis)
import PoppinsRegular from './poppins/Poppins-Regular.woff2';
import PoppinsMedium from './poppins/Poppins-Medium.woff2';
import PoppinsSemiBold from './poppins/Poppins-SemiBold.woff2';
import PoppinsBold from './poppins/Poppins-Bold.woff2';
import PoppinsExtraBold from './poppins/Poppins-ExtraBold.woff2';

// Monospace Font Family - JetBrains Mono (For code, numbers, data)
import JetBrainsMonoRegular from './jetbrains-mono/JetBrainsMono-Regular.woff2';
import JetBrainsMonoMedium from './jetbrains-mono/JetBrainsMono-Medium.woff2';
import JetBrainsMonoBold from './jetbrains-mono/JetBrainsMono-Bold.woff2';

// Gaming Font Family - Orbitron (For gaming-specific elements)
import OrbitronRegular from './orbitron/Orbitron-Regular.woff2';
import OrbitronMedium from './orbitron/Orbitron-Medium.woff2';
import OrbitronBold from './orbitron/Orbitron-Bold.woff2';
import OrbitronExtraBold from './orbitron/Orbitron-ExtraBold.woff2';

// Icon Font - Material Icons
import MaterialIcons from './material-icons/MaterialIcons-Regular.woff2';
import MaterialIconsOutlined from './material-icons/MaterialIconsOutlined-Regular.woff2';
import MaterialIconsRound from './material-icons/MaterialIconsRound-Regular.woff2';
import MaterialIconsSharp from './material-icons/MaterialIconsSharp-Regular.woff2';

// Font configurations
export const fontFamilies: Record<string, any> = {
  primary: {
    name: 'Inter',
    fallback: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    files: {
      regular: InterRegular,
      medium: InterMedium,
      semibold: InterSemiBold,
      bold: InterBold,
      extrabold: InterExtraBold,
    },
  },
  
  secondary: {
    name: 'Roboto',
    fallback: 'Arial, sans-serif',
    weights: {
      regular: 400,
      medium: 500,
      bold: 700,
    },
    files: {
      regular: RobotoRegular,
      medium: RobotoMedium,
      bold: RobotoBold,
    },
  },
  
  display: {
    name: 'Poppins',
    fallback: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    files: {
      regular: PoppinsRegular,
      medium: PoppinsMedium,
      semibold: PoppinsSemiBold,
      bold: PoppinsBold,
      extrabold: PoppinsExtraBold,
    },
  },
  
  monospace: {
    name: 'JetBrains Mono',
    fallback: 'Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    weights: {
      regular: 400,
      medium: 500,
      bold: 700,
    },
    files: {
      regular: JetBrainsMonoRegular,
      medium: JetBrainsMonoMedium,
      bold: JetBrainsMonoBold,
    },
  },
  
  gaming: {
    name: 'Orbitron',
    fallback: 'Inter, sans-serif',
    weights: {
      regular: 400,
      medium: 500,
      bold: 700,
      extrabold: 800,
    },
    files: {
      regular: OrbitronRegular,
      medium: OrbitronMedium,
      bold: OrbitronBold,
      extrabold: OrbitronExtraBold,
    },
  },
  
  icons: {
    name: 'Material Icons',
    fallback: 'sans-serif',
    variants: {
      filled: MaterialIcons,
      outlined: MaterialIconsOutlined,
      round: MaterialIconsRound,
      sharp: MaterialIconsSharp,
    },
  },
};

// Font loading utilities
export const loadFont = (fontFamily: string, weight = 'regular', display: FontDisplay = 'swap') => {
  const family = fontFamilies[fontFamily];
  if (!family || !family.files[weight]) {
    console.warn(`Font not found: ${fontFamily} ${weight}`);
    return null;
  }

  const fontFace = new FontFace(
    family.name,
    `url(${family.files[weight]})`,
    {
      weight: family.weights[weight],
      display,
    }
  );

  return fontFace.load().then((loadedFont) => {
    document.fonts.add(loadedFont);
    return loadedFont;
  });
};

export const loadAllFonts = async () => {
  const fontPromises = [];

  // Load primary fonts
  Object.keys(fontFamilies.primary.files).forEach(weight => {
    fontPromises.push(loadFont('primary', weight));
  });

  // Load display fonts
  Object.keys(fontFamilies.display.files).forEach(weight => {
    fontPromises.push(loadFont('display', weight));
  });

  // Load monospace fonts
  Object.keys(fontFamilies.monospace.files).forEach(weight => {
    fontPromises.push(loadFont('monospace', weight));
  });

  // Load gaming fonts
  Object.keys(fontFamilies.gaming.files).forEach(weight => {
    fontPromises.push(loadFont('gaming', weight));
  });

  try {
    await Promise.all(fontPromises);
    console.log('All fonts loaded successfully');
    return true;
  } catch (error) {
    console.error('Error loading fonts:', error);
    return false;
  }
};

// CSS font-face declarations generator
export const generateFontFaceCSS = () => {
  let css = '';

  Object.entries(fontFamilies).forEach(([key, family]) => {
    if (key === 'icons') {
      // Handle icon fonts separately
      Object.entries(family.variants).forEach(([variant, file]) => {
        css += `
@font-face {
  font-family: '${family.name} ${variant}';
  src: url('${file}') format('woff2');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
`;
      });
    } else {
      // Handle regular fonts
      Object.entries(family.files).forEach(([weight, file]) => {
        css += `
@font-face {
  font-family: '${family.name}';
  src: url('${file}') format('woff2');
  font-weight: ${family.weights[weight]};
  font-style: normal;
  font-display: swap;
}
`;
      });
    }
  });

  return css;
};

// Font stack utilities
export const getFontStack = (type = 'primary') => {
  const family = fontFamilies[type];
  if (!family) return fontFamilies.primary.fallback;
  
  return `"${family.name}", ${family.fallback}`;
};

export const getFontWeight = (type = 'primary', weight = 'regular') => {
  const family = fontFamilies[type];
  if (!family || !family.weights[weight]) return 400;
  
  return family.weights[weight];
};

// Responsive font size utilities
export const fontSizes = {
  xs: '0.75rem',     // 12px
  sm: '0.875rem',    // 14px
  base: '1rem',      // 16px
  lg: '1.125rem',    // 18px
  xl: '1.25rem',     // 20px
  '2xl': '1.5rem',   // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem',  // 36px
  '5xl': '3rem',     // 48px
  '6xl': '3.75rem',  // 60px
  '7xl': '4.5rem',   // 72px
  '8xl': '6rem',     // 96px
  '9xl': '8rem',     // 128px
};

// Line height utilities
export const lineHeights = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
};

// Letter spacing utilities
export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
};

// Typography presets for common use cases
export const typographyPresets = {
  // Headings
  h1: {
    fontFamily: getFontStack('display'),
    fontSize: fontSizes['4xl'],
    fontWeight: getFontWeight('display', 'bold'),
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacing.tight,
  },
  
  h2: {
    fontFamily: getFontStack('display'),
    fontSize: fontSizes['3xl'],
    fontWeight: getFontWeight('display', 'semibold'),
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacing.tight,
  },
  
  h3: {
    fontFamily: getFontStack('display'),
    fontSize: fontSizes['2xl'],
    fontWeight: getFontWeight('display', 'semibold'),
    lineHeight: lineHeights.snug,
  },
  
  h4: {
    fontFamily: getFontStack('display'),
    fontSize: fontSizes.xl,
    fontWeight: getFontWeight('display', 'medium'),
    lineHeight: lineHeights.snug,
  },
  
  // Body text
  body: {
    fontFamily: getFontStack('primary'),
    fontSize: fontSizes.base,
    fontWeight: getFontWeight('primary', 'regular'),
    lineHeight: lineHeights.normal,
  },
  
  bodyLarge: {
    fontFamily: getFontStack('primary'),
    fontSize: fontSizes.lg,
    fontWeight: getFontWeight('primary', 'regular'),
    lineHeight: lineHeights.relaxed,
  },
  
  bodySmall: {
    fontFamily: getFontStack('primary'),
    fontSize: fontSizes.sm,
    fontWeight: getFontWeight('primary', 'regular'),
    lineHeight: lineHeights.normal,
  },
  
  // UI elements
  button: {
    fontFamily: getFontStack('primary'),
    fontSize: fontSizes.sm,
    fontWeight: getFontWeight('primary', 'medium'),
    lineHeight: lineHeights.none,
    letterSpacing: letterSpacing.wide,
  },
  
  label: {
    fontFamily: getFontStack('primary'),
    fontSize: fontSizes.sm,
    fontWeight: getFontWeight('primary', 'medium'),
    lineHeight: lineHeights.normal,
  },
  
  caption: {
    fontFamily: getFontStack('primary'),
    fontSize: fontSizes.xs,
    fontWeight: getFontWeight('primary', 'regular'),
    lineHeight: lineHeights.normal,
    color: '#6B7280',
  },
  
  // Gaming-specific
  gamingTitle: {
    fontFamily: getFontStack('gaming'),
    fontSize: fontSizes['3xl'],
    fontWeight: getFontWeight('gaming', 'bold'),
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacing.wider,
  },
  
  // Data display
  monospace: {
    fontFamily: getFontStack('monospace'),
    fontSize: fontSizes.sm,
    fontWeight: getFontWeight('monospace', 'regular'),
    lineHeight: lineHeights.normal,
  },
  
  currency: {
    fontFamily: getFontStack('monospace'),
    fontSize: fontSizes.base,
    fontWeight: getFontWeight('monospace', 'medium'),
    lineHeight: lineHeights.none,
    fontVariantNumeric: 'tabular-nums',
  },
};

// Font loading status
export const fontLoadingStatus = {
  loading: 'loading',
  loaded: 'loaded',
  error: 'error',
};

// Font loading hook utility
export const createFontLoadingHook = () => {
  let status = fontLoadingStatus.loading;
  const listeners = new Set<(status: string) => void>();

  const notify = (newStatus: string) => {
    status = newStatus;
    listeners.forEach(listener => listener(status));
  };

  loadAllFonts()
    .then(() => notify(fontLoadingStatus.loaded))
    .catch(() => notify(fontLoadingStatus.error));

  return {
    getStatus: () => status,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
};

// Default export
export default {
  families: fontFamilies,
  sizes: fontSizes,
  lineHeights,
  letterSpacing,
  presets: typographyPresets,
  utils: {
    loadFont,
    loadAllFonts,
    generateFontFaceCSS,
    getFontStack,
    getFontWeight,
    createFontLoadingHook,
  },
}; 